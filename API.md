<a name="module_src/index"></a>

## src/index

Module providing GitHub API calls.

- [src/index](#srcindex)
  - [src/index~authenticate(gitHubOAuthToken) ⇒ `Promise`](#srcindexauthenticategithuboauthtoken--promise)
  - [src/index~getDetailsForAuthenticatedUser() ⇒ `Promise`](#srcindexgetdetailsforauthenticateduser--promise)
  - [src/index~getDetailsForUser(username) ⇒ `Promise`](#srcindexgetdetailsforuserusername--promise)
  - [src/index~getReposForAuthenticatedUser(affiliation, page, per_page) ⇒ `Promise`](#srcindexgetreposforauthenticateduseraffiliation-page-per_page--promise)
  - [src/index~getReposForUser(username, page, per_page) ⇒ `Promise`](#srcindexgetreposforuserusername-page-per_page--promise)
  - [src/index~getDetailsForOrg(org) ⇒ `Promise`](#srcindexgetdetailsfororgorg--promise)
  - [src/index~getMembershipForUser(org, username) ⇒ `Promise`](#srcindexgetmembershipforuserorg-username--promise)
  - [src/index~getPermissionsForUser() ⇒ `Promise`](#srcindexgetpermissionsforuser--promise)
  - [src/index~getTemplates(owner, repo, ref, path) ⇒ `Promise`](#srcindexgettemplatesowner-repo-ref-path--promise)
  - [src/index~getDoc(owner, repo, ref, path) ⇒ `Promise`](#srcindexgetdocowner-repo-ref-path--promise)
  - [src/index~createRepo(repo, description, isPrivate) ⇒ `Promise`](#srcindexcreatereporepo-description-isprivate--promise)
  - [src/index~createOrgRepo(org, repo, description, isPrivate) ⇒ `Promise`](#srcindexcreateorgrepoorg-repo-description-isprivate--promise)
  - [src/index~saveDoc(owner, repo, path, content, branch, message, [sha]) ⇒ `Promise`](#srcindexsavedocowner-repo-path-content-branch-message-sha--promise)
  - [src/index~saveAsPullRequest(owner, repo, path, content, branch, message, title, [sha]) ⇒ `Promise`](#srcindexsaveaspullrequestowner-repo-path-content-branch-message-title-sha--promise)
  - [src/index~createFork(owner, repo, [organization]) ⇒ `Promise`](#srcindexcreateforkowner-repo-organization--promise)
  - [src/index~searchCode(query, page, per_page) ⇒ `Promise`](#srcindexsearchcodequery-page-per_page--promise)
  - [src/index~searchRepos(query, page, per_page) ⇒ `Promise`](#srcindexsearchreposquery-page-per_page--promise)
  - [src/index~getRepoContents(owner, repo) ⇒ `Promise`](#srcindexgetrepocontentsowner-repo--promise)
  - [src/index~getRepoContentsByDrillDown(owner, repo) ⇒ `Promise`](#srcindexgetrepocontentsbydrilldownowner-repo--promise)

<a name="module_src/index..authenticate"></a>

### src/index~authenticate(gitHubOAuthToken) ⇒ `Promise`

Authenticate the user for making calls to GitHub, using their OAuth token.
See [https://developer.github.com/v3/#authentication](https://developer.github.com/v3/#authentication)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| gitHubOAuthToken | `String` | The OAuth token from GitHub |

<a name="module_src/index..getDetailsForAuthenticatedUser"></a>

### src/index~getDetailsForAuthenticatedUser() ⇒ `Promise`

Get the details associated with the currently authenticated user.
See [https://developer.github.com/v3/users/#get-the-authenticated-user](https://developer.github.com/v3/users/#get-the-authenticated-user)

**Kind**: inner method of [`src/index`](#module_src/index)  
<a name="module_src/index..getDetailsForUser"></a>

### src/index~getDetailsForUser(username) ⇒ `Promise`

Get the details for a specific user.
See [https://developer.github.com/v3/users/#get-a-single-user](https://developer.github.com/v3/users/#get-a-single-user)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type |
| --- | --- |
| username | `String` |

<a name="module_src/index..getReposForAuthenticatedUser"></a>

### src/index~getReposForAuthenticatedUser(affiliation, page, per_page) ⇒ `Promise`

Get the repos the user has explicit permission to access.
See [https://developer.github.com/v3/repos/#list-your-repositories](https://developer.github.com/v3/repos/#list-your-repositories)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| affiliation | `String` | User's relation to the repo |
| page | `Integer` | The page number |
| per_page | `Integer` | Repos per page |

<a name="module_src/index..getReposForUser"></a>

### src/index~getReposForUser(username, page, per_page) ⇒ `Promise`

Get the repos for a specific user.
See [https://developer.github.com/v3/repos/#list-user-repositories](https://developer.github.com/v3/repos/#list-user-repositories)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| username | `String` | The username |
| page | `Integer` | The page number |
| per_page | `Integer` | Repos per page |

<a name="module_src/index..getDetailsForOrg"></a>

### src/index~getDetailsForOrg(org) ⇒ `Promise`

Get the repos for a specific org.
See [https://developer.github.com/v3/repos/#list-organization-repositories](https://developer.github.com/v3/repos/#list-organization-repositories)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| org | `String` | The org name |

<a name="module_src/index..getMembershipForUser"></a>

### src/index~getMembershipForUser(org, username) ⇒ `Promise`

Get organization membership for a user
See [https://docs.github.com/en/rest/reference/orgs#set-organization-membership-for-a-user](https://docs.github.com/en/rest/reference/orgs#set-organization-membership-for-a-user)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| org | `String` | The org name |
| username | `String` | The user name |

<a name="module_src/index..getPermissionsForUser"></a>

### src/index~getPermissionsForUser() ⇒ `Promise`

Get the permissions for a specific user and repo.
See [https://developer.github.com/v3/repos/collaborators/#review-a-users-permission-level](https://developer.github.com/v3/repos/collaborators/#review-a-users-permission-level)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| req.owner | `String` | The repo owner |
| req.repo | `String` | The repo |
| req.username | `String` | The username |

<a name="module_src/index..getTemplates"></a>

### src/index~getTemplates(owner, repo, ref, path) ⇒ `Promise`

Get the CWRC Writer templates.
Default location is [https://github.com/cwrc/CWRC-Writer-Templates/tree/master/templates](https://github.com/cwrc/CWRC-Writer-Templates/tree/master/templates)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| owner | `String` | The owner |
| repo | `String` | The repo |
| ref | `String` | The branch/tag |
| path | `String` | The path |

<a name="module_src/index..getDoc"></a>

### src/index~getDoc(owner, repo, ref, path) ⇒ `Promise`

Get a document from GitHub.
See [https://developer.github.com/v3/repos/contents/#get-contents](https://developer.github.com/v3/repos/contents/#get-contents)
See [https://octokit.github.io/rest.js/#octokit-routes-repos-get-contents](https://octokit.github.io/rest.js/#octokit-routes-repos-get-contents)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| owner | `String` | The owner |
| repo | `String` | The repo |
| ref | `String` | The branch/tag |
| path | `String` | The path |

<a name="module_src/index..createRepo"></a>

### src/index~createRepo(repo, description, isPrivate) ⇒ `Promise`

Create a new repo for the authenticated user.
See [https://developer.github.com/v3/repos/#create](https://developer.github.com/v3/repos/#create)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| repo | `String` | The repo |
| description | `String` | The repo description |
| isPrivate | `String` \| `Boolean` | Is the repo private |

<a name="module_src/index..createOrgRepo"></a>

### src/index~createOrgRepo(org, repo, description, isPrivate) ⇒ `Promise`

Create a new repo for a specific org.
See [https://developer.github.com/v3/repos/#create](https://developer.github.com/v3/repos/#create)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| org | `String` | The org |
| repo | `String` | The repo |
| description | `String` | The description |
| isPrivate | `String` \| `Boolean` | Is the repo private |

<a name="module_src/index..saveDoc"></a>

### src/index~saveDoc(owner, repo, path, content, branch, message, [sha]) ⇒ `Promise`

Save (i.e. create or update) a document.
See [https://developer.github.com/v3/repos/contents/#create-or-update-a-file](https://developer.github.com/v3/repos/contents/#create-or-update-a-file)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| owner | `String` | The owner |
| repo | `String` | The repo |
| path | `String` | The path |
| content | `String` | The content |
| branch | `String` | The branch |
| message | `String` | The commit message |
| [sha] | `String` | The SHA |

<a name="module_src/index..saveAsPullRequest"></a>

### src/index~saveAsPullRequest(owner, repo, path, content, branch, message, title, [sha]) ⇒ `Promise`

Save (i.e. create) a document as a pull request.
See [https://developer.github.com/v3/pulls/#create-a-pull-request](https://developer.github.com/v3/pulls/#create-a-pull-request)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| owner | `String` | The owner |
| repo | `String` | The repo |
| path | `String` | The path |
| content | `String` | The content |
| branch | `String` | The branch |
| message | `String` | The commit message |
| title | `String` | The title of the pull request |
| [sha] | `String` | The SHA |

<a name="module_src/index..createFork"></a>

### src/index~createFork(owner, repo, [organization]) ⇒ `Promise`

Create a fork for the authenticated user.
See [https://octokit.github.io/rest.js/v18#repos-create-fork](https://octokit.github.io/rest.js/v18#repos-create-fork)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| owner | `String` | The owner |
| repo | `String` | The repo |
| [organization] | `String` | The organization |

<a name="module_src/index..searchCode"></a>

### src/index~searchCode(query, page, per_page) ⇒ `Promise`

Search for files based on a specific query.
See [https://developer.github.com/v3/search/#search-code](https://developer.github.com/v3/search/#search-code)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| query | `String` | The query |
| page | `String` | The page number |
| per_page | `String` | Results per page |

<a name="module_src/index..searchRepos"></a>

### src/index~searchRepos(query, page, per_page) ⇒ `Promise`

Search for repos based on a specific query.
See [https://developer.github.com/v3/search/#search-repositories](https://developer.github.com/v3/search/#search-repositories)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| query | `String` | The query |
| page | `String` | The page number |
| per_page | `String` | Results per page |

<a name="module_src/index..getRepoContents"></a>

### src/index~getRepoContents(owner, repo) ⇒ `Promise`

Gets the contents (i.e. file structure) of a repo using the GitHub recursive tree method.
See [https://developer.github.com/v3/git/trees/#get-a-tree-recursively](https://developer.github.com/v3/git/trees/#get-a-tree-recursively)

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| owner | `String` | The owner |
| repo | `String` | The repo |

<a name="module_src/index..getRepoContentsByDrillDown"></a>

### src/index~getRepoContentsByDrillDown(owner, repo) ⇒ `Promise`

Gets the contents (i.e. file structure) of a repo by manually recursing.
Intended to be used if the github recursive option didn't work because the repository is too big.

**Kind**: inner method of [`src/index`](#module_src/index)  

| Param | Type | Description |
| --- | --- | --- |
| owner | `String` | The owner |
| repo | `String` | The repo |
