var cwrcGit = require("../src/index.js");
var nock = require('nock');
var expect = require('chai').expect;
var config = require('../config');
var fixtures = require('../fixturesAndMocks/fixtures.js');
var mocks = require('../fixturesAndMocks/mocks.js');


cwrcGit.authenticate(config.personal_oath_for_testing);

// uncomment the line below to let calls through to Github, and have nock output the results
// to the console, for use in nock.  I've put past nock recordings in /fixturesAndMocks/mocks.js,
//  which nock now returns for calls to GitHub that it intercepts (by virtue of 'requiring' nock
// above.)  See https://github.com/node-nock/nock for full details.
// nock.recorder.rec();

describe("cwrcGit", function() {

  describe(".getDoc", function() {
  
    beforeEach(function() {
   
      var getDocumentFromGithubNock = mocks.getDocumentFromGithubNock();
      var getAnnotationsFromGithubNock = mocks.getAnnotationsFromGithubNock();
      var getBranchInfoFromGithubNock = mocks.getBranchInfoFromGithubNock();
                 
    });

    it("returns correctly", function (done) {
      
      cwrcGit.getDoc({owner: fixtures.owner, repo: fixtures.testRepo})
          .then(result=>{
            expect(result.baseTreeSHA).to.be.a('string');
            expect(result.parentCommitSHA).to.be.a('string');
            expect(result.doc).to.equal(fixtures.testDoc);
            expect(result.annotations).to.equal(fixtures.annotationBundleText);
            expect(result.owner).to.equal(fixtures.owner);
            expect(result.repo).to.equal(fixtures.testRepo);
            done();
          });
    });

  });

describe(".getReposForUser", function() {
  
    beforeEach(function() {
      var getReposForGithubUserNock = mocks.getReposForGithubUserNock();
    });

    it("returns correctly", function (done) {
      cwrcGit.getReposForUser({username:fixtures.owner})
          .then(result=>{
            expect(result).to.exist;
            done();
          });
    });

  });

  describe("createRepoForDoc", function() {
    
    beforeEach(function() {
  
      var createGithubRepoNock = mocks.getCreateGithubRepoNock();
      var getMasterBranchFromGithubNock = mocks.getMasterBranchFromGithubNock();    
      var createGithubTreeNock = mocks.getGithubTreeNock();
      var createGithubCommitNock = mocks.getGithubCommitNock();
      var createGithubCWRCBranchNock = mocks.getCreateGithubCWRCBranchNock();
      var createGithubTagNock = mocks.getCreateGithubTagNock();
      
    });

    /*afterEach(function() {
      var deleteRepoNock = nock('https://api.github.com:443', {"encodedQueryParams":true})
        .delete('/repos/jchartrand/aTest')
        .query({"access_token":config.personal_oath_for_testing})
        .reply(204, "");
      cwrcGit.authenticate(githubOauthToken);
      cwrcGit.deleteRepo({owner: owner, repo: testRepo});
    });
*/
    it("returns correctly", function (done) {
        cwrcGit.createRepoForDoc(
          {
          repo: fixtures.testRepo,
          isPrivate: fixtures.isPrivate, 
          doc:fixtures.testDoc, 
          description: fixtures.testRepoDescription,
          annotations: fixtures.annotationBundleText,
          versionTimestamp: fixtures.versionTimestamp
        })
          .then(
            result=>{
              expect(result.baseTreeSHA).to.be.a('string');
              expect(result.parentCommitSHA).to.be.a('string');
              expect(result.doc).to.equal(fixtures.testDoc);
              expect(result.annotations).to.equal(fixtures.annotationBundleText);
              expect(result.owner).to.equal(fixtures.owner);
              expect(result.repo).to.equal(fixtures.testRepo);
              done()
            }
          )
    });

  });



describe("saveDoc", function() {
    
    beforeEach(function() {
      var createGithubTreeNock = mocks.getGithubTreeNock();
      var createGithubCommitNock = mocks.getGithubCommitNock();
      var updateGithubCWRCBranchNock = mocks.getUpdateGithubCWRCBranchNock();
      var createGithubTagNock = mocks.getCreateGithubTagNock();   
    });

    it("returns correctly", function (done) {
     // console.error('pending mocks: %j', nock.pendingMocks());
        cwrcGit.saveDoc(
          {owner: fixtures.owner, 
          repo: fixtures.testRepo,
          doc:fixtures.testDoc, 
          baseTreeSHA: fixtures.baseTreeSHA, 
          parentCommitSHA: fixtures.parentCommitSHA,
          annotations: fixtures.annotationBundleText,
          versionTimestamp: fixtures.versionTimestamp
        })
          .then(
            result=>{
              expect(result.baseTreeSHA).to.be.a('string');
              expect(result.parentCommitSHA).to.be.a('string');
              expect(result.doc).to.equal(fixtures.testDoc);
              expect(result.annotations).to.equal(fixtures.annotationBundleText);
              expect(result.owner).to.equal(fixtures.owner);
              expect(result.repo).to.equal(fixtures.testRepo);
              done()
            }
          )
    });

  });


});
