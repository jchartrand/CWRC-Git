# CWRC-Git

1. [Overview](#overview)
1. [Demo](#demo)
1. [Installation](#installation)
1. [Use](#use)
1. [Development](#development)
1. [Contributing](#contributing)
1. [FAQ](#faq)
1. [License](#license)

### Overview

NPM package for creating and updating CWRC XML documents in GitHub through the GitHub API.  Used by the [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer), whose web API is in turn used by the [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter].

### Demo 

A [CWRC GitHub Sandbox](http://208.75.74.217/editor_github.html) uses the NPM package published from this repository along with the code in [CWRC-Writer](https://github.com/cwrc/CWRC-Writer), [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer), [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter], and [CWRC-GitDelegator](https://github.com/cwrc/CWRC-GitServer). The same code is easily (for someone with modest development experience) installed on any server to run your own instance.

### Installation

`npm install cwrcgit`   

To simultaneously register as a dependency in your package.json:

`npm install cwrcgit --save`   

or in shortcut form:

`npm i -S cwrcgit`

### Use

One example:

var cwrcGit = require('cwrcgit');
cwrcGit.authenticate(gitHubOAuthToken);
var repos = cwrcGit.getReposForAuthenticatedUser();

The spec directory contains specifications (tests) that can help better understand the API. Also see [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer) which fully uses the API.

The methods exposed (API) by this package are:

```
authenticate(gitHubOAuthToken)

getDetailsForAuthenticatedUser()

getReposForAuthenticatedUser()

getReposForUser({})

createRepoForDoc({})

saveDoc({})

getDoc({})

getAnnotations({})

deleteRepo({})
```

### Development

* Fork or clone (depending on your role in the project) the repo to your local machine.

* `npm install` to install the node.js dependencies 
	
	NOTE:  we use `npm set save-exact true` to save dependencies as exact version numbers so NPM should install exact versions when you run install

* write a test (or two)for your new functionality (in 'spec' directory)

* `npm test` to start mocha and automatically rerun the tests whenever you change a file

* change some stuff to satisfy new test

NOTE:  if you are working from a fork of the repo, then commit change to github and submit a pull request

### Release to NPM

If you are working within a cloned copy, do the following to setup automatic semantic release through continuous integration using semantic-relase and commitizen, otherwise if your are working from a fork, submit a pull-request.

Make sure you've got NPM configured to publish to the NPM registry:

```
npm set init.author.name "James Chartrand"
npm set init.author.email "jc.chartrand@gmail.com"
npm set init.author.url "http://openskysolutions.ca"
npm login  (and then answer prompts)
```

and install semantic-release-cli globally:

`npm install -g semantic-release-cli`

If necessary (although it should already have been done, but maybe the NPM author information has changed for example) configure it:

`semantic-release-cli setup`

which will ask you a series of questions, which at the time of writing this were:

```
semantic-release-cli setup
? What is your npm registry? https://registry.npmjs.org/
? What is your npm username? jchartrand
? What is your npm password? *******
? What is your GitHub username? jchartrand
? What is your GitHub password? ********
? What CI are you using? Travis CI
```

Anytime you want to submit a commit, stage your changes (e.g., git add -A) then instead of using git's commit command, instead automatically use `npm run commit` which uses commitizen to create commits that are structured to adhere to the semantic-release conventions (which are the same as those used by Google: https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit )


* check code coverage results on github page (coverage badge percentage)

Testing uses mocha and chai.  Tests are in spec. 

This module makes http calls to the GitHub API, including calls to create new repositories.  Rather than make those calls for every test, [nock](https://github.com/node-nock/nock) instead mocks the calls to GitHub (intercepts the calls and instead returns pre-recorded data).  

### Contributing

Please contact us if you'd like to contribute.  Standard pull requests, including tests, are expected.

### FAQ

Who would use this?

Anyone wanting to use the CWRC-Writer to author XML documents and add RDF annotations, and save those documents to GitHub.

### License

[GNU GPL V2](LICENSE)