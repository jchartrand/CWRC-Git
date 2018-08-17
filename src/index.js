var github = require("@octokit/rest")({
	headers: {
		accept: 'application/vnd.github.v3.text-match+json',
		'user-agent': 'octokit/rest.js v1.2.3' // v1.2.3 will be current version
	},
});
var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
var serializer = new XMLSerializer();

// we use the cwrcAppName to match CWRC GitHub repositories that are themselves documemnts,
// but we don't match to match repositories that are code repositories,
// so here we sneakily concatenate the full string to avoid matches on this code repo.
var cwrcAppName = "CWRC-GitWriter" + "-web-app";

// We chain together the calls to github as a series of chained promises, and pass
// the growing result as an object (strictly speaking, creating a copy of the object
// at each point in the chain, so no arguments are mutated) along the promise chain, ultimately returning
// the object, which holds the new document, new annotations, treeSHA, and commitSHA
// The document and annotations are new because we rewrite all the annotations to use
// new raw github URIs for the newly saved document and annotation files.

function authenticate(gitHubOAuthToken) {
   return github.authenticate({type: "oauth",token: gitHubOAuthToken})
}

function getDetailsForAuthenticatedUser() {
    return github.users.get({})
}

// options can be as described here:
// https://octokit.github.io/rest.js/#api-Repos-getAll
function getReposForAuthenticatedUser(options){
    return github.repos.getAll(options).then((result)=>{
	    return result
    })
}

function getReposForUser(theDetails) {
    return github.repos.getForUser(theDetails)
}

function getTemplates(theDetails){
    return github.repos.getContent(
        {
            owner: theDetails.owner || 'cwrc', 
            repo: theDetails.repo || 'CWRC-Writer-Templates', 
            ref: theDetails.ref || 'master',
            path: theDetails.path || 'templates'
        }
    )
}

function getTemplate(theDetails){
    let path = 'templates/' + (theDetails.path || 'Sample TEI letter.xml');
    return github.repos.getContent(
        {
            owner: theDetails.owner || 'cwrc', 
            repo: theDetails.repo || 'CWRC-Writer-Templates', 
            ref: theDetails.ref || 'master',
            path: path
        }
    ).then(
        result=>{
            return Buffer.from(result.data.content, 'base64').toString('utf8');
        }
    )
}


function getDoc(chainedResult) {

	const {owner, repo, branch, path} = chainedResult
	return github.repos.getContent(
		{
			owner: owner,
			repo: repo,
			ref: branch,
			path: path
		}
	).then(result => ({
			...chainedResult,
			doc: Buffer.from(result.data.content, 'base64').toString('utf8'),
			sha: result.data.sha
		})
	)
}

function createRepo(chainedResult){
	let {repo, isPrivate = false, description} = chainedResult
	if (isPrivate === 'true') {
		isPrivate = true;
	} else if (isPrivate === 'false') {
		isPrivate = false;
	}
    const createParams = {
        name: repo,
        auto_init: true, 
        private: isPrivate,
        description: description
    }
    return github.repos.create(createParams)
        .then(githubResponse=>{
            return {
	            ...chainedResult,
	            owner: githubResponse.data.owner.login,
	            repo: githubResponse.data.name
            }
        })
	    .catch(logError)

	// .then(getMasterBranchSHAs)
}

function encodeContent(content) {
	return Buffer.from(content).toString('base64')
}


/* the Details must contain:
owner: the owner of the repo
repo: repoName
branch: the branch name
 */
function createBranchFromMaster(theDetails) {
	const {owner, repo, branch} = theDetails
	return getMasterBranchSHAs(theDetails)
		.then(result => ({
			owner,
			repo,
			ref: `refs/heads/${branch}`,
			sha: result.parentCommitSHA
		}))
		.then(github.gitdata.createReference)
		.then(githubResponse=>({...theDetails, refURL: githubResponse.data.url}))
		.catch(logError)
}

/* the Details must contain:
owner: repoownwer
repo: repoName
path: path
title:  title for pull request
message:  message for commit
branch: the branch in which to save, i.e., the github username for the person submitting
content: the file content to save
 */
async function saveAsPullRequest(chainedResult) {
	const {owner, repo, title, branch, message} = chainedResult
	//probably want to write in the cwrc-git /// application tag,
	const doesBranchExist = await checkForBranch({owner, repo, branch});
	if (! doesBranchExist) {
		await createBranchFromMaster({owner, repo, branch})
	}
	const resultOfSave = await saveDoc(chainedResult)
	const doesPullRequestExist = await checkForPullRequest({owner, repo, branch})
	// there can be only one PR per branch */
	if (! doesPullRequestExist) {
		const prArgs = {
			owner,
			repo,
			title,
			head: branch,
			base: 'master',
			body: message
		}
		const prResult = await github.pullRequests.create(prArgs)
	}

	return {...chainedResult, sha: resultOfSave.sha}
}

function checkForPullRequest({owner, repo, branch}) {
	return github.search.issues({q: `state:open type:pr repo:${owner}/${repo} head:${branch}`}).then(
		result=>result.data.total_count > 0
	)
}

async function getLatestFileSHA(chainedResult) {
	const {owner, repo, branch, path} = chainedResult
	const {data: {data: {repository: {object: result}}}} = await github.request({
		method: 'POST',
		url: '/graphql',
		query: `{
			repository(owner: "${owner}", name: "${repo}") {
				object(expression: "${branch}:${path}") {
					... on Blob {
						oid
					}
				}
			}
		}`
	}).catch(function(error) {
		console.log(error);
	});
	const sha = result ? result.oid : null
	return {...chainedResult, sha}
}

async function saveDoc(chainedResult) {
	const {owner, repo, branch, path, sha: originalFileSHA} = chainedResult
	let sha
	if (originalFileSHA) {
		sha = originalFileSHA
	} else {
		const {sha: latestSHA} = await getLatestFileSHA({owner, repo, branch, path})
		sha = latestSHA
	}
	return sha ? updateFile({...chainedResult, sha}) : createFile(chainedResult)
}
// expects in theDetails:
// {
//      owner: owner,
//      repo: repo,
//      path: path,
//      message:  the commit message
//      content: the doc,
//      branch: branch (default master)
// }
// returns the chained result object for passing to further promise based calls.
function createFile(chainedResult) {
	const {owner, repo, path, message, content, branch} = chainedResult
	return github.repos.createFile({owner, repo, path, message, branch, content: encodeContent(content)})
		.then(result=>({...chainedResult, sha: result.data.content.sha}))
}
// expects in theDetails:
// {
//      owner: owner,
//      repo: repo,
//      path: path,
//      message:  the commit message
//      content: the doc,
//      branch: branch (default master)
//      sha: oldFileSHA
// }
// returns the chained result object for passing to further promise based calls.
function updateFile(chainedResult) {
	const {owner, repo, path, message, content, sha, branch} = chainedResult
	//probably want to write in the cwrc-git /// application tag, but that could go in from the cwrc-writer I guess, before sending.
	return github.repos.updateFile({owner, repo, path, message, sha, branch, content: encodeContent(content)})
		.then(result=>({...chainedResult, sha: result.data.content.sha}))
}
function logError(error) {
    console.error("oh no!");
    console.log(error);
    return Promise.reject(new Error(`Failed to call the GitHub API:  ${error}`));
}

function addAppInfoTag(docString) {
	let doc = new DOMParser().parseFromString(docString)

	let header = doc.documentElement.getElementsByTagName('teiHeader')[0]
	let encodingDesc = header.getElementsByTagName('encodingDesc')
	if (!encodingDesc.length) {
		encodingDesc = doc.createElement('encodingDesc')
		header.appendChild(encodingDesc)
	} else {
		encodingDesc = encodingDesc[0]
	}
	let appInfo = encodingDesc.getElementsByTagName('appInfo');
	if (!appInfo.length) {
		appInfo = doc.createElement('appInfo')
		encodingDesc.appendChild(appInfo)
	} else {
		appInfo = appInfo[0]
	}
	let application = appInfo.getElementsByTagName('application')
	if (!application.length) {
		application = doc.createElement('application')
		appInfo.appendChild(application)
	} else {
		application = application[0]
	}

	application.setAttribute('version', '1.0')
	application.setAttribute('ident', cwrcAppName)
	application.setAttribute('notAfter', (new Date()).toISOString())
	let applicationLabel = application.getElementsByTagName('label')
	if (!applicationLabel.length) {
		applicationLabel = doc.createElement('label')
		applicationLabel.appendChild(doc.createTextNode(cwrcAppName))
		application.appendChild(applicationLabel)
	}

	let newDoc = serializer.serializeToString(doc)

}

function getMasterBranchSHAs(chainedResult) {
    return github.repos.getBranch(
        {
            owner: chainedResult.owner, 
            repo: chainedResult.repo, 
            branch:'master'
        }
    ).then(
        githubResponse=>({
        	...chainedResult,
            baseTreeSHA: githubResponse.data.commit.commit.tree.sha,
            parentCommitSHA: githubResponse.data.commit.sha
        })
    )
}



function getTreeContentsByDrillDown(chainedResult) {
	let basePath = ''
	return getTreeContents(
		{
			owner: chainedResult.owner,
			repo: chainedResult.repo,
			tree_sha: chainedResult.baseTreeSHA
		},
		basePath
	).then(
		contents => ({
			...chainedResult,
			contents: {
				type: 'folder',
				path: '',
				name: '',
				contents: contents
			}
		})
	)
}

function getTreeContents(treeDetails, basePath) {
	return github.gitdata.getTree(treeDetails
	).then(
		githubResponse=>{
			let promises = githubResponse.data.tree.map(entry=>{
			    let path = basePath + entry.path
			    if (entry.type === 'tree') {
				    return getTreeContents(
					    {
						    owner: treeDetails.owner,
						    repo: treeDetails.repo,
						    tree_sha: entry.sha
					    },
                        path + '/'
                    ).then(folderContents => ({
                                type: 'folder',
					            path: path,
					            name: entry.path,
                                contents: folderContents
                        }))

                } else {
			        return Promise.resolve({type: 'file', path: path, name: entry.path})
                }
            })

            return Promise.all(promises).then(results => {
                return results;
            })
		}
	)
}

function unflattenContents(flatContents) {
		const files = flatContents.filter(file=>file.type==='blob')
		var result = {type: 'folder', name: '', path: '', contents: []}
		const findSubFolder = (parentFolder, folderNameToFind) => {
			 const subfolder = parentFolder.contents.find(el => {
			 	return el.type === 'folder' && el.name === folderNameToFind
			 })
			return subfolder;
		}
		const addSubFolder = (newFolderName, parentFolder) => {
			const newSubFolder = {type: 'folder', name: newFolderName, path: `${parentFolder.path}/${newFolderName}`, contents:[]}
			parentFolder.contents.push(newSubFolder)
			return newSubFolder;
		}
		const addFile = (newFileName, parentFolder) => {
			const newFile = {type: 'file', name: newFileName, path: `${parentFolder.path}/${newFileName}`}
			parentFolder.contents.push(newFile)
		}
		const isFile = (pathSections, currentIndex) => {
			return pathSections.length - 1 == currentIndex
		}

		files.forEach(file=>{
			const pathSections = file.path.split('/')
			pathSections.reduce(function(parentFolder, pathSection, pathSectionIndex) {
				const subFolder = findSubFolder(parentFolder, pathSection)
				if (subFolder) {
					return subFolder
				} else if (isFile(pathSections, pathSectionIndex)) {
					return addFile(pathSection, parentFolder)
				} else {
					return addSubFolder(pathSection, parentFolder)
				}
			}, result)
		})
		return result
}

function search(query, page, per_page) {
    return github.search.code(
    	{
		    q: query,
		    page,
		    per_page
        }
    ).then(
	    (result)=>{
		    return result
	    }
    );
}

// expects in theDetails argument:
// {
//    repo: repo,
//    owner: owner
// }
function getRepoContents(theDetails) {
	return getMasterBranchSHAs(theDetails)
        .then(getTreeContentsRecursively)
}

function getTreeContentsRecursively(chainedResult) {
	return github.gitdata.getTree(
		{
			owner: chainedResult.owner,
			repo: chainedResult.repo,
			tree_sha: chainedResult.baseTreeSHA,
			recursive: 1
		}
	).then(
		githubResponse=>({
			...chainedResult,
			contents: unflattenContents(githubResponse.data.tree),
			truncated: githubResponse.data.truncated
		})
	)
}
// expects in theDetails argument:
// {
//    repo: repo,
//    owner: owner
// }
function getRepoContentsByDrillDown(theDetails) {
	return getMasterBranchSHAs(theDetails)
		.then(getTreeContentsByDrillDown)
}

function checkForBranch(theDetails) {
	return github.gitdata.getReference(
		{
			owner: theDetails.owner,
			repo: theDetails.repo,
			ref: `heads/${theDetails.branch}`
		}
	).then(
		result => {
			// this next check also handles the case where the branch name doesn't exist, but there are branches
			// for which this name is a prefix, in which case the call returns an array of those 'matching' branches.
			// See:  https://developer.github.com/v3/git/refs/#get-a-reference
			return result.data.hasOwnProperty('object')
		}).catch((error) => {
		if (error.code === 404) {
			return false
		} else {
			throw new Error('Something went wrong with the call to check for a branch. ' + error.message);
		}
	})
}


module.exports = {
    authenticate: authenticate,
    getDetailsForAuthenticatedUser: getDetailsForAuthenticatedUser,
    getReposForAuthenticatedUser: getReposForAuthenticatedUser,
    getReposForUser: getReposForUser,
	saveAsPullRequest: saveAsPullRequest,
	saveDoc: saveDoc,
	getDoc: getDoc,
	createRepo: createRepo,
    getTemplates: getTemplates,
    getTemplate: getTemplate,
    search: search,
    getRepoContents: getRepoContents,
	getRepoContentsByDrillDown: getRepoContentsByDrillDown,

	checkForBranch: checkForBranch,
	checkForPullRequest: checkForPullRequest,
	createBranchFromMaster: createBranchFromMaster,
	getLatestFileSHA: getLatestFileSHA,
	createFile: createFile,
	updateFile: updateFile
};
