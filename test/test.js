var cwrcGit = require("../src/index.js");
var nock = require('nock');
var expect = require('chai').expect;
var config = require('../config.js');
var fixtures = require('../fixturesAndMocks/fixtures.js');
var mocks = require('../fixturesAndMocks/mocks.js');

// uncomment this line to use actual authentication with a real github personal token
cwrcGit.authenticate(config.personal_oath_for_testing);

// uncomment the line below to let calls through to Github, and have nock output the results
// to the console, for use in nock.  I've put past nock recordings in /fixturesAndMocks/mocks.js,
//  which nock now returns for calls to GitHub that it intercepts (by virtue of 'requiring' nock
// above.)  See https://github.com/node-nock/nock for full details.
//nock.recorder.rec();

/* could also use "tape-nock" to simplify recording and use of fixtures.  Here are
some of the scripts that could be used, although I'm not sure that the nyc stuff works.
Would probably just want to continue using Istanbul as-is, but use tape-nock instead of
just straight nock:

"test": "nyc tape test/index.js",
    "test:record": "NOCK_BACK_MODE=record npm test",
    "test:wild": "NOCK_BACK_MODE=wild npm test",
    "test:lockdown": "NOCK_BACK_MODE=lockdown npm test",
    "test:overwrite": "rm test/fixtures/*.json & npm run test",
    "check-coverage": "nyc check-coverage --branches 100 --functions 100 --lines 100",
    "publish-coverage": "codecov --token=bfcccbea-ae1e-4b76-bfa1-83be70525b9a",
    "report-coverage": "nyc report --reporter=text-lcov > coverage.lcov"

and here is how it would be used in this test file:

const tape = require('tape')
var tapeNock = require('tape-nock')


var test = tapeNock(tape, {
  //  mode: 'record', //wild, dryrun, record, lockdown
})

and then just proceed with tests as-is, so that no need to setup
nocks in the beforeEach:  tape-nock will take care of it all.
 */

describe("cwrcGit", function () {

	describe(".getDoc", function () {

		beforeEach(function () {

			var getDocumentFromGithubNock = mocks.getDocumentFromGithubNock();
			var getAnnotationsFromGithubNock = mocks.getAnnotationsFromGithubNock();
			var getBranchInfoFromGithubNock = mocks.getBranchInfoFromGithubNock();

		});

		it("returns correctly", function (done) {

			cwrcGit.getDoc({owner: fixtures.owner, repo: fixtures.testRepo})
				.then(result => {
					expect(result.baseTreeSHA).to.be.a('string');
					expect(result.parentCommitSHA).to.be.a('string');
					//expect(result.doc).to.equal(fixtures.testDoc);
					//expect(result.annotations).to.equal(fixtures.annotationBundleText);
					expect(result.owner).to.equal(fixtures.owner);
					expect(result.repo).to.equal(fixtures.testRepo);
					done();
				});
		});

	});

	describe(".getRepoContents", function () {
		beforeEach(function () {
			var getRepoContentsByDrillDownBranchNock = mocks.getRepoContentsByDrillDownBranchNock()
			var getRepoContentsNock = mocks.getRepoContentsNock();
		})

		it("returns correctly", function (done) {
			cwrcGit.getRepoContents({repo: fixtures.testRepo, owner: fixtures.owner})
				.then(result => {
					expect(result).to.exist;
					// expect(result.data)
					done();
				})
		})
	})


	describe(".getRepoContentsByDrillDown", function () {
		beforeEach(function () {
			var getRepoContentsByDrillDownBranchNock = mocks.getRepoContentsByDrillDownBranchNock()
			var getRepoContentsByDrillDownRootTreeNock = mocks.getRepoContentsByDrillDownRootTreeNock()
			var getReposByDrillDownSecondLevelNock = mocks.getReposByDrillDownSecondLevelNock()
			var getReposByDrillDownThirdLevelNock = mocks.getReposByDrillDownThirdLevelNock()
		})

		it("returns correctly", function (done) {
			cwrcGit.getRepoContentsByDrillDown({repo: fixtures.testRepo, owner: fixtures.owner})
				.then(result => {
					expect(result).to.exist
					//console.log(JSON.stringify(result))
					// expect(result.data)
					done()
				})
		})
	})

	describe(".getReposForUser", function () {

		beforeEach(function () {
			var getReposForGithubUserNock = mocks.getReposForGithubUserNock();
		});

		it("returns correctly", function (done) {
			cwrcGit.getReposForUser({username: fixtures.owner})
				.then(result => {
					expect(result).to.exist;
					expect(result.data[0].owner.login).to.equal(fixtures.owner)
					done();
				});
		});

	});


	describe(".getReposForAuthenticatedUser", function () {

		beforeEach(function () {
			var getReposForAuthenticatedUserNock = mocks.getReposForAuthenticatedUserNock();
		});

		it("returns correctly", function (done) {
			cwrcGit.getReposForAuthenticatedUser()
				.then(result => {
					expect(result).to.exist;
					expect(result.data[0].name).to.equal(fixtures.testRepo);
					done();
				})
		})// .timeout(5000); // to force mocha to wait longer for async to return

	});


	describe(".createEmptyRepo", function () {
		beforeEach(function () {
			var createGithubRepoNock = mocks.getCreateGithubRepoNock();
			var getMasterBranchFromGithubNock = mocks.getMasterBranchFromGithubNock();
		})

		it("returns correctly", function (done) {
			cwrcGit.createEmptyRepo(
				{
					repo: fixtures.testRepo,
					isPrivate: fixtures.isPrivate,
					description: fixtures.testRepoDescription
				})
				.then(
					result => {
						expect(result.baseTreeSHA).to.be.a('string');
						expect(result.parentCommitSHA).to.be.a('string');
						expect(result.owner).to.equal(fixtures.owner);
						expect(result.repo).to.equal(fixtures.testRepo);
						done()
					}
				)
		}).timeout(9000);
	})

	describe(".createFile", function () {
		beforeEach(function () {
			var createFileNock = mocks.getCreateFileNock();
		})

		it("returns correctly", function (done) {
			cwrcGit.createFile(
				{
					owner: fixtures.owner,
					repo: fixtures.testRepo,
					path: 'curt/qurt/test1.txt',
					message: 'some commit message',
					content: fixtures.testDoc,
					branch: 'master'
				})
				.then(
					result => {
						expect(result.sha).to.be.a('string');
						expect(result.owner).to.equal(fixtures.owner);
						expect(result.repo).to.equal(fixtures.testRepo);
						done()
					}
				)
		}).timeout(9000);
	})

	describe(".updateFile", function () {
		beforeEach(function () {
			var updateFileNock = mocks.getUpdateFileNock();
		})

		it("returns correctly", function (done) {
			cwrcGit.updateFile(
				{
					owner: fixtures.owner,
					repo: fixtures.testRepo,
					path: 'curt/qurt/test.txt',
					message: 'another commit message on the update',
					content: fixtures.testDoc,
					branch: 'master',
					sha: '6f715c0deeb9012272c04a50e1fc09bc3fe4bdb7'
				})
				.then(
					result => {
						expect(result.sha).to.be.a('string');
						expect(result.owner).to.equal(fixtures.owner);
						expect(result.repo).to.equal(fixtures.testRepo);
						done()
					},
					error => {
						console.log(error)
					}
				)
		}).timeout(9000);
	})

	describe(".saveAsPullRequest", function () {
		beforeEach(function () {
			var createFileNock = mocks.getCreateFileNock();
		})

		it("returns correctly", function (done) {
			cwrcGit.createFile(
				{
					owner: fixtures.owner,
					repo: fixtures.testRepo,
					path: 'curt/qurt/test1.txt',
					message: 'some commit message',
					content: fixtures.testDoc,
					branch: 'master'
				})
				.then(
					result => {
						expect(result.sha).to.be.a('string');
						expect(result.owner).to.equal(fixtures.owner);
						expect(result.repo).to.equal(fixtures.testRepo);
						done()
					}
				)
		}).timeout(9000);
	})

	describe(".getDetailsForAuthenticatedUser", function () {

		beforeEach(function () {
			var getDetailsForAuthenticatedUserNock = mocks.getDetailsForAuthenticatedUserNock();
		});

		it("returns correctly", function (done) {
			cwrcGit.getDetailsForAuthenticatedUser()
				.then(
					result => {
						expect(result).to.exist;
						done()
					}
				)
		});

	});

	describe(".getTemplates", function () {

		beforeEach(function () {
			var getTemplatesNock = mocks.getTemplatesNock();
		});

		it("returns correctly", function (done) {
			cwrcGit.getTemplates({owner: 'cwrc', repo: 'CWRC-Writer-Templates', path: 'templates', ref: 'master'})
				.then(
					result => {
						expect(result).to.exist;
						done()
					}
				)
		}).timeout(5000);

		it("returns correctly with defaults", function (done) {
			cwrcGit.getTemplates({})
				.then(
					result => {
						expect(result).to.exist;
						done()
					}
				)
		}).timeout(5000);

	});

	describe(".getTemplate", function () {

		beforeEach(function () {
			var getTemplateNock = mocks.getTemplateNock();
		});

		it("returns correctly", function (done) {
			cwrcGit.getTemplate({owner: 'cwrc', repo: 'CWRC-Writer-Templates', path: 'letter.xml', ref: 'master'})
				.then(
					result => {
						expect(result).to.exist;
						done()
					}
				)
		})

		it("returns correctly for defaults", function (done) {
			cwrcGit.getTemplate({})
				.then(
					result => {
						expect(result).to.exist;
						done()
					}
				)
		})

		it("returns the decoded document", function (done) {
			cwrcGit.getTemplate({owner: 'cwrc', repo: 'CWRC-Writer-Templates', path: 'letter.xml', ref: 'master'})
				.then(
					result => {
						expect(result).to.contain(`<?xml version="1.0" encoding="UTF-8"?>`)
						expect(result).to.contain(`<title>Sample Letter Title</title>`)
						done()
					}
				)

		})

	});


	describe(".search", function () {

		beforeEach(function () {
			var getSearchNock = mocks.getSearchNock();
		});

		it("returns correctly", function (done) {
			cwrcGit.search('cwrc-melbourne+repo:jchartrand/cleanDoc2')
				.then(
					result => {
						expect(result).to.exist
						done()
					}
				)
		})//.timeout(5000); // to force mocha to wait longer for async to return

		it("returns highlighting", function (done) {
			cwrcGit.search('cwrc-melbourne+repo:jchartrand/cleanDoc2')
				.then(
					result => {
						expect(result.data.items[0].text_matches).to.exist
						done()
					}
				)
		})

	});


});
