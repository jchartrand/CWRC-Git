var cwrcGit = require("../src/index.js");
var nock = require('nock');
var expect = require('chai').expect;
var config = require('../config.js');
var fixtures = require('../fixturesAndMocks/fixtures.js');
var mocks = require('../fixturesAndMocks/mocks.js');

cwrcGit.authenticate(config.personal_oath_for_testing);

// uncomment the line below to let calls through to Github, and have nock output the results
// to the console, for use in nock.  I've put past nock recordings in /fixturesAndMocks/mocks.js,
//  which nock now returns for calls to GitHub that it intercepts (by virtue of 'requiring' nock
// above.)  See https://github.com/node-nock/nock for full details.
   //  nock.recorder.rec();

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
            expect(result[0].owner.login).to.equal(fixtures.owner)
            done();
          });
    });

  });

describe(".getReposForAuthenticatedUser", function() {
  
    beforeEach(function() {
      var getReposForAuthenticatedUserNock = mocks.getReposForAuthenticatedUserNock();
    });

    it("returns correctly", function (done) {
      cwrcGit.getReposForAuthenticatedUser()
          .then(result=>{
            expect(result).to.exist;
            expect(result[0].name).to.equal(fixtures.testRepo);
            done();
          })
    })// .timeout(5000); // to force mocha to wait longer for async to return

  });


  describe(".createRepoForDoc", function() {
    
    beforeEach(function() {
  
      var getDocumentFromGithubNock = mocks.getDocumentFromGithubNock();
      var getAnnotationsFromGithubNock = mocks.getAnnotationsFromGithubNock();
      var getBranchInfoFromGithubNock = mocks.getBranchInfoFromGithubNock();

      var createGithubRepoNock = mocks.getCreateGithubRepoNock();
      var getMasterBranchFromGithubNock = mocks.getMasterBranchFromGithubNock();    
      var createGithubTreeNock = mocks.getGithubTreeNock();
      var createGithubCommitNock = mocks.getGithubCommitNock();
      //var createGithubCWRCBranchNock = mocks.getCreateGithubCWRCBranchNock();
      var updateGithubCWRCBranchNock = mocks.getUpdateGithubCWRCBranchNock();
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
    })//.timeout(9000);
;

  });

describe(".getDetailsForAuthenticatedUser", function() {
    
    beforeEach(function() {
      var getDetailsForAuthenticatedUserNock = mocks.getDetailsForAuthenticatedUserNock();
    });

    it("returns correctly", function (done) {
        cwrcGit.getDetailsForAuthenticatedUser()
          .then(
            result=>{
              expect(result).to.exist;
              done()
            }
          )
    });

  });

describe(".getTemplates", function() {
    
    beforeEach(function() {
      var getTemplatesNock = mocks.getTemplatesNock();
    });

    it("returns correctly", function (done) {
        cwrcGit.getTemplates({owner: 'cwrc', repo: 'CWRC-Writer-Templates', path: 'templates', ref: 'master'})
          .then(
            result=>{
              expect(result).to.exist;
              done()
            }
          )
    }).timeout(5000);

    it("returns correctly with defaults", function (done) {
        cwrcGit.getTemplates({})
          .then(
            result=>{
              expect(result).to.exist;
              done()
            }
          )
    }).timeout(5000);

  });

describe(".getTemplate", function() {
    
    beforeEach(function() {
      var getTemplateNock = mocks.getTemplateNock();
    });

    it("returns correctly", function (done) {
        cwrcGit.getTemplate({owner: 'cwrc', repo: 'CWRC-Writer-Templates', path: 'letter.xml', ref: 'master'})
          .then(
            result=>{
              expect(result).to.exist;
              done()
            }
          )
    })

    it("returns correctly for defaults", function (done) {
        cwrcGit.getTemplate({})
          .then(
            result=>{
              expect(result).to.exist;
              done()
            }
          )
    })

    it("returns the decoded document", function(done) {
      cwrcGit.getTemplate({owner: 'cwrc', repo: 'CWRC-Writer-Templates', path: 'letter.xml', ref: 'master'})
          .then(
            result=>{
              expect(result).to.contain(`<?xml version="1.0" encoding="UTF-8"?>`)
              expect(result).to.contain(`<title>Sample Letter Title</title>`)
              done()
            }
          )
      
    })

  });


describe(".search", function() {
    
    beforeEach(function() {
      var getSearchNock = mocks.getSearchNock();
    });

    it("returns correctly", function (done) {
        cwrcGit.search('cwrc-melbourne+repo:jchartrand/cleanDoc2')
          .then(
            result=>{
              expect(result).to.exist
              done()
            }
          )
    })//.timeout(5000); // to force mocha to wait longer for async to return

    it("returns highlighting", function (done) {
        cwrcGit.search('cwrc-melbourne+repo:jchartrand/cleanDoc2')
          .then(
            result=>{
              expect(result.items[0].text_matches).to.exist
              done()
            }
          )
    })

  });



describe(".saveDoc", function() {
    
    beforeEach(function() {

      var getDocumentFromGithubNock = mocks.getDocumentFromGithubNock();
      var getAnnotationsFromGithubNock = mocks.getAnnotationsFromGithubNock();
      var getBranchInfoFromGithubNock = mocks.getBranchInfoFromGithubNock();
                 

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

    it("adds to existing version", function (done) {
     // console.error('pending mocks: %j', nock.pendingMocks());
        cwrcGit.saveDoc(
          {owner: fixtures.owner, 
          repo: fixtures.testRepo,
          doc:fixtures.testDocWithVersion, 
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


    it("returns a rejected promise for missing arguments", function(done) {
      
        cwrcGit.saveDoc(
          {owner: fixtures.owner, 
          repo: fixtures.testRepo, 
          baseTreeSHA: fixtures.baseTreeSHA, 
          parentCommitSHA: fixtures.parentCommitSHA,
          annotations: fixtures.annotationBundleText,
          versionTimestamp: fixtures.versionTimestamp
        }).catch(error=>{ 
              expect(error).to.exist;
              done()
            }
          )
    });



  });


});
