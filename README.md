# CWRC-Git

## Table of Contents

1. [Overview](#overview)
1. [Demo](#demo)
1. [Use](#use)
1. [Development](#development)
1. [Contributing](#contributing)
1. [FAQ](#faq)
1. [License](#license)

### Overview

NPM package for creating and updating CWRC XML documents in GitHub through the GitHub API.  Used by the [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer), whose web API is in turn used by the [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter].

### Demo 

A [CWRC GitHub Sandbox](http://208.75.74.217/editor_github.html) uses the NPM package published from this repository along with the code in [CWRC-Writer](https://github.com/cwrc/CWRC-Writer), [CWRC-GitServer](https://github.com/cwrc/CWRC-GitServer), [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter], and [CWRC-GitDelegator](https://github.com/cwrc/CWRC-GitServer). The same code is easily (for someone with modest development experience) installed on any server to run your own instance.

### Use

`npm install cwrcgit --save`   (or, using shorcut: npm i -S cwrcgit)

The methods exposed by this module are:

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

* write a test (or two)for your new functionality (in 'spec' directory)

* `npm test` to start mocha and automatically rerun the tests whenever you change a file

* change some stuff to satisfy new test

* commit change to github or submit a pull request

* publish semantically to travis, npm and github using commitizen:  `npm commit`

* check code coverage results on github page (coverage badge percentage)

Testing uses mocha and chai.  Tests are in spec. 

This module makes http calls to the GitHub API, including calls to create new repositories.  Rather than make those calls for every test, [nock](https://github.com/node-nock/nock) instead mocks the calls to GitHub (intercepts the calls and instead returns pre-recorded data).  

### Contributing

Please contact us if you'd like to contribute.  Standard pull requests, including tests, are expected.

### FAQ

Who would use this?

Anyone wanting to use the CWRC-Writer to author XML documents and add RDF annotations, and save those documents to GitHub.

### License

TBD