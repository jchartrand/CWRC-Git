var nock = require('nock');
var config = require('../config');
var fixtures = require('./fixtures.js');

// we use the cwrcAppName to match CWRC GitHub repositories that are themselves documemnts,
// but we don't match to match repositories that are code repositories,
// so here we sneakily concatenate the full string to avoid matches on this code repo.
var cwrcAppName = "CWRC-GitWriter" + "-web-app";

function getDetailsForAuthenticatedUserNock() {
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
    .get('/user')
    .query({"access_token":config.personal_oath_for_testing})
    .reply(200, {"login":fixtures.owner,"id":547165,"avatar_url":"https://avatars.githubusercontent.com/u/547165?v=3","gravatar_id":"","url":"https://api.github.com/users/jchartrand","html_url":"https://github.com/jchartrand","followers_url":"https://api.github.com/users/jchartrand/followers","following_url":"https://api.github.com/users/jchartrand/following{/other_user}","gists_url":"https://api.github.com/users/jchartrand/gists{/gist_id}","starred_url":"https://api.github.com/users/jchartrand/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/jchartrand/subscriptions","organizations_url":"https://api.github.com/users/jchartrand/orgs","repos_url":"https://api.github.com/users/jchartrand/repos","events_url":"https://api.github.com/users/jchartrand/events{/privacy}","received_events_url":"https://api.github.com/users/jchartrand/received_events","type":"User","site_admin":false,"name":null,"company":null,"blog":null,"location":null,"email":null,"hireable":null,"bio":null,"public_repos":13,"public_gists":0,"followers":3,"following":1,"created_at":"2011-01-04T15:50:51Z","updated_at":"2017-01-31T21:24:53Z"});
}

function getReposForAuthenticatedUserNock() {
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
  .get('/user/repos')
  .query({"access_token":config.personal_oath_for_testing,"page":1,"per_page":10,"affiliation":"owner"})
  .reply(200, [{"id":19289649,"name":fixtures.testRepo}]);

}

/*function getGithubTreeFailureNock() {
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
}*/

function  getGithubCommitNock() {
  // NOTE:  I put in more in the reply than necessary. I  put it in
      // to help explain what's going on.
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .post(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/commits`, function(body) {
         
          return (body.message === 'saving cwrc version'
          && body.tree === 'newTreeSHAForTesting'
          && body.parents[0] === 'parentCommitSHAForTesting')
        }
        )

          //{"message":fixtures.commitMessage,"tree":fixtures.newTreeSHA,"parents":[fixtures.parentCommitSHA]})
        .query({"access_token":config.personal_oath_for_testing})
        .reply(201, {
            "sha": fixtures.newCommitSHA,
            "tree": {"sha": fixtures.newTreeSHA},
            "message": fixtures.commitMessage,
            "parents": [{"sha": fixtures.parentCommitSHA}]
        });
}

/*function getCreateGithubCWRCBranchNock() {
   // NOTE:  I didn't really need to return anything in the reply.  It isn't used. I just put it in
      // to help explain what's going on.
      return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .post(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/refs`, {"ref":"refs/heads/cwrc-drafts","sha":fixtures.newCommitSHA})
        .query({"access_token":config.personal_oath_for_testing})
        .reply(201, {"ref": "refs/heads/cwrc-drafts","object": {"sha": fixtures.newCommitSHA}});

}*/

function getUpdateGithubCWRCBranchNock() {
    // this is exactly the same as the create one above, but uses patch instead of post.
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .patch(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/refs/heads/master`, {"sha":fixtures.newCommitSHA})
        .query({"access_token":config.personal_oath_for_testing})
        .reply(201, {"ref": "refs/heads/master","object": {"sha": fixtures.newCommitSHA}});
}

function getCreateGithubTagNock() {
      // NOTE:  I didn't really need to return anything in the reply.  It isn't used.  I just put it in
      // to help explain what's going on.
      return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .post(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/refs`, {"ref":`refs/tags/cwrc/${fixtures.versionTimestamp}`,"sha":fixtures.newCommitSHA})
        .query({"access_token":config.personal_oath_for_testing})
        .reply(201, {
          "ref": `refs/tags/cwrc/${fixtures.versionTimestamp}`,
          "object": {"sha": fixtures.newCommitSHA}
        });
}

function getGithubTreeNock() {
  // In this one, I only return what's needed for the test to continue, i.e., the newSHA
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .post(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/trees`, 
          function(body) {
                  return (body.tree[0].path === 'document.xml' 
                  && body.tree[0].content.includes(`<encodingDesc><appInfo><application version="1.0" ident="${cwrcAppName}" notAfter="`)
                  && body.tree[1].path === 'annotations.json')

                }
          /*{"tree":[
            {"path":"document.xml","mode":"100644","type":"blob","content":fixtures.testDocWithTagAdded},
            {"path":"annotations.json","mode":"100644","type":"blob","content":fixtures.annotationBundleText}
          ],
          "base_tree":fixtures.baseTreeSHA
        }*/
        )
        .query({"access_token":config.personal_oath_for_testing})
        .reply(201, {"sha":fixtures.newTreeSHA});
}

function getCreateGithubRepoNock() {
// NOTE:  I put in more in the reply than necessary. I  put it in
      // to help explain what's going on.
      return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .post('/user/repos', {"name":fixtures.testRepo,"description":fixtures.testRepoDescription,"private":fixtures.isPrivate,"auto_init":true})
        .query({"access_token":config.personal_oath_for_testing})
        .reply(201, {"owner": {"login": fixtures.owner}, "name":fixtures.testRepo});
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
        .query({"ref":"master", "access_token":config.personal_oath_for_testing})
        .reply(200, {content: fixtures.base64TestDoc});
}

function getAnnotationsFromGithubNock() {
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .get(`/repos/${fixtures.owner}/${fixtures.testRepo}/contents/annotations.json`)
        .query({"ref":"master", "access_token":config.personal_oath_for_testing})
        .reply(200, {content: fixtures.base64AnnotationBundle});
}

function getBranchInfoFromGithubNock() {
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
                    })
}

function getReposForGithubUserNock() {

  return nock('https://api.github.com:443', {"encodedQueryParams":true})
        .get(`/users/${fixtures.owner}/repos`)
        .query({"access_token":config.personal_oath_for_testing,"page":1,"per_page":10})
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

function getTemplatesNock(repoDetails) {
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
  .get('/repos/cwrc/CWRC-Writer-Templates/contents/templates')
  .query({"ref":"master","access_token":config.personal_oath_for_testing})
  .reply(200, [{"name":"Sample_Canadian_Women_Playwrights_entry.xml","path":"templates/Sample_Canadian_Women_Playwrights_entry.xml","sha":"c03aab155adf94869e64867204b57f5418521379","size":93879,"url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/Sample_Canadian_Women_Playwrights_entry.xml?ref=master","html_url":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/Sample_Canadian_Women_Playwrights_entry.xml","git_url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/c03aab155adf94869e64867204b57f5418521379","download_url":"https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/Sample_Canadian_Women_Playwrights_entry.xml","type":"file","_links":{"self":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/Sample_Canadian_Women_Playwrights_entry.xml?ref=master","git":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/c03aab155adf94869e64867204b57f5418521379","html":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/Sample_Canadian_Women_Playwrights_entry.xml"}},{"name":"biography.xml","path":"templates/biography.xml","sha":"df8924ab45525603b11131084bac46a65e40dd05","size":8969,"url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/biography.xml?ref=master","html_url":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/biography.xml","git_url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/df8924ab45525603b11131084bac46a65e40dd05","download_url":"https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/biography.xml","type":"file","_links":{"self":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/biography.xml?ref=master","git":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/df8924ab45525603b11131084bac46a65e40dd05","html":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/biography.xml"}},{"name":"ceww_new_entry_template.xml","path":"templates/ceww_new_entry_template.xml","sha":"ed224c05b1dd8b2e8053fd880e04c983065698c1","size":12918,"url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/ceww_new_entry_template.xml?ref=master","html_url":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/ceww_new_entry_template.xml","git_url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/ed224c05b1dd8b2e8053fd880e04c983065698c1","download_url":"https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/ceww_new_entry_template.xml","type":"file","_links":{"self":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/ceww_new_entry_template.xml?ref=master","git":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/ed224c05b1dd8b2e8053fd880e04c983065698c1","html":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/ceww_new_entry_template.xml"}},{"name":"cwrcEntry.xml","path":"templates/cwrcEntry.xml","sha":"5cc998e21ac16e733e8e2d176ac77b1276651d1a","size":1192,"url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/cwrcEntry.xml?ref=master","html_url":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/cwrcEntry.xml","git_url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/5cc998e21ac16e733e8e2d176ac77b1276651d1a","download_url":"https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/cwrcEntry.xml","type":"file","_links":{"self":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/cwrcEntry.xml?ref=master","git":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/5cc998e21ac16e733e8e2d176ac77b1276651d1a","html":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/cwrcEntry.xml"}},{"name":"letter.xml","path":"templates/letter.xml","sha":"1525a783ddcd2844d75677d3748673d749c99963","size":4470,"url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/letter.xml?ref=master","html_url":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/letter.xml","git_url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/1525a783ddcd2844d75677d3748673d749c99963","download_url":"https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/letter.xml","type":"file","_links":{"self":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/letter.xml?ref=master","git":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/1525a783ddcd2844d75677d3748673d749c99963","html":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/letter.xml"}},{"name":"poem.xml","path":"templates/poem.xml","sha":"3646f33255208aa71b79ef0a7adaa03af2057ec4","size":9775,"url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/poem.xml?ref=master","html_url":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/poem.xml","git_url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/3646f33255208aa71b79ef0a7adaa03af2057ec4","download_url":"https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/poem.xml","type":"file","_links":{"self":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/poem.xml?ref=master","git":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/3646f33255208aa71b79ef0a7adaa03af2057ec4","html":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/poem.xml"}},{"name":"prose.xml","path":"templates/prose.xml","sha":"abe5f5729d23b51a54ad4098c182bbd3e70b2d79","size":19730,"url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/prose.xml?ref=master","html_url":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/prose.xml","git_url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/abe5f5729d23b51a54ad4098c182bbd3e70b2d79","download_url":"https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/prose.xml","type":"file","_links":{"self":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/prose.xml?ref=master","git":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/abe5f5729d23b51a54ad4098c182bbd3e70b2d79","html":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/prose.xml"}},{"name":"sample_biography.xml","path":"templates/sample_biography.xml","sha":"95edb8af9142e198f7b5adda6a2520f606171c1a","size":79937,"url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_biography.xml?ref=master","html_url":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_biography.xml","git_url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/95edb8af9142e198f7b5adda6a2520f606171c1a","download_url":"https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/sample_biography.xml","type":"file","_links":{"self":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_biography.xml?ref=master","git":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/95edb8af9142e198f7b5adda6a2520f606171c1a","html":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_biography.xml"}},{"name":"sample_letter.xml","path":"templates/sample_letter.xml","sha":"3018280fedf351a4a9330326cd654382aa80984b","size":20765,"url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_letter.xml?ref=master","html_url":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_letter.xml","git_url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/3018280fedf351a4a9330326cd654382aa80984b","download_url":"https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/sample_letter.xml","type":"file","_links":{"self":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_letter.xml?ref=master","git":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/3018280fedf351a4a9330326cd654382aa80984b","html":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_letter.xml"}},{"name":"sample_poem.xml","path":"templates/sample_poem.xml","sha":"e3fadfac318e076318ffbf69a335470df6a73b42","size":6572,"url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_poem.xml?ref=master","html_url":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_poem.xml","git_url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/e3fadfac318e076318ffbf69a335470df6a73b42","download_url":"https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/sample_poem.xml","type":"file","_links":{"self":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_poem.xml?ref=master","git":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/e3fadfac318e076318ffbf69a335470df6a73b42","html":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_poem.xml"}},{"name":"sample_writing.xml","path":"templates/sample_writing.xml","sha":"70f5fa95ddd70ae11aa7413d63369dfcabd4d81f","size":93162,"url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_writing.xml?ref=master","html_url":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_writing.xml","git_url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/70f5fa95ddd70ae11aa7413d63369dfcabd4d81f","download_url":"https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/sample_writing.xml","type":"file","_links":{"self":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_writing.xml?ref=master","git":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/70f5fa95ddd70ae11aa7413d63369dfcabd4d81f","html":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_writing.xml"}},{"name":"writing.xml","path":"templates/writing.xml","sha":"978a11166ed998a61e60732597178eea51ae2daf","size":6316,"url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/writing.xml?ref=master","html_url":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/writing.xml","git_url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/978a11166ed998a61e60732597178eea51ae2daf","download_url":"https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/writing.xml","type":"file","_links":{"self":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/writing.xml?ref=master","git":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/978a11166ed998a61e60732597178eea51ae2daf","html":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/writing.xml"}}], [ 'Server',
  'GitHub.com',
  'Date',
  'Tue, 14 Mar 2017 00:34:06 GMT',
  'Content-Type',
  'application/json; charset=utf-8',
  'Content-Length',
  '11023',
  'Connection',
  'close',
  'Status',
  '200 OK',
  'X-RateLimit-Limit',
  '60',
  'X-RateLimit-Remaining',
  '59',
  'X-RateLimit-Reset',
  '1489455245',
  'Cache-Control',
  'public, max-age=60, s-maxage=60',
  'Vary',
  'Accept',
  'ETag',
  '"3cf589b0fb08096878dfecd1f6fe3ad1"',
  'Last-Modified',
  'Tue, 02 Feb 2016 23:01:13 GMT',
  'X-GitHub-Media-Type',
  'github.v3; format=json',
  'Access-Control-Expose-Headers',
  'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
  'Access-Control-Allow-Origin',
  '*',
  'Content-Security-Policy',
  'default-src \'none\'',
  'Strict-Transport-Security',
  'max-age=31536000; includeSubdomains; preload',
  'X-Content-Type-Options',
  'nosniff',
  'X-Frame-Options',
  'deny',
  'X-XSS-Protection',
  '1; mode=block',
  'Vary',
  'Accept-Encoding',
  'X-Served-By',
  '4c8b2d4732c413f4b9aefe394bd65569',
  'X-GitHub-Request-Id',
  'FC15:DCFF:7FA7785:A336296:58C73A7B' ]);


}

function getTemplateNock() {
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
  .get('/repos/cwrc/CWRC-Writer-Templates/contents/templates/letter.xml')
  .query({"ref":"master","access_token":config.personal_oath_for_testing})
  .reply(200, {"name":"letter.xml","path":"templates/letter.xml","sha":"1525a783ddcd2844d75677d3748673d749c99963","size":4470,"url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/letter.xml?ref=master","html_url":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/letter.xml","git_url":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/1525a783ddcd2844d75677d3748673d749c99963","download_url":"https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/letter.xml","type":"file","content":"77u/PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPD94\nbWwtbW9kZWwgaHJlZj0iaHR0cDovL2N3cmMuY2Evc2NoZW1hcy9jd3JjX3Rl\naV9saXRlLnJuZyIgdHlwZT0iYXBwbGljYXRpb24veG1sIiBzY2hlbWF0eXBl\nbnM9Imh0dHA6Ly9yZWxheG5nLm9yZy9ucy9zdHJ1Y3R1cmUvMS4wIj8+Cjw/\neG1sLXN0eWxlc2hlZXQgdHlwZT0idGV4dC9jc3MiIGhyZWY9Imh0dHA6Ly9j\nd3JjLmNhL3RlbXBsYXRlcy9jc3MvdGVpLmNzcyI/Pgo8VEVJIHhtbG5zPSJo\ndHRwOi8vd3d3LnRlaS1jLm9yZy9ucy8xLjAiIHhtbG5zOnJkZj0iaHR0cDov\nL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgeG1sbnM6\nY3c9Imh0dHA6Ly9jd3JjLmNhL25zL2N3IyIgeG1sbnM6dz0iaHR0cDovL2N3\ncmN0Yy5hcnRzcm4udWFsYmVydGEuY2EvIyI+Cgk8cmRmOlJERiB4bWxuczpy\nZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1u\ncyMiIHhtbG5zOmN3PSJodHRwOi8vY3dyYy5jYS9ucy9jdyMiIHhtbG5zOm9h\nPSJodHRwOi8vd3d3LnczLm9yZy9ucy9vYSMiIHhtbG5zOmZvYWY9Imh0dHA6\nLy94bWxucy5jb20vZm9hZi8wLjEvIj4KCQk8cmRmOkRlc2NyaXB0aW9uIHJk\nZjphYm91dD0iaHR0cDovL2FwcHMudGVzdGluZy5jd3JjLmNhL2VkaXRvci9k\nb2N1bWVudHMvbnVsbCI+CgkJCTxjdzptb2RlPjA8L2N3Om1vZGU+CgkJPC9y\nZGY6RGVzY3JpcHRpb24+CgkJPHJkZjpEZXNjcmlwdGlvbiB4bWxuczpyZGY9\nImh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMi\nIHJkZjphYm91dD0iaHR0cDovL2lkLmN3cmMuY2EvYW5ub3RhdGlvbi8zM2Mz\nNzdmMS0yMWZhLTQ1OTQtOWIxZi05M2Q3ZTM4N2ZjOGEiPgoJCQk8b2E6aGFz\nVGFyZ2V0IHhtbG5zOm9hPSJodHRwOi8vd3d3LnczLm9yZy9ucy9vYSMiIHJk\nZjpyZXNvdXJjZT0iaHR0cDovL2lkLmN3cmMuY2EvdGFyZ2V0LzE2OGJhMzlk\nLTJiYjktNDY0ZC1iMzNhLTAxM2ZhNjMwZDJjMSIvPgoJCQk8b2E6aGFzQm9k\neSB4bWxuczpvYT0iaHR0cDovL3d3dy53My5vcmcvbnMvb2EjIiByZGY6cmVz\nb3VyY2U9Imh0dHA6Ly9jd3JjLWRldi0wMS5zcnYudWFsYmVydGEuY2EvaXNs\nYW5kb3JhL29iamVjdC83M2MzMzRkMy0yNjI5LTRmNjMtODM1Yi0yM2ZjMGE3\nMDZkN2MiLz4KCQkJPG9hOmFubm90YXRlZEJ5IHhtbG5zOm9hPSJodHRwOi8v\nd3d3LnczLm9yZy9ucy9vYSMiIHJkZjpyZXNvdXJjZT0iaHR0cDovL2lkLmN3\ncmMuY2EvdXNlci8wNmY5M2JjMy1kODNhLTQzMDAtYTIwOS0zY2YxMmNjNmE5\nZTkiLz4KCQkJPG9hOmFubm90YXRlZEF0IHhtbG5zOm9hPSJodHRwOi8vd3d3\nLnczLm9yZy9ucy9vYSMiPjIwMTQtMTAtMDFUMTY6MTI6MTMuNDY0Wjwvb2E6\nYW5ub3RhdGVkQXQ+CgkJCTxvYTpzZXJpYWxpemVkQnkgeG1sbnM6b2E9Imh0\ndHA6Ly93d3cudzMub3JnL25zL29hIyIgcmRmOnJlc291cmNlPSIiLz4KCQkJ\nPG9hOnNlcmlhbGl6ZWRBdCB4bWxuczpvYT0iaHR0cDovL3d3dy53My5vcmcv\nbnMvb2EjIj4yMDE0LTEwLTAxVDE2OjEyOjEzLjQ2NFo8L29hOnNlcmlhbGl6\nZWRBdD4KCQkJPHJkZjp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3d3dy53\nMy5vcmcvbnMvb2EjQW5ub3RhdGlvbiIvPgoJCQk8b2E6bW90aXZhdGVkQnkg\neG1sbnM6b2E9Imh0dHA6Ly93d3cudzMub3JnL25zL29hIyIgcmRmOnJlc291\ncmNlPSJodHRwOi8vd3d3LnczLm9yZy9ucy9vYSN0YWdnaW5nIi8+CgkJCTxv\nYTptb3RpdmF0ZWRCeSB4bWxuczpvYT0iaHR0cDovL3d3dy53My5vcmcvbnMv\nb2EjIiByZGY6cmVzb3VyY2U9Imh0dHA6Ly93d3cudzMub3JnL25zL29hI2lk\nZW50aWZ5aW5nIi8+CgkJCTxjdzpoYXNDZXJ0YWludHkgeG1sbnM6Y3c9Imh0\ndHA6Ly9jd3JjLmNhL25zL2N3IyIgcmRmOnJlc291cmNlPSJodHRwOi8vY3dy\nYy5jYS9ucy9jdyNkZWZpbml0ZSIvPgoJCQk8Y3c6Y3dyY0luZm8geG1sbnM6\nY3c9Imh0dHA6Ly9jd3JjLmNhL25zL2N3IyI+eyJpZCI6Imh0dHA6Ly92aWFm\nLm9yZy92aWFmLzM5NTY5NzUyIiwibmFtZSI6IkJyb3duLCBNaXF1ZWwiLCJy\nZXBvc2l0b3J5IjoidmlhZiJ9PC9jdzpjd3JjSW5mbz4KCQkJPGN3OmN3cmNB\ndHRyaWJ1dGVzIHhtbG5zOmN3PSJodHRwOi8vY3dyYy5jYS9ucy9jdyMiPnsi\nY2VydCI6ImRlZmluaXRlIiwidHlwZSI6InJlYWwiLCJyZWYiOiJodHRwOi8v\ndmlhZi5vcmcvdmlhZi8zOTU2OTc1MiJ9PC9jdzpjd3JjQXR0cmlidXRlcz4K\nCQk8L3JkZjpEZXNjcmlwdGlvbj4KCQk8cmRmOkRlc2NyaXB0aW9uIHhtbG5z\nOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4\nLW5zIyIgcmRmOmFib3V0PSJodHRwOi8vY3dyYy1kZXYtMDEuc3J2LnVhbGJl\ncnRhLmNhL2lzbGFuZG9yYS9vYmplY3QvNzNjMzM0ZDMtMjYyOS00ZjYzLTgz\nNWItMjNmYzBhNzA2ZDdjIj4KCQkJPHJkZjp0eXBlIHJkZjpyZXNvdXJjZT0i\naHR0cDovL3d3dy53My5vcmcvbnMvb2EjU2VtYW50aWNUYWciLz4KCQkJPHJk\nZjp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3htbG5zLmNvbS9mb2FmLzAu\nMS9QZXJzb24iLz4KCQk8L3JkZjpEZXNjcmlwdGlvbj4KCQk8cmRmOkRlc2Ny\naXB0aW9uIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8y\nMi1yZGYtc3ludGF4LW5zIyIgcmRmOmFib3V0PSJodHRwOi8vaWQuY3dyYy5j\nYS90YXJnZXQvMTY4YmEzOWQtMmJiOS00NjRkLWIzM2EtMDEzZmE2MzBkMmMx\nIj4KCQkJPG9hOmhhc1NvdXJjZSB4bWxuczpvYT0iaHR0cDovL3d3dy53My5v\ncmcvbnMvb2EjIiByZGY6cmVzb3VyY2U9Imh0dHA6Ly9pZC5jd3JjLmNhL2Rv\nYy85YTgxMzIzNi00YjRlLTRmMzEtYjQxOC03YTE4M2EyODViNWUiLz4KCQkJ\nPHJkZjp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3d3dy53My5vcmcvbnMv\nb2EjU3BlY2lmaWNSZXNvdXJjZSIvPgoJCQk8b2E6aGFzU2VsZWN0b3IgeG1s\nbnM6b2E9Imh0dHA6Ly93d3cudzMub3JnL25zL29hIyIgcmRmOnJlc291cmNl\nPSJodHRwOi8vaWQuY3dyYy5jYS9zZWxlY3Rvci82YjRiYmQxYS1iODg3LTQ5\nOGItYjVmNy1iZTQwMWJmY2Q2ZDkiLz4KCQk8L3JkZjpEZXNjcmlwdGlvbj4K\nCQk8cmRmOkRlc2NyaXB0aW9uIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5v\ncmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgcmRmOmFib3V0PSJodHRw\nOi8vaWQuY3dyYy5jYS9zZWxlY3Rvci82YjRiYmQxYS1iODg3LTQ5OGItYjVm\nNy1iZTQwMWJmY2Q2ZDkiPgoJCQk8cmRmOnZhbHVlPnhwb2ludGVyKC8vcGVy\nc05hbWVbQGFubm90YXRpb25JZD0iZW50XzYyIl0pPC9yZGY6dmFsdWU+CgkJ\nCTxyZGY6dHlwZSByZGY6cmVzb3VyY2U9Imh0dHA6Ly93d3cudzMub3JnL25z\nL29hI0ZyYWdtZW50U2VsZWN0b3IiLz4KCQk8L3JkZjpEZXNjcmlwdGlvbj4K\nCTwvcmRmOlJERj4KCTx0ZWlIZWFkZXI+CgkJPGZpbGVEZXNjPgoJCQk8dGl0\nbGVTdG10PgoJCQkJPHRpdGxlPlNhbXBsZSBEb2N1bWVudCBUaXRsZTwvdGl0\nbGU+CgkJCTwvdGl0bGVTdG10PgoJCQk8cHVibGljYXRpb25TdG10PgoJCQkJ\nPHAvPgoJCQk8L3B1YmxpY2F0aW9uU3RtdD4KCQkJPHNvdXJjZURlc2Mgc2Ft\nZUFzPSJodHRwOi8vd3d3LmN3cmMuY2EiPgoJCQkJPHA+Q3JlYXRlZCBmcm9t\nIG9yaWdpbmFsIHJlc2VhcmNoIGJ5IG1lbWJlcnMgb2YgQ1dSQy9DU++/vUMg\ndW5sZXNzIG90aGVyd2lzZSBub3RlZC48L3A+CgkJCTwvc291cmNlRGVzYz4K\nCQk8L2ZpbGVEZXNjPgoJPC90ZWlIZWFkZXI+Cgk8dGV4dD4KCQk8Ym9keT4K\nCQkJPGRpdiB0eXBlPSJsZXR0ZXIiPgoJCQkJPGhlYWQ+CgkJCQkJPHRpdGxl\nPlNhbXBsZSBMZXR0ZXIgVGl0bGU8L3RpdGxlPgoJCQkJPC9oZWFkPgoJCQkJ\nPG9wZW5lcj4KCQkJCQk8bm90ZSB0eXBlPSJzZXR0aW5nIj4KCQkJCQkJPHA+\nU29tZSBvcGVuaW5nIG5vdGUgZGVzY3JpYmluZyB0aGUgd3JpdGluZyBzZXR0\naW5nPC9wPgoJCQkJCTwvbm90ZT4KCQkJCQk8ZGF0ZWxpbmU+CgkJCQkJCTxk\nYXRlPlNvbWUgZGF0ZSAoc2V0IGRhdGUgdmFsdWUgaW4gYXR0cmlidXRlKS48\nL2RhdGU+CgkJCQkJPC9kYXRlbGluZT4KCQkJCQk8c2FsdXRlPlNvbWUgc2Fs\ndXRhdGlvbiwgZS5nLiAiRGVhcmVzdCA8cGVyc05hbWUgYW5ub3RhdGlvbklk\nPSJlbnRfNjIiIGNlcnQ9ImRlZmluaXRlIiB0eXBlPSJyZWFsIiByZWY9Imh0\ndHA6Ly92aWFmLm9yZy92aWFmLzM5NTY5NzUyIj5NaXF1ZWw8L3BlcnNOYW1l\nPiI8L3NhbHV0ZT4KCQkJCTwvb3BlbmVyPgoJCQkJPHA+U2FtcGxlIGxldHRl\nciBjb250ZW50PC9wPgoJCQkJPGNsb3Nlcj4KCQkJCQk8c2FsdXRlPlNvbWUg\nY2xvc2luZyBzYWx1dGF0aW9uLCBlLmcuICJXaXRoIGxvdmUuLi4iPC9zYWx1\ndGU+CgkJCQkJPHNpZ25lZD5TZW5kZXIgbmFtZSBhbmQvb3Igc2lnbmF0dXJl\nLjwvc2lnbmVkPgoJCQkJPC9jbG9zZXI+CgkJCTwvZGl2PgoJCTwvYm9keT4K\nCTwvdGV4dD4KPC9URUk+\n","encoding":"base64","_links":{"self":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/letter.xml?ref=master","git":"https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/1525a783ddcd2844d75677d3748673d749c99963","html":"https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/letter.xml"}}, [ 'Server',
  'GitHub.com',
  'Date',
  'Tue, 14 Mar 2017 03:29:10 GMT',
  'Content-Type',
  'application/json; charset=utf-8',
  'Content-Length',
  '7061',
  'Connection',
  'close',
  'Status',
  '200 OK',
  'X-RateLimit-Limit',
  '5000',
  'X-RateLimit-Remaining',
  '4999',
  'X-RateLimit-Reset',
  '1489465750',
  'Cache-Control',
  'private, max-age=60, s-maxage=60',
  'Vary',
  'Accept, Authorization, Cookie, X-GitHub-OTP',
  'ETag',
  '"3a70a0eac710a2f0a7e1ff7d4d5a8806"',
  'Last-Modified',
  'Wed, 07 Dec 2016 19:45:12 GMT',
  'X-OAuth-Scopes',
  '',
  'X-Accepted-OAuth-Scopes',
  '',
  'X-GitHub-Media-Type',
  'github.v3; format=json',
  'Access-Control-Expose-Headers',
  'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
  'Access-Control-Allow-Origin',
  '*',
  'Content-Security-Policy',
  'default-src \'none\'',
  'Strict-Transport-Security',
  'max-age=31536000; includeSubdomains; preload',
  'X-Content-Type-Options',
  'nosniff',
  'X-Frame-Options',
  'deny',
  'X-XSS-Protection',
  '1; mode=block',
  'Vary',
  'Accept-Encoding',
  'X-Served-By',
  '173530fed4bbeb1e264b2ed22e8b5c20',
  'X-GitHub-Request-Id',
  'C6FB:DCFF:81252EB:A51FB15:58C76386' ]);
}

function getSearchNock() {
  return nock('https://api.github.com:443', {"encodedQueryParams":true})
  .get((uri)=>uri.includes('search/code'))
  .query({"q":"cwrc-melbourne+repo%3Ajchartrand%2FcleanDoc2", "page":"undefined","per_page":"undefined","access_token":config.personal_oath_for_testing})
  .reply(200, {"total_count":1,"incomplete_results":false,"items":[{"name":"cwrc-categories","path":"cwrc-categories","sha":"50e94e0bb7c307caab2c791775d63e544ae64bc6","url":"https://api.github.com/repositories/84259758/contents/cwrc-categories?ref=aab4b2d3c14c0121e2d604900711896b1ac8b83c","git_url":"https://api.github.com/repositories/84259758/git/blobs/50e94e0bb7c307caab2c791775d63e544ae64bc6","html_url":"https://github.com/jchartrand/cleanDoc2/blob/aab4b2d3c14c0121e2d604900711896b1ac8b83c/cwrc-categories","repository":{"id":84259758,"name":"cleanDoc2","full_name":"jchartrand/cleanDoc2","owner":{"login":"jchartrand","id":547165,"avatar_url":"https://avatars0.githubusercontent.com/u/547165?v=3","gravatar_id":"","url":"https://api.github.com/users/jchartrand","html_url":"https://github.com/jchartrand","followers_url":"https://api.github.com/users/jchartrand/followers","following_url":"https://api.github.com/users/jchartrand/following{/other_user}","gists_url":"https://api.github.com/users/jchartrand/gists{/gist_id}","starred_url":"https://api.github.com/users/jchartrand/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/jchartrand/subscriptions","organizations_url":"https://api.github.com/users/jchartrand/orgs","repos_url":"https://api.github.com/users/jchartrand/repos","events_url":"https://api.github.com/users/jchartrand/events{/privacy}","received_events_url":"https://api.github.com/users/jchartrand/received_events","type":"User","site_admin":false},"private":false,"html_url":"https://github.com/jchartrand/cleanDoc2","description":"a clean cwrc doc","fork":false,"url":"https://api.github.com/repos/jchartrand/cleanDoc2","forks_url":"https://api.github.com/repos/jchartrand/cleanDoc2/forks","keys_url":"https://api.github.com/repos/jchartrand/cleanDoc2/keys{/key_id}","collaborators_url":"https://api.github.com/repos/jchartrand/cleanDoc2/collaborators{/collaborator}","teams_url":"https://api.github.com/repos/jchartrand/cleanDoc2/teams","hooks_url":"https://api.github.com/repos/jchartrand/cleanDoc2/hooks","issue_events_url":"https://api.github.com/repos/jchartrand/cleanDoc2/issues/events{/number}","events_url":"https://api.github.com/repos/jchartrand/cleanDoc2/events","assignees_url":"https://api.github.com/repos/jchartrand/cleanDoc2/assignees{/user}","branches_url":"https://api.github.com/repos/jchartrand/cleanDoc2/branches{/branch}","tags_url":"https://api.github.com/repos/jchartrand/cleanDoc2/tags","blobs_url":"https://api.github.com/repos/jchartrand/cleanDoc2/git/blobs{/sha}","git_tags_url":"https://api.github.com/repos/jchartrand/cleanDoc2/git/tags{/sha}","git_refs_url":"https://api.github.com/repos/jchartrand/cleanDoc2/git/refs{/sha}","trees_url":"https://api.github.com/repos/jchartrand/cleanDoc2/git/trees{/sha}","statuses_url":"https://api.github.com/repos/jchartrand/cleanDoc2/statuses/{sha}","languages_url":"https://api.github.com/repos/jchartrand/cleanDoc2/languages","stargazers_url":"https://api.github.com/repos/jchartrand/cleanDoc2/stargazers","contributors_url":"https://api.github.com/repos/jchartrand/cleanDoc2/contributors","subscribers_url":"https://api.github.com/repos/jchartrand/cleanDoc2/subscribers","subscription_url":"https://api.github.com/repos/jchartrand/cleanDoc2/subscription","commits_url":"https://api.github.com/repos/jchartrand/cleanDoc2/commits{/sha}","git_commits_url":"https://api.github.com/repos/jchartrand/cleanDoc2/git/commits{/sha}","comments_url":"https://api.github.com/repos/jchartrand/cleanDoc2/comments{/number}","issue_comment_url":"https://api.github.com/repos/jchartrand/cleanDoc2/issues/comments{/number}","contents_url":"https://api.github.com/repos/jchartrand/cleanDoc2/contents/{+path}","compare_url":"https://api.github.com/repos/jchartrand/cleanDoc2/compare/{base}...{head}","merges_url":"https://api.github.com/repos/jchartrand/cleanDoc2/merges","archive_url":"https://api.github.com/repos/jchartrand/cleanDoc2/{archive_format}{/ref}","downloads_url":"https://api.github.com/repos/jchartrand/cleanDoc2/downloads","issues_url":"https://api.github.com/repos/jchartrand/cleanDoc2/issues{/number}","pulls_url":"https://api.github.com/repos/jchartrand/cleanDoc2/pulls{/number}","milestones_url":"https://api.github.com/repos/jchartrand/cleanDoc2/milestones{/number}","notifications_url":"https://api.github.com/repos/jchartrand/cleanDoc2/notifications{?since,all,participating}","labels_url":"https://api.github.com/repos/jchartrand/cleanDoc2/labels{/name}","releases_url":"https://api.github.com/repos/jchartrand/cleanDoc2/releases{/id}","deployments_url":"https://api.github.com/repos/jchartrand/cleanDoc2/deployments"},"score":11.488182,"text_matches":[{"object_url":"https://api.github.com/repositories/84259758/contents//cwrc-categories?ref=aab4b2d3c14c0121e2d604900711896b1ac8b83c","object_type":"FileContent","property":"content","fragment":"cwrc-melbourne\n","matches":[{"text":"cwrc-melbourne","indices":[0,14]}]}]}]}, [ 'Server',
  'GitHub.com',
  'Date',
  'Sun, 02 Apr 2017 22:28:42 GMT',
  'Content-Type',
  'application/json; charset=utf-8',
  'Content-Length',
  '4935',
  'Connection',
  'close',
  'Status',
  '200 OK',
  'X-RateLimit-Limit',
  '30',
  'X-RateLimit-Remaining',
  '29',
  'X-RateLimit-Reset',
  '1491172182',
  'Cache-Control',
  'no-cache',
  'X-OAuth-Scopes',
  '',
  'X-Accepted-OAuth-Scopes',
  '',
  'X-GitHub-Media-Type',
  'github.v3; param=text-match; format=json',
  'Access-Control-Expose-Headers',
  'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
  'Access-Control-Allow-Origin',
  '*',
  'Content-Security-Policy',
  'default-src \'none\'',
  'Strict-Transport-Security',
  'max-age=31536000; includeSubdomains; preload',
  'X-Content-Type-Options',
  'nosniff',
  'X-Frame-Options',
  'deny',
  'X-XSS-Protection',
  '1; mode=block',
  'Vary',
  'Accept-Encoding',
  'X-Served-By',
  'b535085e7f4d6e3423e016e684de0829',
  'X-GitHub-Request-Id',
  'E4A0:257B:3CD9208:4ACDF0A:58E17B19' ]);
}

function getRepoContentsByDrillDownBranchNock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.get('/repos/jchartrand/aTest/branches/master')
		.query({"access_token":config.personal_oath_for_testing})
		.reply(200, ["1f8b0800000000000003ed574d6fdb300cfd2b81cf696d27fe88030c1bb0dbcedd654311d03265ab736c4f92d37541fefb48c7f972b12e0eb05b734a24f1f1f1891499ad53c11a9da5b30663513b5347d4ebb5b2ce72eb980268238a16be0409b888023f0c64ec05e92c8d441c43262109234c7c9fd62e4ca1b545ad19a487ff425ecce47301da6aa8323a8c6b5025e13f897b7158fe94f3e23d51a00319582636f3fcc59d17dccda2073f587ac9729e7c7376079eccf97f7a21d60672e601593691aac489acf5c4a2b1aaca89a5d548bb07b11289999cc75ee6037a62e1853126de3c8a803edecc8f534c6298792119b69aa32fac","6dccd275a151f7b9b2459b72f4aec6a636eed35118171ec8a34b275c7668dcab1d9152b77ada678271476600567625eab6a21cf2a6ce06b5924a805575c53aed7f63e62c259406a78e4630bce5b4955179453b5387bf806d35295bb56539751a78296b2023feb9bb31a61be229ecba5c5dea77764bafee67efe106c1ccc0c975e9303620970de87a0c497caad0b2ce15eb7f8a86b615691d06b11f8574740316f49061b768e67dd6b606b5a82b4be85d02b7eedefae3e6434070b9ee4118d7f957f633d879f6d3f96b2f828ecaba2ceb67421832be2cb1a113f76877c4a00abf0983ecb66e6d0b24d128941d0ba08c1d4ba8b3d952d11bbb5219a318925c633692546f45949e2b62b3ed5e970eae4d8dd0aae1da1c4beec296b06a9d43a57e77753e168b6c3925bb476f646c9d0dd9e286f37aa4f1de68eb365a6d40bcb0241a05aa0d497c13e0c09af0ec4bc3cde32ba5010bae2cae205b73bd75cfdfb08fbdd762371ebcd7e25bc3c1ab97ebbd16a9e10c7a063d7217957c552d36a0bbf6b8fc7e18e8c270011904b3d84f7d4f641946722e17a11fc4c97ce62f602e122f0b9398e06f19b30e1d7c849b6b3b613f32f623c9d50e768ff426ad4a55fd201948052ce5e83135a51a16054da9c73f154cfa0ce6ad198ae7db83215169746d51d8b381b15fe9e749ac202d2fc6c99fade21e495dcfb666453cc43e14ac687217c803d0aaa4e79d09d552d2cd7583cbafeede1f79b83c7978bba1fc654a1f844feda50b8109effe00b953669e700d0000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Fri, 27 Apr 2018 13:19:26 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4970',
			'X-RateLimit-Reset',
			'1524837201',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'W/"cc5b2ec31609cc9a0a1be66ef570e41c"',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.052916',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'4F65:2B63:296904C:50BBB52:5AE3235E' ]);

}

function getRepoContentsByDrillDownRootTreeNock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.get('/repos/jchartrand/aTest/git/trees/9fedf370d1ae0c8057e90366aaaa0217be97a205')
		.query({"access_token":config.personal_oath_for_testing})
		.reply(200, ["1f8b0800000000000003a5933f6fdc300cc5bf8be6c0a26c59b26e2b908c5d826c41078aa26a0767cbb07440fee0be7b752d7ac9e8f6b811e2c3d30f7cfc10794471102e72889d85a0908106e82d3be88cc15ad02aebd9596ca11777e2b41dab602c65cd0729719d9a9f53194fbea134cb8dd794e50b8db8950d9720f18973917542968d39cb7f30ba08c4e1f943ac58c66af9f8f0edfefb433387fa893985fa261480d1baf6e56dbdf4fe987cedfe3059dd32921982b73174d645e5836a6b696bc0ebe87ae523","f2459ea7f72ab7ff0f7731ce72b7e3f9ee4a85cb920a96292db979c969d90907d178660250601c906d4939d0410fa809886cd4446880ae70cadc4ab7dbf20b5d48749a7929cdeb7cdc49e6180724ea40b504d698d6101be09acee0b42315502bcb71b892e9dec1ad6cbb4dbfb0e534f3fdb47d6281865a9f69fc1de0bf69ecea3aa2456d628f36586b7beda06d91425d58648fa4d9d57bab82db2e6cb7d1f947bd9bedb410160ee210f198f9fc0b3876de0111040000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Fri, 27 Apr 2018 13:19:26 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4969',
			'X-RateLimit-Reset',
			'1524837201',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'W/"4cd04f71fec918606214f45784dcc323"',
			'Last-Modified',
			'Thu, 26 Apr 2018 14:09:46 GMT',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.038646',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'56E0:2B63:2969064:50BBB91:5AE3235E' ]);

}

function getReposByDrillDownSecondLevelNock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.get('/repos/jchartrand/aTest/git/trees/3ca6f7a46f5a7d777549022acd4c0febac4e96aa')
		.query({"access_token":config.personal_oath_for_testing})
		.reply(200, ["1f8b0800000000000003a5913d6fc3201086ff0b7314ce7006db73d5a963b7aac30147edca892d2055db28ffbd24559bb51fb7bd82472f0f771479243108edc9444b68624b36586b5bec4129f2013d4476e4917b432436e290e60a8ca5ac799092d669fb3495f1e0b67ed9c9c4eb92e5b31f299544fb20e99e7391f5862c8939cb5f149d01313c1cc54a65ac95743bcdbc2dafa53e62b7847a261a00835873795bcfd9cd8babe9d3497154c6b26a5d30de9006700ead6603e8a057ce1076add217607aaf78a3ff","6e776ecef2c795a7cdb75666bfecc31dbff07c33a5ab1b20d4b9ba5dbee3cb2d605ba7e9b54202e6d0296b4137da5ab4bd6182d879eca2a9c0fff6f5e3a2d363dd423aec3d150e628834673e7d0072e710e25f020000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Fri, 27 Apr 2018 13:19:26 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4968',
			'X-RateLimit-Reset',
			'1524837201',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'W/"cceb007e9646574a82e1d21bd1263e7a"',
			'Last-Modified',
			'Thu, 26 Apr 2018 14:09:46 GMT',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.031467',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'284E:2B61:121E66F:2B7230A:5AE3235E' ]);

}

function getReposByDrillDownThirdLevelNock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.get('/repos/jchartrand/aTest/git/trees/d4555519324a0eed82770313774796ea0f8c48f6')
		.query({"access_token":config.personal_oath_for_testing})
		.reply(200, ["1f8b08000000000000039d8f416ec3201045efc2ba326008d83e40565d76177531c0503b720c021ca98d72f78ed50bb49ddd97fed3fbf360750636b1a04f747254bd06811886de5aa1a4b256dbd1208838783d44c35ed85e5602e6d6729d3887bc741f4b9b77d7f974e30573aafcea6728adc01638bc616d9c1abc15c4caff203a00365d1e2c439b4959d1a72dbce21dd7f3b26277ad69a33db714a8c6a410466bcaed331fd9adc951fa79af970e7aef2c686185544a19d451f51ec0fa53746a30ce8f9674042c5f","842bf1ff470f73e5bf563edf6973d9370f0d039b22ac159fdff769a44098010000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Fri, 27 Apr 2018 13:19:27 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4967',
			'X-RateLimit-Reset',
			'1524837201',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'W/"0b1ffa03f96dcd40b21a031261a29b59"',
			'Last-Modified',
			'Thu, 26 Apr 2018 14:09:46 GMT',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.039221',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'2506:2B61:121E674:2B7231F:5AE3235F' ]);


}

function getRepoContentsNock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.get('/repos/jchartrand/aTest/git/trees/9fedf370d1ae0c8057e90366aaaa0217be97a205')
		.query({"access_token":config.personal_oath_for_testing,"recursive":"true"})
		.reply(200, ["1f8b0800000000000003a594cd6edb301084df45e7405afe882bfa5620e9a9bd14bd153d2c97cbd8812519125da40dfceea56dd431d00255e2bd11e262f46166f852cd6baa56954f129341888a04b88316c583718eca805618c4236968abbb6a3f6dcbc23ae7ddbc6a1ada6deac74d5eef43cd63df4cb21be7e689d734e58986d8d0579973536e347912999b37081d17aad5b7976a47795d24bf3c7cb8fffc50f7b1fc443fc6f2ad5200ceda72ce3f77c773d88ea19cce4c68b510bb2e064cd1a04f2a44a5cb58","74106cf2ad0a89e4b83e6f7e95757c3fdc51786e162b1eee2e54340c63a6bc1987b97e9ac761211c241744184081f3c0a85979b0d17664199831596672c01738e56ea55b2c79451747def732e4fab9df2e24f3421d311b509a019dd38ec5819474466f3dab4856a1a4ee42665b0fb7b22d16bd629bc75eee37d32b165828f39ac65380ffa4d1143b129275a9258c88d85a0f5a13c7625892406cc597be9585db1ab658e86f94863e6eb652e7e7bcd02b2d493b14dd86e8d8910108c1a2297ed9005e0747b66bb53975f2543165de8f77eed862c97fe0cdc2e3103fc90fd92e372edab68cf2465b0291d8694430ca205af44e0852c7b64bee66e3160bfd97acb9023d39fa868745ab409a43492a2028638c139b8c6622e43605d3b9c01ecfc13e596a6e2edf62c9c3f7f2d24ffb81294bac5689b6b31c7e03c37c2174c3060000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Fri, 27 Apr 2018 13:46:45 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4965',
			'X-RateLimit-Reset',
			'1524837201',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'W/"6badd72a8f9e3059a18eab89285118d0"',
			'Last-Modified',
			'Thu, 26 Apr 2018 14:09:46 GMT',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.047910',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'0412:2B62:1E14688:42453A1:5AE329C5' ]);
}

function getCreateFileNock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.put('/repos/jchartrand/aTest/contents/curt/qurt/test1.txt', {"message":"some commit message","content":"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPFRFSSB4bWxucz0iaHR0cDovL3d3dy50ZWktYy5vcmcvbnMvMS4wIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmN3PSJodHRwOi8vY3dyYy5jYS9ucy9jdyMiIHhtbG5zOnc9Imh0dHA6Ly9jd3JjdGMuYXJ0c3JuLnVhbGJlcnRhLmNhLyMiPgogIDx0ZWlIZWFkZXI+CiAgICA8ZmlsZURlc2M+CiAgICAgIDx0aXRsZVN0bXQ+CiAgICAgICAgPHRpdGxlPlNhbXBsZSBEb2N1bWVudCBUaXRsZSB0ZXN0IHVuZGVmaW5lZDwvdGl0bGU+CiAgICAgIDwvdGl0bGVTdG10PgogICAgICA8cHVibGljYXRpb25TdG10PgogICAgICAgIDxwPjwvcD4KICAgICAgPC9wdWJsaWNhdGlvblN0bXQ+CiAgICAgIDxzb3VyY2VEZXNjIHNhbWVBcz0iaHR0cDovL3d3dy5jd3JjLmNhIj4KICAgICAgICA8cD5DcmVhdGVkIGZyb20gb3JpZ2luYWwgcmVzZWFyY2ggYnkgbWVtYmVycyBvZiBDV1JDL0NTw4lDIHVubGVzcyBvdGhlcndpc2Ugbm90ZWQuPC9wPgogICAgICA8L3NvdXJjZURlc2M+CiAgICA8L2ZpbGVEZXNjPgogIDwvdGVpSGVhZGVyPgogIDx0ZXh0PgogICAgPGJvZHk+CiAgICAgIDxkaXYgdHlwZT0ibGV0dGVyIj4KICAgICAgICA8aGVhZD4KICAgICAgICAgIDx0aXRsZT5TYW1wbGUgTGV0dGVyIC0gQmVydHJhbmQgUnVzc2VsbCB0byA8cGVyc05hbWUgYW5ub3RhdGlvbklkPSJlbnRfNzMiIGNlcnQ9InByb2JhYmxlIiByZWY9IjI3OTM5OTM5OSI+UGF0cmljaWEgU3BlbmNlPC9wZXJzTmFtZT4gLSBPY3RvYmVyIDIxLCAxOTM1PC90aXRsZT4KICAgICAgICA8L2hlYWQ+CiAgICAgICAgPG9wZW5lcj4KICAgICAgICAgIDxub3RlPgogICAgICAgICAgICA8cD5CYWQgd3JpdGluZyBkdWUgdG8gc2hha3kgdHJhaW48L3A+PHA+SW4gdHJhaW48L3A+PHA+CiAgICAgICAgICAgICAgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDMiIGNlcnQ9ImRlZmluaXRlIiByZWY9Imh0dHA6Ly93d3cuZ2VvbmFtZXMub3JnLzY0NTMzNjYiPk9zbG88L3BsYWNlTmFtZT4gdG8gQmVyZ2VuPC9wPgogICAgICAgICAgPC9ub3RlPgogICAgICAgICAgPGRhdGVsaW5lPgogICAgICAgICAgICA8ZGF0ZSBhbm5vdGF0aW9uSWQ9ImVudF82OSIgY2VydD0iZGVmaW5pdGUiIHdoZW49IjE5MzUtMTAtMjEiPjIxLjEwLjM1PC9kYXRlPgogICAgICAgICAgPC9kYXRlbGluZT4KICAgICAgICAgIDxzYWx1dGU+RGVhcmVzdCAtPC9zYWx1dGU+CiAgICAgICAgPC9vcGVuZXI+PHA+SSBoYXZlIGhhZCBubzxub3RlIGFubm90YXRpb25JZD0iZW50XzE5MCIgdHlwZT0icmVzZWFyY2hOb3RlIj4KICAgICAgICAgICAgICAgIDxwIHhtbG5zPSJodHRwOi8vd3d3LnRlaS1jLm9yZy9ucy8xLjAiPlNvbWUga2luZCBvZiBub3RlPC9wPgogICAgICAgICAgICA8L25vdGU+IGxldHRlciBmcm9tIHlvdSBzaW5jZSBJIGxlZnQgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDUiIG9mZnNldElkPSJlbnRfMTQ1IiBjZXJ0PSJkZWZpbml0ZSIgcmVmPSJodHRwOi8vd3d3Lmdlb25hbWVzLm9yZy8yNjczNzIyIj5TdG9ja2hvbG08L3BsYWNlTmFtZT4sIGJ1dCBJIGhhZCBhIG5pY2Ugb25lIGZyb20gSm9obiBpbiBhbiBlbnZlbG9wZSB5b3UgaGFkIHNlbnQgaGltLiBJIGhhZCBzZW50IGhpbSBvbmUgYWRkcmVzc2VkIHRvIENvcGVuaGFnZW4gYnV0IGhlIGhhZG4ndCB1c2VkIGl0LjwvcD48cD5XaGVuIEkgcmVhY2hlZCBPc2xvIHllc3RlcmRheSBldmVuaW5nLCBCcnluanVsZiBCdWxsIHNob3VsZCBoYXZlIGJlZW4gdGhlcmUgdG8gbWVldCBtZSwgYnV0IHdhc24ndC4gSGUgaXMgbm90IG9uIHRoZSB0ZWxlcGhvbmUsIHNvIEkgdG9vayBhIHRheGkgdG8gaGlzIGFkZHJlc3MsIHdoaWNoIHR1cm5lZCBvdXQgdG8gYmUgYSBzdHVkZW50cycgY2x1YiB3aXRoIG5vIG9uZSBhYm91dCBvbiBTdW5kYXlzLCBzbyBJIHdlbnQgdG8gYSBob3RlbCBmZWVsaW5nIHJhdGhlciBub24tcGx1c3NlZC4gQnV0IHByZXNlbnRseSBoZSB0dXJuZWQgdXAuIEhlIGhhZCBnb3QgdGhlIDxwYiBuPSIyIj48L3BiPiB0aW1lIG9mIG15IGFycml2YWwgd3JvbmcsIGFuZCAKICAgICAgICAgICAgPGNob2ljZSBhbm5vdGF0aW9uSWQ9ImVudF82NSI+PHNpYyBhbm5vdGF0aW9uSWQ9ImVudF82NSI+d2hlbjwvc2ljPjxjb3JyIGFubm90YXRpb25JZD0iZW50XzY1Ij53aGVuPC9jb3JyPjwvY2hvaWNlPgogICAgICAgICAgaGUgaGFkIGZvdW5kIGhlIGhhZCBtaXNzZWQgbWUgaGUgcGhvbmVkIHRvIGV2ZXJ5IGhvdGVsIGluIE9zbG8gdGlsbCBoZSBoaXQgb24gdGhlIHJpZ2h0IG9uZS4gSGUgbGVmdCBtZSBhdCAxMCwgYW5kIHRoZW4gSSBoYWQgdG8gZG8gYSBTdW5kYXkgUmVmZXJlZSBhcnRpY2xlLiBUb2RheSBteSBqb3VybmV5IGxhc3RzIGZyb20gOSB0aWxsIDkgLSBmb3J0dW5hdGVseSBvbmUgb2YgdGhlIG1vc3QgYmVhdXRpZnVsIHJhaWx3YXkgam91cm5leXMgaW4gdGhlIHdvcmxkLiBUb21vcnJvdyBJIGxlY3R1cmUgYXQgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDQiIGNlcnQ9ImRlZmluaXRlIiByZWY9Imh0dHA6Ly93d3cuZ2VvbmFtZXMub3JnLzY1NDg1MjgiPkJlcmdlbjwvcGxhY2VOYW1lPiB0byB0aGUgQW5nbG8tTm9yd2VnaWFuIFNvY2lldHkuIE5leHQgZGF5IEkgZ28gYmFjayB0byBPc2xvLCBsZWN0dXJlIHRoZXJlIEZyaS4gYW5kIFNhdC4gYW5kIHRoZW4gc3RhcnQgZm9yIGhvbWUgdmlhIEJlcmdlbi48L3A+CiAgICAgICAgPHBiIG49IjMiPjwvcGI+CiAgICAgICAgPHA+QnVsbCBpcyBhIG5pY2UgeW91bmcgbWFuIGJ1dCBpbmNvbXBldGVudCAtIGNhbid0IHF1aXRlIHN0YW5kIHRoZSBjb21tdW5pc3RzLCBidXQgZmluZHMgdGhlIHNvY2lhbGlzdHMgdG9vIG1pbGQuPC9wPjxwPkkgYW0gdW5oYXBwaWx5IHdvbmRlcmluZyB3aGF0IHlvdSBhcmUgZmVlbGluZyBhYm91dCBtZS48L3A+CiAgICAgICAgPGNsb3Nlcj4KICAgICAgICAgIDxzYWx1dGU+SSBsb3ZlIHlvdSB2ZXJ5IG11Y2ggLTwvc2FsdXRlPgogICAgICAgICAgPHNpZ25lZD4KICAgICAgICAgICAgPHBlcnNOYW1lIHNhbWVBcz0iaHR0cDovL3d3dy5mcmVlYmFzZS5jb20vdmlldy9lbi9iZXJ0cmFuZF9ydXNzZWxsIj4KICAgICAgICAgICAgICA8cGVyc05hbWUgYW5ub3RhdGlvbklkPSJlbnRfMTA5IiBjZXJ0PSJkZWZpbml0ZSIgdHlwZT0icmVhbCIgcmVmPSJodHRwOi8vdmlhZi5vcmcvdmlhZi8zNjkyNDEzNyI+QjwvcGVyc05hbWU+CiAgICAgICAgICAgIDwvcGVyc05hbWU+CiAgICAgICAgICA8L3NpZ25lZD4KICAgICAgICA8L2Nsb3Nlcj4KICAgICAgPC9kaXY+CiAgICA8L2JvZHk+CiAgPC90ZXh0Pgo8L1RFST4K","branch":"master"})
		.query({"access_token":config.personal_oath_for_testing})
		.reply(201, {"content":{"name":"test1.txt","path":"curt/qurt/test1.txt","sha":"9fa3ec5f93e21b52d9d7fda29dfc4b3d43932400","size":3384,"url":"https://api.github.com/repos/jchartrand/aTest/contents/curt/qurt/test1.txt?ref=master","html_url":"https://github.com/jchartrand/aTest/blob/master/curt/qurt/test1.txt","git_url":"https://api.github.com/repos/jchartrand/aTest/git/blobs/9fa3ec5f93e21b52d9d7fda29dfc4b3d43932400","download_url":"https://raw.githubusercontent.com/jchartrand/aTest/master/curt/qurt/test1.txt","type":"file","_links":{"self":"https://api.github.com/repos/jchartrand/aTest/contents/curt/qurt/test1.txt?ref=master","git":"https://api.github.com/repos/jchartrand/aTest/git/blobs/9fa3ec5f93e21b52d9d7fda29dfc4b3d43932400","html":"https://github.com/jchartrand/aTest/blob/master/curt/qurt/test1.txt"}},"commit":{"sha":"33b587b58b9577e7a7b4810e4103927809626e12","url":"https://api.github.com/repos/jchartrand/aTest/git/commits/33b587b58b9577e7a7b4810e4103927809626e12","html_url":"https://github.com/jchartrand/aTest/commit/33b587b58b9577e7a7b4810e4103927809626e12","author":{"name":"James Chartrand","email":"jc.chartrand@gmail.com","date":"2018-05-01T13:05:48Z"},"committer":{"name":"James Chartrand","email":"jc.chartrand@gmail.com","date":"2018-05-01T13:05:48Z"},"tree":{"sha":"80a38e2f60b912464a4bb14549dd1c6af1f0f46a","url":"https://api.github.com/repos/jchartrand/aTest/git/trees/80a38e2f60b912464a4bb14549dd1c6af1f0f46a"},"message":"some commit message","parents":[{"sha":"a480ac4d99c3130285e940b56700e5152969a7f9","url":"https://api.github.com/repos/jchartrand/aTest/git/commits/a480ac4d99c3130285e940b56700e5152969a7f9","html_url":"https://github.com/jchartrand/aTest/commit/a480ac4d99c3130285e940b56700e5152969a7f9"}],"verification":{"verified":false,"reason":"unsigned","signature":null,"payload":null}}}, [ 'Server',
			'GitHub.com',
			'Date',
			'Tue, 01 May 2018 13:05:48 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Content-Length',
			'1816',
			'Connection',
			'close',
			'Status',
			'201 Created',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4997',
			'X-RateLimit-Reset',
			'1525183284',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'"e64876760e52b560c8e5a7a428b3a7ae"',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.715000',
			'X-GitHub-Request-Id',
			'0E4D:27B0:54429DE:A4416A6:5AE8662B' ]);

}

function getUpdateFileNock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.put('/repos/jchartrand/aTest/contents/curt/qurt/test.txt', {"message":"another commit message on the update","content":"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPFRFSSB4bWxucz0iaHR0cDovL3d3dy50ZWktYy5vcmcvbnMvMS4wIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmN3PSJodHRwOi8vY3dyYy5jYS9ucy9jdyMiIHhtbG5zOnc9Imh0dHA6Ly9jd3JjdGMuYXJ0c3JuLnVhbGJlcnRhLmNhLyMiPgogIDx0ZWlIZWFkZXI+CiAgICA8ZmlsZURlc2M+CiAgICAgIDx0aXRsZVN0bXQ+CiAgICAgICAgPHRpdGxlPlNhbXBsZSBEb2N1bWVudCBUaXRsZSB0ZXN0IHVuZGVmaW5lZDwvdGl0bGU+CiAgICAgIDwvdGl0bGVTdG10PgogICAgICA8cHVibGljYXRpb25TdG10PgogICAgICAgIDxwPjwvcD4KICAgICAgPC9wdWJsaWNhdGlvblN0bXQ+CiAgICAgIDxzb3VyY2VEZXNjIHNhbWVBcz0iaHR0cDovL3d3dy5jd3JjLmNhIj4KICAgICAgICA8cD5DcmVhdGVkIGZyb20gb3JpZ2luYWwgcmVzZWFyY2ggYnkgbWVtYmVycyBvZiBDV1JDL0NTw4lDIHVubGVzcyBvdGhlcndpc2Ugbm90ZWQuPC9wPgogICAgICA8L3NvdXJjZURlc2M+CiAgICA8L2ZpbGVEZXNjPgogIDwvdGVpSGVhZGVyPgogIDx0ZXh0PgogICAgPGJvZHk+CiAgICAgIDxkaXYgdHlwZT0ibGV0dGVyIj4KICAgICAgICA8aGVhZD4KICAgICAgICAgIDx0aXRsZT5TYW1wbGUgTGV0dGVyIC0gQmVydHJhbmQgUnVzc2VsbCB0byA8cGVyc05hbWUgYW5ub3RhdGlvbklkPSJlbnRfNzMiIGNlcnQ9InByb2JhYmxlIiByZWY9IjI3OTM5OTM5OSI+UGF0cmljaWEgU3BlbmNlPC9wZXJzTmFtZT4gLSBPY3RvYmVyIDIxLCAxOTM1PC90aXRsZT4KICAgICAgICA8L2hlYWQ+CiAgICAgICAgPG9wZW5lcj4KICAgICAgICAgIDxub3RlPgogICAgICAgICAgICA8cD5CYWQgd3JpdGluZyBkdWUgdG8gc2hha3kgdHJhaW48L3A+PHA+SW4gdHJhaW48L3A+PHA+CiAgICAgICAgICAgICAgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDMiIGNlcnQ9ImRlZmluaXRlIiByZWY9Imh0dHA6Ly93d3cuZ2VvbmFtZXMub3JnLzY0NTMzNjYiPk9zbG88L3BsYWNlTmFtZT4gdG8gQmVyZ2VuPC9wPgogICAgICAgICAgPC9ub3RlPgogICAgICAgICAgPGRhdGVsaW5lPgogICAgICAgICAgICA8ZGF0ZSBhbm5vdGF0aW9uSWQ9ImVudF82OSIgY2VydD0iZGVmaW5pdGUiIHdoZW49IjE5MzUtMTAtMjEiPjIxLjEwLjM1PC9kYXRlPgogICAgICAgICAgPC9kYXRlbGluZT4KICAgICAgICAgIDxzYWx1dGU+RGVhcmVzdCAtPC9zYWx1dGU+CiAgICAgICAgPC9vcGVuZXI+PHA+SSBoYXZlIGhhZCBubzxub3RlIGFubm90YXRpb25JZD0iZW50XzE5MCIgdHlwZT0icmVzZWFyY2hOb3RlIj4KICAgICAgICAgICAgICAgIDxwIHhtbG5zPSJodHRwOi8vd3d3LnRlaS1jLm9yZy9ucy8xLjAiPlNvbWUga2luZCBvZiBub3RlPC9wPgogICAgICAgICAgICA8L25vdGU+IGxldHRlciBmcm9tIHlvdSBzaW5jZSBJIGxlZnQgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDUiIG9mZnNldElkPSJlbnRfMTQ1IiBjZXJ0PSJkZWZpbml0ZSIgcmVmPSJodHRwOi8vd3d3Lmdlb25hbWVzLm9yZy8yNjczNzIyIj5TdG9ja2hvbG08L3BsYWNlTmFtZT4sIGJ1dCBJIGhhZCBhIG5pY2Ugb25lIGZyb20gSm9obiBpbiBhbiBlbnZlbG9wZSB5b3UgaGFkIHNlbnQgaGltLiBJIGhhZCBzZW50IGhpbSBvbmUgYWRkcmVzc2VkIHRvIENvcGVuaGFnZW4gYnV0IGhlIGhhZG4ndCB1c2VkIGl0LjwvcD48cD5XaGVuIEkgcmVhY2hlZCBPc2xvIHllc3RlcmRheSBldmVuaW5nLCBCcnluanVsZiBCdWxsIHNob3VsZCBoYXZlIGJlZW4gdGhlcmUgdG8gbWVldCBtZSwgYnV0IHdhc24ndC4gSGUgaXMgbm90IG9uIHRoZSB0ZWxlcGhvbmUsIHNvIEkgdG9vayBhIHRheGkgdG8gaGlzIGFkZHJlc3MsIHdoaWNoIHR1cm5lZCBvdXQgdG8gYmUgYSBzdHVkZW50cycgY2x1YiB3aXRoIG5vIG9uZSBhYm91dCBvbiBTdW5kYXlzLCBzbyBJIHdlbnQgdG8gYSBob3RlbCBmZWVsaW5nIHJhdGhlciBub24tcGx1c3NlZC4gQnV0IHByZXNlbnRseSBoZSB0dXJuZWQgdXAuIEhlIGhhZCBnb3QgdGhlIDxwYiBuPSIyIj48L3BiPiB0aW1lIG9mIG15IGFycml2YWwgd3JvbmcsIGFuZCAKICAgICAgICAgICAgPGNob2ljZSBhbm5vdGF0aW9uSWQ9ImVudF82NSI+PHNpYyBhbm5vdGF0aW9uSWQ9ImVudF82NSI+d2hlbjwvc2ljPjxjb3JyIGFubm90YXRpb25JZD0iZW50XzY1Ij53aGVuPC9jb3JyPjwvY2hvaWNlPgogICAgICAgICAgaGUgaGFkIGZvdW5kIGhlIGhhZCBtaXNzZWQgbWUgaGUgcGhvbmVkIHRvIGV2ZXJ5IGhvdGVsIGluIE9zbG8gdGlsbCBoZSBoaXQgb24gdGhlIHJpZ2h0IG9uZS4gSGUgbGVmdCBtZSBhdCAxMCwgYW5kIHRoZW4gSSBoYWQgdG8gZG8gYSBTdW5kYXkgUmVmZXJlZSBhcnRpY2xlLiBUb2RheSBteSBqb3VybmV5IGxhc3RzIGZyb20gOSB0aWxsIDkgLSBmb3J0dW5hdGVseSBvbmUgb2YgdGhlIG1vc3QgYmVhdXRpZnVsIHJhaWx3YXkgam91cm5leXMgaW4gdGhlIHdvcmxkLiBUb21vcnJvdyBJIGxlY3R1cmUgYXQgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDQiIGNlcnQ9ImRlZmluaXRlIiByZWY9Imh0dHA6Ly93d3cuZ2VvbmFtZXMub3JnLzY1NDg1MjgiPkJlcmdlbjwvcGxhY2VOYW1lPiB0byB0aGUgQW5nbG8tTm9yd2VnaWFuIFNvY2lldHkuIE5leHQgZGF5IEkgZ28gYmFjayB0byBPc2xvLCBsZWN0dXJlIHRoZXJlIEZyaS4gYW5kIFNhdC4gYW5kIHRoZW4gc3RhcnQgZm9yIGhvbWUgdmlhIEJlcmdlbi48L3A+CiAgICAgICAgPHBiIG49IjMiPjwvcGI+CiAgICAgICAgPHA+QnVsbCBpcyBhIG5pY2UgeW91bmcgbWFuIGJ1dCBpbmNvbXBldGVudCAtIGNhbid0IHF1aXRlIHN0YW5kIHRoZSBjb21tdW5pc3RzLCBidXQgZmluZHMgdGhlIHNvY2lhbGlzdHMgdG9vIG1pbGQuPC9wPjxwPkkgYW0gdW5oYXBwaWx5IHdvbmRlcmluZyB3aGF0IHlvdSBhcmUgZmVlbGluZyBhYm91dCBtZS48L3A+CiAgICAgICAgPGNsb3Nlcj4KICAgICAgICAgIDxzYWx1dGU+SSBsb3ZlIHlvdSB2ZXJ5IG11Y2ggLTwvc2FsdXRlPgogICAgICAgICAgPHNpZ25lZD4KICAgICAgICAgICAgPHBlcnNOYW1lIHNhbWVBcz0iaHR0cDovL3d3dy5mcmVlYmFzZS5jb20vdmlldy9lbi9iZXJ0cmFuZF9ydXNzZWxsIj4KICAgICAgICAgICAgICA8cGVyc05hbWUgYW5ub3RhdGlvbklkPSJlbnRfMTA5IiBjZXJ0PSJkZWZpbml0ZSIgdHlwZT0icmVhbCIgcmVmPSJodHRwOi8vdmlhZi5vcmcvdmlhZi8zNjkyNDEzNyI+QjwvcGVyc05hbWU+CiAgICAgICAgICAgIDwvcGVyc05hbWU+CiAgICAgICAgICA8L3NpZ25lZD4KICAgICAgICA8L2Nsb3Nlcj4KICAgICAgPC9kaXY+CiAgICA8L2JvZHk+CiAgPC90ZXh0Pgo8L1RFST4K","branch":"master","sha":"6f715c0deeb9012272c04a50e1fc09bc3fe4bdb7"})
		.query({"access_token":config.personal_oath_for_testing})
		.reply(200, ["1f8b0800000000000003b555db8ed33010fd95cacfddfa928bed4a0824de78de27105a4d62a7c99238c576589655ff9d712f4bd922d476e12195e289cf99396766fa44ead145eb22593e110783254b126d888bf83d923959436cf1a49e7ca45fd3cf512cb48021dd4066eba2d19915bc2a84d146360684364d9d5799c9339d899c31040bdd0f84cf3295cfc9e47bbcdcc6b80e4b4a61dd2d565d6ca76a518f03f5763d067a5fb7e0a3076728dc624a749f69a0a7e9bcf5b679334088d623511b87feee778623f413dcaa1f2bbabbfc0768c4c3cb2fe0ce4b18efd1041ee8052a99f1c1f52398178c1e1ef6124dc1fabd145bb54eea","f95b29f1719d2c6ebade6261777de7be84647db07df3ff0c41212e06bf4abce4fc11d32b5cdf6ce6381ac390324779b6bdce8b4ceb526a6ce1b204551646436e0bada011463055e4595d8291a8ec35fd9d2ade51067a01d585ddbe63b88400a6d88efe68417cc03d1166ef0fe389e5da01ba24fc7dbd789eda77ab74985a143f301053df09c6d50d2b6e18bfe5d992b325931fc9b3d2697a7fada17fcf12bdc5240e6eaac6a8bc36a51285e65ae4204b2105571cfd64a6e12ccf4b55c9b4b9ae753311067a36110a81c2065825a9c08db1b57eb6f36bb60fcc4637c3e3d9b4de2a9a36b4c7ed8d33fce9505796558592f854ba90d24a9055ae38b33967991652315d8ad272f18aba0e5d7a01d5755d7a36c1e6f39c7cb3be6bba1a6237ba64f3eedd1ab26ca00f764ebc8590426472a15b398ca43fa59583387994dc4d7d9f047d4ceb77f7bad96c7e02de72b6ff22070000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Tue, 01 May 2018 13:10:08 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4996',
			'X-RateLimit-Reset',
			'1525183284',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'W/"04a0d4ce65d0cf6452d11c563ce525db"',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.702730',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'6397:27B0:544BC8B:A453FC3:5AE8672F' ]);
}

function getUserBranchHeadNock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.get('/repos/jchartrand/aTest/git/refs/heads/jchartrand')
		.query({"access_token":config.personal_oath_for_testing})
		.reply(200, ["1f8b0800000000000003a58ebd0ec2300c84df2533aa1b5afaf71cbc80e318d28ad228710754f5dd316261604062f1e0bbfbee3693f86286d7cd10187d868902264978f7e660d674533588c43c00601c8beb286175052d33248ecba71ff0cc59401d2a7de72d6e6212336c2607543297dc759ea9ac8fb66e7d4be8aaf6d4f7642be6da3648faea1aab53e41159135a3c8ff2c7b43720c3cfd5fbfe04b1ca08d426010000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 24 May 2018 19:05:31 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4999',
			'X-RateLimit-Reset',
			'1527192331',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'W/"1d95c72cb540f004ea6d427e1fcf6da5"',
			'Last-Modified',
			'Tue, 01 May 2018 13:10:09 GMT',
			'X-Poll-Interval',
			'300',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'repo',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.061844',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'82ED:3F8D:A23941:14815BF:5B070CFB' ]);

}

function getLatestFileSHANock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.post('/graphql', {"query":"{\n\t\t\trepository(owner: \"jchartrand\", name: \"aTest\") {\n\t\t\t\tobject(expression: \"jchartrand:curt/qurt/testq339.txt\") {\n\t\t\t\t\t... on Blob {\n\t\t\t\t\t\toid\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}"})
		.query({"access_token":config.personal_oath_for_testing})
		.reply(200, ["1f8b08000000000000031dc74b0e80200c00d1bbf404d8624cb94da16d821b0cb231c4bbfb99d59b092a43204de876b4b38ed6afef5adead8c5f552101bb9095d5990c97bca2b26eae82ac5e62268dc4843104b8df1e44b3d74655000000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 24 May 2018 19:05:31 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4999',
			'X-RateLimit-Reset',
			'1527192331',
			'Cache-Control',
			'no-cache',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'repo',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.081011',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'A169:3F8C:70E6F2:F7503F:5B070CFB' ]);

}

function saveExistingFileNock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.put('/repos/jchartrand/aTest/contents/curt/qurt/testq339.txt', {"message":"some commit message","sha":"9fa3ec5f93e21b52d9d7fda29dfc4b3d43932400","branch":"jchartrand","content":"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPFRFSSB4bWxucz0iaHR0cDovL3d3dy50ZWktYy5vcmcvbnMvMS4wIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmN3PSJodHRwOi8vY3dyYy5jYS9ucy9jdyMiIHhtbG5zOnc9Imh0dHA6Ly9jd3JjdGMuYXJ0c3JuLnVhbGJlcnRhLmNhLyMiPgogIDx0ZWlIZWFkZXI+CiAgICA8ZmlsZURlc2M+CiAgICAgIDx0aXRsZVN0bXQ+CiAgICAgICAgPHRpdGxlPlNhbXBsZSBEb2N1bWVudCBUaXRsZSB0ZXN0IHVuZGVmaW5lZDwvdGl0bGU+CiAgICAgIDwvdGl0bGVTdG10PgogICAgICA8cHVibGljYXRpb25TdG10PgogICAgICAgIDxwPjwvcD4KICAgICAgPC9wdWJsaWNhdGlvblN0bXQ+CiAgICAgIDxzb3VyY2VEZXNjIHNhbWVBcz0iaHR0cDovL3d3dy5jd3JjLmNhIj4KICAgICAgICA8cD5DcmVhdGVkIGZyb20gb3JpZ2luYWwgcmVzZWFyY2ggYnkgbWVtYmVycyBvZiBDV1JDL0NTw4lDIHVubGVzcyBvdGhlcndpc2Ugbm90ZWQuPC9wPgogICAgICA8L3NvdXJjZURlc2M+CiAgICA8L2ZpbGVEZXNjPgogIDwvdGVpSGVhZGVyPgogIDx0ZXh0PgogICAgPGJvZHk+CiAgICAgIDxkaXYgdHlwZT0ibGV0dGVyIj4KICAgICAgICA8aGVhZD4KICAgICAgICAgIDx0aXRsZT5TYW1wbGUgTGV0dGVyIC0gQmVydHJhbmQgUnVzc2VsbCB0byA8cGVyc05hbWUgYW5ub3RhdGlvbklkPSJlbnRfNzMiIGNlcnQ9InByb2JhYmxlIiByZWY9IjI3OTM5OTM5OSI+UGF0cmljaWEgU3BlbmNlPC9wZXJzTmFtZT4gLSBPY3RvYmVyIDIxLCAxOTM1PC90aXRsZT4KICAgICAgICA8L2hlYWQ+CiAgICAgICAgPG9wZW5lcj4KICAgICAgICAgIDxub3RlPgogICAgICAgICAgICA8cD5CYWQgd3JpdGluZyBkdWUgdG8gc2hha3kgdHJhaW48L3A+PHA+SW4gdHJhaW48L3A+PHA+CiAgICAgICAgICAgICAgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDMiIGNlcnQ9ImRlZmluaXRlIiByZWY9Imh0dHA6Ly93d3cuZ2VvbmFtZXMub3JnLzY0NTMzNjYiPk9zbG88L3BsYWNlTmFtZT4gdG8gQmVyZ2VuPC9wPgogICAgICAgICAgPC9ub3RlPgogICAgICAgICAgPGRhdGVsaW5lPgogICAgICAgICAgICA8ZGF0ZSBhbm5vdGF0aW9uSWQ9ImVudF82OSIgY2VydD0iZGVmaW5pdGUiIHdoZW49IjE5MzUtMTAtMjEiPjIxLjEwLjM1PC9kYXRlPgogICAgICAgICAgPC9kYXRlbGluZT4KICAgICAgICAgIDxzYWx1dGU+RGVhcmVzdCAtPC9zYWx1dGU+CiAgICAgICAgPC9vcGVuZXI+PHA+SSBoYXZlIGhhZCBubzxub3RlIGFubm90YXRpb25JZD0iZW50XzE5MCIgdHlwZT0icmVzZWFyY2hOb3RlIj4KICAgICAgICAgICAgICAgIDxwIHhtbG5zPSJodHRwOi8vd3d3LnRlaS1jLm9yZy9ucy8xLjAiPlNvbWUga2luZCBvZiBub3RlPC9wPgogICAgICAgICAgICA8L25vdGU+IGxldHRlciBmcm9tIHlvdSBzaW5jZSBJIGxlZnQgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDUiIG9mZnNldElkPSJlbnRfMTQ1IiBjZXJ0PSJkZWZpbml0ZSIgcmVmPSJodHRwOi8vd3d3Lmdlb25hbWVzLm9yZy8yNjczNzIyIj5TdG9ja2hvbG08L3BsYWNlTmFtZT4sIGJ1dCBJIGhhZCBhIG5pY2Ugb25lIGZyb20gSm9obiBpbiBhbiBlbnZlbG9wZSB5b3UgaGFkIHNlbnQgaGltLiBJIGhhZCBzZW50IGhpbSBvbmUgYWRkcmVzc2VkIHRvIENvcGVuaGFnZW4gYnV0IGhlIGhhZG4ndCB1c2VkIGl0LjwvcD48cD5XaGVuIEkgcmVhY2hlZCBPc2xvIHllc3RlcmRheSBldmVuaW5nLCBCcnluanVsZiBCdWxsIHNob3VsZCBoYXZlIGJlZW4gdGhlcmUgdG8gbWVldCBtZSwgYnV0IHdhc24ndC4gSGUgaXMgbm90IG9uIHRoZSB0ZWxlcGhvbmUsIHNvIEkgdG9vayBhIHRheGkgdG8gaGlzIGFkZHJlc3MsIHdoaWNoIHR1cm5lZCBvdXQgdG8gYmUgYSBzdHVkZW50cycgY2x1YiB3aXRoIG5vIG9uZSBhYm91dCBvbiBTdW5kYXlzLCBzbyBJIHdlbnQgdG8gYSBob3RlbCBmZWVsaW5nIHJhdGhlciBub24tcGx1c3NlZC4gQnV0IHByZXNlbnRseSBoZSB0dXJuZWQgdXAuIEhlIGhhZCBnb3QgdGhlIDxwYiBuPSIyIj48L3BiPiB0aW1lIG9mIG15IGFycml2YWwgd3JvbmcsIGFuZCAKICAgICAgICAgICAgPGNob2ljZSBhbm5vdGF0aW9uSWQ9ImVudF82NSI+PHNpYyBhbm5vdGF0aW9uSWQ9ImVudF82NSI+d2hlbjwvc2ljPjxjb3JyIGFubm90YXRpb25JZD0iZW50XzY1Ij53aGVuPC9jb3JyPjwvY2hvaWNlPgogICAgICAgICAgaGUgaGFkIGZvdW5kIGhlIGhhZCBtaXNzZWQgbWUgaGUgcGhvbmVkIHRvIGV2ZXJ5IGhvdGVsIGluIE9zbG8gdGlsbCBoZSBoaXQgb24gdGhlIHJpZ2h0IG9uZS4gSGUgbGVmdCBtZSBhdCAxMCwgYW5kIHRoZW4gSSBoYWQgdG8gZG8gYSBTdW5kYXkgUmVmZXJlZSBhcnRpY2xlLiBUb2RheSBteSBqb3VybmV5IGxhc3RzIGZyb20gOSB0aWxsIDkgLSBmb3J0dW5hdGVseSBvbmUgb2YgdGhlIG1vc3QgYmVhdXRpZnVsIHJhaWx3YXkgam91cm5leXMgaW4gdGhlIHdvcmxkLiBUb21vcnJvdyBJIGxlY3R1cmUgYXQgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDQiIGNlcnQ9ImRlZmluaXRlIiByZWY9Imh0dHA6Ly93d3cuZ2VvbmFtZXMub3JnLzY1NDg1MjgiPkJlcmdlbjwvcGxhY2VOYW1lPiB0byB0aGUgQW5nbG8tTm9yd2VnaWFuIFNvY2lldHkuIE5leHQgZGF5IEkgZ28gYmFjayB0byBPc2xvLCBsZWN0dXJlIHRoZXJlIEZyaS4gYW5kIFNhdC4gYW5kIHRoZW4gc3RhcnQgZm9yIGhvbWUgdmlhIEJlcmdlbi48L3A+CiAgICAgICAgPHBiIG49IjMiPjwvcGI+CiAgICAgICAgPHA+QnVsbCBpcyBhIG5pY2UgeW91bmcgbWFuIGJ1dCBpbmNvbXBldGVudCAtIGNhbid0IHF1aXRlIHN0YW5kIHRoZSBjb21tdW5pc3RzLCBidXQgZmluZHMgdGhlIHNvY2lhbGlzdHMgdG9vIG1pbGQuPC9wPjxwPkkgYW0gdW5oYXBwaWx5IHdvbmRlcmluZyB3aGF0IHlvdSBhcmUgZmVlbGluZyBhYm91dCBtZS48L3A+CiAgICAgICAgPGNsb3Nlcj4KICAgICAgICAgIDxzYWx1dGU+SSBsb3ZlIHlvdSB2ZXJ5IG11Y2ggLTwvc2FsdXRlPgogICAgICAgICAgPHNpZ25lZD4KICAgICAgICAgICAgPHBlcnNOYW1lIHNhbWVBcz0iaHR0cDovL3d3dy5mcmVlYmFzZS5jb20vdmlldy9lbi9iZXJ0cmFuZF9ydXNzZWxsIj4KICAgICAgICAgICAgICA8cGVyc05hbWUgYW5ub3RhdGlvbklkPSJlbnRfMTA5IiBjZXJ0PSJkZWZpbml0ZSIgdHlwZT0icmVhbCIgcmVmPSJodHRwOi8vdmlhZi5vcmcvdmlhZi8zNjkyNDEzNyI+QjwvcGVyc05hbWU+CiAgICAgICAgICAgIDwvcGVyc05hbWU+CiAgICAgICAgICA8L3NpZ25lZD4KICAgICAgICA8L2Nsb3Nlcj4KICAgICAgPC9kaXY+CiAgICA8L2JvZHk+CiAgPC90ZXh0Pgo8L1RFST4K"})
		.query({"access_token":config.personal_oath_for_testing})
		.reply(200, ["1f8b0800000000000003b595c96edb3010865fc5e0d9b1b848a664a06881de7acea945118cc891a5548b43524dd340efde611c27ae9302b6d35c247028cec7f967d13d33431fb00f6c75cf7ae890ad58401f6e942a16e1576073b6815093d58c2e2437f171b0ef6ba0eda2028526ab0a85529499b485d5950559d8caa4a5b2a92a944c392787bef94d18a5f274ce46d7d2e13a848d5f25096c9ac5ba09f5582eccd0250e37834fae4d0d2e38e86d029774b5e4f1c63e79fd4a1f1d561f9e0f11b00e5d7bf537698ff2c27fd90ee53ef5750cf92527076e8f0b80ce2511e2931354b3c36ddf0e600f880e6e1f251b3dba47691ed47b11","d79ee19f2185bb4d2c81aa699102bc6a9bfe878fa5e1b1adde3f5124ccc990b3c48c15b147fa0fd5304d736aa5ae8b11905c0f3db1c4aa5a1a0d0600554aaf54716da4d2a9e02615202de8b2d08a943ea70f62e45ba44f4e409dd80d5bc2290018433db8bd81f285e68a9f7ddeb531858b1d343101d766f1d4dd9fd6d1184b973eb010621d4a2ef20b9e5dc8f452142b9ead94f8ca9e940ef8be94e0902eb1cb269702017525b9d152e572292d37987110798965914b2d910b6ddf90cd08f4c9d120128284f5b08e52f9a1c3d93659b39d350e6f47c39d5af8db2e0ce498e7160d4fa548b5d5064aa5b3a2304221a66209864cf952bc218c5d519e803aaf288f064cdfe7ec27baa66a0c8466e86356b76bb46c5541eb71ce1c828f5b6cec7db3ee6927feabd63d84d191c2fdd8b651d0bb3885b7cb699afe009381c29f41070000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 24 May 2018 19:05:32 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4998',
			'X-RateLimit-Reset',
			'1527192331',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'W/"a4decab1ba27b76f281b656d4b781829"',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.727300',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'99B6:3F8D:A23987:1481661:5B070CFB' ]);

}

function findExistingPRNock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.get('/search/issues')
		.query({"access_token":config.personal_oath_for_testing,"q":"state%3Aopen%20type%3Apr%20repo%3Ajchartrand%2FaTest%20head%3Ajchartrand"})
		.reply(200, ["1f8b0800000000000003a595516fd33010c7bf4ae5e7ae4edaa69b22219e7805848a904053e426d7c4e0d8c13e772a51bf3b6737ebb61601cd9ea224f7fff97cbefbbb676850a8a2345e23cbd32993ba346da700a1b0e0bc42c7f2ad500ee817424b6fdf7ae6ad62396b103b97732e3a39ab25367e33232db7d019c7bf978db06885aeb85883432e9df3e0f89c4d598c9068ecbe18412280121b506e8cf894063f327aae450b076252ea2d687c25f5914240d8bd1e776410acc1569dedf759c92f8add79a562a965c5f2c57cbe4856e9dd72cab46f3760593e9f3294a8804eb156c64ae3dd247e986c8d9d7cfc444aef4260cf94a9a5a6b8a735066cb6bc4d57d994899d4061cf0f237e748ba13102ac341aa922b1473c3faadfeede2c0957db0112d26561f1bf3558803d6fb02bca43a15ba3947920c279c62fbbf87c117ed29d1852d7a318a4ebb9c106a868b495d07cb574ffeabc8b84a2a6e7e151c82a501c95dc42756552838a527ad0944d1f0738","e2fcc6955676288dbeb65a2fb4c432b6165afe126358a4758488ae71e5dea286b4ff338b17053e8a7ade59b913e53e94c442097247251e053c53130ff75d98c1cf61d6a8e0e4b085a8da306fd1730f8f5647ae7b1fcf1743b8e94053b832e50fa08119ec5938276b0d14a069fa692e87f760d9246ea5221b36faf4ff64557942ee6781d85521e81660f324bdbb49b29b345da78b3ccbf2e5f22bade7bbea0f31ab757a9b2f577992859852193760862c3c36c616948c29653c7e5ae0c397f7ef82c7049ba26be6275d0cb4eeb87b25308ed7ca588face4767bb5b7ce822a6c4160d95caf8e3246e7bb31d59e2ae24c0b93702212272d38276a080d511a4be795ce92c3fde137a58274c9ac070000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 24 May 2018 19:05:32 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'30',
			'X-RateLimit-Remaining',
			'29',
			'X-RateLimit-Reset',
			'1527188792',
			'Cache-Control',
			'no-cache',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.095574',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'A7C3:3F8E:C51CD5:17ED234:5B070CFC' ]);

}

function saveNewFileNock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.put('/repos/jchartrand/aTest/contents/curt/qurt/testuufy.txt', {"message":"some commit message","branch":"jchartrand","content":"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPFRFSSB4bWxucz0iaHR0cDovL3d3dy50ZWktYy5vcmcvbnMvMS4wIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmN3PSJodHRwOi8vY3dyYy5jYS9ucy9jdyMiIHhtbG5zOnc9Imh0dHA6Ly9jd3JjdGMuYXJ0c3JuLnVhbGJlcnRhLmNhLyMiPgogIDx0ZWlIZWFkZXI+CiAgICA8ZmlsZURlc2M+CiAgICAgIDx0aXRsZVN0bXQ+CiAgICAgICAgPHRpdGxlPlNhbXBsZSBEb2N1bWVudCBUaXRsZSB0ZXN0IHVuZGVmaW5lZDwvdGl0bGU+CiAgICAgIDwvdGl0bGVTdG10PgogICAgICA8cHVibGljYXRpb25TdG10PgogICAgICAgIDxwPjwvcD4KICAgICAgPC9wdWJsaWNhdGlvblN0bXQ+CiAgICAgIDxzb3VyY2VEZXNjIHNhbWVBcz0iaHR0cDovL3d3dy5jd3JjLmNhIj4KICAgICAgICA8cD5DcmVhdGVkIGZyb20gb3JpZ2luYWwgcmVzZWFyY2ggYnkgbWVtYmVycyBvZiBDV1JDL0NTw4lDIHVubGVzcyBvdGhlcndpc2Ugbm90ZWQuPC9wPgogICAgICA8L3NvdXJjZURlc2M+CiAgICA8L2ZpbGVEZXNjPgogIDwvdGVpSGVhZGVyPgogIDx0ZXh0PgogICAgPGJvZHk+CiAgICAgIDxkaXYgdHlwZT0ibGV0dGVyIj4KICAgICAgICA8aGVhZD4KICAgICAgICAgIDx0aXRsZT5TYW1wbGUgTGV0dGVyIC0gQmVydHJhbmQgUnVzc2VsbCB0byA8cGVyc05hbWUgYW5ub3RhdGlvbklkPSJlbnRfNzMiIGNlcnQ9InByb2JhYmxlIiByZWY9IjI3OTM5OTM5OSI+UGF0cmljaWEgU3BlbmNlPC9wZXJzTmFtZT4gLSBPY3RvYmVyIDIxLCAxOTM1PC90aXRsZT4KICAgICAgICA8L2hlYWQ+CiAgICAgICAgPG9wZW5lcj4KICAgICAgICAgIDxub3RlPgogICAgICAgICAgICA8cD5CYWQgd3JpdGluZyBkdWUgdG8gc2hha3kgdHJhaW48L3A+PHA+SW4gdHJhaW48L3A+PHA+CiAgICAgICAgICAgICAgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDMiIGNlcnQ9ImRlZmluaXRlIiByZWY9Imh0dHA6Ly93d3cuZ2VvbmFtZXMub3JnLzY0NTMzNjYiPk9zbG88L3BsYWNlTmFtZT4gdG8gQmVyZ2VuPC9wPgogICAgICAgICAgPC9ub3RlPgogICAgICAgICAgPGRhdGVsaW5lPgogICAgICAgICAgICA8ZGF0ZSBhbm5vdGF0aW9uSWQ9ImVudF82OSIgY2VydD0iZGVmaW5pdGUiIHdoZW49IjE5MzUtMTAtMjEiPjIxLjEwLjM1PC9kYXRlPgogICAgICAgICAgPC9kYXRlbGluZT4KICAgICAgICAgIDxzYWx1dGU+RGVhcmVzdCAtPC9zYWx1dGU+CiAgICAgICAgPC9vcGVuZXI+PHA+SSBoYXZlIGhhZCBubzxub3RlIGFubm90YXRpb25JZD0iZW50XzE5MCIgdHlwZT0icmVzZWFyY2hOb3RlIj4KICAgICAgICAgICAgICAgIDxwIHhtbG5zPSJodHRwOi8vd3d3LnRlaS1jLm9yZy9ucy8xLjAiPlNvbWUga2luZCBvZiBub3RlPC9wPgogICAgICAgICAgICA8L25vdGU+IGxldHRlciBmcm9tIHlvdSBzaW5jZSBJIGxlZnQgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDUiIG9mZnNldElkPSJlbnRfMTQ1IiBjZXJ0PSJkZWZpbml0ZSIgcmVmPSJodHRwOi8vd3d3Lmdlb25hbWVzLm9yZy8yNjczNzIyIj5TdG9ja2hvbG08L3BsYWNlTmFtZT4sIGJ1dCBJIGhhZCBhIG5pY2Ugb25lIGZyb20gSm9obiBpbiBhbiBlbnZlbG9wZSB5b3UgaGFkIHNlbnQgaGltLiBJIGhhZCBzZW50IGhpbSBvbmUgYWRkcmVzc2VkIHRvIENvcGVuaGFnZW4gYnV0IGhlIGhhZG4ndCB1c2VkIGl0LjwvcD48cD5XaGVuIEkgcmVhY2hlZCBPc2xvIHllc3RlcmRheSBldmVuaW5nLCBCcnluanVsZiBCdWxsIHNob3VsZCBoYXZlIGJlZW4gdGhlcmUgdG8gbWVldCBtZSwgYnV0IHdhc24ndC4gSGUgaXMgbm90IG9uIHRoZSB0ZWxlcGhvbmUsIHNvIEkgdG9vayBhIHRheGkgdG8gaGlzIGFkZHJlc3MsIHdoaWNoIHR1cm5lZCBvdXQgdG8gYmUgYSBzdHVkZW50cycgY2x1YiB3aXRoIG5vIG9uZSBhYm91dCBvbiBTdW5kYXlzLCBzbyBJIHdlbnQgdG8gYSBob3RlbCBmZWVsaW5nIHJhdGhlciBub24tcGx1c3NlZC4gQnV0IHByZXNlbnRseSBoZSB0dXJuZWQgdXAuIEhlIGhhZCBnb3QgdGhlIDxwYiBuPSIyIj48L3BiPiB0aW1lIG9mIG15IGFycml2YWwgd3JvbmcsIGFuZCAKICAgICAgICAgICAgPGNob2ljZSBhbm5vdGF0aW9uSWQ9ImVudF82NSI+PHNpYyBhbm5vdGF0aW9uSWQ9ImVudF82NSI+d2hlbjwvc2ljPjxjb3JyIGFubm90YXRpb25JZD0iZW50XzY1Ij53aGVuPC9jb3JyPjwvY2hvaWNlPgogICAgICAgICAgaGUgaGFkIGZvdW5kIGhlIGhhZCBtaXNzZWQgbWUgaGUgcGhvbmVkIHRvIGV2ZXJ5IGhvdGVsIGluIE9zbG8gdGlsbCBoZSBoaXQgb24gdGhlIHJpZ2h0IG9uZS4gSGUgbGVmdCBtZSBhdCAxMCwgYW5kIHRoZW4gSSBoYWQgdG8gZG8gYSBTdW5kYXkgUmVmZXJlZSBhcnRpY2xlLiBUb2RheSBteSBqb3VybmV5IGxhc3RzIGZyb20gOSB0aWxsIDkgLSBmb3J0dW5hdGVseSBvbmUgb2YgdGhlIG1vc3QgYmVhdXRpZnVsIHJhaWx3YXkgam91cm5leXMgaW4gdGhlIHdvcmxkLiBUb21vcnJvdyBJIGxlY3R1cmUgYXQgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDQiIGNlcnQ9ImRlZmluaXRlIiByZWY9Imh0dHA6Ly93d3cuZ2VvbmFtZXMub3JnLzY1NDg1MjgiPkJlcmdlbjwvcGxhY2VOYW1lPiB0byB0aGUgQW5nbG8tTm9yd2VnaWFuIFNvY2lldHkuIE5leHQgZGF5IEkgZ28gYmFjayB0byBPc2xvLCBsZWN0dXJlIHRoZXJlIEZyaS4gYW5kIFNhdC4gYW5kIHRoZW4gc3RhcnQgZm9yIGhvbWUgdmlhIEJlcmdlbi48L3A+CiAgICAgICAgPHBiIG49IjMiPjwvcGI+CiAgICAgICAgPHA+QnVsbCBpcyBhIG5pY2UgeW91bmcgbWFuIGJ1dCBpbmNvbXBldGVudCAtIGNhbid0IHF1aXRlIHN0YW5kIHRoZSBjb21tdW5pc3RzLCBidXQgZmluZHMgdGhlIHNvY2lhbGlzdHMgdG9vIG1pbGQuPC9wPjxwPkkgYW0gdW5oYXBwaWx5IHdvbmRlcmluZyB3aGF0IHlvdSBhcmUgZmVlbGluZyBhYm91dCBtZS48L3A+CiAgICAgICAgPGNsb3Nlcj4KICAgICAgICAgIDxzYWx1dGU+SSBsb3ZlIHlvdSB2ZXJ5IG11Y2ggLTwvc2FsdXRlPgogICAgICAgICAgPHNpZ25lZD4KICAgICAgICAgICAgPHBlcnNOYW1lIHNhbWVBcz0iaHR0cDovL3d3dy5mcmVlYmFzZS5jb20vdmlldy9lbi9iZXJ0cmFuZF9ydXNzZWxsIj4KICAgICAgICAgICAgICA8cGVyc05hbWUgYW5ub3RhdGlvbklkPSJlbnRfMTA5IiBjZXJ0PSJkZWZpbml0ZSIgdHlwZT0icmVhbCIgcmVmPSJodHRwOi8vdmlhZi5vcmcvdmlhZi8zNjkyNDEzNyI+QjwvcGVyc05hbWU+CiAgICAgICAgICAgIDwvcGVyc05hbWU+CiAgICAgICAgICA8L3NpZ25lZD4KICAgICAgICA8L2Nsb3Nlcj4KICAgICAgPC9kaXY+CiAgICA8L2JvZHk+CiAgPC90ZXh0Pgo8L1RFST4K"})
		.query({"access_token":config.personal_oath_for_testing})
		.reply(201, {"content":{"name":"testufy.txt","path":"curt/qurt/testufy.txt","sha":"9fa3ec5f93e21b52d9d7fda29dfc4b3d43932400","size":3384,"url":"https://api.github.com/repos/jchartrand/aTest/contents/curt/qurt/testufy.txt?ref=jchartrand","html_url":"https://github.com/jchartrand/aTest/blob/jchartrand/curt/qurt/testufy.txt","git_url":"https://api.github.com/repos/jchartrand/aTest/git/blobs/9fa3ec5f93e21b52d9d7fda29dfc4b3d43932400","download_url":"https://raw.githubusercontent.com/jchartrand/aTest/jchartrand/curt/qurt/testufy.txt","type":"file","_links":{"self":"https://api.github.com/repos/jchartrand/aTest/contents/curt/qurt/testufy.txt?ref=jchartrand","git":"https://api.github.com/repos/jchartrand/aTest/git/blobs/9fa3ec5f93e21b52d9d7fda29dfc4b3d43932400","html":"https://github.com/jchartrand/aTest/blob/jchartrand/curt/qurt/testufy.txt"}},"commit":{"sha":"5f98b10ff8b7841081445b0004d71e3660fc5d19","url":"https://api.github.com/repos/jchartrand/aTest/git/commits/5f98b10ff8b7841081445b0004d71e3660fc5d19","html_url":"https://github.com/jchartrand/aTest/commit/5f98b10ff8b7841081445b0004d71e3660fc5d19","author":{"name":"James Chartrand","email":"jc.chartrand@gmail.com","date":"2018-05-24T19:05:33Z"},"committer":{"name":"James Chartrand","email":"jc.chartrand@gmail.com","date":"2018-05-24T19:05:33Z"},"tree":{"sha":"2334e036dfee384e8d445fc1cf87dd8dab9d2aff","url":"https://api.github.com/repos/jchartrand/aTest/git/trees/2334e036dfee384e8d445fc1cf87dd8dab9d2aff"},"message":"some commit message","parents":[{"sha":"6eff6c7acaae34aca4307c237410c41a2da7b973","url":"https://api.github.com/repos/jchartrand/aTest/git/commits/6eff6c7acaae34aca4307c237410c41a2da7b973","html_url":"https://github.com/jchartrand/aTest/commit/6eff6c7acaae34aca4307c237410c41a2da7b973"}],"verification":{"verified":false,"reason":"unsigned","signature":null,"payload":null}}}, [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 24 May 2018 19:05:34 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Content-Length',
			'1850',
			'Connection',
			'close',
			'Status',
			'201 Created',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4996',
			'X-RateLimit-Reset',
			'1527192331',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'"553b9477c201db8225eb545d8dc1b6f5"',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.698888',
			'X-GitHub-Request-Id',
			'A795:3F8E:C51D41:17ED2F2:5B070CFD' ]);

}

function getLatestFileSHANockForNew() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.post('/graphql', {"query":"{\n\t\t\trepository(owner: \"jchartrand\", name: \"aTest\") {\n\t\t\t\tobject(expression: \"jchartrand:curt/qurt/testuufy.txt\") {\n\t\t\t\t\t... on Blob {\n\t\t\t\t\t\toid\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}"})
		.query({"access_token":config.personal_oath_for_testing})
		.reply(200, ["1f8b0800000000000003ab564a492c4954b2aa562a4a2dc82fce2cc92faa04f1f293b252934b94acf24a73726a6b6b019ac688b327000000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 24 May 2018 19:23:25 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4996',
			'X-RateLimit-Reset',
			'1527192331',
			'Cache-Control',
			'no-cache',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'repo',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.059255',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'8872:3F8E:C7892E:183A3EF:5B07112D' ]);

}

function missingSHANock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.post('/graphql', {"query":"{\n\t\t\trepository(owner: \"jchartrand\", name: \"aTest\") {\n\t\t\t\tobject(expression: \"master:curt/qurt/tesddt.txt\") {\n\t\t\t\t\t... on Blob {\n\t\t\t\t\t\toid\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}"})
		.query({"access_token":config.personal_oath_for_testing})
		.reply(200, ["1f8b0800000000000003ab564a492c4954b2aa562a4a2dc82fce2cc92faa04f1f293b252934b94acf24a73726a6b6b019ac688b327000000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 24 May 2018 19:31:17 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4994',
			'X-RateLimit-Reset',
			'1527192331',
			'Cache-Control',
			'no-cache',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'repo',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.064002',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'8198:3F8B:541F42:BD5AC4:5B071305' ]);
}

function missingBranchNock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.get('/repos/jchartrand/aTest/git/refs/heads/hote')
		.query({"access_token":config.personal_oath_for_testing})
		.reply(404, ["1f8b08000000000000030dc9310e80201005d1ab98b555b7b0f300965ec1207cd14458038b8df1eed2cdcbbc1490b3f1a08916d16696121d75e4c49680a8464f896b4957fd87ea9d2766870797dc48833ff528db6025f033721527ec995b0fed4d5f1b09d182be1f2ef525fe67000000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 24 May 2018 19:36:46 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'404 Not Found',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4988',
			'X-RateLimit-Reset',
			'1527192331',
			'X-Poll-Interval',
			'300',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'repo',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.038495',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'B458:3F8C:7397D6:FD2598:5B07144E' ]);

}

function missingPRNock() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.get('/search/issues')
		.query({"access_token":config.personal_oath_for_testing,"q":"state%3Aopen%20type%3Apr%20repo%3Ajchartrand%2FaTest%20head%3Ahote"})
		.reply(200, ["1f8b0800000000000003ab562ac92f49cc894fce2fcd2b51b232d051cacc4bcecf2dc8492d498d2f4a2d2ecd292956b24a4bcc294e054a95a4e60279d1b1b500c845f5b737000000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 24 May 2018 19:39:48 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'30',
			'X-RateLimit-Remaining',
			'28',
			'X-RateLimit-Reset',
			'1527190847',
			'Cache-Control',
			'no-cache',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.068931',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'A184:3F8C:73D486:FDABA9:5B071503' ]);

}

function createBranchFromMasterGetMaster() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.get('/repos/jchartrand/aTest/branches/master')
		.query({"access_token":config.personal_oath_for_testing})
		.reply(200, ["1f8b0800000000000003ed574b6fdb300cfe2b81ce69fd7e05183660b79dbbcb86c2906dd956e7489e24a7eb82fcf7918af372b12e0eb05b0f011249fcf8f11329325b22e89a911559536d98224b52caf59a1bb2da12dd52d8f0a220cbe2240b82348e691a47554643166529adfdca77d3280cca9856c985291d4c2b15828cf05fc08b5e7c6ea9328a8a0a0eb335e51de03f95f7e561f953838bf740010e54d42031dff5d23b37ba73bd072f5879eeca4dbe91dd812772fe9f5e80b5a60df2a0429a96a9c55e9fc5b8b1906201cb8ba1b77497c42806a70fe2a57595866515a77e9479991fd224f613df4b3d90cfad6acf0dc3382d12","170c07856ab4c6f47ae538b4e7f70d37ed50a01a8e62bdd4ced35128873e306d1c38e1a043ed5ced0894bbd5d33e72edcccc08264c5eca41404eb94bb2618ad7bca4864b813aed7fb38aac6ada69b6248a518d5b64109a3702769604bf50332850560c5db7243d7de9240523fcb9bb31a61be269cdbacb2ff53bbba557f7b3f77083607ae2e4ba74981b908306703d1a243e556c271b8efa9fa2816d0e5a4761e2c5111cdd5043d594a15dd4c198b58366aa94c200ba4de0c1d95b7fdc7c0801ae512308e2927f653f829d673f9cbff622e0682dbb4e3e03c294f165894d9d3847bb230617cd4d1860b775eceb91a3971d0ac0b5994bc8da6ca1e8b5c97985281a2457ac9a496ab4024acf02d86cedeb62e18642978af7589b73c95dd80296540d15fcb7adf3b958608b29691fbd99b1591bb0651bcceb99c67ba3add32bbea1e50b4aa258c9f80624be0970620d78e6a5c766f215d20005e786e5b45a63bdd9e76fdad7de6bd18e0befb5f8d670f0eae57aaf456838939e018fdc45255f558b3d55b63daebe1f06ba2028a234814f914549c2129a1461eab92cf4dc20f393d4cd623f669e0ff0b78c59870e3ec3cdb59d701c19c791e46a07bb477893f28e8b1f2003a8c0ba7af6985a400d972d4ca9c73f1948fa0ce6ad190ae7db832150e99534ac346703e3b832ce934cd0a2bb18277f0e1c7b24743d33e81c7894fb5098a8a52a190e407907cf3b1292750d376707975ff6de1f71b83c7978bba1fc654a9f840fedc5868084777f0066a2855f800d0000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 24 May 2018 19:44:14 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4985',
			'X-RateLimit-Reset',
			'1527192331',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'W/"be141d5c7dbe3dfd04b6969cedf909d6"',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.049013',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'91A2:3F8D:A69BE4:1511554:5B07160E' ]);


}

function createBranchFromMasterCreateBranch() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.post('/repos/jchartrand/aTest/git/refs', {"ref":"refs/heads/test83","sha":"1539967933866a865d9a4e598af2d208543c6ad7"})
		.query({"access_token":config.personal_oath_for_testing})
		.reply(201, {"ref":"refs/heads/test83","url":"https://api.github.com/repos/jchartrand/aTest/git/refs/heads/test83","object":{"sha":"1539967933866a865d9a4e598af2d208543c6ad7","type":"commit","url":"https://api.github.com/repos/jchartrand/aTest/git/commits/1539967933866a865d9a4e598af2d208543c6ad7"}}, [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 24 May 2018 19:44:14 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Content-Length',
			'286',
			'Connection',
			'close',
			'Status',
			'201 Created',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4984',
			'X-RateLimit-Reset',
			'1527192331',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'"d4dfcc17c00adfebe886cd3e64f53a5a"',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'repo',
			'Location',
			'https://api.github.com/repos/jchartrand/aTest/git/refs/heads/test83',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.499281',
			'X-GitHub-Request-Id',
			'97CE:3F8E:CA4EA4:1892D34:5B07160E' ]);

}

function getDoc() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.get('/repos/jchartrand/aTest/contents/curt/qurt/test.txt')
		.query({"access_token":config.personal_oath_for_testing,"ref":"jchartrand"})
		.reply(200, ["1f8b0800000000000003b5586993aa5812fd2ff5b53a5eb1484ff1222626c405f129a5a220444574b0586c17b44b40b1a3fffb9c04b5ace54d74cfc47cf02d70efcdcc93274fe6e58fbbdccd3677dfef8acdbef8561c8bbb5fee766e11e1895fbe160fbfd31f37eff6918b57f28b2b6e7ce945163702ef49422007ff78095c410e5efc8e27061d5116850ec7e1b07d7cc2f1a2f8d8f9e5ae7c65d81c15c56efffde1c1ddc5dfc2b8884aef9bbfcd1e5e37bbedfe21f123f7b57875f3e0c15dc2","a5077f9b179bbcd83f7c76e75faf9b977fbe6d80b1a8c8d86fefaddc58f874b6c7b6deadc5cf2670260ef870e45f731cfb1ec8c0fee16fa0156c0f39dbbac1078bafeee10c55b9dfbc9e216950fb14d3cd832fc329ea1da5fb25661b04773e0a0f667db9e3598730c8ccda1758e5255c3c353a072d569897e995a3b2d23971b1692ed4c9328c67a7ce8fd97031340ca5f39c7bd6b1f4f1d61d2d38bfbfad26622006b5c439565ad8b554f9995f79f9b43a9f084bb47e573baa2d3fe75a1671c1a8fbeba496b1cf2f83d3b4f4c4713e390da4a7655a4dfb5a354db4c2cf16d964ad4b5ebe88363dbef4eb698cdda3a8f054e9f494e9e2cc186f83d1e2f0143f56363c80edc43664ac949300abaf6b735f26abcff9d96e1288e32450a7a5bd1e73be382e27b91979ea98f9b035c9f46882ddb3701b6afd23a2629a630dd3e7dc596bf7bdb81b6abdeea393b1bdb35a305f985e9e35abddf562ef983ae7ade76fcf7bddf0399f8d16bb403db219d3236fadec1d43197882ce7b9659063d65d5ec3414ce59eb9c36324b473533d79298d33f54f05c659ca7ae6e6c1daaf699b90c549e6bbc851df2cd1f99b1a7b2c45e2f769e202d69f7bb15e4e961961c2abfdff971de15ce7af221b0c67bd7d2239c5c79ac8de2393fc74cbb4e9e68d6b6600ee065a28d1089652a5f70a141989044c692371b8d777da9ef67266c98a9a63ab5277021f2bf730456dae024de9d8037ac8440cdced310360a9b985a2b95132b7d931ff7279cbe3c74589f90f254f344ef02354206839d2fac422f93916fc79a9714d72d3a1351af82f538f990bdc789e0ec70521319ad87e7401e5eee0cd58c908dfaca887574c57ba68e2b6794de722075d7367607237670961c32617238a5fe88834ba7dee0dfe4e1cc2078be9496b6c51f90f3707939a1c78573e0108cc69197cdc3558eb80573eff514ceab812cacf89c04cc3d6b15da9684ba5ab4b94c598a6a61a8a517fd84ca5075203597b55c01fee3c8ce8e0cb55f3b5653a189263e2da7a846fc0ced7ea50e393f63896b0dc295d8280423549df5f8b4cc8685b3ec84134399d9e2024ca54c697ded38e9758f3881c7cab62a96ef79301122665b9faa44c5b960bdff9e35840c45c36e32f9c6f7bed4c34984397804ee964eada4013008d4c7d017a2c815d3905073adcee344ecdecf46dd7bc3eabc7b4615da7d57b3d7ca18297bdbd25913aba1007b09bc1872ae259786051433b384ede1e351efdf609b2d1854a2445d5fb1fda87d8e60561e4e256db9a8a00d664f4f7a62c7b3543e79ea233cbeb10fac292ae2017637ec86e76fd5dfa082a75fa23553890f266a5cba22897cb7bad1ea1ae2fa598c8850001f42d47f1df4b99814ea39c759c07c05b50db68ed591b564204d4fab62baec16d36410cf127021191c2649c38514aaf485edcb1be856093e5d55e95c1527db3af2b072bf40d5904204bd2e50c3aeeb9bab4ab5f157a8869214bbc9b5a16cedb5c334358a9c9e527aa72332467cd2d461495a71d6cab143715912b746379af63430a4ade237558a9e68df275dbbb0b1d1d64be7b9ed50e891e2245f30d7e093e77c92c9b55353af7a043add185da1a2aa75a182f09074aecde07bf56aac3419835e110b57f71a7a0aba20f36325f333b9d046ac0a0ce584bc24c8e498de3bf93c9c9d59fc9cff271eb72c4636553973729d058337e5982ee73c6cc74a82cae7105bea58d0cc8c81311ae976f629de2c60e840d4254e1431785e3fd67ae29ff493064594d0bbe4c415a2ca53b98f3cdf6bea98476744044dd6a897a8d2ce2675172464aeed1d46266fbd58d9e117e1078d7398472a6228922702517598a25321631e507055564ce2eb99e8341287f3779ea1a01249351729e51aba8a5d8b4a1be80d93c07375887ed209","eddca41d2d97d44e0e0ff966353af4a4eda9d4e3d6d0f7521ba4840b3cb7a1768861e60bc70a19623e38840927da180ac31456225bf9a4a7f4fc1c8a919b7be4bf1758c73d3cdf1253f1a477e1f098911f4db783c7a406c097c10fa8d3a1f56f1444be40be75c016033dc45d4f9b9e88bc96886bdb4c1ad691f92ab0cf566407b1422555b9726b25c29a68a3a6a4a9381fa89d5029a933c28c244eb13ad8624ed86215ef679851c0d8603d6f7cb10945f02f18993433015fbff6a11947de8e15116ab845162bf28374c6ce64ca7185cc2d034b823ab013703879b53246be47e00fb2d69c8b1aa6ca43b7cb1cabd130bc1f43cf8003558bd0297cf5c8fba20e7f28ee39656a84aeb6d6a9f3ed81751337ba7f89c9200cd65d64e89cc99e0294c912fe8f0a46c670e6cc209652cf50e259ac40f179e45dce34959780478dae28d0cc82be03147d307688eaedfe78a7a9ad22abfad6131855e497fd83b45547af9d8df41d6c23035f7599cbaa006cf2886b3871961c13cc4ff545c9b0bb9dfb6eb4cce6516b2231128ad9aca6e90f9cac90c5773db5f5dc25c650dda84e4559b9f21d1c73d73aaa660eced19a55d832a8ad16aa5053803a009d88662720c28071d3c7802da3598572b075c11664acc57b44d31fcde72d2b3a2131167353d6725a89a0f6c7690fdc265f88bde07fa3e994459cece087b88d0b87d2700535821f8cf0c6540fd53832d4fdca139a9a2bf0fb9d66592f33e1eb11158a8a04c75b4d79024b5caabe7e4a934d06c438e0d0f44eec6c94c213ecd67b95c7d4e3833b987ca200d83ba85f62264e10ed751abae03855c906358809e41c73807bd231259f50df025ff9f9b80ac07ad26b4c52d8813a024a17ddfe996a0335e847abdbf3b7c9ee2f4e1fb04d53cddbf4c1ebfd909f26b8f3a5a875d26fe2191042d77fc244caa80e509d1ce51e35862a446e8b25d43d104c4c03c3521beae01643574a917bc43d9a23434389f4c511482186093406f9c6398d22a2e2f78ea55365b226bff4f7c0a95d037a4b391fe24e829abecd7f9331e41667c336f18d1819642cd20667cfe376da7b37198c1460d469a65cdcf19ad8aeb7bab652312f403988a93bdc2aa24bcfd958328f1a07ef87e806e7de84ee87bebd8686a3b66826c1648d2e144077867c33f98d74eeeab5a124c834e6167069477c43dc31e926cd89ce687a6646831eeea30c1a4acf64a8258fbb497b97c1d493e0f696a640830b7112261be500ae49504b3093fa4a3301a3de87f0a399063033ad60c5a42ed8cec717e545cff8022555df7bd0d18f5338e2c61df0328ba102b10a53556be35cf73c4f37b7c992d469b8473d7c35ed41e51cf4f04ff71f9add460aee267ac3b5db1b263af0fbef0d98764c062e9d1c4302ae5c85dcb3a0969917cb314d287e06351e8297502cea44a8e78fb78acb8df97c73fad9bd896687c50b265ae967d3cfcd9c1879981b6fa7a1e79cbe5010339db8fd3ad2fefb11537e5aebfdc149afb5fb79c3c5f606073fae37919b5e82fbe8572bcef33bbad467549bdd98153fe793266edc54af5f3426c2db4d96ee6c0e6eb9cdcde271c2e3cb0f66f2e71c1f9136b9bf0de23cc45724cfdd6f7eede0d96f2cced3fdddf73feef61bf6f2fffdea872f6d7fdbc07ff5758e3e2fde58fa1f3f2dfef9e7bf016a96151c7d150000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 24 May 2018 20:01:34 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4983',
			'X-RateLimit-Reset',
			'1527192331',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'W/"9fa3ec5f93e21b52d9d7fda29dfc4b3d43932400"',
			'Last-Modified',
			'Thu, 24 May 2018 19:23:25 GMT',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.062517',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'8B13:3F8D:A8DD55:1558ACE:5B071A1E' ]);

}

function getRepoContentsTree() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.get((uri)=>uri.includes('git/trees'))
		.query({"access_token":config.personal_oath_for_testing,"recursive":"1"})
		.reply(200, ["1f8b0800000000000003dd594d6f1b3710fd2f3a07da2139fcf2ad40d2537b297a2b7a1892c34a86a495b5eb3676e0ffde59397104c14869efa1c0f246ac88c787375f7cfab21a36b4ba59855062d1503070f54a55971d59af958390a25345be193289571f56f7a79d1cd88ce371b8e93a3a6ed77f6dc7cd7d5ae77edf9df8d80fdd6dded0693cd1a174f43b0f6327bfe8c613f3d0bd01683ab0baf9e3cbea48e346207ffbf4d3c75f3fadf7452eb1ef8b7c5b2900","8728fbf1e138edd3ae4fb27be6e4513365174af2b5181fab4a456959e81d24acd1aa5489a7e3c3f6518efbf7939b8087ae19f1e9c30b2b3a1cfa91c66d7f18d6b7437f682407d525e60ca0c045c85e671501453fc20c39fb8a399383fc424eb9b9ec9a212fd8e5fbd3f89d1120c8fa2ed759e16f7219678b46575c54852013d812a18854420c98c8689f6c744e0ecc0bc166a02b1e5d6a2703beca8d232a63729c6e6e3c2a4694e4623098a3b2199ee59947a619e83532dd28c9b91e3f5f48f4c38c8a950c675ba361ad92d5523324b548c752332653d00857d1f825e88c09f87eb99e93aa19f49a6159925c139965cb75d72e9753925b3140243036c402b2b5b626473aa1411d30d6407a7eb76a06ba8ebd89ccf2e53a33548b2d200fed11d95c86df5f0d9fe7a766a0eb889cc82c36224b9feff77c18d79ff7bbc6012a3205cad980d219bc73da6576c0d5f812316699415079aee1a597a18df07ef5bef6b256d00bf56efb030f8d33147acf3144ed6370520e59dbe4549051a3a09f1a3793b316f4fc19aa19e89a48f7cfa6a737c82417a78c187c091963f22654a3bc077239a86a855fc829a4ef23870215e6cad40cfa2a3bb36c7a7777cbe6f79622d21c28df9e98ff7f748ec3b0ecfc7b7ca44567e030f4b4dc187d68ec74ec5d2af2b4b6a582f434240ba8a32e3969aa861d875ac54898dfe99a81ae7bc1c3d4eaee9629d5f1d42813e4043e5831aa48ba378a3c95d129ae3189c7638db14c18aa9e6dea34035dc8743c2d761a19fa3d7fdcb6aa64c42aac9ed0554bbe78ef2d46d09a721133b17292098ca3239aad5233d0854a5fa974f4f376c76f786b6aaedaf969042e939b6d0052422fa5013041d4621660b0da9cfde2b3fdabccdcb9b119f2157a03e7fe507ee1bf79d72e5c412b4b4dae1b0173095a4663a38cf7e8a363822a5373a8f3ab6033d07f32eb2e889e157d83e92da623e99c2452c18358abc63156a3339197c74d32c1a51cfdb3a77c96d4cc7eb135433efd29ff429cee0f99462eab9b4abb819ffe05f5f3b2da5f190000"], [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 26 Jul 2018 12:47:10 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Transfer-Encoding',
			'chunked',
			'Connection',
			'close',
			'Status',
			'200 OK',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4933',
			'X-RateLimit-Reset',
			'1532610663',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'W/"8da5cafeee33318d132e660c3c3bb235"',
			'Last-Modified',
			'Mon, 23 Jul 2018 13:16:03 GMT',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'',
			'X-GitHub-Media-Type',
			'github.v3; param=text-match; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.051997',
			'Content-Encoding',
			'gzip',
			'X-GitHub-Request-Id',
			'B257:6064:1F88F83:3E6535E:5B59C2CE' ]);

}

function createBranchGeneric() {
	return nock('https://api.github.com:443', {"encodedQueryParams":true})
		.post((uri)=>uri.includes('git/refs'))
		.query({"access_token":config.personal_oath_for_testing})
		.reply(201, {"ref":"refs/heads/test84","node_id":"MDM6UmVmMTI5OTQxNzczOnRlc3Q4NA==","url":"https://api.github.com/repos/jchartrand/aTest/git/refs/heads/test84","object":{"sha":"248a708af7d740518bb7340be5eb1c3074dd5376","type":"commit","url":"https://api.github.com/repos/jchartrand/aTest/git/commits/248a708af7d740518bb7340be5eb1c3074dd5376"}}, [ 'Server',
			'GitHub.com',
			'Date',
			'Thu, 26 Jul 2018 13:30:13 GMT',
			'Content-Type',
			'application/json; charset=utf-8',
			'Content-Length',
			'331',
			'Connection',
			'close',
			'Status',
			'201 Created',
			'X-RateLimit-Limit',
			'5000',
			'X-RateLimit-Remaining',
			'4996',
			'X-RateLimit-Reset',
			'1532615376',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'"09ce11196dcb7d0e8c1a40b8c4758799"',
			'X-OAuth-Scopes',
			'repo',
			'X-Accepted-OAuth-Scopes',
			'repo',
			'Location',
			'https://api.github.com/repos/jchartrand/aTest/git/refs/heads/test84',
			'X-GitHub-Media-Type',
			'github.v3; param=text-match; format=json',
			'Access-Control-Expose-Headers',
			'ETag, Link, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
			'Access-Control-Allow-Origin',
			'*',
			'Strict-Transport-Security',
			'max-age=31536000; includeSubdomains; preload',
			'X-Frame-Options',
			'deny',
			'X-Content-Type-Options',
			'nosniff',
			'X-XSS-Protection',
			'1; mode=block',
			'Referrer-Policy',
			'origin-when-cross-origin, strict-origin-when-cross-origin',
			'Content-Security-Policy',
			'default-src \'none\'',
			'X-Runtime-rack',
			'0.489495',
			'X-GitHub-Request-Id',
			'93FC:6064:1FE5B22:3F20356:5B59CCE5' ]);

}
module.exports = {
  getDetailsForAuthenticatedUserNock: getDetailsForAuthenticatedUserNock,
  getGithubCommitNock: getGithubCommitNock,
 // getCreateGithubCWRCBranchNock:getCreateGithubCWRCBranchNock,
  getUpdateGithubCWRCBranchNock:getUpdateGithubCWRCBranchNock,
  getCreateGithubTagNock:getCreateGithubTagNock,
  getGithubTreeNock:getGithubTreeNock,
  getCreateGithubRepoNock: getCreateGithubRepoNock,
  getMasterBranchFromGithubNock: getMasterBranchFromGithubNock,
  getDocumentFromGithubNock:getDocumentFromGithubNock,
  getAnnotationsFromGithubNock:getAnnotationsFromGithubNock,
  getBranchInfoFromGithubNock:getBranchInfoFromGithubNock,
  getReposForGithubUserNock: getReposForGithubUserNock,
  getReposForAuthenticatedUserNock: getReposForAuthenticatedUserNock,
  getTemplatesNock: getTemplatesNock,
  getTemplateNock: getTemplateNock,
  getSearchNock: getSearchNock,
	getRepoContentsByDrillDownBranchNock: getRepoContentsByDrillDownBranchNock,
	getRepoContentsByDrillDownRootTreeNock: getRepoContentsByDrillDownRootTreeNock,
	getReposByDrillDownSecondLevelNock: getReposByDrillDownSecondLevelNock,
	getReposByDrillDownThirdLevelNock: getReposByDrillDownThirdLevelNock,
	getRepoContentsNock: getRepoContentsNock,
	getCreateFileNock: getCreateFileNock,
	getUpdateFileNock: getUpdateFileNock,
	getUserBranchHeadNock: getUserBranchHeadNock,
	getLatestFileSHANock: getLatestFileSHANock,
	getLatestFileSHANockForNew: getLatestFileSHANockForNew,
	saveExistingFileNock: saveExistingFileNock,
	findExistingPRNock: findExistingPRNock,
	saveNewFileNock: saveNewFileNock,
	missingSHANock: missingSHANock,
	missingBranchNock: missingBranchNock,
	missingPRNock: missingPRNock,
	createBranchFromMasterGetMaster: createBranchFromMasterGetMaster,
	createBranchFromMasterCreateBranch: createBranchFromMasterCreateBranch,
	getDoc: getDoc,
	getRepoContentsTree: getRepoContentsTree,
	createBranchGeneric: createBranchGeneric
}
