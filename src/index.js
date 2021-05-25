/**
 * Module providing GitHub API calls.
 * @module src/index
 */

const { Octokit } = require('@octokit/rest');

let octokit;

// We chain together the calls to github as a series of chained promises, and pass
// the growing result as an object (strictly speaking, creating a copy of the object
// at each point in the chain, so no arguments are mutated) along the promise chain, ultimately returning
// the object, which holds the new document, new annotations, treeSHA, and commitSHA
// The document and annotations are new because we rewrite all the annotations to use
// new raw github URIs for the newly saved document and annotation files.

//Encoding & Decoding
const _encodeContent = (content) => Buffer.from(content).toString('base64');
const _decodeContent = (content) => Buffer.from(content, 'base64').toString('utf8');

/**
 * Authenticate the user for making calls to GitHub, using their OAuth token.
 * See {@link https://developer.github.com/v3/#authentication}
 * @param {String} gitHubOAuthToken The OAuth token from GitHub
 * @returns {Promise}
 */
const authenticate = (gitHubOAuthToken) => {
  octokit = new Octokit({
    auth: gitHubOAuthToken,
    userAgent: 'octokit/rest.js v18.0.11',
  });

  return octokit;
};

/**
 * Get the details associated with the currently authenticated user.
 * See {@link https://developer.github.com/v3/users/#get-the-authenticated-user}
 * @returns {Promise}
 */
const getDetailsForAuthenticatedUser = async () => await octokit.users.getAuthenticated();

/**
 * Get the details for a specific user.
 * See {@link https://developer.github.com/v3/users/#get-a-single-user}
 * @param {String} username
 * @returns {Promise}
 */
const getDetailsForUser = async (username) => {
  return await octokit.users.getByUsername({ username });
};

/**
 * Get the repos the user has explicit permission to access.
 * See {@link https://developer.github.com/v3/repos/#list-your-repositories}
 * @param {String} affiliation User's relation to the repo
 * @param {Integer} page The page number
 * @param {Integer} per_page Repos per page
 * @returns {Promise}
 */
const getReposForAuthenticatedUser = async (affiliation, page, per_page) => {
  return await octokit.repos.listForAuthenticatedUser({ affiliation, page, per_page });
};

/**
 * Get the repos for a specific user.
 * See {@link https://developer.github.com/v3/repos/#list-user-repositories}
 * @param {String} username The username
 * @param {Integer} page The page number
 * @param {Integer} per_page Repos per page
 * @returns {Promise}
 */
const getReposForUser = async (username, page, per_page) => {
  return await octokit.repos.listForUser({ username, page, per_page });
};

/**
 * Get the repos for a specific org.
 * See {@link https://developer.github.com/v3/repos/#list-organization-repositories}
 * @param {String} org The org name
 * @returns {Promise}
 */
const getDetailsForOrg = async (org) => {
  return await octokit.orgs.get({ org });
};

/**
 * Get organization membership for a user
 * See {@link https://docs.github.com/en/rest/reference/orgs#set-organization-membership-for-a-user}
 * @param {String} org The org name
 * @param {String} username The user name
 * @returns {Promise}
 */
const getMembershipForUser = async ({ org, username }) => {
  return await octokit.orgs.getMembershipForUser({ org, username });
};

/**
 * Get the permissions for a specific user and repo.
 * See {@link https://developer.github.com/v3/repos/collaborators/#review-a-users-permission-level}
 * @param {String} req.owner The repo owner
 * @param {String} req.repo The repo
 * @param {String} req.username The username
 * @returns {Promise}
 */
const getPermissionsForUser = async ({ owner, repo, username }) => {
  const result = await octokit.repos.getCollaboratorPermissionLevel({ owner, repo, username });
  return result;
};

/**
 * Get the CWRC Writer templates.
 * Default location is {@link https://github.com/cwrc/CWRC-Writer-Templates/tree/master/templates}
 * @param {String} owner The owner
 * @param {String} repo The repo
 * @param {String} ref The branch/tag
 * @param {String} path The path
 * @returns {Promise}
 */
const getTemplates = async (owner, repo, ref, path) => {
  return await octokit.repos.getContent({ owner, repo, ref, path });
};

/**
 * Get a document from GitHub.
 * See {@link https://developer.github.com/v3/repos/contents/#get-contents}
 * See {@link https://octokit.github.io/rest.js/#octokit-routes-repos-get-contents}
 * @param {String} owner The owner
 * @param {String} repo The repo
 * @param {String} ref The branch/tag
 * @param {String} path The path
 * @returns {Promise}
 */
const getDoc = async ({ owner, repo, path, ref }) => {
  const result = await octokit.repos.getContent({ owner, repo, ref, path });

  return {
    owner,
    repo,
    ref,
    path,
    doc: _decodeContent(result.data.content),
    sha: result.data.sha,
  };
};

/**
 * Create a new repo for the authenticated user.
 * See {@link https://developer.github.com/v3/repos/#create}
 * @param {String} repo The repo
 * @param {String} description The repo description
 * @param {String|Boolean} isPrivate Is the repo private
 * @returns {Promise}
 */
const createRepo = async ({ owner, repo, description, isPrivate }) => {
  isPrivate = isPrivate === 'true' ? true : false;

  const githubResponse = await octokit.repos
    .createForAuthenticatedUser({
      name: repo,
      description,
      auto_init: true,
      private: isPrivate,
    })
    .catch(logError);

  //rename branch to master 
  //TODO remove this and add option to the user choose the branch they want to work with
  const branch = await renameRepo({ owner, repo, branch:'main', new_name:'master' })

  return {
    description,
    isPrivate,
    owner: githubResponse.data.owner.login,
    repo: githubResponse.data.name,
    branch,
  };
};

/**
 * Create a new repo for the authenticated user.
 * See {@link https://developer.github.com/v3/repos/#create}
 * @param {String} repo The repo
 * @param {String} description The repo description
 * @param {String|Boolean} isPrivate Is the repo private
 * @returns {Promise}
 */
 const renameRepo = async ({ owner, repo, branch, new_name }) => {
  const response = await octokit.repos.renameBranch({
    owner,
    repo,
    branch,
    new_name,
  })
  .catch(logError);

  if (response.status === 201) return new_name;
  return branch;
};

/**
 * Create a new repo for a specific org.
 * See {@link https://developer.github.com/v3/repos/#create}
 * @param {String} org The org
 * @param {String} repo The repo
 * @param {String} description The description
 * @param {String|Boolean} isPrivate Is the repo private
 * @returns {Promise}
 */
const createOrgRepo = async ({ org, repo, description, isPrivate }) => {
  isPrivate = isPrivate == 'true' ? true : false;

  const githubResponse = await octokit.repos
    .createInOrg({
      org,
      name: repo,
      description: description,
      auto_init: true,
      private: isPrivate,
    })
    .catch(logError);

  return {
    org,
    description,
    isPrivate,
    owner: githubResponse.data.owner.login,
    repo: githubResponse.data.name,
  };
};

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
const saveDoc = async ({ owner, repo, path, content, branch, message, sha }) => {
  if (sha === undefined) {
    // try to get the sha
    sha = await _getLatestFileSHA({ owner, repo, branch, path });
  }

  if (sha) {
    return await _updateFile({ owner, repo, path, content, branch, message, sha });
  } else {
    return await _createFile({ owner, repo, path, content, branch, message });
  }
};

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
const _createFile = async (chainedResult) => {
  const { owner, repo, path, message, content, branch } = chainedResult;

  const result = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: _encodeContent(content),
    branch,
  });

  return {
    ...chainedResult,
    sha: result.data.content.sha,
  };
};

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
const _updateFile = async (chainedResult) => {
  const { owner, repo, path, message, content, sha, branch } = chainedResult;
  //probably want to write in the cwrc-git /// application tag, but that could go in from the cwrc-writer I guess, before sending.

  const result = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: _encodeContent(content),
    sha,
    branch,
  });

  return {
    ...chainedResult,
    sha: result.data.content.sha,
  };
};

/* the Details must contain:
owner: the owner of the repo
repo: repoName
branch: the branch name
 */
const _createBranchFromMaster = async (theDetails) => {
  const { owner, repo, branch } = theDetails;

  const result = await _getMasterBranchSHAs(theDetails).catch(logError);

  const githubResponse = await octokit.git
    .createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: result.parentCommitSHA,
    })
    .catch(logError);

  return {
    ...theDetails,
    refURL: githubResponse.data.url,
  };
};

const _checkForPullRequest = async ({ owner, repo, branch }) => {
  const result = await octokit.search.issuesAndPullRequests({
    q: `state:open type:pr repo:${owner}/${repo} head:${branch}`,
  });

  return result.data.total_count > 0;
};

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
const saveAsPullRequest = async ({
  owner,
  repo,
  path,
  content,
  branch,
  message,
  title,
  crossRepository = false,
  sha,
}) => {
  if (!crossRepository) {
    //test and create branch
    const doesBranchExist = await _checkForBranch({ owner, repo, branch });
    if (!doesBranchExist) await _createBranchFromMaster({ owner, repo, branch });

    //save file in the new branch
    const resultOfSave = await saveDoc({ owner, repo, path, content, branch, message, sha });
    sha = resultOfSave.sha;
  }

  // there can be only one PR per branch */
  const doesPullRequestExist = await _checkForPullRequest({ owner, repo, branch });

  if (!doesPullRequestExist) {
    await _createPullRequest({
      owner,
      repo,
      title,
      head: branch,
      base: 'master',
      body: message,
    });
  }

  return { owner, repo, path, content, branch, message, title, sha };
};

const _createPullRequest = async ({ owner, repo, title, head, base, body }) => {
  return await octokit.pulls
    .create({ owner, repo, title, head, base, body })
    .catch((error) => error);
};

const _getLatestFileSHA = async (chainedResult) => {
  const { owner, repo, branch, path } = chainedResult;

  const {
    data: {
      data: {
        repository: { object: result },
      },
    },
  } = await octokit
    .request({
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
		}`,
    })
    .catch((error) => {
      console.log(error);
    });

  const sha = result ? result.oid : null;
  return sha;
};

/**
 * Create a fork for the authenticated user.
 * See {@link https://octokit.github.io/rest.js/v18#repos-create-fork}
 * @param {String} owner The owner
 * @param {String} repo The repo
 * @param {String} [organization] The organization
 * @returns {Promise}
 */
const createFork = async ({ owner, repo, organization }) => {
  const fork = { owner, repo };
  if (organization) fork.organization = organization;
  const result = await octokit.repos.createFork(fork);
  return { owner, repo, organization, result };
};

const logError = (error) => {
  console.error('oh no!');
  console.log(error);
  throw new Error(error);
  // return Promise.reject(error);
};

const _getMasterBranchSHAs = async (chainedResult) => {
  const githubResponse = await octokit.repos.getBranch({
    owner: chainedResult.owner,
    repo: chainedResult.repo,
    branch: 'master',
  });

  return {
    ...chainedResult,
    baseTreeSHA: githubResponse.data.commit.commit.tree.sha,
    parentCommitSHA: githubResponse.data.commit.sha,
  };
};

const _getTreeContentsByDrillDown = async (chainedResult) => {
  const basePath = '';

  const response = await _getTreeContents(
    {
      owner: chainedResult.owner,
      repo: chainedResult.repo,
      tree_sha: chainedResult.baseTreeSHA,
    },
    basePath
  );

  return {
    ...chainedResult,
    contents: {
      type: 'folder',
      path: '',
      name: '',
      contents: response,
    },
  };
};

const _getTreeContents = async (treeDetails, basePath) => {
  const response = await octokit.git.getTree(treeDetails);

  let promises = response.data.tree.map((entry) => {
    let path = basePath + entry.path;
    if (entry.type === 'tree') {
      return _getTreeContents(
        {
          owner: treeDetails.owner,
          repo: treeDetails.repo,
          tree_sha: entry.sha,
        },
        `${path}/`
      ).then((folderContents) => ({
        type: 'folder',
        path: path,
        name: entry.path,
        contents: folderContents,
      }));
    } else {
      return Promise.resolve({
        type: 'file',
        path: path,
        name: entry.path,
      });
    }
  });

  return Promise.all(promises).then((results) => {
    return results;
  });
};

const _unflattenContents = (flatContents) => {
  const files = flatContents.filter((file) => file.type === 'blob');
  const result = {
    type: 'folder',
    name: '',
    path: '',
    contents: [],
  };
  const findSubFolder = (parentFolder, folderNameToFind) => {
    const subfolder = parentFolder.contents.find((el) => {
      return el.type === 'folder' && el.name === folderNameToFind;
    });
    return subfolder;
  };
  const addSubFolder = (newFolderName, parentFolder) => {
    const newSubFolder = {
      type: 'folder',
      name: newFolderName,
      path: `${parentFolder.path}/${newFolderName}`,
      contents: [],
    };
    parentFolder.contents.push(newSubFolder);
    return newSubFolder;
  };
  const addFile = (newFileName, parentFolder) => {
    const newFile = {
      type: 'file',
      name: newFileName,
      path: `${parentFolder.path}/${newFileName}`,
    };
    parentFolder.contents.push(newFile);
  };
  const isFile = (pathSections, currentIndex) => {
    return pathSections.length - 1 == currentIndex;
  };

  files.forEach((file) => {
    const pathSections = file.path.split('/');
    pathSections.reduce((parentFolder, pathSection, pathSectionIndex) => {
      const subFolder = findSubFolder(parentFolder, pathSection);
      if (subFolder) {
        return subFolder;
      } else if (isFile(pathSections, pathSectionIndex)) {
        return addFile(pathSection, parentFolder);
      } else {
        return addSubFolder(pathSection, parentFolder);
      }
    }, result);
  });
  return result;
};

/**
 * Search for files based on a specific query.
 * See {@link https://developer.github.com/v3/search/#search-code}
 * @param {String} query The query
 * @param {String} page The page number
 * @param {String} per_page Results per page
 * @returns {Promise}
 */
const searchCode = async (query, page, per_page) => {
  const response = await octokit.search.code({
    q: query,
    page,
    per_page,
    mediaType: { format: 'text-match' },
  });

  return response;
};

/**
 * Search for repos based on a specific query.
 * See {@link https://developer.github.com/v3/search/#search-repositories}
 * @param {String} query The query
 * @param {String} page The page number
 * @param {String} per_page Results per page
 * @returns {Promise}
 */
const searchRepos = async (query, page, per_page) => {
  const response = await octokit.search.repos({
    q: query,
    page,
    per_page,
    mediaType: { format: 'text-match' },
  });

  return response;
};

/**
 * Gets the contents (i.e. file structure) of a repo using the GitHub recursive tree method.
 * See {@link https://developer.github.com/v3/git/trees/#get-a-tree-recursively}
 * @param {String} owner The owner
 * @param {String} repo The repo
 * @returns {Promise}
 */
const getRepoContents = async ({ owner, repo }) => {
  const masterBranch = await _getMasterBranchSHAs({ owner, repo });
  return await _getTreeContentsRecursively(masterBranch);
};

const _getTreeContentsRecursively = async (chainedResult) => {
  const githubResponse = await octokit.git.getTree({
    owner: chainedResult.owner,
    repo: chainedResult.repo,
    tree_sha: chainedResult.baseTreeSHA,
    recursive: 1,
  });

  return {
    ...chainedResult,
    contents: _unflattenContents(githubResponse.data.tree),
    truncated: githubResponse.data.truncated,
  };
};

/**
 * Gets the contents (i.e. file structure) of a repo by manually recursing.
 * Intended to be used if the github recursive option didn't work because the repository is too big.
 * @param {String} owner The owner
 * @param {String} repo The repo
 * @returns {Promise}
 */
const getRepoContentsByDrillDown = async (owner, repo) => {
  const results = await _getMasterBranchSHAs({ owner, repo });
  return await _getTreeContentsByDrillDown(results);
};

const _checkForBranch = async (theDetails) => {
  const results = await octokit.git
    .getRef({
      owner: theDetails.owner,
      repo: theDetails.repo,
      ref: `heads/${theDetails.branch}`,
    })
    .catch((error) => {
      if (error.status === 404) {
        return false;
      } else {
        throw new Error(
          `Something went wrong with the call to check for a branch. ${error.message}`
        );
      }
    });

  if (results === false) return false;

  // this next check also handles the case where the branch name doesn't exist, but there are branches
  // for which this name is a prefix, in which case the call returns an array of those 'matching' branches.
  // See:  https://developer.github.com/v3/git/refs/#get-a-reference
  return Object.prototype.hasOwnProperty.call(results.data, 'object');
  // return results.data.hasOwnProperty('object');
};

module.exports = {
  authenticate,
  createFork,
  createRepo,
  createOrgRepo,
  getDetailsForAuthenticatedUser,
  getDetailsForUser,
  getDetailsForOrg,
  getDoc,
  getMembershipForUser,
  getRepoContents,
  getRepoContentsByDrillDown,
  getReposForAuthenticatedUser,
  getReposForUser,
  getPermissionsForUser,
  getTemplates,
  saveAsPullRequest,
  saveDoc,
  searchCode,
  searchRepos,
};
