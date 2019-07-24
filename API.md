## Functions

<dl>
<dt><a href="#authenticate">authenticate(gitHubOAuthToken)</a> ⇒ <code>Promise</code></dt>
<dd><p>Authenticate the user for making calls to GitHub, using their OAuth token.
See <a href="https://developer.github.com/v3/#authentication">https://developer.github.com/v3/#authentication</a></p>
</dd>
<dt><a href="#getDetailsForAuthenticatedUser">getDetailsForAuthenticatedUser()</a> ⇒ <code>Promise</code></dt>
<dd><p>Get the details associated with the currently authenticated user.
See <a href="https://developer.github.com/v3/users/#get-the-authenticated-user">https://developer.github.com/v3/users/#get-the-authenticated-user</a></p>
</dd>
<dt><a href="#getDetailsForUser">getDetailsForUser(username)</a> ⇒ <code>Promise</code></dt>
<dd><p>Get the details for a specific user.
See <a href="https://developer.github.com/v3/users/#get-a-single-user">https://developer.github.com/v3/users/#get-a-single-user</a></p>
</dd>
<dt><a href="#getReposForAuthenticatedUser">getReposForAuthenticatedUser(affiliation, page, per_page)</a> ⇒ <code>Promise</code></dt>
<dd><p>Get the repos the user has explicit permission to access.
See <a href="https://developer.github.com/v3/repos/#list-your-repositories">https://developer.github.com/v3/repos/#list-your-repositories</a></p>
</dd>
<dt><a href="#getReposForUser">getReposForUser(username, page, per_page)</a> ⇒ <code>Promise</code></dt>
<dd><p>Get the repos for a specific user.
See <a href="https://developer.github.com/v3/repos/#list-user-repositories">https://developer.github.com/v3/repos/#list-user-repositories</a></p>
</dd>
<dt><a href="#getDetailsForOrg">getDetailsForOrg(org)</a> ⇒ <code>Promise</code></dt>
<dd><p>Get the repos for a specific org.
See <a href="https://developer.github.com/v3/repos/#list-organization-repositories">https://developer.github.com/v3/repos/#list-organization-repositories</a></p>
</dd>
<dt><a href="#getPermissionsForUser">getPermissionsForUser(owner, repo, username)</a> ⇒ <code>Promise</code></dt>
<dd><p>Get the permissions for a specific user and repo.
See <a href="https://developer.github.com/v3/repos/collaborators/#review-a-users-permission-level">https://developer.github.com/v3/repos/collaborators/#review-a-users-permission-level</a></p>
</dd>
<dt><a href="#getTemplates">getTemplates(owner, repo, ref, path)</a> ⇒ <code>Promise</code></dt>
<dd><p>Get the CWRC Writer templates.
Default location is <a href="https://github.com/cwrc/CWRC-Writer-Templates/tree/master/templates">https://github.com/cwrc/CWRC-Writer-Templates/tree/master/templates</a></p>
</dd>
<dt><a href="#getDoc">getDoc(owner, repo, ref, path)</a> ⇒ <code>Promise</code></dt>
<dd><p>Get a document from GitHub.
See <a href="https://developer.github.com/v3/repos/contents/#get-contents">https://developer.github.com/v3/repos/contents/#get-contents</a></p>
</dd>
<dt><a href="#createRepo">createRepo(repo, description, isPrivate)</a> ⇒ <code>Promise</code></dt>
<dd><p>Create a new repo for the authenticated user.
See <a href="https://developer.github.com/v3/repos/#create">https://developer.github.com/v3/repos/#create</a></p>
</dd>
<dt><a href="#createOrgRepo">createOrgRepo(org, repo, description, isPrivate)</a> ⇒ <code>Promise</code></dt>
<dd><p>Create a new repo for a specific org.
See <a href="https://developer.github.com/v3/repos/#create">https://developer.github.com/v3/repos/#create</a></p>
</dd>
<dt><a href="#saveDoc">saveDoc(owner, repo, path, content, branch, message, [sha])</a> ⇒ <code>Promise</code></dt>
<dd><p>Save (i.e. create or update) a document.
See <a href="https://developer.github.com/v3/repos/contents/#create-or-update-a-file">https://developer.github.com/v3/repos/contents/#create-or-update-a-file</a></p>
</dd>
<dt><a href="#saveAsPullRequest">saveAsPullRequest(owner, repo, path, content, branch, message, title, [sha])</a> ⇒ <code>Promise</code></dt>
<dd><p>Save (i.e. create) a document as a pull request.
See <a href="https://developer.github.com/v3/pulls/#create-a-pull-request">https://developer.github.com/v3/pulls/#create-a-pull-request</a></p>
</dd>
<dt><a href="#searchCode">searchCode(query, page, per_page)</a> ⇒ <code>Promise</code></dt>
<dd><p>Search for files based on a specific query.
See <a href="https://developer.github.com/v3/search/#search-code">https://developer.github.com/v3/search/#search-code</a></p>
</dd>
<dt><a href="#searchRepos">searchRepos(query, page, per_page)</a> ⇒ <code>Promise</code></dt>
<dd><p>Search for repos based on a specific query.
See <a href="https://developer.github.com/v3/search/#search-repositories">https://developer.github.com/v3/search/#search-repositories</a></p>
</dd>
<dt><a href="#getRepoContents">getRepoContents(owner, repo)</a> ⇒ <code>Promise</code></dt>
<dd><p>Gets the contents (i.e. file structure) of a repo using the GitHub recursive tree method.
See <a href="https://developer.github.com/v3/git/trees/#get-a-tree-recursively">https://developer.github.com/v3/git/trees/#get-a-tree-recursively</a></p>
</dd>
<dt><a href="#getRepoContentsByDrillDown">getRepoContentsByDrillDown(owner, repo)</a> ⇒ <code>Promise</code></dt>
<dd><p>Gets the contents (i.e. file structure) of a repo by manually recursing.
Intended to be used if the github recursive option didn&#39;t work because the repository is too big.</p>
</dd>
</dl>

<a name="authenticate"></a>

## authenticate(gitHubOAuthToken) ⇒ <code>Promise</code>
Authenticate the user for making calls to GitHub, using their OAuth token.
See [https://developer.github.com/v3/#authentication](https://developer.github.com/v3/#authentication)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| gitHubOAuthToken | <code>String</code> | The OAuth token from GitHub |

<a name="getDetailsForAuthenticatedUser"></a>

## getDetailsForAuthenticatedUser() ⇒ <code>Promise</code>
Get the details associated with the currently authenticated user.
See [https://developer.github.com/v3/users/#get-the-authenticated-user](https://developer.github.com/v3/users/#get-the-authenticated-user)

**Kind**: global function  
<a name="getDetailsForUser"></a>

## getDetailsForUser(username) ⇒ <code>Promise</code>
Get the details for a specific user.
See [https://developer.github.com/v3/users/#get-a-single-user](https://developer.github.com/v3/users/#get-a-single-user)

**Kind**: global function  

| Param | Type |
| --- | --- |
| username | <code>String</code> | 

<a name="getReposForAuthenticatedUser"></a>

## getReposForAuthenticatedUser(affiliation, page, per_page) ⇒ <code>Promise</code>
Get the repos the user has explicit permission to access.
See [https://developer.github.com/v3/repos/#list-your-repositories](https://developer.github.com/v3/repos/#list-your-repositories)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| affiliation | <code>String</code> | User's relation to the repo |
| page | <code>Integer</code> | The page number |
| per_page | <code>Integer</code> | Repos per page |

<a name="getReposForUser"></a>

## getReposForUser(username, page, per_page) ⇒ <code>Promise</code>
Get the repos for a specific user.
See [https://developer.github.com/v3/repos/#list-user-repositories](https://developer.github.com/v3/repos/#list-user-repositories)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>String</code> | The username |
| page | <code>Integer</code> | The page number |
| per_page | <code>Integer</code> | Repos per page |

<a name="getDetailsForOrg"></a>

## getDetailsForOrg(org) ⇒ <code>Promise</code>
Get the repos for a specific org.
See [https://developer.github.com/v3/repos/#list-organization-repositories](https://developer.github.com/v3/repos/#list-organization-repositories)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| org | <code>String</code> | The org name |

<a name="getPermissionsForUser"></a>

## getPermissionsForUser(owner, repo, username) ⇒ <code>Promise</code>
Get the permissions for a specific user and repo.
See [https://developer.github.com/v3/repos/collaborators/#review-a-users-permission-level](https://developer.github.com/v3/repos/collaborators/#review-a-users-permission-level)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| owner | <code>String</code> | The repo owner |
| repo | <code>String</code> | The repo |
| username | <code>String</code> | The username |

<a name="getTemplates"></a>

## getTemplates(owner, repo, ref, path) ⇒ <code>Promise</code>
Get the CWRC Writer templates.
Default location is [https://github.com/cwrc/CWRC-Writer-Templates/tree/master/templates](https://github.com/cwrc/CWRC-Writer-Templates/tree/master/templates)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| owner | <code>String</code> | The owner |
| repo | <code>String</code> | The repo |
| ref | <code>String</code> | The branch/tag |
| path | <code>String</code> | The path |

<a name="getDoc"></a>

## getDoc(owner, repo, ref, path) ⇒ <code>Promise</code>
Get a document from GitHub.
See [https://developer.github.com/v3/repos/contents/#get-contents](https://developer.github.com/v3/repos/contents/#get-contents)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| owner | <code>String</code> | The owner |
| repo | <code>String</code> | The repo |
| ref | <code>String</code> | The branch/tag |
| path | <code>String</code> | The path |

<a name="createRepo"></a>

## createRepo(repo, description, isPrivate) ⇒ <code>Promise</code>
Create a new repo for the authenticated user.
See [https://developer.github.com/v3/repos/#create](https://developer.github.com/v3/repos/#create)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| repo | <code>String</code> | The repo |
| description | <code>String</code> | The repo description |
| isPrivate | <code>String</code> \| <code>Boolean</code> | Is the repo private |

<a name="createOrgRepo"></a>

## createOrgRepo(org, repo, description, isPrivate) ⇒ <code>Promise</code>
Create a new repo for a specific org.
See [https://developer.github.com/v3/repos/#create](https://developer.github.com/v3/repos/#create)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| org | <code>String</code> | The org |
| repo | <code>String</code> | The repo |
| description | <code>String</code> | The description |
| isPrivate | <code>String</code> \| <code>Boolean</code> | Is the repo private |

<a name="saveDoc"></a>

## saveDoc(owner, repo, path, content, branch, message, [sha]) ⇒ <code>Promise</code>
Save (i.e. create or update) a document.
See [https://developer.github.com/v3/repos/contents/#create-or-update-a-file](https://developer.github.com/v3/repos/contents/#create-or-update-a-file)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| owner | <code>String</code> | The owner |
| repo | <code>String</code> | The repo |
| path | <code>String</code> | The path |
| content | <code>String</code> | The content |
| branch | <code>String</code> | The branch |
| message | <code>String</code> | The commit message |
| [sha] | <code>String</code> | The SHA |

<a name="saveAsPullRequest"></a>

## saveAsPullRequest(owner, repo, path, content, branch, message, title, [sha]) ⇒ <code>Promise</code>
Save (i.e. create) a document as a pull request.
See [https://developer.github.com/v3/pulls/#create-a-pull-request](https://developer.github.com/v3/pulls/#create-a-pull-request)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| owner | <code>String</code> | The owner |
| repo | <code>String</code> | The repo |
| path | <code>String</code> | The path |
| content | <code>String</code> | The content |
| branch | <code>String</code> | The branch |
| message | <code>String</code> | The commit message |
| title | <code>String</code> | The title of the pull request |
| [sha] | <code>String</code> | The SHA |

<a name="searchCode"></a>

## searchCode(query, page, per_page) ⇒ <code>Promise</code>
Search for files based on a specific query.
See [https://developer.github.com/v3/search/#search-code](https://developer.github.com/v3/search/#search-code)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>String</code> | The query |
| page | <code>String</code> | The page number |
| per_page | <code>String</code> | Results per page |

<a name="searchRepos"></a>

## searchRepos(query, page, per_page) ⇒ <code>Promise</code>
Search for repos based on a specific query.
See [https://developer.github.com/v3/search/#search-repositories](https://developer.github.com/v3/search/#search-repositories)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>String</code> | The query |
| page | <code>String</code> | The page number |
| per_page | <code>String</code> | Results per page |

<a name="getRepoContents"></a>

## getRepoContents(owner, repo) ⇒ <code>Promise</code>
Gets the contents (i.e. file structure) of a repo using the GitHub recursive tree method.
See [https://developer.github.com/v3/git/trees/#get-a-tree-recursively](https://developer.github.com/v3/git/trees/#get-a-tree-recursively)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| owner | <code>String</code> | The owner |
| repo | <code>String</code> | The repo |

<a name="getRepoContentsByDrillDown"></a>

## getRepoContentsByDrillDown(owner, repo) ⇒ <code>Promise</code>
Gets the contents (i.e. file structure) of a repo by manually recursing.
Intended to be used if the github recursive option didn't work because the repository is too big.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| owner | <code>String</code> | The owner |
| repo | <code>String</code> | The repo |

