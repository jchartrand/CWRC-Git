const cwrcGit = require('../src/index.js');
const nock = require('nock');
const expect = require('chai').expect;
const config = require('../config.js');
const fixtures = require('../fixturesAndMocks/fixtures.js');
const mocks = require('../fixturesAndMocks/mocks.js');
const templateMocks = require('../fixturesAndMocks/templateMocks.js')
const request = require('request')

// uncomment this next line to use actual authentication with a real github personal token
cwrcGit.authenticate(config.personal_oath_for_testing);

// uncomment the line below to let calls through to Github, and have nock output the results
// to the console, for use in nock.  I've put past nock recordings in /fixturesAndMocks/mocks.js,
//  which nock now returns for calls to GitHub that it intercepts (by virtue of 'requiring' nock
// above.)  See https://github.com/node-nock/nock for full details.
// nock.recorder.rec();

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
const tapeNock = require('tape-nock')


const test = tapeNock(tape, {
  //  mode: 'record', //wild, dryrun, record, lockdown
})

and then just proceed with tests as-is, so that no need to setup
nocks in the beforeEach:  tape-nock will take care of it all.
 */

describe('cwrcGit', () => {

	describe('.getDoc', () => {

		beforeEach(() => {
			mocks.getDoc()

			// mocks.getDocumentFromGithubNock();
			// mocks.getAnnotationsFromGithubNock();
			// mocks.getBranchInfoFromGithubNock();

		});

		it('returns correctly', async () => {
			const result = await cwrcGit.getDoc(fixtures.owner, fixtures.testRepo, 'master', 'text.txt')
				.catch(err => {
					console.log(err);
				})

			expect(result.sha).to.be.a('string');

			//expect(result.doc).to.equal(fixtures.testDoc);
			//expect(result.annotations).to.equal(fixtures.annotationBundleText);

			expect(result.owner).to.equal(fixtures.owner);
			expect(result.repo).to.equal(fixtures.testRepo);

		});

	});

	describe('.getRepoContents', () => {
		beforeEach(() => {
			mocks.getRepoContentsByDrillDownBranchNock()
			mocks.getRepoContentsNock();
			mocks.getRepoContentsTree()
		})

		it('returns correctly', async () => {
			const result = await cwrcGit.getRepoContents(fixtures.owner, fixtures.testRepo)
			expect(result).to.exist;
		})
	})


	describe('.getRepoContentsByDrillDown', () => {
		beforeEach(() => {
			mocks.getRepoContentsByDrillDownBranchNock()
			mocks.getRepoContentsByDrillDownRootTreeNock()
			mocks.getReposByDrillDownSecondLevelNock()
			mocks.getReposByDrillDownThirdLevelNock()
		})

		it('returns correctly', async () => {
			const result = await cwrcGit.getRepoContentsByDrillDown(fixtures.owner, fixtures.testRepo)
			expect(result).to.exist
		})
	})

	describe('.getReposForUser', () => {

		beforeEach(() => {
			mocks.getReposForGithubUserNock();
		});

		it('returns correctly', async () => {
			const result = await cwrcGit.getReposForUser(fixtures.owner, 1, 10)
			expect(result).to.exist;
			expect(result.data[0].owner.login).to.equal(fixtures.owner)
		})

	});


	describe('.getReposForAuthenticatedUser', () => {

		beforeEach( () => {
			mocks.getDetailsForAuthenticatedUserNock();
			mocks.getReposForAuthenticatedUserNock();
		});

		it('returns correctly', async () => {
			const result = await cwrcGit.getReposForAuthenticatedUser('owner', 1, 10)
			expect(result).to.exist;
			expect(result.data[0].name).to.equal(fixtures.testRepo);
		}).timeout(5000); // to force mocha to wait longer for async to return

	});


	describe('.createRepo', () => {
		beforeEach(() => {
			mocks.getCreateGithubRepoNock();
			mocks.getMasterBranchFromGithubNock();
		})

		it('returns correctly', async () => {
			const result = await cwrcGit.createRepo(fixtures.testRepo, fixtures.testRepoDescription, fixtures.isPrivate)
			expect(result.owner).to.equal(fixtures.owner);
			expect(result.repo).to.equal(fixtures.testRepo);
		}).timeout(5000);
	})

	// 	// describe('.createBranchFromMaster', () => {

	// 	// 	beforeEach( () => {
	// 	// 		mocks.createBranchFromMasterGetMaster()
	// 	// 		mocks.createBranchFromMasterCreateBranch()
	// 	// 		mocks.createBranchGeneric()
	// 	// 	})

	// 	// 	it('returns valid url for new ref if created', async () => {
	// 	// 		const result = await cwrcGit.createBranchFromMaster({
	// 	// 			'owner': fixtures.owner,
	// 	// 			'repo': fixtures.testRepo,
	// 	// 			'branch': 'test84'
	// 	// 		})

	// 	// 		expect(result.refURL).to.exist
	// 	// 		expect(request.head('http://www.google.com', (error, response)=>(!error && response.statusCode == 200)))
	// 	// 	})
	// 	// })

	// 	// describe('.checkForPullRequest', () => {

	// 	// 	beforeEach( () => {
	// 	// 		mocks.findExistingPRNock()
	// 	// 		mocks.missingPRNock()
	// 	// 	})

	// 	// 	it('returns true if pr exists', async () => {
	// 	// 		const result = await cwrcGit.checkForPullRequest({
	// 	// 			'repo':fixtures.testRepo,
	// 	// 			'owner': fixtures.owner,
	// 	// 			'branch': 'jchartrand'
	// 	// 		})

	// 	// 		expect(result).to.be.true;
	// 	// 	})

	// 	// 	it('returns false if pr doesn\'t exist', async () => {
	// 	// 		const result = await cwrcGit.checkForPullRequest({
	// 	// 			'repo':fixtures.testRepo,
	// 	// 			'owner': fixtures.owner,
	// 	// 			'branch': 'hote'
	// 	// 		})

	// 	// 		expect(result).to.be.false
	// 	// 	})
	// 	// })

	// // describe('.checkForBranch', () => {
	// // 	beforeEach( () => {
	// // 		mocks.getUserBranchHeadNock()
	// // 		mocks.missingBranchNock()
	// // 	})

	// // 	it('returns true if branch exists', async () => {
	// // 		const result = await cwrcGit.checkForBranch({
	// // 			'repo':fixtures.testRepo,
	// // 			'owner': fixtures.owner,
	// // 			'branch': 'jchartrand'
	// // 		})

	// // 		expect(result).to.be.true
	// // 	})

	// // 	it('returns false if branch doesn\'t exist', async () => {
	// // 		const result = await cwrcGit.checkForBranch({
	// // 			'repo':fixtures.testRepo,
	// // 			'owner': fixtures.owner,
	// // 			'branch': 'hote'
	// // 		})

	// // 		expect(result).to.be.false;
	// // 	})
	// // })

	// // describe('.createFile', () => {
	// // 	beforeEach( () => {
	// // 		mocks.getCreateFileNock();
	// // 	})

	// // 	it('returns correctly', async () => {
	// // 		const result = await cwrcGit.createFile({
	// // 			owner: fixtures.owner,
	// // 			repo: fixtures.testRepo,
	// // 			path: 'curt/qurt/test1.txt',
	// // 			message: 'some commit message',
	// // 			content: fixtures.testDoc,
	// // 			branch: 'master'
	// // 		})

	// // 		expect(result.sha).to.be.a('string');
	// // 		expect(result.owner).to.equal(fixtures.owner);
	// // 		expect(result.repo).to.equal(fixtures.testRepo);
	// // 	}).timeout(9000);
	// // })

	// // describe('.updateFile', () => {
	// // 	beforeEach( () => {
	// // 		mocks.getUpdateFileNock();
	// // 	})

	// // 	it('returns correctly', async () => {
	// // 		const result = await cwrcGit.updateFile({
	// // 			owner: fixtures.owner,
	// // 			repo: fixtures.testRepo,
	// // 			path: 'curt/qurt/test.txt',
	// // 			message: 'another commit message on the update',
	// // 			content: fixtures.testDoc,
	// // 			branch: 'master',
	// // 			sha: '6f715c0deeb9012272c04a50e1fc09bc3fe4bdb7'
	// // 		})

	// // 		expect(result.sha).to.be.a('string');
	// // 		expect(result.owner).to.equal(fixtures.owner);
	// // 		expect(result.repo).to.equal(fixtures.testRepo);

	// // 	}).timeout(9000);
	// // })

	// // describe('.getLatestFileSHA', () => {
	// // 	beforeEach( () => {
	// // 		mocks.getLatestFileSHANock()
	// // 		mocks.missingSHANock()
	// // 	})

	// // 	it('returns a string for existing sha', async () => {
	// // 		const result = await cwrcGit.getLatestFileSHA({
	// // 			owner: fixtures.owner,
	// // 			repo: fixtures.testRepo,
	// // 			branch: 'jchartrand',
	// // 			path: 'curt/qurt/testq339.txt'

	// // 		})
	// // 		expect(result.sha).to.be.a('string');
	// // 		expect(result.owner).to.equal(fixtures.owner);
	// // 		expect(result.repo).to.equal(fixtures.testRepo);

	// // 	}).timeout(9000);

	// // 	it('returns null for no sha', async () => {
	// // 		const result = await cwrcGit.getLatestFileSHA({
	// // 			owner: fixtures.owner,
	// // 			repo: fixtures.testRepo,
	// // 			branch: 'master',
	// // 			path: 'curt/qurt/tesddt.txt'

	// // 		})
	// // 		expect(result.sha).to.equal(null)
	// // 		expect(result.owner).to.equal(fixtures.owner);
	// // 		expect(result.repo).to.equal(fixtures.testRepo);

	// // 	}).timeout(9000);
	// // })

	describe('.saveAsPullRequest', () => {
		beforeEach(() => {
			mocks.getUserBranchHeadNock()
			mocks.getLatestFileSHANock()
			mocks.saveExistingFileNock()
			mocks.findExistingPRNock()
			mocks.saveNewFileNock()
			mocks.getLatestFileSHANockForNew()
		})

		it('returns correctly for existing file', async () => {
			const result = await cwrcGit.saveAsPullRequest(
				fixtures.owner, fixtures.testRepo, 'text.txt', 'test',
				'dev', 'some commit message', 'glorious title for PR'
			);

			expect(result.sha).to.be.a('string');
			expect(result.owner).to.equal(fixtures.owner);
			expect(result.repo).to.equal(fixtures.testRepo);
		}).timeout(9000);

		// it('returns correctly for new file', async () => {
		// 	const result = await cwrcGit.saveAsPullRequest(
		// 		fixtures.owner, fixtures.testRepo, 'text15.txt', fixtures.testDoc,
		// 		'dev', 'some commit message', 'glorious title for PR'
		// 	)

		// 	expect(result.sha).to.be.a('string');
		// 	expect(result.owner).to.equal(fixtures.owner);
		// 	expect(result.repo).to.equal(fixtures.testRepo);
		// }).timeout(9000);
	})

	describe('.getDetailsForAuthenticatedUser', () => {

		beforeEach(() => {
			mocks.getDetailsForAuthenticatedUserNock();
		});

		it('returns correctly', async () => {
			const result = await cwrcGit.getDetailsForAuthenticatedUser()
			expect(result).to.exist;
		});

	});

	describe('.getTemplates', () => {

		beforeEach(() => {
			templateMocks();
		});

		it('returns correctly', async () => {
			const result = await cwrcGit.getTemplates('cwrc', 'CWRC-Writer-Templates', 'master', 'templates')
			expect(result).to.exist;
		}).timeout(5000);

	});

	describe('.searchCode', () => {

		beforeEach(() => {
			mocks.getSearchNock();
		});

		it('returns correctly', async () => {
			const result = await cwrcGit.searchCode('test+repo:lucaju/misc')
			expect(result).to.exist
		}) //.timeout(5000); // to force mocha to wait longer for async to return

		it('returns highlighting', async () => {
			const result = await cwrcGit.searchCode('test+repo:lucaju/misc')
			expect(result.data.items[0].text_matches).to.exist
		})

	});

});