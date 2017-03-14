var GitHubApi = require("github");
// We chain together the calls to github as a series of chained promises, and pass
// the growing result as an object along the promise chain, ultimately returning
// the object, which holds the new document, new annotations, treeSHA, and commitSHA
// The document and annotations are new because we rewrite all the annotations to use
// new raw github URIs for the newly saved document and annotation files.

var github = new GitHubApi({
    // optional
    debug: false,
    protocol: "https",
    host: "api.github.com", 
    headers: {
        "user-agent": "My-Cool-GitHub-App" 
    },
    timeout: 5000
});

function authenticate(gitHubOAuthToken) {
   return github.authenticate({type: "oauth",token: gitHubOAuthToken})
}

function getDetailsForAuthenticatedUser() {
    return github.users.get({})
}

function getReposForAuthenticatedUser(){
    return github.repos.getAll({})
}

function getReposForUser(theDetails) {
    return github.repos.getForUser(theDetails)
}

function getTemplates(theDetails){
    return github.repos.getContent(
        {
            owner: theDetails.owner || 'cwrc', 
            repo: theDetails.repo || 'CWRC-Writer-Templates', 
            ref: theDetails.branch || 'master', 
            path: theDetails.path || 'templates'
        }
    )
}

function getTemplate(theDetails){
    return github.repos.getContent(
        {
            owner: theDetails.owner || 'cwrc', 
            repo: theDetails.repo || 'CWRC-Writer-Templates', 
            ref: theDetails.branch || 'master', 
            path: theDetails.sha || 'templates/letter.xml'
        }
    ).then(
        result=>{
            return Buffer.from(result.content, 'base64').toString('utf8');
        }
    )
}


// expects in theDetails argument: 
// {
//    repo: repo, 
//    owner: owner
// }

function getDoc(theDetails) {
    return getMainText(theDetails)
        .then(getAnnotations, logError)
        .then(getCWRCBranchSHAs, logError)
}


// expects in theDetails argument: 
// {
//    repo: repo, 
//    isPrivate: true/false, 
//    repoDescription: repoDescription, 
//    doc: doc, 
//    annotations: annotations,
//    versionTimestamp: versionTimestamp
// }

// returns the chained result object

function createRepoForDoc(theDetails) {
    return createRepo(theDetails)
        .then(getMasterBranchSHAs)
        .then(createTree)
        .then(createCommit)
        .then(createCWRCDraftsBranch)
        .then(createCWRCVersionTag)
        .catch(logError)
}


// expects in theDetails: 
// {
//      owner: owner,
//      repo: repo, 
//      doc: doc, 
//      annotations: annotations, 
//      baseTreeSHA: baseTreeSHA, 
//      parentCommitSHA: parentCommitSHA,
//      versionTimestamp: versionTimestamp
// }
// returns the chained result object for passing to further promise based calls.

function saveDoc(theDetails) {
    return createTree(theDetails)
            .then(createCommit)
            .then(updateCWRCDraftsBranch)
            .then(createCWRCVersionTag)
            .catch(logError)
}

function logError(error) {
    console.error("oh no!");
    console.log(error);
    return Promise.reject(new Error(`Failed to call the GitHub API:  ${error}`));
}

function getMainText(chainedResult) {
    return github.repos.getContent(
        {
            owner: chainedResult.owner, 
            repo: chainedResult.repo, 
            ref:'cwrc-drafts', 
            path:'document.xml'
        }
    ).then(
        result=>{
            chainedResult.doc = Buffer.from(result.content, 'base64').toString('utf8');
            return chainedResult;
        }
    )
}

function getAnnotations(chainedResult) {
    return github.repos.getContent(
        {
            owner: chainedResult.owner, 
            repo: chainedResult.repo, 
            ref:'cwrc-drafts', 
            path:'annotations.json'
        }
    ).then(
        result=>{
            chainedResult.annotations = Buffer.from(result.content, 'base64').toString('utf8');
            return chainedResult
        }
    )
}

function buildNewTree(chainedResult) {
    // TODO - change this to loop over annotations from original doc, and add one object per annotation, with
    // new URIs.
    var newDoc = chainedResult.doc;  // TODO will first rewrite the RDF in the doc.
    var newAnnotations = chainedResult.annotations;  // TODO will first rewrit the URIs in the RDF
    chainedResult.newDoc = newDoc;
    chainedResult.newAnnotations = newAnnotations;
    chainedResult.newTree = [
                {
                  "path": "document.xml",
                  "mode": "100644",
                  "type": "blob",
                  "content": newDoc
                },
                {
                  "path": "annotations.json",
                  "mode": "100644",
                  "type": "blob",
                  "content": newAnnotations
                }/*,
                {
                  "path": "annotations/test.json",
                  "mode": "100644",
                  "type": "blob",
                  "content": `{anno: 'a test anno ${chainedResult.versionTimestamp}'`
                }*/
            ]
    return chainedResult;
}

function createRepo(chainedResult){
    var createParams = {
        name: chainedResult.repo,   
        auto_init: true, 
        private: chainedResult.isPrivate, 
        description: chainedResult.description 
    }
    return github.repos.create(createParams)
        .then(githubResponse=>{
            chainedResult.owner = githubResponse.owner.login;
            return chainedResult;
        }

    )
}

function getCWRCBranchSHAs(chainedResult) {
    return github.repos.getBranch(
        {
            owner: chainedResult.owner, 
            repo: chainedResult.repo, 
            branch:'cwrc-drafts'
        }
    ).then(
        githubResponse=>{
            chainedResult.baseTreeSHA = githubResponse.commit.commit.tree.sha;
            chainedResult.parentCommitSHA = githubResponse.commit.sha;
            return chainedResult;
        }
    )
}

function getMasterBranchSHAs(chainedResult) {
    return github.repos.getBranch(
        {
            owner: chainedResult.owner, 
            repo: chainedResult.repo, 
            branch:'master'
        }
    ).then(
        githubResponse=>{
            chainedResult.baseTreeSHA = githubResponse.commit.commit.tree.sha;
            chainedResult.parentCommitSHA = githubResponse.commit.sha;
            return chainedResult;
        }
    )
}

// expect chainedResult.baseTreeSHA
// expects chainedResult.owner
// expects chainedResult.repo
// adds chainedResult.newTreeSHA
// 
// returns: chainedResult
function createTree(chainedResult) {
    buildNewTree(chainedResult);
  
    return github.gitdata.createTree(
        {
            owner: chainedResult.owner,
            repo: chainedResult.repo,
            base_tree: chainedResult.baseTreeSHA,
            tree: chainedResult.newTree
        }
    )
    .then(
        githubResponse=> {
            chainedResult.newTreeSHA = githubResponse.sha;
            return chainedResult
        }
    )
}

// expects chainedResult.parentCommitSHA, chainedResult.newTreeSHA, chainedResult.owner, chainedResult.repo
// adds chainedResult.newCommitSHA
// returns: chainedResult
function createCommit(chainedResult) {
    
    return github.gitdata.createCommit(
        {
            owner: chainedResult.owner,
            repo: chainedResult.repo,
            message: 'saving cwrc draft', 
            parents: [chainedResult.parentCommitSHA],
            tree: chainedResult.newTreeSHA

        }
    )
    .then(
        githubResponse=>{
            chainedResult.newCommitSHA = githubResponse.sha; 
            return chainedResult
        }
    )
}

// expects in chainedResult: newCommitSHA
// adds to chainedResult: nothing
// returns: chainedResult
function createCWRCDraftsBranch(chainedResult) {
    return github.gitdata.createReference(
        {
            owner: chainedResult.owner,
            repo: chainedResult.repo,
            ref: 'refs/heads/cwrc-drafts', 
            sha: chainedResult.newCommitSHA
        }
    ).then(githubResponse=>chainedResult)
}

//expects chainedResult.newCommitTag
// adds to chainedResult: nothing
// returns chainedResult
function createCWRCVersionTag(chainedResult) {
    return github.gitdata.createReference(
        {
            owner: chainedResult.owner,
            repo: chainedResult.repo,
            ref: `refs/tags/cwrc-drafts/${chainedResult.versionTimestamp}`, 
            sha: chainedResult.newCommitSHA
        }
    ).then(githubResponse=>chainedResult)
}

// expects chainedResult.newCommitSHA
// adds to chainedResult: nothing
// returns: chainedResult
function updateCWRCDraftsBranch(chainedResult) {
    return github.gitdata.updateReference(
        {
            owner: chainedResult.owner,
            repo: chainedResult.repo,
            ref: 'heads/cwrc-drafts', 
            sha: chainedResult.newCommitSHA
        }
    ).then(githubResponse=>chainedResult)
}



module.exports = {
    authenticate: authenticate,
    getDetailsForAuthenticatedUser: getDetailsForAuthenticatedUser,
    getReposForAuthenticatedUser: getReposForAuthenticatedUser,
    getReposForUser: getReposForUser,
	saveDoc: saveDoc,
	getDoc: getDoc,
    createRepoForDoc: createRepoForDoc,
    getAnnotations: getAnnotations,
    getTemplates: getTemplates,
    getTemplate: getTemplate
};