const github = require('@octokit/rest')({
	headers: {
		accept: 'application/vnd.github.v3.text-match+json',
		'user-agent': 'octokit/rest.js v1.2.3' // v1.2.3 will be current version
	},
});
const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;
const serializer = new XMLSerializer();

// we use the cwrcAppName to match CWRC GitHub repositories that are themselves documemnts,
// but we don't match to match repositories that are code repositories,
// so here we sneakily concatenate the full string to avoid matches on this code repo.
const cwrcAppName = 'CWRC-GitWriter' + '-web-app';

// We chain together the calls to github as a series of chained promises, and pass
// the growing result as an object (strictly speaking, creating a copy of the object
// at each point in the chain, so no arguments are mutated) along the promise chain, ultimately returning
// the object, which holds the new document, new annotations, treeSHA, and commitSHA
// The document and annotations are new because we rewrite all the annotations to use
// new raw github URIs for the newly saved document and annotation files.


function _encodeContent(content) {
	return Buffer.from(content).toString('base64')
}

function _decodeContent(content) {
	return Buffer.from(content, 'base64').toString('utf8')
}


/**
 * Authenticate the user for making calls to GitHub, using their OAuth token.
 * See {@link https://developer.github.com/v3/#authentication}
 * @param {String} gitHubOAuthToken The OAuth token from GitHub
 * @returns {Promise}
 */
function authenticate(gitHubOAuthToken) {
	return github.authenticate({
		type: 'oauth',
		token: gitHubOAuthToken
	})
}

/**
 * Get the details associated with the currently authenticated user.
 * See {@link https://developer.github.com/v3/users/#get-the-authenticated-user}
 * @returns {Promise}
 */
function getDetailsForAuthenticatedUser() {
	return github.users.getAuthenticated({})
}

/**
 * Get the details for a specific user.
 * See {@link https://developer.github.com/v3/users/#get-a-single-user}
 * @param {String} username 
 * @returns {Promise}
 */
function getDetailsForUser(username) {
	return github.users.getByUsername({
		username
	})
}

/**
 * Get the repos the user has explicit permission to access.
 * See {@link https://developer.github.com/v3/repos/#list-your-repositories}
 * @param {String} affiliation User's relation to the repo
 * @param {Integer} page The page number
 * @param {Integer} per_page Repos per page
 * @returns {Promise}
 */
function getReposForAuthenticatedUser(affiliation, page, per_page) {
	return github.repos.list({
		page,
		per_page,
		affiliation
	}).then((result) => {
		return result
	})
}

/**
 * Get the repos for a specific user.
 * See {@link https://developer.github.com/v3/repos/#list-user-repositories}
 * @param {String} username The username
 * @param {Integer} page The page number
 * @param {Integer} per_page Repos per page
 * @returns {Promise}
 */
function getReposForUser(username, page, per_page) {
	return github.repos.listForUser({
		username,
		page,
		per_page
	})
}

/**
 * Get the repos for a specific org.
 * See {@link https://developer.github.com/v3/repos/#list-organization-repositories}
 * @param {String} org The org name
 * @returns {Promise}
 */
function getDetailsForOrg(org) {
	return github.orgs.get({
		org
	})
}

/**
 * Get the permissions for a specific user and repo.
 * See {@link https://developer.github.com/v3/repos/collaborators/#review-a-users-permission-level}
 * @param {String} owner The repo owner
 * @param {String} repo The repo
 * @param {String} username The username
 * @returns {Promise}
 */
function getPermissionsForUser(owner, repo, username) {
	return github.repos.getCollaboratorPermissionLevel({
		owner,
		repo,
		username
	})
}

/**
 * Get the CWRC Writer templates.
 * Default location is {@link https://github.com/cwrc/CWRC-Writer-Templates/tree/master/templates}
 * @param {String} owner The owner
 * @param {String} repo The repo
 * @param {String} ref The branch/tag
 * @param {String} path The path
 * @returns {Promise}
 */
function getTemplates(owner, repo, ref, path) {
	return github.repos.getContents({
		owner,
		repo,
		ref,
		path
	})
}

/**
 * Get a document from GitHub.
 * See {@link https://developer.github.com/v3/repos/contents/#get-contents}
 * @param {String} owner The owner
 * @param {String} repo The repo
 * @param {String} ref The branch/tag
 * @param {String} path The path
 * @returns {Promise}
 */
function getDoc(owner, repo, ref, path) {
	return github.repos.getContents({
		owner,
		repo,
		ref,
		path
	}).then(result => ({
		owner,
		repo,
		ref,
		path,
		doc: _decodeContent(result.data.content),
		sha: result.data.sha
	}))
}

/**
 * Create a new repo for the authenticated user.
 * See {@link https://developer.github.com/v3/repos/#create}
 * @param {String} repo The repo
 * @param {String} description The repo description
 * @param {String|Boolean} isPrivate Is the repo private
 * @returns {Promise}
 */
function createRepo(repo, description, isPrivate) {
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
	return github.repos.createForAuthenticatedUser(createParams)
		.then(githubResponse => {
			return {
				description,
				isPrivate,
				owner: githubResponse.data.owner.login,
				repo: githubResponse.data.name
			}
		})
		.catch(logError)

	// .then(_getMasterBranchSHAs)
}

/**
 * Create a new repo for a specific org.
 * See {@link https://developer.github.com/v3/repos/#create}
 * @param {String} org The org
 * @param {String} repo The repo
 * @param {String} description The description
 * @param {String|Boolean} isPrivate Is the repo private
 * @returns {Promise}
 */
function createOrgRepo(org, repo, description, isPrivate) {
	if (isPrivate === 'true') {
		isPrivate = true;
	} else if (isPrivate === 'false') {
		isPrivate = false;
	}
	const createParams = {
		org,
		name: repo,
		auto_init: true,
		private: isPrivate,
		description: description
	}
	return github.repos.createForOrg(createParams)
		.then(githubResponse => {
			return {
				org,
				description,
				isPrivate,
				owner: githubResponse.data.owner.login,
				repo: githubResponse.data.name
			}
		})
		.catch(logError)
}

/**
 * Save (i.e. create or update) a document.
 * See {@link https://developer.github.com/v3/repos/contents/#create-or-update-a-file}
 * @param {String} owner The owner
 * @param {String} repo The repo
 * @param {String} path The path
 * @param {String} content The content
 * @param {String} branch The branch
 * @param {String} message The commit message
 * @param {String} [sha] The SHA
 * @returns {Promise}
 */
async function saveDoc(owner, repo, path, content, branch, message, sha) {
	if (sha === undefined) {
		// try to get the sha
		sha = await _getLatestFileSHA({
			owner,
			repo,
			branch,
			path
		})
	}
	if (sha) {
		return _updateFile({
			owner,
			repo,
			path,
			content,
			branch,
			message,
			sha
		})
	} else {
		return _createFile({
			owner,
			repo,
			path,
			content,
			branch,
			message
		})
	}
}

/* the Details must contain:
owner: the owner of the repo
repo: repoName
branch: the branch name
 */
function _createBranchFromMaster(theDetails) {
	const {
		owner,
		repo,
		branch
	} = theDetails
	return _getMasterBranchSHAs(theDetails)
		.then(result => ({
			owner,
			repo,
			ref: `refs/heads/${branch}`,
			sha: result.parentCommitSHA
		}))
		.then(github.gitdata.createReference)
		.then(githubResponse => ({
			...theDetails,
			refURL: githubResponse.data.url
		}))
		.catch(logError)
}

function _checkForPullRequest({
	owner,
	repo,
	branch
}) {
	return github.search.issuesAndPullRequests({
		q: `state:open type:pr repo:${owner}/${repo} head:${branch}`
	}).then(
		result => result.data.total_count > 0
	)
}

/**
 * Save (i.e. create) a document as a pull request.
 * See {@link https://developer.github.com/v3/pulls/#create-a-pull-request}
 * @param {String} owner The owner
 * @param {String} repo The repo
 * @param {String} path The path
 * @param {String} content The content
 * @param {String} branch The branch
 * @param {String} message The commit message
 * @param {String} title The title of the pull request
 * @param {String} [sha] The SHA
 * @returns {Promise}
 */
async function saveAsPullRequest(owner, repo, path, content, branch, message, title, sha) {
	const doesBranchExist = await _checkForBranch({
		owner,
		repo,
		branch
	});
	if (!doesBranchExist) {
		await _createBranchFromMaster({
			owner,
			repo,
			branch
		})
	}
	const resultOfSave = await saveDoc(owner, repo, path, content, branch, message, sha)
	const doesPullRequestExist = await _checkForPullRequest({
		owner,
		repo,
		branch
	})
	// there can be only one PR per branch */
	if (!doesPullRequestExist) {
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

	return {
		owner,
		repo,
		path,
		content,
		branch,
		message,
		title,
		sha: resultOfSave.sha
	}
}

async function _getLatestFileSHA(chainedResult) {
	const {
		owner,
		repo,
		branch,
		path
	} = chainedResult
	const {
		data: {
			data: {
				repository: {
					object: result
				}
			}
		}
	} = await github.request({
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
	}).catch(function (error) {
		console.log(error);
	});
	const sha = result ? result.oid : null
	return sha
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
function _createFile(chainedResult) {
	const {
		owner,
		repo,
		path,
		message,
		content,
		branch
	} = chainedResult
	return github.repos.createFile({
			owner,
			repo,
			path,
			message,
			branch,
			content: _encodeContent(content)
		})
		.then(result => ({
			...chainedResult,
			sha: result.data.content.sha
		}))
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
function _updateFile(chainedResult) {
	const {
		owner,
		repo,
		path,
		message,
		content,
		sha,
		branch
	} = chainedResult
	//probably want to write in the cwrc-git /// application tag, but that could go in from the cwrc-writer I guess, before sending.
	return github.repos.updateFile({
			owner,
			repo,
			path,
			message,
			sha,
			branch,
			content: _encodeContent(content)
		})
		.then(result => ({
			...chainedResult,
			sha: result.data.content.sha
		}))
}

function logError(error) {
	console.error('oh no!');
	console.log(error);
	return Promise.reject(error);
}

function _getMasterBranchSHAs(chainedResult) {
	return github.repos.getBranch({
		owner: chainedResult.owner,
		repo: chainedResult.repo,
		branch: 'master'
	}).then(
		githubResponse => ({
			...chainedResult,
			baseTreeSHA: githubResponse.data.commit.commit.tree.sha,
			parentCommitSHA: githubResponse.data.commit.sha
		})
	)
}

function _getTreeContentsByDrillDown(chainedResult) {
	let basePath = ''
	return _getTreeContents({
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

function _getTreeContents(treeDetails, basePath) {
	return github.gitdata.getTree(treeDetails).then(
		githubResponse => {
			let promises = githubResponse.data.tree.map(entry => {
				let path = basePath + entry.path
				if (entry.type === 'tree') {
					return _getTreeContents({
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
					return Promise.resolve({
						type: 'file',
						path: path,
						name: entry.path
					})
				}
			})

			return Promise.all(promises).then(results => {
				return results;
			})
		}
	)
}

function _unflattenContents(flatContents) {
	const files = flatContents.filter(file => file.type === 'blob')
	const result = {
		type: 'folder',
		name: '',
		path: '',
		contents: []
	}
	const findSubFolder = (parentFolder, folderNameToFind) => {
		const subfolder = parentFolder.contents.find(el => {
			return el.type === 'folder' && el.name === folderNameToFind
		})
		return subfolder;
	}
	const addSubFolder = (newFolderName, parentFolder) => {
		const newSubFolder = {
			type: 'folder',
			name: newFolderName,
			path: `${parentFolder.path}/${newFolderName}`,
			contents: []
		}
		parentFolder.contents.push(newSubFolder)
		return newSubFolder;
	}
	const addFile = (newFileName, parentFolder) => {
		const newFile = {
			type: 'file',
			name: newFileName,
			path: `${parentFolder.path}/${newFileName}`
		}
		parentFolder.contents.push(newFile)
	}
	const isFile = (pathSections, currentIndex) => {
		return pathSections.length - 1 == currentIndex
	}

	files.forEach(file => {
		const pathSections = file.path.split('/')
		pathSections.reduce(function (parentFolder, pathSection, pathSectionIndex) {
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

/**
 * Search for files based on a specific query.
 * See {@link https://developer.github.com/v3/search/#search-code}
 * @param {String} query The query
 * @param {String} page The page number
 * @param {String} per_page Results per page
 * @returns {Promise}
 */
function searchCode(query, page, per_page) {
	return github.search.code({
		q: query,
		page,
		per_page
	}).then(
		(result) => {
			return result
		}
	);
}

/**
 * Search for repos based on a specific query.
 * See {@link https://developer.github.com/v3/search/#search-repositories}
 * @param {String} query The query
 * @param {String} page The page number
 * @param {String} per_page Results per page
 * @returns {Promise}
 */
function searchRepos(query, page, per_page) {
	return github.search.repos({
		q: query,
		page,
		per_page
	}).then(
		(result) => {
			return result
		}
	);
}

/**
 * Gets the contents (i.e. file structure) of a repo using the GitHub recursive tree method.
 * See {@link https://developer.github.com/v3/git/trees/#get-a-tree-recursively}
 * @param {String} owner The owner
 * @param {String} repo The repo
 * @returns {Promise}
 */
function getRepoContents(owner, repo) {
	return _getMasterBranchSHAs({
			owner,
			repo
		})
		.then(_getTreeContentsRecursively)
}

function _getTreeContentsRecursively(chainedResult) {
	return github.gitdata.getTree({
		owner: chainedResult.owner,
		repo: chainedResult.repo,
		tree_sha: chainedResult.baseTreeSHA,
		recursive: 1
	}).then(
		githubResponse => ({
			...chainedResult,
			contents: _unflattenContents(githubResponse.data.tree),
			truncated: githubResponse.data.truncated
		})
	)
}

/**
 * Gets the contents (i.e. file structure) of a repo by manually recursing.
 * Intended to be used if the github recursive option didn't work because the repository is too big.
 * @param {String} owner The owner
 * @param {String} repo The repo
 * @returns {Promise}
 */
function getRepoContentsByDrillDown(owner, repo) {
	return _getMasterBranchSHAs({
			owner,
			repo
		})
		.then(_getTreeContentsByDrillDown)
}

function _checkForBranch(theDetails) {
	return github.gitdata.getRef({
		owner: theDetails.owner,
		repo: theDetails.repo,
		ref: `heads/${theDetails.branch}`
	}).then(
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
	getDetailsForUser: getDetailsForUser,
	getDetailsForOrg: getDetailsForOrg,
	getReposForAuthenticatedUser: getReposForAuthenticatedUser,
	getReposForUser: getReposForUser,
	getPermissionsForUser: getPermissionsForUser,
	saveAsPullRequest: saveAsPullRequest,
	saveDoc: saveDoc,
	getDoc: getDoc,
	createRepo: createRepo,
	createOrgRepo: createOrgRepo,
	getTemplates: getTemplates,
	searchCode: searchCode,
	searchRepos: searchRepos,
	getRepoContents: getRepoContents,
	getRepoContentsByDrillDown: getRepoContentsByDrillDown
};