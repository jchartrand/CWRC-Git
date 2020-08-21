# CWRC-Git

![Picture](http://cwrc.ca/logos/CWRC_logos_2016_versions/CWRCLogo-Horz-FullColour.png)

[![Travis](https://img.shields.io/travis/cwrc/CWRC-Git.svg)](https://travis-ci.org/cwrc/CWRC-Git)
[![Codecov](https://img.shields.io/codecov/c/github/cwrc/CWRC-Git.svg)](https://codecov.io/gh/cwrc/CWRC-Git)
[![version](https://img.shields.io/npm/v/cwrcgit.svg)](http://npm.im/cwrcgit)
[![downloads](https://img.shields.io/npm/dm/cwrcgit.svg)](http://npm-stat.com/charts.html?package=cwrcgit&from=2015-08-01)
[![GPL-2.0](https://img.shields.io/npm/l/cwrcgit.svg)](http://opensource.org/licenses/GPL-2.0)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

- [CWRC-Git](#cwrc-git)
  - [Overview](#overview)
  - [Demo](#demo)
  - [Installation](#installation)
  - [Use](#use)
  - [API](#api)
    - [License](#license)

<!---
1. [Development](#development)
1. [Contributing](#contributing)
1. [FAQ](#faq)
-->

## Overview

A module for searching GitHub, and for creating and updating XML documents in GitHub. This is done through the GitHub API via [octokit/rest.js](https://github.com/octokit/rest.js). Used by the [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer), whose web API is in turn used by the [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter).

## Demo

The [CWRC-GitWriter Sandbox](https://cwrc-writer.cwrc.ca) is running an instance of [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter), which uses the code from [CWRC-WriterBase](https://github.com/cwrc/CWRC-WriterBase) and [cwrc-git-dialogs](https://github.com/cwrc/cwrc-git-dialogs). There is a corresponding server component running [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer) and using the NPM package published from this repository. The same code is easily (for someone with modest development experience) installed on any server to run your own instance. If you are looking to put together your own CWRC-Writer, [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter) is a good place to start.

## Installation

`npm install cwrcgit`

## Use

A simple example:

```js
const cwrcGit = require('cwrcgit');
cwrcGit.authenticate(gitHubOAuthToken);
const repos = cwrcGit.getDetailsForAuthenticatedUser();
```

## API

[View the full API here](API.md)

Also see [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer) which makes full use of this API.

<!--
## Development

* Fork or clone (depending on your role in the project) the repo to your local machine.

* `npm install` to install the node.js dependencies

* The config.json file specifies several passwords and tokens that are used during testing. You'll have to set these values appropriately in your cloned repo. The jwt_secret shouldn't matter, but the github values do. Once you've substituted your values, stop git from noticing that you've changed the file (so that you don't inadvertently commit the file and push it to the public repo thereby exposing the passwords):

`git update-index --skip-worktree config.json`

* write a test (or two) for your new functionality (in 'spec' directory)

* `npm test` to start mocha and automatically rerun the tests whenever you change a file

* change some stuff to satisfy new test

### Commit to Github / Build in Travis / Release to NPM

If you are working within a cloned copy, do the following to setup automatic semantic release through continuous integration using semantic-release (which in turn uses Travis) and commitizen. Otherwise, if you are working from a fork, then submit a pull-request.

Make sure you've got NPM configured to publish to the NPM registry:

```bash
npm set init.author.name "James Chartrand"
npm set init.author.email "jc.chartrand@gmail.com"
npm set init.author.url "http://openskysolutions.ca"
npm login (answer prompts approriately)
```

Install semantic-release-cli globally:

`npm install -g semantic-release-cli`

If necessary (although this was probably already done by someone else, but maybe the NPM author information has changed for example) configure semantic release:

`semantic-release-cli setup`

which will ask you a series of questions, which at the time of writing this were:

```bash
semantic-release-cli setup
? What is your npm registry? https://registry.npmjs.org/
? What is your npm username? jchartrand
? What is your npm password? *******
? What is your GitHub username? jchartrand
? What is your GitHub password? ********
? What CI are you using? Travis CI
```

Semantic-release-cli configures the corresponding Travis build (on the Travis web site in the Travis account associated with the given Github username) so that when the Travis build is triggered (whenever you push a change to the GitHub repo), Travis will run semantic-release, which will in turn:

* write a new version number to package.json
* deploy a new version to the NPM registry if the commited change is either a new feature or a breaking change.
* generate a changelog
* create a release in the Github project

A full description of what semantic-release-cli does is [here](https://github.com/semantic-release/cli#what-it-does).
A full description of what semantic-release itself does is [here](https://github.com/semantic-release/semantic-release#how-does-it-work)

To submit a commit, stage your changes (e.g., git add -A) then instead of using git's commit command, instead use `npm run commit` which uses commitizen to create commits that are structured to adhere to the semantic-release conventions (which are the same as those used by Google: <https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit> )

The NPM `ghooks` package is used to add two pre-commit git hooks that will check that all mocha tests pass and that code coverage is 100% (as caluclated by istanbul) before allowing a commit to proceed. The hooks are set in package.json:

```json
"config": {
    "ghooks": {
      "pre-commit": "npm run test:single && npm run check-coverage"
    }
  }
```

After the commit has succeeded then `git push` it all up to github, which will in turn trigger the Travis build. The Travis build is also set to confirm that all tests pass and that code coverage is 100%. This is set in the `.travis.yml` file:

```bash
script:
  - npm run test:single
  - npm run check-coverage
```

Of course, if the githooks that check tests and code coverage themselves passed, then the Travis check for tests and code coverage should also be fine.

Results of the travis build are here:

`https://travis-ci.org/cwrc/CWRC-Git`

The Travis build also publishes the code coverage statistics to codecov.io where the coverage can be viewed:

`https://codecov.io/gh/cwrc/CWRC-Git/`

 codecov.io also provides us with the code coverage badge at the top of this README.

Finally the Travis build publishes a new version (if the commit was designated as a new feature or breaking change) to NPM:

<https://www.npmjs.com/package/cwrcgit>

Testing uses mocha and chai. Tests are in the `spec` directory.

This module makes http calls to the GitHub API, including calls to create new repositories. Rather than make those calls for every test, [nock](https://github.com/node-nock/nock) instead mocks the calls to GitHub (intercepts the calls and instead returns pre-recorded data).

### Contributing

Please contact us if you'd like to contribute. Standard pull requests, including tests, are expected.

### FAQ

Who would use this?

Anyone wanting to use the CWRC-Writer to author XML documents with RDF annotations, and save those documents to GitHub.
-->

### License

[GNU GPL V2](LICENSE)
