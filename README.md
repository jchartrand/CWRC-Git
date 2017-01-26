# CWRC-Git

## Table of Contents

1. [Overview](#overview)
1. [Demo](#demo)
1. [Install](#install)
1. [Use](#use)
1. [Development](#development)
    2. [Fork](#fork)
    2. [Install](#install)
    2. [Testing](#testing)
1. [Contributing](#contributing)
1. [FAQ](#faq)
1. [License](#license)

### Overview

Client for creating and updating CWRC XML documents in GitHub through the GitHub API.  Used by the [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer), whose web API is in turn used by the [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter].

### Demo 

A [CWRC GitHub Sandbox](http://208.75.74.217/editor_github.html) uses the code in this repository along with the code in [CWRC-Writer](https://github.com/cwrc/CWRC-Writer), [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer), [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter], and [CWRC-GitDelegator](https://github.com/cwrc/CWRC-GitServer). The same code is easily (for someone with modest development experience) installed on any server to run your own instance.

### Install

To install to node_modules and save to package.json dependencies

`npm install cwrcgit --save`

### Use

To use:

The methods exposed by this module are:

```
authenticate(gitHubOAuthToken)

getDetailsForAuthenticatedUser

getReposForAuthenticatedUser

getReposForUser({})

saveDoc({})

getDoc({})

createRepoForDoc({})

getAnnotations({})

deleteRepo({})
```

### Development

## Fork 

Fork the repo to your local machine.

## Install

Run:

`npm install` to install the node.js dependencies

## Testing

Testing uses mocha and chai.  Tests are in spec. Run tests with:

`npm test` 

This module makes http calls to the GitHub API, including calls to create new repositories.  Rather than make those calls for every test, [nock](https://github.com/node-nock/nock) is instead used to mock the calls to GitHub (intercept the calls and instead return pre-canned data).  

### Contributing

Please contact us if you'd like to contribute.  Standard pull requests are the expectation.

### FAQ

Who would use this?

Anyone wanting to use the CWRC-Writer to author XML documents and add RDF annotations, and save those documents to GitHub.

### License

TBD