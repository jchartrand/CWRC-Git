var nock = require('nock');
var config = require('../config');
var fixtures = require('./fixtures.js');

function  getGithubCommitNock() {
  // NOTE:  I put in more in the reply than necessary. I  put it in
      // to help explain what's going on.
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .post(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/commits`, {"message":fixtures.commitMessage,"tree":fixtures.newTreeSHA,"parents":[fixtures.parentCommitSHA]})
        .query({"access_token":config.personal_oath_for_testing})
        .reply(201, {
            "sha": fixtures.newCommitSHA,
            "tree": {"sha": fixtures.newTreeSHA},
            "message": fixtures.commitMessage,
            "parents": [{"sha": fixtures.parentCommitSHA}]
        });
}

function getCreateGithubCWRCBranchNock() {
   // NOTE:  I didn't really need to return anything in the reply.  It isn't used. I just put it in
      // to help explain what's going on.
      return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .post(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/refs`, {"ref":"refs/heads/cwrc-drafts","sha":fixtures.newCommitSHA})
        .query({"access_token":config.personal_oath_for_testing})
        .reply(201, {"ref": "refs/heads/cwrc-drafts","object": {"sha": fixtures.newCommitSHA}});

}

function getUpdateGithubCWRCBranchNock() {
    // this is exactly the same as the create one above, but uses patch instead of post.
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .patch(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/refs/heads/cwrc-drafts`, {"sha":fixtures.newCommitSHA})
        .query({"access_token":config.personal_oath_for_testing})
        .reply(201, {"ref": "refs/heads/cwrc-drafts","object": {"sha": fixtures.newCommitSHA}});
}

function getCreateGithubTagNock() {
      // NOTE:  I didn't really need to return anything in the reply.  It isn't used.  I just put it in
      // to help explain what's going on.
      return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .post(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/refs`, {"ref":`refs/tags/cwrc-drafts/${fixtures.versionTimestamp}`,"sha":fixtures.newCommitSHA})
        .query({"access_token":config.personal_oath_for_testing})
        .reply(201, {
          "ref": `refs/tags/cwrc-drafts/${fixtures.versionTimestamp}`,
          "object": {"sha": fixtures.newCommitSHA}
        });
}

function getGithubTreeNock() {
  // In this one, I only return what's needed for the test to continue, i.e., the newSHA
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .post(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/trees`, 
          {"tree":[
            {"path":"document.xml","mode":"100644","type":"blob","content":fixtures.testDoc},
            {"path":"annotations.json","mode":"100644","type":"blob","content":fixtures.annotationBundleText}
          ],
          "base_tree":fixtures.baseTreeSHA
        })
        .query({"access_token":config.personal_oath_for_testing})
        .reply(201, {"sha":fixtures.newTreeSHA});
}

function getCreateGithubRepoNock() {
// NOTE:  I put in more in the reply than necessary. I  put it in
      // to help explain what's going on.
      return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .post('/user/repos', {"name":fixtures.testRepo,"description":fixtures.testRepoDescription,"private":fixtures.isPrivate,"auto_init":true})
        .query({"access_token":config.personal_oath_for_testing})
        .reply(201, {"owner": {"login": fixtures.owner}});
}

function getMasterBranchFromGithubNock() {
        // NOTE:  I put in more in the reply than necessary. I  put it in
      // to help explain what's going on.
      return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .get(`/repos/${fixtures.owner}/${fixtures.testRepo}/branches/master`)
        .query({"access_token":config.personal_oath_for_testing})
        .reply(200, { "commit": {
                        "sha": fixtures.parentCommitSHA,
                        "commit": {
                          "message": "test commit",
                          "tree": {
                            "sha": fixtures.baseTreeSHA
                          }
                        }
                      }
                    });
}

function getDocumentFromGithubNock() {
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .get(`/repos/${fixtures.owner}/${fixtures.testRepo}/contents/document.xml`)
        .query({"ref":"cwrc-drafts", "access_token":config.personal_oath_for_testing})
        .reply(200, {content: fixtures.base64TestDoc});
}

function getAnnotationsFromGithubNock() {
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .get(`/repos/${fixtures.owner}/${fixtures.testRepo}/contents/annotations.json`)
        .query({"ref":"cwrc-drafts", "access_token":config.personal_oath_for_testing})
        .reply(200, {content: fixtures.base64AnnotationBundle});
}

function getBranchInfoFromGithubNock() {
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .get(`/repos/${fixtures.owner}/${fixtures.testRepo}/branches/cwrc-drafts`)
        .query({"access_token":config.personal_oath_for_testing})
        .reply(200, { "commit": {
                        "sha": "thid doesn't matter",
                        "commit": {
                          "message": "a fake commit message",
                          "tree": {
                            "sha": "someSHAorAnother"
                          }
                        }
                      }
                    })
}

function getReposForGithubUserNock() {

  return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .get(`/users/${fixtures.owner}/repos`)
        .query({"access_token":config.personal_oath_for_testing})
        .reply(200, [{
          "id": 76067525,
          "name": "aTest",
          "full_name": fixtures.ownerAndRepo,
          "owner": {
            "login": fixtures.owner
          },
          "private": false,
          "description": "a description of the repo"
        }, {
          "id": 75946742,
          "name": "aTest",
          "full_name": fixtures.owner + '/someOtherRepo',
          "owner": {
            "login": fixtures.owner
          },
          "private": true,
          "default_branch": "master"
        }]);
}
    

module.exports = {
  getGithubCommitNock: getGithubCommitNock,
  getCreateGithubCWRCBranchNock:getCreateGithubCWRCBranchNock,
  getUpdateGithubCWRCBranchNock:getUpdateGithubCWRCBranchNock,
  getCreateGithubTagNock:getCreateGithubTagNock,
  getGithubTreeNock:getGithubTreeNock,
  getCreateGithubRepoNock: getCreateGithubRepoNock,
  getMasterBranchFromGithubNock: getMasterBranchFromGithubNock,
  getDocumentFromGithubNock:getDocumentFromGithubNock,
  getAnnotationsFromGithubNock:getAnnotationsFromGithubNock,
  getBranchInfoFromGithubNock:getBranchInfoFromGithubNock,
  getReposForGithubUserNock: getReposForGithubUserNock
}