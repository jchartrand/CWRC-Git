/* eslint-disable quotes */
const nock = require('nock');

const config = require('../config.json');
const fixtures = require('./fixtures');

// we use the cwrcAppName to match CWRC GitHub repositories that are themselves documemnts,
// but we don't match to match repositories that are code repositories,
// so here we sneakily concatenate the full string to avoid matches on this code repo.
const cwrcAppName = 'CWRC-GitWriter' + '-web-app';

const authenticate = () => {
  // return github.auth({
  // 	type: 'oauth',
  // 	token: gitHubOAuthToken
  // })
};

const getDetailsForAuthenticatedUserNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/user')
    .reply(
      200,
      [
        '1f8b080000000000000395545d6f9b3014fd2b919f0906275d1b4b552b75dbd35a295236557d898c71c09db1913fe812d4ffbe6ba05117690f3c61aece39f7f8720f3d52a6921a51a40267af0125489688e6e46a7dbdda24489b52ec63053d7edd7ef9f5fca4f8ebb7e3d36ebb7a3cfdbe0534eb9867761fac024ced7deb28c663d191b492be0e4570c272a3bdd03ee5a6c1014ffa77dded1a342a3ba90c8da070a1d6ca496864839ac367bbb56fd445fbb1eb003ec3',
        '0e4629f306cc4babff17c7670e581acf5257b3f9c0e9b1f1b5802981f5f77861e9fc1c2303bec7f1011f232a3818ba15e50c331303acbc6970d1632b5a334885c2712b5b2f8d9e63ea1f1ee8185b312d4f6cae0ef01cd0a39d39ed073cf044076b358738127adc5ad9317e8c23b0820bd9c138678b5d3041cb1f5b015bfc133e751caef462cfca2646ecc094131029d644c08fc025d366f1ddcad34958066058d896e923a23a2895a002a239063302d3830a7f4ccaac4f8ba8ac0c1f461da309d9b282a964b17d48160f4cb332ca8986c998ca3103f78d8889807a2d015c283031f591e6e3d8864249be1f674bf39b044d956103e1bff011040812bcad3ee50251b2862b80b48741320f8d4996e7cb9c2cf36c475634bba157d90bf40f6df91943b265962fc9f58e104a3674bd7941ef7f0143a0a5ad97040000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Tue, 28 Jan 2020 04:53:49 GMT',
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
        '4993',
        'X-RateLimit-Reset',
        '1580190208',
        'Cache-Control',
        'private, max-age=60, s-maxage=60',
        'Vary',
        'Accept, Authorization, Cookie, X-GitHub-OTP',
        'ETag',
        'W/"06944ef5f451daea4a01f60d064b3a0d"',
        'Last-Modified',
        'Mon, 27 Jan 2020 22:29:49 GMT',
        'X-OAuth-Scopes',
        'admin:repo_hook, repo',
        'X-Accepted-OAuth-Scopes',
        '',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        'B526:6A01:A65F:13283:5E2FBE5D',
      ]
    );
};

const getReposForAuthenticatedUserNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/user/repos')
    .query({
      page: 1,
      per_page: 10,
      affiliation: 'owner',
    })
    .reply(200, [
      {
        id: 19289649,
        name: fixtures.testRepo,
      },
    ]);
};

const getGithubCommitNock = () => {
  // NOTE:  I put in more in the reply than necessary. I  put it in
  // to help explain what's going on.
  return (
    nock('https://api.github.com:443', {
      encodedQueryParams: true,
    })
      .post(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/commits`, function (body) {
        return (
          body.message === 'saving cwrc version' &&
          body.tree === 'newTreeSHAForTesting' &&
          body.parents[0] === 'parentCommitSHAForTesting'
        );
      })

      //{"message":fixtures.commitMessage,"tree":fixtures.newTreeSHA,"parents":[fixtures.parentCommitSHA]})
      .query({
        access_token: config.personal_oath_for_testing,
      })
      .reply(201, {
        sha: fixtures.newCommitSHA,
        tree: {
          sha: fixtures.newTreeSHA,
        },
        message: fixtures.commitMessage,
        parents: [
          {
            sha: fixtures.parentCommitSHA,
          },
        ],
      })
  );
};

const getUpdateGithubCWRCBranchNock = () => {
  // this is exactly the same as the create one above, but uses patch instead of post.
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .patch(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/refs/heads/master`, {
      sha: fixtures.newCommitSHA,
    })
    .query({
      access_token: config.personal_oath_for_testing,
    })
    .reply(201, {
      ref: 'refs/heads/master',
      object: {
        sha: fixtures.newCommitSHA,
      },
    });
};

const getCreateGithubTagNock = () => {
  // NOTE:  I didn't really need to return anything in the reply.  It isn't used.  I just put it in
  // to help explain what's going on.
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .post(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/refs`, {
      ref: `refs/tags/cwrc/${fixtures.versionTimestamp}`,
      sha: fixtures.newCommitSHA,
    })
    .query({
      access_token: config.personal_oath_for_testing,
    })
    .reply(201, {
      ref: `refs/tags/cwrc/${fixtures.versionTimestamp}`,
      object: {
        sha: fixtures.newCommitSHA,
      },
    });
};

const getGithubTreeNock = () => {
  // In this one, I only return what's needed for the test to continue, i.e., the newSHA
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .post(`/repos/${fixtures.owner}/${fixtures.testRepo}/git/trees`, function (body) {
      return (
        body.tree[0].path === 'document.xml' &&
        body.tree[0].content.includes(
          `<encodingDesc><appInfo><application version="1.0" ident="${cwrcAppName}" notAfter="`
        ) &&
        body.tree[1].path === 'annotations.json'
      );
    })
    .query({
      access_token: config.personal_oath_for_testing,
    })
    .reply(201, {
      sha: fixtures.newTreeSHA,
    });
};

const getCreateGithubRepoNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .post('/user/repos', {
      name: fixtures.testRepo,
      description: fixtures.testRepoDescription,
      private: fixtures.isPrivate,
      auto_init: true,
    })
    .reply(201, {
      owner: {
        login: fixtures.owner,
      },
      name: fixtures.testRepo,
    });
};

const getMasterBranchFromGithubNock = () => {
  // NOTE:  I put in more in the reply than necessary. I  put it in
  // to help explain what's going on.
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get(`/repos/${fixtures.owner}/${fixtures.testRepo}/branches/master`)
    .query({
      access_token: config.personal_oath_for_testing,
    })
    .reply(200, {
      commit: {
        sha: fixtures.parentCommitSHA,
        commit: {
          message: 'test commit',
          tree: {
            sha: fixtures.baseTreeSHA,
          },
        },
      },
    });
};

const getDocumentFromGithubNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get(`/repos/${fixtures.owner}/${fixtures.testRepo}/contents/document.xml`)
    .query({
      ref: 'master',
      access_token: config.personal_oath_for_testing,
    })
    .reply(200, {
      content: fixtures.base64TestDoc,
    });
};

const getAnnotationsFromGithubNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get(`/repos/${fixtures.owner}/${fixtures.testRepo}/contents/annotations.json`)
    .query({
      ref: 'master',
      access_token: config.personal_oath_for_testing,
    })
    .reply(200, {
      content: fixtures.base64AnnotationBundle,
    });
};

const getBranchInfoFromGithubNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get(`/repos/${fixtures.owner}/${fixtures.testRepo}/branches/master`)
    .query({
      access_token: config.personal_oath_for_testing,
    })
    .reply(200, {
      commit: {
        sha: fixtures.parentCommitSHA,
        commit: {
          message: 'test commit',
          tree: {
            sha: fixtures.baseTreeSHA,
          },
        },
      },
    });
};

const getReposForGithubUserNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/users/lucaju/repos')
    .query({
      page: '1',
      per_page: '10',
    })
    .reply(
      200,
      [
        '1f8b0800000000000003ed9df173e2361680ff158e5f2f041b7000cfecf4762e3bbd76366cf74a7b6d6f6e32c638e0c4606a9bb081d9fffd9e6461642181915eda66c63337bdc4d1fb24db926c7ffb64ff77d70ca74d77d01f761dcbb96a2ee369704fb634ef6e3f6c3e45df47feb7c3adf7cbbf9ffde5536fb47dda8ec6efed2614f4160194fa6798051f83650a5b1ed65174cf36476bdf7b5cb7b9bfae92f0d9cb20e4c18bd2e0aa196f9641d27477',
        'cd289e854b20e521c021b5db1da7d7ef0ecbedf97cf3f32fa3c87ffcf0321a7feede6d9fde41690fa85e72bf4e2260ccb36c95baed76be31ed5ccfc26cbe9eacd320f1e365162cb36b3f5eb4d76dc6ffe6f95d0f18b38451e88ec30681b60a19288f065ada2e9a3bcf1691507d5e2b2d5c147b88a328de40a4d85435bc5dc490a34be3c3e5ece27888d9b5e36c1ec05182a67f253b1ca6d9250da1e5776df27fd039082185839e04d30b1ac322a029e4cc7fddb593601553d47a92fa49b8cac2787949a34a71c0899399b70cb7dea51c8823dd9734e792ea6979880b9ea15b5d129807ecda7444f82fe41024811f84cf70382f860991c0ca5e566460fe04a79a1c5c189ff7de744186181d795faf60949cefb1fcd09d06c5f969ba4b18e5a437264fc5503e395ae86162c3808712c299a3260d85410181b0674fc18b563c89dbb5e1bfac27fb30b0bc499c78597c6e70ca1b5402ecdafcafe4dc6681b7d06a280d04c03c8ef58e140d044098a6eba052d792ef208d4fdbfb7ebb5c2f26f93452a5b7ca917924b4cd4bd370b60c02ad235404efdafb996d92784b7fae87dbc7eedaf94ff4ec7933ada69138089f44f1442b1e2e216d1abc6ba7732f9fb3b37bddd6101a892dc192e041bb6924b6806589e6f9a3cd22c1050a2e12199c4aad76ed63db3b76c4226f395b7b333d5a114c2651b8d8cdbcedd98bb7bcaf1fa201456e439270b2d69f6c0ef1a465f9b513c6a3de213b841f60f4427cfac2aed851ee424e7775b108cf5d19e524165aeaae0638d2cf4424f9fdfc855bdd3c12bb6b1fe6c27c9265549da3c766d97dbb7836bb77d53ac5fbd8f6eeef2b2f9b939904aa587949a0d34816dade4d3cb895b8bebedecd038fde102e824473a4e59180f0127f0e77413aeddaed63e1ee60e165f4eef281346b0a779b51ec4db58e5d110ca0fcf4e8b42d8fe4cfe70aeea1b41a440379d2228c82348b977a73dc219a672ee32c7c08fd2af7d1f2e15102ecbe49c3a51f5c7970db08bd2e0bfd10fa213c9390b303375e81de91c823a1d9f0189adf4147017449ada39a0479ecae9d3fdb4c835514bf68cf0e5c38196c49008fbdd37b2f839bf28e65775b56b7653b63ebc6ed76dd9ef31b9459afa6a532c396d569759cb13d702ddbb52d5266b54ee71ca6478a585d82717aaed52745609a63fd137e82a7e0a3c7d0e2fe9b3cce42409ace0f01ff38147785c77756dc8fa0a30923e07c1dcfe2b5441d024d9ac78b6005d7ecfd83461a6ee1676760dff44bd7613f5e2fe1885a57cd8d97c10d1f5cff0e9bf6d76e38e2ef7d7235fb913e5f12bc97dee7e3b1e966c91a3c04d9b24ae2c7c0cf527edb61ec730537e153580a247717c57350fe48c39ad18129314c9298a989fcb189cd52601998059986a9378982c38678152c590bf91d0a7d702cc541c91f815ca8822b5e3a18f49769f0e0ada3ec3ebf9b8583b1f0d20c9e0abf5ee5d2c7ee771c67d8ef0ece689f2fa3ed77f668fc04ca65f60e0e22733c53b8d38671dc7a08b309ed4e12017454a6d640b50622e2a8d6406f43031d0de0920c6a8ee761da48823420335bc35b4e1bf47a07536e834daa0d2f5c04d3461637822f70594d82c63cde34c04636e09ae7d110f24b44f457230da287569678fe134c2c242048c200ee1e1a30a946d3c62468c0c32185cd02908870d16cc013d033ccfe10de20f77e69237ec8c9701b08d15ec48c20d492c4ebd9bce1cfa1113128dfd5fce5aa91c275647a459bf11ca66b3064d76426d3d35b4707eb52c95506e8aa2e818225bc042cb2f612e8baf24bc0182a30818627c204b0910e135838524c8022a831f104eb093281429eec8d359984692acb2448236526e1198b338189a2cf04a6b1443b6e23137130496baa3401c953c823919650139b89a1d5e44c2ae7e8',
        'ce5f2ad78ef69b020c159ba45f2288364953b1749b80c6956e47eda6ffe49c1aa9b72326757718024e201b683881842ae304b69192939e7c1331270071f49c785e0ac58721e904f82baa3aa1260461271071b49dd8bf0eee8fccb282bce3c49cdd771d6add8ee59d6db73a0322ef1cdb753a1279376cf1457ac36af2aedcd28a0a4f1a544de44943d30a3aaf1c0887e820f568860ea849e80de9f543b4fe125f8313be9e24ed7dd006327698526a93eb31f57f9dbe3300a1c5fd3b5c55fff73d64f6fc09f60f1afbdaf60faa30b37fcea037e8f686bdb3f66f3cb33eddde599fc69f39fb975bbf16c917230fccc7b95fe502b5f7abbd5fedfd484ee4dbf07ee5d18b9701264c1b17268171d1ba728c476099319e89acc578b4ae13e31986428c47e1d9309e6aa4c278108e07e3890812ac743af50c188f40d15f22d0d47d893c23f125c28cad170f44515e3cd0d87709ad33965d3c0fc574951a88a1b924407dc755de5d0cc125f63f04bb2536124b6df15c5caf25f62263a9251c022ca3c5630d74168f4175593cd848641d9f6a138bc5d3701456e944a0fa2b9efc8af28aaf06c15cf1381c6d55ea4a279dd580ca267b6c75214dcced2812ce98901abaa0adba37a79c555ea457cd5971cdac28ac8e23aad9aae3b82aaa8a8b2a79aa3c5d2b974f20486af1b45ff403d96ea6e2a9dbeff5fb9dce39efb41d6d3f7721f3ec65f4fe1de79de6eb85b76ca52487d48b5a8bf83920899a7205a52c5bdba8da46d536eaedd828e540c61353ca2a2ecde19283747595828665ae14786489a5a845d7672970866a4b41c5b35c8a0a8c84978289e3be1470040da6206b2e9a54d050e4d809b6a9273b8136526627b8c6f64cc14611690ab6b15353703196652ad028a64dc1e612d4c83f8f734b2e2f589b769aadefdf145c519ac1c884c52d9726b029e064988b1590df2f5cdca9a0ef49bc5fa19704ba035087f951c77575cafd40c84553b2d172d2143518c83c0511d5eb29ea30527c0a66de594c6c9f028c23fe1470dc85a68a4a5e51072a6a4430830a328e2454c04f2f50755ad60d59a06ac30255dbed2972dc4a0b54a9531416a8f65bd6a0d5e98c6dc7ed3aae438b90793f7f590cfc245da02a6f7145757832b89a453c89a82214e500a55bbce9c13baefe9a76315f1e5b5ad3fa16b2da06e4c5619db34b5a3fddfe648db6772f9f4a72315c3e052db87b7b0812b2ecacb50926e4054a72bba82e5cebc55a2fd67af1ede845f548c6f38bea3a2e158c0a92ae6154e1b014a38a8fec1855d5e84a4615cfd032aab0789a515583916754417144a38a8e601a55684dd5a8c2a1b8c6537053d9788a6d641b4f818d75a30a8ee21b557063e1a802631847151b4539aae028cef10c5c5f3aaac0a214d4b38e2a3a927654e131bda3aa0e5cf1a8aa05e505746a389a7a545561e01e554854f9a8aac4c83eaaa0e6fa5145c6f18f2a3aae8054d5f28a06525525828254a1711ca48a7e5a42c2ebede07f03f27a3bdb726d9a90282eb48502b01e3717954358222a9190b4887d33b61cb7d7059d594d422a9a5cd1429e8eaea6214f33aa784805412922079deecd5fd544b277e5fd012a7247de2a4e5e94b78a5a9d6b0b8e167bd7dd5dbc0de135e18d1fd69328f41b1ff3f7f135f232e96afa857d33e1878f2ceee43bd101415ee797b6b97ab8ef2ef837e36fa3c7dffee36c7f1b7fb0e0757df47d540899979d8e33ec75067dfbcc92df97bbc79f9cd1ed77f0bd870f5ceae5224c7db90a657fa9bd67ed3d6beff976bc271bb67892733f435cb8ac9784e9ea4b1a8be52a290c594c52a6ae85a4c186ca9132f0fc22c519c9444ac031871485a009f393a4b72097c6a208c082646afb0a9091da3b34c7f41b0d948422ed28c9d8d0eddb63bcbe968250dc5bde248c15',
        'b53c49dfaab13dc358435bf423d1c869a4e915cdc25a354b81b826ace814c6eb64f77b8bb54096f20c84168d47b5579468a4aab813689216473138122a3fcaa8cb5e29f215f512e523b824cac1114779cf38b9b415dc0e7c04a137b687b066d5edd0f7a80996a863b52c58fe0adf5ba07968b6e4756c62918a9688b4afa212e28a56f33f3cbbc20bd74871a5d9b1b55e9c962f80fde33e97f00652cbc83732fb37c2372915dfc8dcfeea70f2083ec21066f1da9fb77ef692304ed60bb946b99316acad4a6d556aabf276ac8a7c14e3491639ffd22c32094557c1c850584646c6461634b22a747d8d8c65a86f64483c9b23a31bc91d1910c7f5c8c808ea4786d5cc0e93a150c4900a6cea89545c236da4821a6783c9c02852490636764c32284606988c8b62a0646094ccaf13607d3f25838a7e492fe34b4646caf692a13133bd647c5cb725ab0125c34b0e46cbee92e10d44980c87eac5641518693219d03c9b4b46c5916832326e1697ac8657546cb2ea108c9b0c8b23e064e4d3595bdcb74d9da16b51d726666d09df36a5ef913b5a3a0a5aaf4bdf58d7b5dceea05ad696a4b915f59c3ab29aad53c757c9d492442b5d5e173ed9a995a5f5a77d06f50d78bd8e35e83a76cf82fc37f2350396c9757b64f65eee6e67db116464ddddfeca65452d830cbe1c28177ac5df6a87573bbcdae1bd1d87570cdcf2e74e4741b681dca6c6cff453a1eccba264e8eb7d2ff430755c98309507eafa3a168da5e8180ed9ca31aaae8863e186ee8d51f0741b031a1936c6c0916a0c86e0d1f6274c2f898a45a3d8328e652ac838949113e39b649a4cc55828e68bb18c65d7a14dc629550c85a2b4f6cdc248ab2ab3f4c555b17f18a9555cbf12e597467215d734acf42a86c495505c17314eb13aec33569215231ad8254640154a8c69e4904a27d324d98a81704cd1fe78a3265c31e82bfa205603820262241cebb3ef276712afc8babaeeb8032f08ebb98e25173df9370520f1caeeb9162d23889efd7730f3221dbaca8f38fbd3ef08cb5b58d1ed940a57d339657e85f4ab3c40296d06837e574bdafc6b7cf79150bdf43e9f3f9b6efe522eb26595c48f819fc1aab0c3b6c3e0e6366ec2a7b014e8cd0288fae316d5e5a964484bd8ec61d7b206e7d3b0be7c1adf6d40d874478f4f9cac8997fedc83377bc9750df7d75ad8d4c2a616366f47d87043172fd38a9f2d2e3434fb505d4753c463599a0288ec690aaeaea9290086aea6e0e0d99a0269e46b0a0a8eb1297008cee670f2f4ac4d118fe26d4a345373538219b99b72b34ced4d4143f13705cdd8e0f0ed327638050cc5e21c9a86e171449abec9e1f612c3e594fa1982cd29350fcbe714505ca353ea30c64e87df732cab53300dbc4ec140353b05d5c8ed0827d6c4ee14281cbf7338f2a886a7c0bea2e329ea40b03c050bc7f31c7acd39d37343bf1e69bb207b1cd9dbe0f3f57316bcea1d96e1f5e10392c7a6a754043e3059f1eb91fb3656743d42f16ab647aca382efd987288d8fddef3b5ac6e77befd9fbd14fc215f9a061ed7d82045e7eb46b86d32628c4a1d5b71cebdcf2bb2fa3dba7cd68fbdebebbe5bdcf2af4b330965b9fe26fb5f3a99d4fed7cde8ef329066e3949e7fdb2112efd689d86cf4163112ec3d6cc5b040d10d00dfa758eb4e12da78ddfd75e1ab6f20d7f2313835e0acf6162b95010e581ba7a884563c921864356438caa2b8658b8a11662143c29c480464a88317084108321e8a0fd09d393412c1a4505712c5311c4a18c3410df245309c458280a88b18c05d0a14dc6fa87a150e4cfbe5918eaa7ccd2173fc5fe61681fae5f21481fae6958ca872171850fd7458c75cf619fb1640f231aa81e4640153d8c69a4794a27d344f230108ee2d91f6f54c1c3a0afa877580d0872879170d4cebe',
        '9f9c143b03fa6aecfed882fc9d0e5b6475bc562b5f88453e05e8b816cdcf394ee1a16bb558918a62276f6145ad532a5c4dea94f915944e1e50123acd7996ade023859bcde69a3c403026ccd16d289786dba0e9de740776bf363d38193efffb3f7e5b10c58cbc0000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Mon, 27 Jan 2020 20:17:47 GMT',
        'Content-Type',
        'application/json; charset=utf-8',
        'Transfer-Encoding',
        'chunked',
        'Connection',
        'close',
        'Status',
        '200 OK',
        'X-RateLimit-Limit',
        '60',
        'X-RateLimit-Remaining',
        '53',
        'X-RateLimit-Reset',
        '1580158422',
        'Cache-Control',
        'public, max-age=60, s-maxage=60',
        'Vary',
        'Accept',
        'ETag',
        'W/"ed4c0862d3d37cffcc33307e8ff7b8bb"',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Link',
        '<https://api.github.com/user/1254739/repos?page=2&per_page=10>; rel="next", <https://api.github.com/user/1254739/repos?page=2&per_page=10>; rel="last"',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        '9039:77C2:93349:F963E:5E2F456B',
      ]
    );
};

const getTemplatesNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/repos/cwrc/CWRC-Writer-Templates/contents/templates')
    .query({
      ref: 'master',
      access_token: config.personal_oath_for_testing,
    })
    .reply(
      200,
      [
        {
          name: 'Sample_Canadian_Women_Playwrights_entry.xml',
          path: 'templates/Sample_Canadian_Women_Playwrights_entry.xml',
          sha: 'c03aab155adf94869e64867204b57f5418521379',
          size: 93879,
          url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/Sample_Canadian_Women_Playwrights_entry.xml?ref=master',
          html_url:
            'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/Sample_Canadian_Women_Playwrights_entry.xml',
          git_url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/c03aab155adf94869e64867204b57f5418521379',
          download_url:
            'https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/Sample_Canadian_Women_Playwrights_entry.xml',
          type: 'file',
          _links: {
            self:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/Sample_Canadian_Women_Playwrights_entry.xml?ref=master',
            git:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/c03aab155adf94869e64867204b57f5418521379',
            html:
              'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/Sample_Canadian_Women_Playwrights_entry.xml',
          },
        },
        {
          name: 'biography.xml',
          path: 'templates/biography.xml',
          sha: 'df8924ab45525603b11131084bac46a65e40dd05',
          size: 8969,
          url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/biography.xml?ref=master',
          html_url:
            'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/biography.xml',
          git_url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/df8924ab45525603b11131084bac46a65e40dd05',
          download_url:
            'https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/biography.xml',
          type: 'file',
          _links: {
            self:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/biography.xml?ref=master',
            git:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/df8924ab45525603b11131084bac46a65e40dd05',
            html:
              'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/biography.xml',
          },
        },
        {
          name: 'ceww_new_entry_template.xml',
          path: 'templates/ceww_new_entry_template.xml',
          sha: 'ed224c05b1dd8b2e8053fd880e04c983065698c1',
          size: 12918,
          url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/ceww_new_entry_template.xml?ref=master',
          html_url:
            'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/ceww_new_entry_template.xml',
          git_url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/ed224c05b1dd8b2e8053fd880e04c983065698c1',
          download_url:
            'https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/ceww_new_entry_template.xml',
          type: 'file',
          _links: {
            self:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/ceww_new_entry_template.xml?ref=master',
            git:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/ed224c05b1dd8b2e8053fd880e04c983065698c1',
            html:
              'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/ceww_new_entry_template.xml',
          },
        },
        {
          name: 'cwrcEntry.xml',
          path: 'templates/cwrcEntry.xml',
          sha: '5cc998e21ac16e733e8e2d176ac77b1276651d1a',
          size: 1192,
          url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/cwrcEntry.xml?ref=master',
          html_url:
            'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/cwrcEntry.xml',
          git_url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/5cc998e21ac16e733e8e2d176ac77b1276651d1a',
          download_url:
            'https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/cwrcEntry.xml',
          type: 'file',
          _links: {
            self:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/cwrcEntry.xml?ref=master',
            git:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/5cc998e21ac16e733e8e2d176ac77b1276651d1a',
            html:
              'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/cwrcEntry.xml',
          },
        },
        {
          name: 'letter.xml',
          path: 'templates/letter.xml',
          sha: '1525a783ddcd2844d75677d3748673d749c99963',
          size: 4470,
          url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/letter.xml?ref=master',
          html_url:
            'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/letter.xml',
          git_url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/1525a783ddcd2844d75677d3748673d749c99963',
          download_url:
            'https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/letter.xml',
          type: 'file',
          _links: {
            self:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/letter.xml?ref=master',
            git:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/1525a783ddcd2844d75677d3748673d749c99963',
            html: 'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/letter.xml',
          },
        },
        {
          name: 'poem.xml',
          path: 'templates/poem.xml',
          sha: '3646f33255208aa71b79ef0a7adaa03af2057ec4',
          size: 9775,
          url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/poem.xml?ref=master',
          html_url: 'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/poem.xml',
          git_url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/3646f33255208aa71b79ef0a7adaa03af2057ec4',
          download_url:
            'https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/poem.xml',
          type: 'file',
          _links: {
            self:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/poem.xml?ref=master',
            git:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/3646f33255208aa71b79ef0a7adaa03af2057ec4',
            html: 'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/poem.xml',
          },
        },
        {
          name: 'prose.xml',
          path: 'templates/prose.xml',
          sha: 'abe5f5729d23b51a54ad4098c182bbd3e70b2d79',
          size: 19730,
          url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/prose.xml?ref=master',
          html_url: 'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/prose.xml',
          git_url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/abe5f5729d23b51a54ad4098c182bbd3e70b2d79',
          download_url:
            'https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/prose.xml',
          type: 'file',
          _links: {
            self:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/prose.xml?ref=master',
            git:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/abe5f5729d23b51a54ad4098c182bbd3e70b2d79',
            html: 'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/prose.xml',
          },
        },
        {
          name: 'sample_biography.xml',
          path: 'templates/sample_biography.xml',
          sha: '95edb8af9142e198f7b5adda6a2520f606171c1a',
          size: 79937,
          url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_biography.xml?ref=master',
          html_url:
            'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_biography.xml',
          git_url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/95edb8af9142e198f7b5adda6a2520f606171c1a',
          download_url:
            'https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/sample_biography.xml',
          type: 'file',
          _links: {
            self:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_biography.xml?ref=master',
            git:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/95edb8af9142e198f7b5adda6a2520f606171c1a',
            html:
              'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_biography.xml',
          },
        },
        {
          name: 'sample_letter.xml',
          path: 'templates/sample_letter.xml',
          sha: '3018280fedf351a4a9330326cd654382aa80984b',
          size: 20765,
          url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_letter.xml?ref=master',
          html_url:
            'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_letter.xml',
          git_url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/3018280fedf351a4a9330326cd654382aa80984b',
          download_url:
            'https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/sample_letter.xml',
          type: 'file',
          _links: {
            self:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_letter.xml?ref=master',
            git:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/3018280fedf351a4a9330326cd654382aa80984b',
            html:
              'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_letter.xml',
          },
        },
        {
          name: 'sample_poem.xml',
          path: 'templates/sample_poem.xml',
          sha: 'e3fadfac318e076318ffbf69a335470df6a73b42',
          size: 6572,
          url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_poem.xml?ref=master',
          html_url:
            'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_poem.xml',
          git_url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/e3fadfac318e076318ffbf69a335470df6a73b42',
          download_url:
            'https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/sample_poem.xml',
          type: 'file',
          _links: {
            self:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_poem.xml?ref=master',
            git:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/e3fadfac318e076318ffbf69a335470df6a73b42',
            html:
              'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_poem.xml',
          },
        },
        {
          name: 'sample_writing.xml',
          path: 'templates/sample_writing.xml',
          sha: '70f5fa95ddd70ae11aa7413d63369dfcabd4d81f',
          size: 93162,
          url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_writing.xml?ref=master',
          html_url:
            'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_writing.xml',
          git_url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/70f5fa95ddd70ae11aa7413d63369dfcabd4d81f',
          download_url:
            'https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/sample_writing.xml',
          type: 'file',
          _links: {
            self:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/sample_writing.xml?ref=master',
            git:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/70f5fa95ddd70ae11aa7413d63369dfcabd4d81f',
            html:
              'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/sample_writing.xml',
          },
        },
        {
          name: 'writing.xml',
          path: 'templates/writing.xml',
          sha: '978a11166ed998a61e60732597178eea51ae2daf',
          size: 6316,
          url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/writing.xml?ref=master',
          html_url:
            'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/writing.xml',
          git_url:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/978a11166ed998a61e60732597178eea51ae2daf',
          download_url:
            'https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/writing.xml',
          type: 'file',
          _links: {
            self:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/writing.xml?ref=master',
            git:
              'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/978a11166ed998a61e60732597178eea51ae2daf',
            html: 'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/writing.xml',
          },
        },
      ],
      [
        'Server',
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
        "default-src 'none'",
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
        'FC15:DCFF:7FA7785:A336296:58C73A7B',
      ]
    );
};

const getTemplateNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/repos/cwrc/CWRC-Writer-Templates/contents/templates/letter.xml')
    .query({
      ref: 'master',
      access_token: config.personal_oath_for_testing,
    })
    .reply(
      200,
      {
        name: 'letter.xml',
        path: 'templates/letter.xml',
        sha: '1525a783ddcd2844d75677d3748673d749c99963',
        size: 4470,
        url:
          'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/letter.xml?ref=master',
        html_url: 'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/letter.xml',
        git_url:
          'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/1525a783ddcd2844d75677d3748673d749c99963',
        download_url:
          'https://raw.githubusercontent.com/cwrc/CWRC-Writer-Templates/master/templates/letter.xml',
        type: 'file',
        content:
          '77u/PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPD94\nbWwtbW9kZWwgaHJlZj0iaHR0cDovL2N3cmMuY2Evc2NoZW1hcy9jd3JjX3Rl\naV9saXRlLnJuZyIgdHlwZT0iYXBwbGljYXRpb24veG1sIiBzY2hlbWF0eXBl\nbnM9Imh0dHA6Ly9yZWxheG5nLm9yZy9ucy9zdHJ1Y3R1cmUvMS4wIj8+Cjw/\neG1sLXN0eWxlc2hlZXQgdHlwZT0idGV4dC9jc3MiIGhyZWY9Imh0dHA6Ly9j\nd3JjLmNhL3RlbXBsYXRlcy9jc3MvdGVpLmNzcyI/Pgo8VEVJIHhtbG5zPSJo\ndHRwOi8vd3d3LnRlaS1jLm9yZy9ucy8xLjAiIHhtbG5zOnJkZj0iaHR0cDov\nL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgeG1sbnM6\nY3c9Imh0dHA6Ly9jd3JjLmNhL25zL2N3IyIgeG1sbnM6dz0iaHR0cDovL2N3\ncmN0Yy5hcnRzcm4udWFsYmVydGEuY2EvIyI+Cgk8cmRmOlJERiB4bWxuczpy\nZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1u\ncyMiIHhtbG5zOmN3PSJodHRwOi8vY3dyYy5jYS9ucy9jdyMiIHhtbG5zOm9h\nPSJodHRwOi8vd3d3LnczLm9yZy9ucy9vYSMiIHhtbG5zOmZvYWY9Imh0dHA6\nLy94bWxucy5jb20vZm9hZi8wLjEvIj4KCQk8cmRmOkRlc2NyaXB0aW9uIHJk\nZjphYm91dD0iaHR0cDovL2FwcHMudGVzdGluZy5jd3JjLmNhL2VkaXRvci9k\nb2N1bWVudHMvbnVsbCI+CgkJCTxjdzptb2RlPjA8L2N3Om1vZGU+CgkJPC9y\nZGY6RGVzY3JpcHRpb24+CgkJPHJkZjpEZXNjcmlwdGlvbiB4bWxuczpyZGY9\nImh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMi\nIHJkZjphYm91dD0iaHR0cDovL2lkLmN3cmMuY2EvYW5ub3RhdGlvbi8zM2Mz\nNzdmMS0yMWZhLTQ1OTQtOWIxZi05M2Q3ZTM4N2ZjOGEiPgoJCQk8b2E6aGFz\nVGFyZ2V0IHhtbG5zOm9hPSJodHRwOi8vd3d3LnczLm9yZy9ucy9vYSMiIHJk\nZjpyZXNvdXJjZT0iaHR0cDovL2lkLmN3cmMuY2EvdGFyZ2V0LzE2OGJhMzlk\nLTJiYjktNDY0ZC1iMzNhLTAxM2ZhNjMwZDJjMSIvPgoJCQk8b2E6aGFzQm9k\neSB4bWxuczpvYT0iaHR0cDovL3d3dy53My5vcmcvbnMvb2EjIiByZGY6cmVz\nb3VyY2U9Imh0dHA6Ly9jd3JjLWRldi0wMS5zcnYudWFsYmVydGEuY2EvaXNs\nYW5kb3JhL29iamVjdC83M2MzMzRkMy0yNjI5LTRmNjMtODM1Yi0yM2ZjMGE3\nMDZkN2MiLz4KCQkJPG9hOmFubm90YXRlZEJ5IHhtbG5zOm9hPSJodHRwOi8v\nd3d3LnczLm9yZy9ucy9vYSMiIHJkZjpyZXNvdXJjZT0iaHR0cDovL2lkLmN3\ncmMuY2EvdXNlci8wNmY5M2JjMy1kODNhLTQzMDAtYTIwOS0zY2YxMmNjNmE5\nZTkiLz4KCQkJPG9hOmFubm90YXRlZEF0IHhtbG5zOm9hPSJodHRwOi8vd3d3\nLnczLm9yZy9ucy9vYSMiPjIwMTQtMTAtMDFUMTY6MTI6MTMuNDY0Wjwvb2E6\nYW5ub3RhdGVkQXQ+CgkJCTxvYTpzZXJpYWxpemVkQnkgeG1sbnM6b2E9Imh0\ndHA6Ly93d3cudzMub3JnL25zL29hIyIgcmRmOnJlc291cmNlPSIiLz4KCQkJ\nPG9hOnNlcmlhbGl6ZWRBdCB4bWxuczpvYT0iaHR0cDovL3d3dy53My5vcmcv\nbnMvb2EjIj4yMDE0LTEwLTAxVDE2OjEyOjEzLjQ2NFo8L29hOnNlcmlhbGl6\nZWRBdD4KCQkJPHJkZjp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3d3dy53\nMy5vcmcvbnMvb2EjQW5ub3RhdGlvbiIvPgoJCQk8b2E6bW90aXZhdGVkQnkg\neG1sbnM6b2E9Imh0dHA6Ly93d3cudzMub3JnL25zL29hIyIgcmRmOnJlc291\ncmNlPSJodHRwOi8vd3d3LnczLm9yZy9ucy9vYSN0YWdnaW5nIi8+CgkJCTxv\nYTptb3RpdmF0ZWRCeSB4bWxuczpvYT0iaHR0cDovL3d3dy53My5vcmcvbnMv\nb2EjIiByZGY6cmVzb3VyY2U9Imh0dHA6Ly93d3cudzMub3JnL25zL29hI2lk\nZW50aWZ5aW5nIi8+CgkJCTxjdzpoYXNDZXJ0YWludHkgeG1sbnM6Y3c9Imh0\ndHA6Ly9jd3JjLmNhL25zL2N3IyIgcmRmOnJlc291cmNlPSJodHRwOi8vY3dy\nYy5jYS9ucy9jdyNkZWZpbml0ZSIvPgoJCQk8Y3c6Y3dyY0luZm8geG1sbnM6\nY3c9Imh0dHA6Ly9jd3JjLmNhL25zL2N3IyI+eyJpZCI6Imh0dHA6Ly92aWFm\nLm9yZy92aWFmLzM5NTY5NzUyIiwibmFtZSI6IkJyb3duLCBNaXF1ZWwiLCJy\nZXBvc2l0b3J5IjoidmlhZiJ9PC9jdzpjd3JjSW5mbz4KCQkJPGN3OmN3cmNB\ndHRyaWJ1dGVzIHhtbG5zOmN3PSJodHRwOi8vY3dyYy5jYS9ucy9jdyMiPnsi\nY2VydCI6ImRlZmluaXRlIiwidHlwZSI6InJlYWwiLCJyZWYiOiJodHRwOi8v\ndmlhZi5vcmcvdmlhZi8zOTU2OTc1MiJ9PC9jdzpjd3JjQXR0cmlidXRlcz4K\nCQk8L3JkZjpEZXNjcmlwdGlvbj4KCQk8cmRmOkRlc2NyaXB0aW9uIHhtbG5z\nOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4\nLW5zIyIgcmRmOmFib3V0PSJodHRwOi8vY3dyYy1kZXYtMDEuc3J2LnVhbGJl\ncnRhLmNhL2lzbGFuZG9yYS9vYmplY3QvNzNjMzM0ZDMtMjYyOS00ZjYzLTgz\nNWItMjNmYzBhNzA2ZDdjIj4KCQkJPHJkZjp0eXBlIHJkZjpyZXNvdXJjZT0i\naHR0cDovL3d3dy53My5vcmcvbnMvb2EjU2VtYW50aWNUYWciLz4KCQkJPHJk\nZjp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3htbG5zLmNvbS9mb2FmLzAu\nMS9QZXJzb24iLz4KCQk8L3JkZjpEZXNjcmlwdGlvbj4KCQk8cmRmOkRlc2Ny\naXB0aW9uIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8y\nMi1yZGYtc3ludGF4LW5zIyIgcmRmOmFib3V0PSJodHRwOi8vaWQuY3dyYy5j\nYS90YXJnZXQvMTY4YmEzOWQtMmJiOS00NjRkLWIzM2EtMDEzZmE2MzBkMmMx\nIj4KCQkJPG9hOmhhc1NvdXJjZSB4bWxuczpvYT0iaHR0cDovL3d3dy53My5v\ncmcvbnMvb2EjIiByZGY6cmVzb3VyY2U9Imh0dHA6Ly9pZC5jd3JjLmNhL2Rv\nYy85YTgxMzIzNi00YjRlLTRmMzEtYjQxOC03YTE4M2EyODViNWUiLz4KCQkJ\nPHJkZjp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3d3dy53My5vcmcvbnMv\nb2EjU3BlY2lmaWNSZXNvdXJjZSIvPgoJCQk8b2E6aGFzU2VsZWN0b3IgeG1s\nbnM6b2E9Imh0dHA6Ly93d3cudzMub3JnL25zL29hIyIgcmRmOnJlc291cmNl\nPSJodHRwOi8vaWQuY3dyYy5jYS9zZWxlY3Rvci82YjRiYmQxYS1iODg3LTQ5\nOGItYjVmNy1iZTQwMWJmY2Q2ZDkiLz4KCQk8L3JkZjpEZXNjcmlwdGlvbj4K\nCQk8cmRmOkRlc2NyaXB0aW9uIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5v\ncmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgcmRmOmFib3V0PSJodHRw\nOi8vaWQuY3dyYy5jYS9zZWxlY3Rvci82YjRiYmQxYS1iODg3LTQ5OGItYjVm\nNy1iZTQwMWJmY2Q2ZDkiPgoJCQk8cmRmOnZhbHVlPnhwb2ludGVyKC8vcGVy\nc05hbWVbQGFubm90YXRpb25JZD0iZW50XzYyIl0pPC9yZGY6dmFsdWU+CgkJ\nCTxyZGY6dHlwZSByZGY6cmVzb3VyY2U9Imh0dHA6Ly93d3cudzMub3JnL25z\nL29hI0ZyYWdtZW50U2VsZWN0b3IiLz4KCQk8L3JkZjpEZXNjcmlwdGlvbj4K\nCTwvcmRmOlJERj4KCTx0ZWlIZWFkZXI+CgkJPGZpbGVEZXNjPgoJCQk8dGl0\nbGVTdG10PgoJCQkJPHRpdGxlPlNhbXBsZSBEb2N1bWVudCBUaXRsZTwvdGl0\nbGU+CgkJCTwvdGl0bGVTdG10PgoJCQk8cHVibGljYXRpb25TdG10PgoJCQkJ\nPHAvPgoJCQk8L3B1YmxpY2F0aW9uU3RtdD4KCQkJPHNvdXJjZURlc2Mgc2Ft\nZUFzPSJodHRwOi8vd3d3LmN3cmMuY2EiPgoJCQkJPHA+Q3JlYXRlZCBmcm9t\nIG9yaWdpbmFsIHJlc2VhcmNoIGJ5IG1lbWJlcnMgb2YgQ1dSQy9DU++/vUMg\ndW5sZXNzIG90aGVyd2lzZSBub3RlZC48L3A+CgkJCTwvc291cmNlRGVzYz4K\nCQk8L2ZpbGVEZXNjPgoJPC90ZWlIZWFkZXI+Cgk8dGV4dD4KCQk8Ym9keT4K\nCQkJPGRpdiB0eXBlPSJsZXR0ZXIiPgoJCQkJPGhlYWQ+CgkJCQkJPHRpdGxl\nPlNhbXBsZSBMZXR0ZXIgVGl0bGU8L3RpdGxlPgoJCQkJPC9oZWFkPgoJCQkJ\nPG9wZW5lcj4KCQkJCQk8bm90ZSB0eXBlPSJzZXR0aW5nIj4KCQkJCQkJPHA+\nU29tZSBvcGVuaW5nIG5vdGUgZGVzY3JpYmluZyB0aGUgd3JpdGluZyBzZXR0\naW5nPC9wPgoJCQkJCTwvbm90ZT4KCQkJCQk8ZGF0ZWxpbmU+CgkJCQkJCTxk\nYXRlPlNvbWUgZGF0ZSAoc2V0IGRhdGUgdmFsdWUgaW4gYXR0cmlidXRlKS48\nL2RhdGU+CgkJCQkJPC9kYXRlbGluZT4KCQkJCQk8c2FsdXRlPlNvbWUgc2Fs\ndXRhdGlvbiwgZS5nLiAiRGVhcmVzdCA8cGVyc05hbWUgYW5ub3RhdGlvbklk\nPSJlbnRfNjIiIGNlcnQ9ImRlZmluaXRlIiB0eXBlPSJyZWFsIiByZWY9Imh0\ndHA6Ly92aWFmLm9yZy92aWFmLzM5NTY5NzUyIj5NaXF1ZWw8L3BlcnNOYW1l\nPiI8L3NhbHV0ZT4KCQkJCTwvb3BlbmVyPgoJCQkJPHA+U2FtcGxlIGxldHRl\nciBjb250ZW50PC9wPgoJCQkJPGNsb3Nlcj4KCQkJCQk8c2FsdXRlPlNvbWUg\nY2xvc2luZyBzYWx1dGF0aW9uLCBlLmcuICJXaXRoIGxvdmUuLi4iPC9zYWx1\ndGU+CgkJCQkJPHNpZ25lZD5TZW5kZXIgbmFtZSBhbmQvb3Igc2lnbmF0dXJl\nLjwvc2lnbmVkPgoJCQkJPC9jbG9zZXI+CgkJCTwvZGl2PgoJCTwvYm9keT4K\nCTwvdGV4dD4KPC9URUk+\n',
        encoding: 'base64',
        _links: {
          self:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/contents/templates/letter.xml?ref=master',
          git:
            'https://api.github.com/repos/cwrc/CWRC-Writer-Templates/git/blobs/1525a783ddcd2844d75677d3748673d749c99963',
          html: 'https://github.com/cwrc/CWRC-Writer-Templates/blob/master/templates/letter.xml',
        },
      },
      [
        'Server',
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
        "default-src 'none'",
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
        'C6FB:DCFF:81252EB:A51FB15:58C76386',
      ]
    );
};

const getSearchNock = () => {
  return nock('https://api.github.com:443', { encodedQueryParams: true })
    .get('/search/code')
    .query({ q: 'test%20repo%3Alucaju%2Fmisc' })
    .reply(
      200,
      [
        '1f8b0800000000000003ab562ac92f49cc894fce2fcd2b51b232d051cacc4bcecf2dc8492d498d2f4a2d2ecd292956b24a4bcc294e054a95a4e60279d1b1b500c845f5b737000000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Thu, 03 Dec 2020 21:42:33 GMT',
        'Content-Type',
        'application/json; charset=utf-8',
        'Transfer-Encoding',
        'chunked',
        'Connection',
        'close',
        'Status',
        '200 OK',
        'Cache-Control',
        'no-cache',
        'Vary',
        'Accept, Authorization, Cookie, X-GitHub-OTP',
        'X-OAuth-Scopes',
        'repo, user, workflow',
        'X-Accepted-OAuth-Scopes',
        '',
        'X-GitHub-Media-Type',
        'github.v3; param=text-match',
        'X-RateLimit-Limit',
        '30',
        'X-RateLimit-Remaining',
        '29',
        'X-RateLimit-Reset',
        '1607031813',
        'X-RateLimit-Used',
        '1',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type, Deprecation, Sunset',
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
        "default-src 'none'",
        'Vary',
        'Accept-Encoding, Accept, X-Requested-With',
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        'C773:0F96:9E447:111817:5FC95BC9',
      ]
    );
};

const getRepoContentsByDrillDownBranchNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/repos/lucaju/misc/branches/master')
    .reply(
      200,
      [
        '1f8b0800000000000003ad576b57e23a14fd2b2cbeaad3774b5de3bd5304792854e4255c66b9d234a5c536c536058acbff7e938288cc8c439df18b8b267b679fe4ec7392e72206012a9e1703101314154f8b300c028f14cf9f8bb10be880e6e816521dc15100eff0bac2ab8e66db1274e87fc94148e555cd818a43a138b4d183675350ab32523ba24eaca1cfb7660dc1ec7552b30257e6cc0ecc61d36f07a3d57836705bb5d1d2ecf597f4b734ae75d62371248e67703d0e067e7b66886dfaab3d1c5dbcd30512e2861153b8d57e93400fe0b0701579eb358a009d8d02e0f954889f40304bbe05e80b8d8b7eb70161d18abcc89ff1c299a8f478e55c52ce057e5c7c790d9e6dc41b7bcd23f5c4dae3c46184e67efa6dea1137b18e230e501c83295bba3f671a0a04adc817b222949744880ebceeb7e8400d8802e2054193d512ef48bae248a204119454190abc0478',
        '5db3150a4c2216a24bc83c3ee73830f7bebc49e2a8c630e636f1738117438e0e726cad983b7a0dba259f5864934231972375180461f200c304d3e4e34f8b0b14798e0701f142cc7667f31bd1ec2251824e8b1102311b292e804f73eeb4187b530c4812b14d3e637fe56aadd12edcd66e0bdd46ad6df4fa77d5ecfb044ff0322ec3b261942f0da353ee34d1b56e9a9777e56bcd9dc9e6428a1a4bc3b0eb8d865111bb8f6eaaa9ba118632e61bc38656936fc2091ed4ad3eb0977ab565969ef486c97943a33e1d35bd0486772d636ac86aaa00602eb8596d70a321b278ace0206d38574f5a5b5b38137cef744be3c660908a46cb4d1b0b6b51e9724d8c6acb95660daffafdfbcaddd3bcbff6439beba657d075cab3d913b83aa972c274386e4f70a3dbbdac988996cec66a140c2a507db4b59ed8bdbfc1e3c7b297cae3a17535b86cdc998e8b4746a5df37bda4ecc274a549fcbad39960f76aac4acda95c4748e3d3f004d446a5d9ad0b2fe7e6d0f22c222ecd7a72c395e2909f065552f23571707322f0b3d0f12b9783d5043787d3be29d7a2e46625376bada053afc90e08cbd7b765a9eab79f6ad67d5399734a0cec9edbe7783ae571d83fe9b9d7a53a19762e26f8229c9b6082b3b3a9b62b3f3d317abe7390fa2160d5852571e1d81c9ee03988686a15345d85250195f892a04024ea22809a6653475902efe82524c9128f14871ecca6c0140ecb4ae1ebbb6af24f4150345d977845e00b67bcc2f313bcc97c5a3f0a9baa51f8fa63b1f8196e820fcbc24b7eeb7dc2762e09fc87f70edf2b21fbc56343fe094bc707fcbf2d5379c3e0b6b523a639f2d61afc70eab1eab089810eb1be24888aac49fafb4ed55107f76d1fceaa69bbd7915aeb47d66dc00210101d4acf3ec6e2b6cc26318a6088094d2ed604b884dbf2ffbbb89029c734dab2642df177f59ab1bdd66b3af79893a1d39cd0f7c325451e4a7ddf0cf6c9b91d6687f7f034379e629eb990b888ee1295fec202f66292474836ff99f6a598d06b036388e9fe46c8ce21668ba0529698aa78cefa5e469558318cbc39eb1f7944bdc3519e309a02ecadb33e948787e25846666d38473cd97c8a430b9a5679801bc033378fbc058029db820841e42de876e6263b40522e92ceb3db0b3d6ab6b91e410fc00e98c51ce0c7e8f0eef46abf25b2ce1c9aa1149319502fa9b22c6bbf70a06256467cbbd291e8f48f1c28fdda81db05fec0827b923f36e1dec45c367cc57dde88070c7f62c51dd51f9971c7f2f7ecf846b96fe4cf1872c794d7923b607e53eea07fc7967b4ade59fa28636eee3f71f1fcbfdd9beec8ab10a5cf79fddf35efe357f8d8643fbb831ccbfdf29d96a507dfc38f34781a3bf29d3cef252b0218baf4b9b47b1b33a97b0cbfb82ab1ebe92b860a9847214190b0974b562a775fb60f1b8481e5ef8d46e829f15813a45e2249fc4025c04d00083b610451f650f26962312da1c35eded9356445d8197f6737c7ed9a74858f5bcf8f8fc483a0693bc9d433ad2fff038c359ac42d100000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Mon, 27 Jan 2020 20:00:55 GMT',
        'Content-Type',
        'application/json; charset=utf-8',
        'Transfer-Encoding',
        'chunked',
        'Connection',
        'close',
        'Status',
        '200 OK',
        'X-RateLimit-Limit',
        '60',
        'X-RateLimit-Remaining',
        '56',
        'X-RateLimit-Reset',
        '1580158422',
        'Cache-Control',
        'public, max-age=60, s-maxage=60',
        'Vary',
        'Accept',
        'ETag',
        'W/"806b48ad0781aaf30246fb3dd0f798c5"',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        '9433:179B:7120B:C049D:5E2F4177',
      ]
    );
};

const getRepoContentsByDrillDownRootTreeNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/repos/lucaju/misc/git/trees/2fc7a21e01174680f395f323cec364c103a097d5')
    .reply(
      200,
      [
        '1f8b0800000000000003a5944d8bdb301086ff8bce5b5bd2e833b7c2ee712fbd961e349a51e3c5ae4d2c43da25ffbd0a94d0b217a741170dc3cba38711f32ed6631207a14bf6492b964a79e3822c106d010d99333893958424a3272b9ec4761a5be058ebb21efa3e2d43f77da8c70dbb3c4ffd899779edc72da7b7ad9f8635f7add9d713f3dadfc1b806c4e1ebbb58523d36da9797cfcfaf2fdd448d3fcdd47a4249e98c6975fdb95c6b1c676cd51f1da5adb3edbd902145321a2950bb17870610c124696cb6fa1a187eb5b8fb2faf2bb379ed855d9e6e4295874f34e7ee3c8d3b950cab441689d0151bda515ac9864ec1470590325acbd1aa9b12488007ac76f33e5ae93bb4a2ca8e404a8b8e31bae4bdcd9abdf70e922bdac498d8199d6f5a51',
        '69ff80d66ede472db843cba2549e3c9ae88261042d734160229db2892606238d062e7f69b947b476f3fed13ad7ae9eebce0f183563697b8002ba040ca4a23321b409e5481494b758c83abe2929fbc89cf6d22edfda0a386d3f72aa4ce250d2b8f2e537e8c2cc8ad7040000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Mon, 27 Jan 2020 20:00:55 GMT',
        'Content-Type',
        'application/json; charset=utf-8',
        'Transfer-Encoding',
        'chunked',
        'Connection',
        'close',
        'Status',
        '200 OK',
        'X-RateLimit-Limit',
        '60',
        'X-RateLimit-Remaining',
        '55',
        'X-RateLimit-Reset',
        '1580158422',
        'Cache-Control',
        'public, max-age=60, s-maxage=60',
        'Vary',
        'Accept',
        'ETag',
        'W/"55dedfe8210eeb22a951b65760f44b00"',
        'Last-Modified',
        'Sat, 25 Jan 2020 05:35:12 GMT',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        '8C1A:4A6B:15556:2B5D5:5E2F4177',
      ]
    );
};

const getReposByDrillDownSecondLevelNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/repos/jchartrand/aTest/git/trees/3ca6f7a46f5a7d777549022acd4c0febac4e96aa')
    .query({
      access_token: config.personal_oath_for_testing,
    })
    .reply(
      200,
      [
        '1f8b0800000000000003a5913d6fc3201086ff0b7314ce7006db73d5a963b7aac30147edca892d2055db28ffbd24559bb51fb7bd82472f0f771479243108edc9444b68624b36586b5bec4129f2013d4476e4917b432436e290e60a8ca5ac799092d669fb3495f1e0b67ed9c9c4eb92e5b31f299544fb20e99e7391f5862c8939cb5f149d01313c1cc54a65ac95743bcdbc2dafa53e62b7847a261a00835873795bcfd9cd8babe9d3497154c6b26a5d30de9006700ead6603e8a057ce1076add217607aaf78a3ff',
        '6e776ecef2c795a7cdb75666bfecc31dbff07c33a5ab1b20d4b9ba5dbee3cb2d605ba7e9b54202e6d0296b4137da5ab4bd6182d879eca2a9c0fff6f5e3a2d363dd423aec3d150e628834673e7d0072e710e25f020000',
      ],
      [
        'Server',
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
        "default-src 'none'",
        'X-Runtime-rack',
        '0.031467',
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        '284E:2B61:121E66F:2B7230A:5AE3235E',
      ]
    );
};

const getReposByDrillDownThirdLevelNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/repos/jchartrand/aTest/git/trees/d4555519324a0eed82770313774796ea0f8c48f6')
    .query({
      access_token: config.personal_oath_for_testing,
    })
    .reply(
      200,
      [
        '1f8b08000000000000039d8f416ec3201045efc2ba326008d83e40565d76177531c0503b720c021ca98d72f78ed50bb49ddd97fed3fbf360750636b1a04f747254bd06811886de5aa1a4b256dbd1208838783d44c35ed85e5602e6d6729d3887bc741f4b9b77d7f974e30573aafcea6728adc01638bc616d9c1abc15c4caff203a00365d1e2c439b4959d1a72dbce21dd7f3b26277ad69a33db714a8c6a410466bcaed331fd9adc951fa79af970e7aef2c686185544a19d451f51ec0fa53746a30ce8f9674042c5f',
        '842bf1ff470f73e5bf563edf6973d9370f0d039b22ac159fdff769a44098010000',
      ],
      [
        'Server',
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
        "default-src 'none'",
        'X-Runtime-rack',
        '0.039221',
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        '2506:2B61:121E674:2B7231F:5AE3235F',
      ]
    );
};

const getRepoContentsNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/repos/lucaju/misc/git/trees/2fc7a21e01174680f395f323cec364c103a097d5')
    .query({
      recursive: '1',
    })
    .reply(
      200,
      [
        '1f8b0800000000000003a5944d8bdb301086ff8bce5b5bd2e833b7c2ee712fbd961e349a51e3c5ae4d2c43da25ffbd0a94d0b217a741170dc3cba38711f32ed6631207a14bf6492b964a79e3822c106d010d99333893958424a3272b9ec4761a5be058ebb21efa3e2d43f77da8c70dbb3c4ffd899779edc72da7b7ad9f8635f7add9d713f3dadfc1b806c4e1ebbb58523d36da9797cfcfaf2fdd448d3fcdd47a4249e98c6975fdb95c6b1c676cd51f1da5adb3edbd902145321a2950bb17870610c124696cb6fa1a187eb5b8fb2faf2bb379ed855d9e6e4295874f34e7ee3c8d3b950cab441689d0151bda515ac9864ec1470590325acbd1aa9b12488007ac76f33e5ae93bb4a2ca8e404a8b8e31bae4bdcd9abdf70e922bdac498d8199d6f5a',
        '5169ff80d66ede472db843cba2549e3c9ae88261042d734160229db2892606238d062e7f69b947b476f3fed13ad7ae9eebce0f183563697b8002ba040ca4a23321b409e5481494b758c83abe2929fbc89cf6d22edfda0a386d3f72aa4ce250d2b8f2e537e8c2cc8ad7040000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Sat, 25 Jan 2020 06:07:42 GMT',
        'Content-Type',
        'application/json; charset=utf-8',
        'Transfer-Encoding',
        'chunked',
        'Connection',
        'close',
        'Status',
        '200 OK',
        'X-RateLimit-Limit',
        '60',
        'X-RateLimit-Remaining',
        '24',
        'X-RateLimit-Reset',
        '1579933721',
        'Cache-Control',
        'public, max-age=60, s-maxage=60',
        'Vary',
        'Accept',
        'ETag',
        'W/"55dedfe8210eeb22a951b65760f44b00"',
        'Last-Modified',
        'Sat, 25 Jan 2020 05:35:12 GMT',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        'A637:5522:7C531:153D6A:5E2BDB2E',
      ]
    );
};

const getCreateFileNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .put('/repos/lucaju/misc/contents/text10.txt', {
      message: 'some commit message',
      branch: 'dev',
      content:
        'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPFRFSSB4bWxucz0iaHR0cDovL3d3dy50ZWktYy5vcmcvbnMvMS4wIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmN3PSJodHRwOi8vY3dyYy5jYS9ucy9jdyMiIHhtbG5zOnc9Imh0dHA6Ly9jd3JjdGMuYXJ0c3JuLnVhbGJlcnRhLmNhLyMiPgoJPHRlaUhlYWRlcj4KCQk8ZmlsZURlc2M+CgkJCTx0aXRsZVN0bXQ+CgkJCQk8dGl0bGU+U2FtcGxlIERvY3VtZW50IFRpdGxlIHRlc3QgMTU4MDQ4MzUwNDwvdGl0bGU+CgkJCTwvdGl0bGVTdG10PgoJCQk8cHVibGljYXRpb25TdG10PgoJCQkJPHA+PC9wPgoJCQk8L3B1YmxpY2F0aW9uU3RtdD4KCQkJPHNvdXJjZURlc2Mgc2FtZUFzPSJodHRwOi8vd3d3LmN3cmMuY2EiPgoJCQkJPHA+Q3JlYXRlZCBmcm9tIG9yaWdpbmFsIHJlc2VhcmNoIGJ5IG1lbWJlcnMgb2YgQ1dSQy9DU8OJQyB1bmxlc3Mgb3RoZXJ3aXNlIG5vdGVkLjwvcD4KCQkJPC9zb3VyY2VEZXNjPgoJCTwvZmlsZURlc2M+Cgk8L3RlaUhlYWRlcj4KCTx0ZXh0PgoJCTxib2R5PgoJCQk8ZGl2IHR5cGU9ImxldHRlciI+CgkJCQk8aGVhZD4KCQkJCQk8dGl0bGU+U2FtcGxlIExldHRlciAtIEJlcnRyYW5kIFJ1c3NlbGwgdG8gPHBlcnNOYW1lIGFubm90YXRpb25JZD0iZW50XzczIiBjZXJ0PSJwcm9iYWJsZSIgcmVmPSIyNzkzOTkzOTkiPlBhdHJpY2lhIFNwZW5jZTwvcGVyc05hbWU+IC0gT2N0b2JlciAyMSwgMTkzNTwvdGl0bGU+CgkJCQk8L2hlYWQ+CgkJCQk8b3BlbmVyPgoJCQkJCTxub3RlPgoJCQkJCQk8cD5CYWQgd3JpdGluZyBkdWUgdG8gc2hha3kgdHJhaW48L3A+PHA+SW4gdHJhaW48L3A+PHA+CgkJCQkJCQk8cGxhY2VOYW1lIGFubm90YXRpb25JZD0iZW50XzE0MyIgY2VydD0iZGVmaW5pdGUiIHJlZj0iaHR0cDovL3d3dy5nZW9uYW1lcy5vcmcvNjQ1MzM2NiI+T3NsbzwvcGxhY2VOYW1lPiB0byBCZXJnZW48L3A+CgkJCQkJPC9ub3RlPgoJCQkJCTxkYXRlbGluZT4KCQkJCQkJPGRhdGUgYW5ub3RhdGlvbklkPSJlbnRfNjkiIGNlcnQ9ImRlZmluaXRlIiB3aGVuPSIxOTM1LTEwLTIxIj4yMS4xMC4zNTwvZGF0ZT4KCQkJCQk8L2RhdGVsaW5lPgoJCQkJCTxzYWx1dGU+RGVhcmVzdCAtPC9zYWx1dGU+CgkJCQk8L29wZW5lcj48cD5JIGhhdmUgaGFkIG5vPG5vdGUgYW5ub3RhdGlvbklkPSJlbnRfMTkwIiB0eXBlPSJyZXNlYXJjaE5vdGUiPgoJCQkJCQkJCTxwIHhtbG5zPSJodHRwOi8vd3d3LnRlaS1jLm9yZy9ucy8xLjAiPlNvbWUga2luZCBvZiBub3RlPC9wPgoJCQkJCQk8L25vdGU+IGxldHRlciBmcm9tIHlvdSBzaW5jZSBJIGxlZnQgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDUiIG9mZnNldElkPSJlbnRfMTQ1IiBjZXJ0PSJkZWZpbml0ZSIgcmVmPSJodHRwOi8vd3d3Lmdlb25hbWVzLm9yZy8yNjczNzIyIj5TdG9ja2hvbG08L3BsYWNlTmFtZT4sIGJ1dCBJIGhhZCBhIG5pY2Ugb25lIGZyb20gSm9obiBpbiBhbiBlbnZlbG9wZSB5b3UgaGFkIHNlbnQgaGltLiBJIGhhZCBzZW50IGhpbSBvbmUgYWRkcmVzc2VkIHRvIENvcGVuaGFnZW4gYnV0IGhlIGhhZG4ndCB1c2VkIGl0LjwvcD48cD5XaGVuIEkgcmVhY2hlZCBPc2xvIHllc3RlcmRheSBldmVuaW5nLCBCcnluanVsZiBCdWxsIHNob3VsZCBoYXZlIGJlZW4gdGhlcmUgdG8gbWVldCBtZSwgYnV0IHdhc24ndC4gSGUgaXMgbm90IG9uIHRoZSB0ZWxlcGhvbmUsIHNvIEkgdG9vayBhIHRheGkgdG8gaGlzIGFkZHJlc3MsIHdoaWNoIHR1cm5lZCBvdXQgdG8gYmUgYSBzdHVkZW50cycgY2x1YiB3aXRoIG5vIG9uZSBhYm91dCBvbiBTdW5kYXlzLCBzbyBJIHdlbnQgdG8gYSBob3RlbCBmZWVsaW5nIHJhdGhlciBub24tcGx1c3NlZC4gQnV0IHByZXNlbnRseSBoZSB0dXJuZWQgdXAuIEhlIGhhZCBnb3QgdGhlIDxwYiBuPSIyIj48L3BiPiB0aW1lIG9mIG15IGFycml2YWwgd3JvbmcsIGFuZCAKCQkJCQkJPGNob2ljZSBhbm5vdGF0aW9uSWQ9ImVudF82NSI+PHNpYyBhbm5vdGF0aW9uSWQ9ImVudF82NSI+d2hlbjwvc2ljPjxjb3JyIGFubm90YXRpb25JZD0iZW50XzY1Ij53aGVuPC9jb3JyPjwvY2hvaWNlPgoJCQkJCWhlIGhhZCBmb3VuZCBoZSBoYWQgbWlzc2VkIG1lIGhlIHBob25lZCB0byBldmVyeSBob3RlbCBpbiBPc2xvIHRpbGwgaGUgaGl0IG9uIHRoZSByaWdodCBvbmUuIEhlIGxlZnQgbWUgYXQgMTAsIGFuZCB0aGVuIEkgaGFkIHRvIGRvIGEgU3VuZGF5IFJlZmVyZWUgYXJ0aWNsZS4gVG9kYXkgbXkgam91cm5leSBsYXN0cyBmcm9tIDkgdGlsbCA5IC0gZm9ydHVuYXRlbHkgb25lIG9mIHRoZSBtb3N0IGJlYXV0aWZ1bCByYWlsd2F5IGpvdXJuZXlzIGluIHRoZSB3b3JsZC4gVG9tb3Jyb3cgSSBsZWN0dXJlIGF0IDxwbGFjZU5hbWUgYW5ub3RhdGlvbklkPSJlbnRfMTQ0IiBjZXJ0PSJkZWZpbml0ZSIgcmVmPSJodHRwOi8vd3d3Lmdlb25hbWVzLm9yZy82NTQ4NTI4Ij5CZXJnZW48L3BsYWNlTmFtZT4gdG8gdGhlIEFuZ2xvLU5vcndlZ2lhbiBTb2NpZXR5LiBOZXh0IGRheSBJIGdvIGJhY2sgdG8gT3NsbywgbGVjdHVyZSB0aGVyZSBGcmkuIGFuZCBTYXQuIGFuZCB0aGVuIHN0YXJ0IGZvciBob21lIHZpYSBCZXJnZW4uPC9wPgoJCQkJPHBiIG49IjMiPjwvcGI+CgkJCQk8cD5CdWxsIGlzIGEgbmljZSB5b3VuZyBtYW4gYnV0IGluY29tcGV0ZW50IC0gY2FuJ3QgcXVpdGUgc3RhbmQgdGhlIGNvbW11bmlzdHMsIGJ1dCBmaW5kcyB0aGUgc29jaWFsaXN0cyB0b28gbWlsZC48L3A+PHA+SSBhbSB1bmhhcHBpbHkgd29uZGVyaW5nIHdoYXQgeW91IGFyZSBmZWVsaW5nIGFib3V0IG1lLjwvcD4KCQkJCTxjbG9zZXI+CgkJCQkJPHNhbHV0ZT5JIGxvdmUgeW91IHZlcnkgbXVjaCAtPC9zYWx1dGU+CgkJCQkJPHNpZ25lZD4KCQkJCQkJPHBlcnNOYW1lIHNhbWVBcz0iaHR0cDovL3d3dy5mcmVlYmFzZS5jb20vdmlldy9lbi9iZXJ0cmFuZF9ydXNzZWxsIj4KCQkJCQkJCTxwZXJzTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xMDkiIGNlcnQ9ImRlZmluaXRlIiB0eXBlPSJyZWFsIiByZWY9Imh0dHA6Ly92aWFmLm9yZy92aWFmLzM2OTI0MTM3Ij5CPC9wZXJzTmFtZT4KCQkJCQkJPC9wZXJzTmFtZT4KCQkJCQk8L3NpZ25lZD4KCQkJCTwvY2xvc2VyPgoJCQk8L2Rpdj4KCQk8L2JvZHk+Cgk8L3RleHQ+CjwvVEVJPgo=',
    })
    .reply(
      201,
      {
        content: {
          name: 'text10.txt',
          path: 'text10.txt',
          sha: 'e5f345781ca3c2fd6df65bdedba803966cec0435',
          size: 3197,
          url: 'https://api.github.com/repos/lucaju/misc/contents/text10.txt?ref=dev',
          html_url: 'https://github.com/lucaju/misc/blob/dev/text10.txt',
          git_url:
            'https://api.github.com/repos/lucaju/misc/git/blobs/e5f345781ca3c2fd6df65bdedba803966cec0435',
          download_url: 'https://raw.githubusercontent.com/lucaju/misc/dev/text10.txt',
          type: 'file',
          _links: {
            self: 'https://api.github.com/repos/lucaju/misc/contents/text10.txt?ref=dev',
            git:
              'https://api.github.com/repos/lucaju/misc/git/blobs/e5f345781ca3c2fd6df65bdedba803966cec0435',
            html: 'https://github.com/lucaju/misc/blob/dev/text10.txt',
          },
        },
        commit: {
          sha: 'fd14548139ed6994432d5b772ef4a8df597e9ee4',
          node_id:
            'MDY6Q29tbWl0MjI1OTQyODcxOmZkMTQ1NDgxMzllZDY5OTQ0MzJkNWI3NzJlZjRhOGRmNTk3ZTllZTQ=',
          url:
            'https://api.github.com/repos/lucaju/misc/git/commits/fd14548139ed6994432d5b772ef4a8df597e9ee4',
          html_url:
            'https://github.com/lucaju/misc/commit/fd14548139ed6994432d5b772ef4a8df597e9ee4',
          author: {
            name: 'Luciano Frizzera',
            email: 'lucaju@me.com',
            date: '2020-01-31T15:11:48Z',
          },
          committer: {
            name: 'Luciano Frizzera',
            email: 'lucaju@me.com',
            date: '2020-01-31T15:11:48Z',
          },
          tree: {
            sha: 'c3edc1bc1a7cf84d09247f477b7a95a71da2707e',
            url:
              'https://api.github.com/repos/lucaju/misc/git/trees/c3edc1bc1a7cf84d09247f477b7a95a71da2707e',
          },
          message: 'some commit message',
          parents: [
            {
              sha: 'aa6a597fbcee6a4787d4f7c0a466d9fb6a47edca',
              url:
                'https://api.github.com/repos/lucaju/misc/git/commits/aa6a597fbcee6a4787d4f7c0a466d9fb6a47edca',
              html_url:
                'https://github.com/lucaju/misc/commit/aa6a597fbcee6a4787d4f7c0a466d9fb6a47edca',
            },
          ],
          verification: {
            verified: false,
            reason: 'unsigned',
            signature: null,
            payload: null,
          },
        },
      },
      [
        'Server',
        'GitHub.com',
        'Date',
        'Fri, 31 Jan 2020 15:11:49 GMT',
        'Content-Type',
        'application/json; charset=utf-8',
        'Content-Length',
        '1765',
        'Connection',
        'close',
        'Status',
        '201 Created',
        'X-RateLimit-Limit',
        '5000',
        'X-RateLimit-Remaining',
        '4998',
        'X-RateLimit-Reset',
        '1580487107',
        'Cache-Control',
        'private, max-age=60, s-maxage=60',
        'Vary',
        'Accept, Authorization, Cookie, X-GitHub-OTP',
        'ETag',
        '"80c76e597cc526c3dd705affbef9f952"',
        'X-OAuth-Scopes',
        'admin:repo_hook, repo',
        'X-Accepted-OAuth-Scopes',
        '',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'X-GitHub-Request-Id',
        'A909:0AB2:6A2E89:FDF7F1:5E3443B4',
      ]
    );
};

const getUpdateFileNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .put('/repos/lucaju/misc/contents/text.txt', {
      message: 'some commit message',
      sha: '30d74d258442c7c65512eafab474568dd706c430',
      branch: 'dev',
      content: 'dGVzdA==',
    })
    .reply(
      200,
      [
        '1f8b0800000000000003b5555b4fdb3014fe2b28cf85248e1d3795d0a6890d210daaa288299d26e4d8278dd35c2adbe152d4ff8e4d292abcac41dba3ed9cef9cef62e7c9e35d6ba035dee4c96b5903dec433f0604ecc83f146de8a99f2fd8e2e99dd880241b140648c31e294c784840858c1724c3189c742d020e6380a2c84966b0b8a475eaf6a5b591ab3d213df672b79b290a6ecf313de35be8255a7fdbae7aceafd466aeebfcea5fddd385f1414a702ee2c66699afaf63dde1ed63e4a5e77b96f8bde506cb5fdf443f15f87b125be83d2fe00e6a2bb6feb8e890fcd14bb7f65',
        'de6b50af345f44d81ffcc3cce671e5ac29640d96c16d2ddba5769669a88b7fa5aa253904ea539a38e7f69a1cecda6633b2496d1a37a265fd12c29814023322e238123c47982554105c70c219a23926406308c49859c1da4ec0ad14b6e8f22c8b672831f9af3ab8ac2ec2693a7b9c9ef187699585f3661664e9cdf2aacad6f3f32b79595d97d3542cafd2eb265bdf54597a1165d52c9ca71ccdd36fcbe9f9f7530b3e30d84eb72d15ed0fa07078e6b7e043b0596fca4eed3d013f7b2e59db1dfd5072bd06e52484864967dd36a45f1b7091b5fb8219974c14a0e038088fa3300dc904914980e6de9b6906fe0fba51609bef02c123103ccc79c8282fc6580409c2b4c094e6942584d150d86004d4dda04f78e67a69ffe01e967b035ab3855347770d1c6d7d39daedbad755d997d7dee3df3b06850831c1e3304a40c44982718404c92945506036160549282400f8730c76a91bd06570ea0ec6defc197977a064213933b26b9d8ddb35d87b5ab05ac3c853c0b43bf2fa56cb456b4fdc0f65d132d32bab6bdbd7b593f1d13db3dbe566b379068c1cc771d4060000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Fri, 31 Jan 2020 15:25:02 GMT',
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
        '1580487107',
        'Cache-Control',
        'private, max-age=60, s-maxage=60',
        'Vary',
        'Accept, Authorization, Cookie, X-GitHub-OTP',
        'ETag',
        'W/"67bdb1970ced6e166242630c44de0242"',
        'X-OAuth-Scopes',
        'admin:repo_hook, repo',
        'X-Accepted-OAuth-Scopes',
        '',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        '9A07:2207:68E982:F9BFFD:5E3446CD',
      ]
    );
};

const getUserBranchHeadNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/repos/lucaju/misc/git/ref/heads%2Fdev')
    .reply(
      200,
      [
        '1f8b08000000000000039d8e3d0f82301086ff4b67e3d9005248d8581c08d1a8ab81f680122a84162321fc77cfb839199777b8f7e3b9858d58b1f8ad161a2c9405850fb661f75ee14d2bb2b234db5fccd564ed81e7e7e39ca7f2999b53a7ea24a1e03476146a9c1b6c0c500c7a5b6bd74ce556',
        'f606461c7a0bdd248b7602a3ad0432e9fa05ebcb16a563f1c26c53d05ae85701e7611949f495aa228e3c10bef030e23b2f0c85507e8081e08477f380d42098d1eebf773e5d0b3f53d7f5057beda7b337010000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Sun, 23 Feb 2020 19:11:47 GMT',
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
        '1582488707',
        'Cache-Control',
        'private, max-age=60, s-maxage=60',
        'Vary',
        'Accept, Authorization, Cookie, X-GitHub-OTP',
        'ETag',
        'W/"b223c4f0acf5a47e5fbf1f75801c63f9"',
        'Last-Modified',
        'Tue, 11 Feb 2020 21:32:03 GMT',
        'X-Poll-Interval',
        '300',
        'X-OAuth-Scopes',
        'repo, user',
        'X-Accepted-OAuth-Scopes',
        'repo',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Vary',
        'Accept-Encoding, Accept, X-Requested-With',
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        '9F48:23F9:CEF175:1E8EEB3:5E52CE73',
      ]
    );
};

const getLatestFileSHANock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .post('/graphql', {
      query:
        '{\n\t\t\trepository(owner: "lucaju", name: "misc") {\n\t\t\t\tobject(expression: "dev:text.txt") {\n\t\t\t\t\t... on Blob {\n\t\t\t\t\t\toid\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}',
    })
    .reply(
      200,
      [
        '1f8b08000000000000031dc74b0e80200c00d1bbf404d8624cb94da16d821b0cb231c4bbfb99d59b092a43204de876b4b38ed6afef5adead8c5f552101bb9095d5990c97bca2b26eae82ac5e62268dc4843104b8df1e44b3d74655000000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Sun, 23 Feb 2020 19:11:48 GMT',
        'Content-Type',
        'application/json; charset=utf-8',
        'Transfer-Encoding',
        'chunked',
        'Connection',
        'close',
        'Status',
        '200 OK',
        'Cache-Control',
        'no-cache',
        'X-OAuth-Scopes',
        'repo, user',
        'X-Accepted-OAuth-Scopes',
        'repo',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'X-RateLimit-Limit',
        '5000',
        'X-RateLimit-Remaining',
        '4898',
        'X-RateLimit-Reset',
        '1582488637',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Vary',
        'Accept-Encoding, Accept, X-Requested-With',
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        'A52B:2AC5:168DF49:2BBF461:5E52CE73',
      ]
    );
};

const saveExistingFileNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .put('/repos/lucaju/misc/contents/text.txt', {
      message: 'some commit message',
      sha: '9fa3ec5f93e21b52d9d7fda29dfc4b3d43932400',
      branch: 'dev',
      content: 'dGVzdA==',
    })
    .reply(
      200,
      [
        '1f8b0800000000000003b5555d6bdb3014fd2bc5cf696c7dd8b203657bc8068339a19012dc318a2c5d27cafc112cb96d5cf2df2b354d49fbb2b86c8fbaf23df79e7b8eae9f3cd1d4066ae34d9ebc9a57e04d3c038f666c1e8d37f2b6dcacdf47f49adb000924a3128731a55830118521c2c00b9e5346c32896920591a024b0105af516948ebcae2d6de6da98ad9ef83edfaaf14a9975978f4553f92d6c1bed979de09bceaf9416fe6b5fda3fb6f3a585e24ac2bdc55c9baabc7b',
        '8f7782758a92974deedba437149b6d3ffd90fcd7666c8aefa0b43f80b96c1eeab2e1f243b1963fbc32ef34b4af345f8670daf8879ecd6eeba429540996c15da9ea3fda49a6a12cfed5542dc921509f9a8953eea4c8d9aaedf723ebd4aa722d5ad62f262c58088cc51822124504475102242605d0980b9188508808a190103bb0ba9170a7a44d4aa759748d13932fcb20ddfc40f3c5f56e3e158ff32a23b3e50d99f5abdded22eb679bac4f37199e2f6ffaf97456dd2eae69b69c6de6cb146538c5e9e21b4afbf4ca820f34b69bdb818af6075038dff307f021d8bc33eba63d59013f3ba178dd5c7c6f55df43cb2d4ba8b872d21d4cfab50267591b97dc3867e200079701bec46481920942131adf7a6fa219f83fe8a6055bfc68081cd280c605ce29c2b924326084052c0f3949804a09c001339eb0cf69e66a69ffec1a967b055af3959b8e6e2ab838e872718cbaeddadacd6bdff1af2303468b10219627c2355c240890ddb131810405c47a3d96348430469f637074dd802a835d7736f6fef7c8bb8756154a70a39adac97838837da7052f358cbc16b876575e576bb5aaed8dfba1ac6a6ebad6ceb5eecad28d71e7d6ece1b8dfef9f01c68a0bb8d4060000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Sun, 23 Feb 2020 19:11:49 GMT',
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
        '1582488707',
        'Cache-Control',
        'private, max-age=60, s-maxage=60',
        'Vary',
        'Accept, Authorization, Cookie, X-GitHub-OTP',
        'ETag',
        'W/"bacd0c0c9ed37021b674a5870c44af1f"',
        'X-OAuth-Scopes',
        'repo, user',
        'X-Accepted-OAuth-Scopes',
        '',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Vary',
        'Accept-Encoding, Accept, X-Requested-With',
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        '899B:1DA9:CD228F:1F0758A:5E52CE74',
      ]
    );
};

const findExistingPRNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/search/issues')
    .query({
      q: 'state%3Aopen%20type%3Apr%20repo%3Alucaju%2Fmisc%20head%3Adev',
    })
    .reply(
      200,
      [
        '1f8b0800000000000003a555ef4fdb3010fd572a7f863a494b2722a169d3d83eb58c8d6d880955ae734d0d8e9df947a18dfabfefec868a56da46d8a728f6bd77e7e7bbe78638ed989c72ed9523797a4484e2baaa2538981ab05e3a4bf239931670cb41857f3f1be28d2439593857db9c52568b7e29dcc2cffa88a5066a6da9f49cdd795a09cba9b0d683a5237244e2a670daaca6dd48102bd90ca4ed88db25a75b784315ab608374586b05cabd9ef08900b960f95f4c5b38f22c5c250f0ef84cd9e79ad65ecaa8a828487e323a494e4783747444942e601ad6c8f8c3f9e3857c9fce3e3d7ebdb9fe98de5c4f92f19aa7e3bb77e9783d5e2156f96a0686e48873c249405429b511dadb5e5ce8cdb5e97dfe82a1de86c086485d0a8571db5adafc6976327c3338ddcf7e39fa7e3d91fcee7c35b9ba1c8c',
        'd7f76718cd96cc3173788771d1666d1785545c2b8792c686f2b4e57fbb3c1b2247695a9678cc50dbdfda31b03db5e30b15c6b0b996523f20f2b0d4fd5e7f4e4e77981d5ea8b2331e310dd56e01a812961e3ab514f65f6dba57488c6f68f8602b04068bfa1a283a14d322b0940785553471ac23959f596e44ed84565dd4d9c3218f36255362cdbaf220ce223c1a4987f3c478c4bd6452f7c4dc021a5a1bb1647c152430c0412c51cece640748e472ab3a8cddb7305e282e7aec94155518b1e8ba9b27db43dfbd8df7e842b8ae4161b8d4fc1e70085a8366d68a5201062874071cb6f63f9836822b21c13aad76fb3b03cb13b44303c85d4c19be03244bb2e438c98ed3e15532ccb3619e643798cfd7c59f6206593e1c85182eb56d69da2abc5b6833c5623417f1ba31c1c58fc979b0956063f8d0fcc2f701f3767e59027cfbb0bcc2390b319f7731db7e00849a99e38b4ec088207897335dacf0f45657d00bea0bd7abc05a5642b87cae0dde4dda4f36b79bdf3819dd1d9a070000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Sun, 23 Feb 2020 19:11:50 GMT',
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
        '1582485170',
        'Cache-Control',
        'no-cache',
        'X-OAuth-Scopes',
        'repo, user',
        'X-Accepted-OAuth-Scopes',
        '',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Vary',
        'Accept-Encoding, Accept, X-Requested-With',
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        '9B37:477A:28A7F6:5DE59B:5E52CE75',
      ]
    );
};

const saveNewFileNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .put('/repos/lucaju/misc/contents/text15.txt', {
      message: 'some commit message',
      sha: 'b938e299c1bdc3fcdb68558538ee972a6a0fd9da',
      branch: 'dev',
      content:
        'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPFRFSSB4bWxucz0iaHR0cDovL3d3dy50ZWktYy5vcmcvbnMvMS4wIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmN3PSJodHRwOi8vY3dyYy5jYS9ucy9jdyMiIHhtbG5zOnc9Imh0dHA6Ly9jd3JjdGMuYXJ0c3JuLnVhbGJlcnRhLmNhLyMiPgoJPHRlaUhlYWRlcj4KCQk8ZmlsZURlc2M+CgkJCTx0aXRsZVN0bXQ+CgkJCQk8dGl0bGU+U2FtcGxlIERvY3VtZW50IFRpdGxlIHRlc3QgMTU4MjQ4NTg2MjwvdGl0bGU+CgkJCTwvdGl0bGVTdG10PgoJCQk8cHVibGljYXRpb25TdG10PgoJCQkJPHA+PC9wPgoJCQk8L3B1YmxpY2F0aW9uU3RtdD4KCQkJPHNvdXJjZURlc2Mgc2FtZUFzPSJodHRwOi8vd3d3LmN3cmMuY2EiPgoJCQkJPHA+Q3JlYXRlZCBmcm9tIG9yaWdpbmFsIHJlc2VhcmNoIGJ5IG1lbWJlcnMgb2YgQ1dSQy9DU8OJQyB1bmxlc3Mgb3RoZXJ3aXNlIG5vdGVkLjwvcD4KCQkJPC9zb3VyY2VEZXNjPgoJCTwvZmlsZURlc2M+Cgk8L3RlaUhlYWRlcj4KCTx0ZXh0PgoJCTxib2R5PgoJCQk8ZGl2IHR5cGU9ImxldHRlciI+CgkJCQk8aGVhZD4KCQkJCQk8dGl0bGU+U2FtcGxlIExldHRlciAtIEJlcnRyYW5kIFJ1c3NlbGwgdG8gPHBlcnNOYW1lIGFubm90YXRpb25JZD0iZW50XzczIiBjZXJ0PSJwcm9iYWJsZSIgcmVmPSIyNzkzOTkzOTkiPlBhdHJpY2lhIFNwZW5jZTwvcGVyc05hbWU+IC0gT2N0b2JlciAyMSwgMTkzNTwvdGl0bGU+CgkJCQk8L2hlYWQ+CgkJCQk8b3BlbmVyPgoJCQkJCTxub3RlPgoJCQkJCQk8cD5CYWQgd3JpdGluZyBkdWUgdG8gc2hha3kgdHJhaW48L3A+PHA+SW4gdHJhaW48L3A+PHA+CgkJCQkJCQk8cGxhY2VOYW1lIGFubm90YXRpb25JZD0iZW50XzE0MyIgY2VydD0iZGVmaW5pdGUiIHJlZj0iaHR0cDovL3d3dy5nZW9uYW1lcy5vcmcvNjQ1MzM2NiI+T3NsbzwvcGxhY2VOYW1lPiB0byBCZXJnZW48L3A+CgkJCQkJPC9ub3RlPgoJCQkJCTxkYXRlbGluZT4KCQkJCQkJPGRhdGUgYW5ub3RhdGlvbklkPSJlbnRfNjkiIGNlcnQ9ImRlZmluaXRlIiB3aGVuPSIxOTM1LTEwLTIxIj4yMS4xMC4zNTwvZGF0ZT4KCQkJCQk8L2RhdGVsaW5lPgoJCQkJCTxzYWx1dGU+RGVhcmVzdCAtPC9zYWx1dGU+CgkJCQk8L29wZW5lcj48cD5JIGhhdmUgaGFkIG5vPG5vdGUgYW5ub3RhdGlvbklkPSJlbnRfMTkwIiB0eXBlPSJyZXNlYXJjaE5vdGUiPgoJCQkJCQkJCTxwIHhtbG5zPSJodHRwOi8vd3d3LnRlaS1jLm9yZy9ucy8xLjAiPlNvbWUga2luZCBvZiBub3RlPC9wPgoJCQkJCQk8L25vdGU+IGxldHRlciBmcm9tIHlvdSBzaW5jZSBJIGxlZnQgPHBsYWNlTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xNDUiIG9mZnNldElkPSJlbnRfMTQ1IiBjZXJ0PSJkZWZpbml0ZSIgcmVmPSJodHRwOi8vd3d3Lmdlb25hbWVzLm9yZy8yNjczNzIyIj5TdG9ja2hvbG08L3BsYWNlTmFtZT4sIGJ1dCBJIGhhZCBhIG5pY2Ugb25lIGZyb20gSm9obiBpbiBhbiBlbnZlbG9wZSB5b3UgaGFkIHNlbnQgaGltLiBJIGhhZCBzZW50IGhpbSBvbmUgYWRkcmVzc2VkIHRvIENvcGVuaGFnZW4gYnV0IGhlIGhhZG4ndCB1c2VkIGl0LjwvcD48cD5XaGVuIEkgcmVhY2hlZCBPc2xvIHllc3RlcmRheSBldmVuaW5nLCBCcnluanVsZiBCdWxsIHNob3VsZCBoYXZlIGJlZW4gdGhlcmUgdG8gbWVldCBtZSwgYnV0IHdhc24ndC4gSGUgaXMgbm90IG9uIHRoZSB0ZWxlcGhvbmUsIHNvIEkgdG9vayBhIHRheGkgdG8gaGlzIGFkZHJlc3MsIHdoaWNoIHR1cm5lZCBvdXQgdG8gYmUgYSBzdHVkZW50cycgY2x1YiB3aXRoIG5vIG9uZSBhYm91dCBvbiBTdW5kYXlzLCBzbyBJIHdlbnQgdG8gYSBob3RlbCBmZWVsaW5nIHJhdGhlciBub24tcGx1c3NlZC4gQnV0IHByZXNlbnRseSBoZSB0dXJuZWQgdXAuIEhlIGhhZCBnb3QgdGhlIDxwYiBuPSIyIj48L3BiPiB0aW1lIG9mIG15IGFycml2YWwgd3JvbmcsIGFuZCAKCQkJCQkJPGNob2ljZSBhbm5vdGF0aW9uSWQ9ImVudF82NSI+PHNpYyBhbm5vdGF0aW9uSWQ9ImVudF82NSI+d2hlbjwvc2ljPjxjb3JyIGFubm90YXRpb25JZD0iZW50XzY1Ij53aGVuPC9jb3JyPjwvY2hvaWNlPgoJCQkJCWhlIGhhZCBmb3VuZCBoZSBoYWQgbWlzc2VkIG1lIGhlIHBob25lZCB0byBldmVyeSBob3RlbCBpbiBPc2xvIHRpbGwgaGUgaGl0IG9uIHRoZSByaWdodCBvbmUuIEhlIGxlZnQgbWUgYXQgMTAsIGFuZCB0aGVuIEkgaGFkIHRvIGRvIGEgU3VuZGF5IFJlZmVyZWUgYXJ0aWNsZS4gVG9kYXkgbXkgam91cm5leSBsYXN0cyBmcm9tIDkgdGlsbCA5IC0gZm9ydHVuYXRlbHkgb25lIG9mIHRoZSBtb3N0IGJlYXV0aWZ1bCByYWlsd2F5IGpvdXJuZXlzIGluIHRoZSB3b3JsZC4gVG9tb3Jyb3cgSSBsZWN0dXJlIGF0IDxwbGFjZU5hbWUgYW5ub3RhdGlvbklkPSJlbnRfMTQ0IiBjZXJ0PSJkZWZpbml0ZSIgcmVmPSJodHRwOi8vd3d3Lmdlb25hbWVzLm9yZy82NTQ4NTI4Ij5CZXJnZW48L3BsYWNlTmFtZT4gdG8gdGhlIEFuZ2xvLU5vcndlZ2lhbiBTb2NpZXR5LiBOZXh0IGRheSBJIGdvIGJhY2sgdG8gT3NsbywgbGVjdHVyZSB0aGVyZSBGcmkuIGFuZCBTYXQuIGFuZCB0aGVuIHN0YXJ0IGZvciBob21lIHZpYSBCZXJnZW4uPC9wPgoJCQkJPHBiIG49IjMiPjwvcGI+CgkJCQk8cD5CdWxsIGlzIGEgbmljZSB5b3VuZyBtYW4gYnV0IGluY29tcGV0ZW50IC0gY2FuJ3QgcXVpdGUgc3RhbmQgdGhlIGNvbW11bmlzdHMsIGJ1dCBmaW5kcyB0aGUgc29jaWFsaXN0cyB0b28gbWlsZC48L3A+PHA+SSBhbSB1bmhhcHBpbHkgd29uZGVyaW5nIHdoYXQgeW91IGFyZSBmZWVsaW5nIGFib3V0IG1lLjwvcD4KCQkJCTxjbG9zZXI+CgkJCQkJPHNhbHV0ZT5JIGxvdmUgeW91IHZlcnkgbXVjaCAtPC9zYWx1dGU+CgkJCQkJPHNpZ25lZD4KCQkJCQkJPHBlcnNOYW1lIHNhbWVBcz0iaHR0cDovL3d3dy5mcmVlYmFzZS5jb20vdmlldy9lbi9iZXJ0cmFuZF9ydXNzZWxsIj4KCQkJCQkJCTxwZXJzTmFtZSBhbm5vdGF0aW9uSWQ9ImVudF8xMDkiIGNlcnQ9ImRlZmluaXRlIiB0eXBlPSJyZWFsIiByZWY9Imh0dHA6Ly92aWFmLm9yZy92aWFmLzM2OTI0MTM3Ij5CPC9wZXJzTmFtZT4KCQkJCQkJPC9wZXJzTmFtZT4KCQkJCQk8L3NpZ25lZD4KCQkJCTwvY2xvc2VyPgoJCQk8L2Rpdj4KCQk8L2JvZHk+Cgk8L3RleHQ+CjwvVEVJPgo=',
    })
    .reply(
      200,
      [
        '1f8b0800000000000003b555596fd34010fe2b959fd37a777d47aa38d48240842828023908557b8c934d7d44de757354f9efcc362d84f2405de0d1e3cc37f31d9edc7ab2a92dd4d61bde7a35afc01b7a16369646677663bd81b7e276f1b866161c4b9486a91094ab30cc3246631a074ca671108a10582a621247499166118218bd43e08066c9c0ebda129b17d6aeccd0f7f94a9fcdb55d74e24c3695dfc2aa317ed949beecfc4a1be9dfaf67fc9f5bbd68a138577083c00b5b9557',
        'bf221ea11de388b2113e361de1603ffef851fb1f17c216df8119bf8700aa59d765c3d5a3612d5fdfb3ef0cb4f754ef84385efdb7aded76e57c2a7409c8e1aad4f5b571fe19288b7fa72d12ed03f62c5d9c7f47437a78b7df0f30ba55e59644e67789242428a2540084711c4929090b59112a1e27098d8052596494089ea06875a3e04a2b6c1a5de4f18465567c29c968f98e8ea793edf8426ec6cb57eb11cbe9f8edfb72369db08fcbcfcb9c8dd6a3e5643b5b7ebacea779f071774967d3cb4dcef268347dadf3a93c47f09e1177ca1da818bf0785a767ff00de079b7776d1b44737e1432735af9b9337addeeda0e5c8122aae9d7987a8beacc00517eb8a5b974e46183925ec9405539a0d59380cc8ccfb619a85ff836e5bc0e10f8128128813c538249247854aa9a084610028154a4a91128ef584a8e779e66619ffc933907b05c6f0b953c734159c1c7c3979a8ba63dbe229c66ff9eb038328080319a5b208d314a98820244a4624cc2052492a520e2a2092ba23fb17a9eb31a577ea9e8cbdff36f06ea0d58596dceaa676361e9e01bfd3829706065e0bdcb8575e571b3daff18dfb7799d7dc762dea5a7765e964dcba637b78dceff7df018b3dc564e5060000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Sun, 23 Feb 2020 19:24:30 GMT',
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
        '1582488707',
        'Cache-Control',
        'private, max-age=60, s-maxage=60',
        'Vary',
        'Accept, Authorization, Cookie, X-GitHub-OTP',
        'ETag',
        'W/"315e75631830663120f7ba67fbcc7f89"',
        'X-OAuth-Scopes',
        'repo, user',
        'X-Accepted-OAuth-Scopes',
        '',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Vary',
        'Accept-Encoding, Accept, X-Requested-With',
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        '8A3D:0872:434554:9E9B30:5E52D16E',
      ]
    );
};

const getLatestFileSHANockForNew = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .post('/graphql', {
      query:
        '{\n\t\t\trepository(owner: "lucaju", name: "misc") {\n\t\t\t\tobject(expression: "dev:text15.txt") {\n\t\t\t\t\t... on Blob {\n\t\t\t\t\t\toid\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}',
    })
    .reply(
      200,
      [
        '1f8b08000000000000031d88c90d802010007bd90a1482b274b317097e30c8c7107b179dd7cc0c50ea046940b3b35ea5d7767f55f930e9bf1585048c3e9a439495557c16e52d8610c3bc86bba38d96aca804cfe405eb1f812455000000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Sun, 23 Feb 2020 19:24:29 GMT',
        'Content-Type',
        'application/json; charset=utf-8',
        'Transfer-Encoding',
        'chunked',
        'Connection',
        'close',
        'Status',
        '200 OK',
        'Cache-Control',
        'no-cache',
        'X-OAuth-Scopes',
        'repo, user',
        'X-Accepted-OAuth-Scopes',
        'repo',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'X-RateLimit-Limit',
        '5000',
        'X-RateLimit-Remaining',
        '4896',
        'X-RateLimit-Reset',
        '1582488637',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Vary',
        'Accept-Encoding, Accept, X-Requested-With',
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        'A1EF:4A82:69DC29:10B4C12:5E52D16D',
      ]
    );
};

const pullRequestNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .post('/repos/lucaju/misc/pulls', {
      title: 'glorious title for PR',
      head: 'dev',
      base: 'master',
      body: 'some commit message',
    })
    .reply(
      201,
      {
        url: 'https://api.github.com/repos/lucaju/misc/pulls/6',
        id: 375205332,
        node_id: 'MDExOlB1bGxSZXF1ZXN0Mzc1MjA1MzMy',
        html_url: 'https://github.com/lucaju/misc/pull/6',
        diff_url: 'https://github.com/lucaju/misc/pull/6.diff',
        patch_url: 'https://github.com/lucaju/misc/pull/6.patch',
        issue_url: 'https://api.github.com/repos/lucaju/misc/issues/6',
        number: 6,
        state: 'open',
        locked: false,
        title: 'glorious title for PR',
        user: {
          login: 'lucaju',
          id: 1254739,
          node_id: 'MDQ6VXNlcjEyNTQ3Mzk=',
          avatar_url: 'https://avatars2.githubusercontent.com/u/1254739?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/lucaju',
          html_url: 'https://github.com/lucaju',
          followers_url: 'https://api.github.com/users/lucaju/followers',
          following_url: 'https://api.github.com/users/lucaju/following{/other_user}',
          gists_url: 'https://api.github.com/users/lucaju/gists{/gist_id}',
          starred_url: 'https://api.github.com/users/lucaju/starred{/owner}{/repo}',
          subscriptions_url: 'https://api.github.com/users/lucaju/subscriptions',
          organizations_url: 'https://api.github.com/users/lucaju/orgs',
          repos_url: 'https://api.github.com/users/lucaju/repos',
          events_url: 'https://api.github.com/users/lucaju/events{/privacy}',
          received_events_url: 'https://api.github.com/users/lucaju/received_events',
          type: 'User',
          site_admin: false,
        },
        body: 'some commit message',
        created_at: '2020-02-14T04:24:02Z',
        updated_at: '2020-02-14T04:24:02Z',
        closed_at: null,
        merged_at: null,
        merge_commit_sha: null,
        assignee: null,
        assignees: [],
        requested_reviewers: [],
        requested_teams: [],
        labels: [],
        milestone: null,
        commits_url: 'https://api.github.com/repos/lucaju/misc/pulls/6/commits',
        review_comments_url: 'https://api.github.com/repos/lucaju/misc/pulls/6/comments',
        review_comment_url: 'https://api.github.com/repos/lucaju/misc/pulls/comments{/number}',
        comments_url: 'https://api.github.com/repos/lucaju/misc/issues/6/comments',
        statuses_url:
          'https://api.github.com/repos/lucaju/misc/statuses/4fe6ae80a0676d67b25102eadd39c69cd364e8f0',
        head: {
          label: 'lucaju:dev',
          ref: 'dev',
          sha: '4fe6ae80a0676d67b25102eadd39c69cd364e8f0',
          user: {
            login: 'lucaju',
            id: 1254739,
            node_id: 'MDQ6VXNlcjEyNTQ3Mzk=',
            avatar_url: 'https://avatars2.githubusercontent.com/u/1254739?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/lucaju',
            html_url: 'https://github.com/lucaju',
            followers_url: 'https://api.github.com/users/lucaju/followers',
            following_url: 'https://api.github.com/users/lucaju/following{/other_user}',
            gists_url: 'https://api.github.com/users/lucaju/gists{/gist_id}',
            starred_url: 'https://api.github.com/users/lucaju/starred{/owner}{/repo}',
            subscriptions_url: 'https://api.github.com/users/lucaju/subscriptions',
            organizations_url: 'https://api.github.com/users/lucaju/orgs',
            repos_url: 'https://api.github.com/users/lucaju/repos',
            events_url: 'https://api.github.com/users/lucaju/events{/privacy}',
            received_events_url: 'https://api.github.com/users/lucaju/received_events',
            type: 'User',
            site_admin: false,
          },
          repo: {
            id: 225942871,
            node_id: 'MDEwOlJlcG9zaXRvcnkyMjU5NDI4NzE=',
            name: 'misc',
            full_name: 'lucaju/misc',
            private: false,
            owner: {
              login: 'lucaju',
              id: 1254739,
              node_id: 'MDQ6VXNlcjEyNTQ3Mzk=',
              avatar_url: 'https://avatars2.githubusercontent.com/u/1254739?v=4',
              gravatar_id: '',
              url: 'https://api.github.com/users/lucaju',
              html_url: 'https://github.com/lucaju',
              followers_url: 'https://api.github.com/users/lucaju/followers',
              following_url: 'https://api.github.com/users/lucaju/following{/other_user}',
              gists_url: 'https://api.github.com/users/lucaju/gists{/gist_id}',
              starred_url: 'https://api.github.com/users/lucaju/starred{/owner}{/repo}',
              subscriptions_url: 'https://api.github.com/users/lucaju/subscriptions',
              organizations_url: 'https://api.github.com/users/lucaju/orgs',
              repos_url: 'https://api.github.com/users/lucaju/repos',
              events_url: 'https://api.github.com/users/lucaju/events{/privacy}',
              received_events_url: 'https://api.github.com/users/lucaju/received_events',
              type: 'User',
              site_admin: false,
            },
            html_url: 'https://github.com/lucaju/misc',
            description: null,
            fork: false,
            url: 'https://api.github.com/repos/lucaju/misc',
            forks_url: 'https://api.github.com/repos/lucaju/misc/forks',
            keys_url: 'https://api.github.com/repos/lucaju/misc/keys{/key_id}',
            collaborators_url:
              'https://api.github.com/repos/lucaju/misc/collaborators{/collaborator}',
            teams_url: 'https://api.github.com/repos/lucaju/misc/teams',
            hooks_url: 'https://api.github.com/repos/lucaju/misc/hooks',
            issue_events_url: 'https://api.github.com/repos/lucaju/misc/issues/events{/number}',
            events_url: 'https://api.github.com/repos/lucaju/misc/events',
            assignees_url: 'https://api.github.com/repos/lucaju/misc/assignees{/user}',
            branches_url: 'https://api.github.com/repos/lucaju/misc/branches{/branch}',
            tags_url: 'https://api.github.com/repos/lucaju/misc/tags',
            blobs_url: 'https://api.github.com/repos/lucaju/misc/git/blobs{/sha}',
            git_tags_url: 'https://api.github.com/repos/lucaju/misc/git/tags{/sha}',
            git_refs_url: 'https://api.github.com/repos/lucaju/misc/git/refs{/sha}',
            trees_url: 'https://api.github.com/repos/lucaju/misc/git/trees{/sha}',
            statuses_url: 'https://api.github.com/repos/lucaju/misc/statuses/{sha}',
            languages_url: 'https://api.github.com/repos/lucaju/misc/languages',
            stargazers_url: 'https://api.github.com/repos/lucaju/misc/stargazers',
            contributors_url: 'https://api.github.com/repos/lucaju/misc/contributors',
            subscribers_url: 'https://api.github.com/repos/lucaju/misc/subscribers',
            subscription_url: 'https://api.github.com/repos/lucaju/misc/subscription',
            commits_url: 'https://api.github.com/repos/lucaju/misc/commits{/sha}',
            git_commits_url: 'https://api.github.com/repos/lucaju/misc/git/commits{/sha}',
            comments_url: 'https://api.github.com/repos/lucaju/misc/comments{/number}',
            issue_comment_url: 'https://api.github.com/repos/lucaju/misc/issues/comments{/number}',
            contents_url: 'https://api.github.com/repos/lucaju/misc/contents/{+path}',
            compare_url: 'https://api.github.com/repos/lucaju/misc/compare/{base}...{head}',
            merges_url: 'https://api.github.com/repos/lucaju/misc/merges',
            archive_url: 'https://api.github.com/repos/lucaju/misc/{archive_format}{/ref}',
            downloads_url: 'https://api.github.com/repos/lucaju/misc/downloads',
            issues_url: 'https://api.github.com/repos/lucaju/misc/issues{/number}',
            pulls_url: 'https://api.github.com/repos/lucaju/misc/pulls{/number}',
            milestones_url: 'https://api.github.com/repos/lucaju/misc/milestones{/number}',
            notifications_url:
              'https://api.github.com/repos/lucaju/misc/notifications{?since,all,participating}',
            labels_url: 'https://api.github.com/repos/lucaju/misc/labels{/name}',
            releases_url: 'https://api.github.com/repos/lucaju/misc/releases{/id}',
            deployments_url: 'https://api.github.com/repos/lucaju/misc/deployments',
            created_at: '2019-12-04T19:36:29Z',
            updated_at: '2020-02-11T21:32:03Z',
            pushed_at: '2020-02-14T04:24:01Z',
            git_url: 'git://github.com/lucaju/misc.git',
            ssh_url: 'git@github.com:lucaju/misc.git',
            clone_url: 'https://github.com/lucaju/misc.git',
            svn_url: 'https://github.com/lucaju/misc',
            homepage: null,
            size: 48,
            stargazers_count: 0,
            watchers_count: 0,
            language: null,
            has_issues: true,
            has_projects: true,
            has_downloads: true,
            has_wiki: true,
            has_pages: false,
            forks_count: 0,
            mirror_url: null,
            archived: false,
            disabled: false,
            open_issues_count: 1,
            license: null,
            forks: 0,
            open_issues: 1,
            watchers: 0,
            default_branch: 'master',
          },
        },
        base: {
          label: 'lucaju:master',
          ref: 'master',
          sha: 'abf8c58e9b4e5d8e8ae53a4d98c20bffb3141835',
          user: {
            login: 'lucaju',
            id: 1254739,
            node_id: 'MDQ6VXNlcjEyNTQ3Mzk=',
            avatar_url: 'https://avatars2.githubusercontent.com/u/1254739?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/lucaju',
            html_url: 'https://github.com/lucaju',
            followers_url: 'https://api.github.com/users/lucaju/followers',
            following_url: 'https://api.github.com/users/lucaju/following{/other_user}',
            gists_url: 'https://api.github.com/users/lucaju/gists{/gist_id}',
            starred_url: 'https://api.github.com/users/lucaju/starred{/owner}{/repo}',
            subscriptions_url: 'https://api.github.com/users/lucaju/subscriptions',
            organizations_url: 'https://api.github.com/users/lucaju/orgs',
            repos_url: 'https://api.github.com/users/lucaju/repos',
            events_url: 'https://api.github.com/users/lucaju/events{/privacy}',
            received_events_url: 'https://api.github.com/users/lucaju/received_events',
            type: 'User',
            site_admin: false,
          },
          repo: {
            id: 225942871,
            node_id: 'MDEwOlJlcG9zaXRvcnkyMjU5NDI4NzE=',
            name: 'misc',
            full_name: 'lucaju/misc',
            private: false,
            owner: {
              login: 'lucaju',
              id: 1254739,
              node_id: 'MDQ6VXNlcjEyNTQ3Mzk=',
              avatar_url: 'https://avatars2.githubusercontent.com/u/1254739?v=4',
              gravatar_id: '',
              url: 'https://api.github.com/users/lucaju',
              html_url: 'https://github.com/lucaju',
              followers_url: 'https://api.github.com/users/lucaju/followers',
              following_url: 'https://api.github.com/users/lucaju/following{/other_user}',
              gists_url: 'https://api.github.com/users/lucaju/gists{/gist_id}',
              starred_url: 'https://api.github.com/users/lucaju/starred{/owner}{/repo}',
              subscriptions_url: 'https://api.github.com/users/lucaju/subscriptions',
              organizations_url: 'https://api.github.com/users/lucaju/orgs',
              repos_url: 'https://api.github.com/users/lucaju/repos',
              events_url: 'https://api.github.com/users/lucaju/events{/privacy}',
              received_events_url: 'https://api.github.com/users/lucaju/received_events',
              type: 'User',
              site_admin: false,
            },
            html_url: 'https://github.com/lucaju/misc',
            description: null,
            fork: false,
            url: 'https://api.github.com/repos/lucaju/misc',
            forks_url: 'https://api.github.com/repos/lucaju/misc/forks',
            keys_url: 'https://api.github.com/repos/lucaju/misc/keys{/key_id}',
            collaborators_url:
              'https://api.github.com/repos/lucaju/misc/collaborators{/collaborator}',
            teams_url: 'https://api.github.com/repos/lucaju/misc/teams',
            hooks_url: 'https://api.github.com/repos/lucaju/misc/hooks',
            issue_events_url: 'https://api.github.com/repos/lucaju/misc/issues/events{/number}',
            events_url: 'https://api.github.com/repos/lucaju/misc/events',
            assignees_url: 'https://api.github.com/repos/lucaju/misc/assignees{/user}',
            branches_url: 'https://api.github.com/repos/lucaju/misc/branches{/branch}',
            tags_url: 'https://api.github.com/repos/lucaju/misc/tags',
            blobs_url: 'https://api.github.com/repos/lucaju/misc/git/blobs{/sha}',
            git_tags_url: 'https://api.github.com/repos/lucaju/misc/git/tags{/sha}',
            git_refs_url: 'https://api.github.com/repos/lucaju/misc/git/refs{/sha}',
            trees_url: 'https://api.github.com/repos/lucaju/misc/git/trees{/sha}',
            statuses_url: 'https://api.github.com/repos/lucaju/misc/statuses/{sha}',
            languages_url: 'https://api.github.com/repos/lucaju/misc/languages',
            stargazers_url: 'https://api.github.com/repos/lucaju/misc/stargazers',
            contributors_url: 'https://api.github.com/repos/lucaju/misc/contributors',
            subscribers_url: 'https://api.github.com/repos/lucaju/misc/subscribers',
            subscription_url: 'https://api.github.com/repos/lucaju/misc/subscription',
            commits_url: 'https://api.github.com/repos/lucaju/misc/commits{/sha}',
            git_commits_url: 'https://api.github.com/repos/lucaju/misc/git/commits{/sha}',
            comments_url: 'https://api.github.com/repos/lucaju/misc/comments{/number}',
            issue_comment_url: 'https://api.github.com/repos/lucaju/misc/issues/comments{/number}',
            contents_url: 'https://api.github.com/repos/lucaju/misc/contents/{+path}',
            compare_url: 'https://api.github.com/repos/lucaju/misc/compare/{base}...{head}',
            merges_url: 'https://api.github.com/repos/lucaju/misc/merges',
            archive_url: 'https://api.github.com/repos/lucaju/misc/{archive_format}{/ref}',
            downloads_url: 'https://api.github.com/repos/lucaju/misc/downloads',
            issues_url: 'https://api.github.com/repos/lucaju/misc/issues{/number}',
            pulls_url: 'https://api.github.com/repos/lucaju/misc/pulls{/number}',
            milestones_url: 'https://api.github.com/repos/lucaju/misc/milestones{/number}',
            notifications_url:
              'https://api.github.com/repos/lucaju/misc/notifications{?since,all,participating}',
            labels_url: 'https://api.github.com/repos/lucaju/misc/labels{/name}',
            releases_url: 'https://api.github.com/repos/lucaju/misc/releases{/id}',
            deployments_url: 'https://api.github.com/repos/lucaju/misc/deployments',
            created_at: '2019-12-04T19:36:29Z',
            updated_at: '2020-02-11T21:32:03Z',
            pushed_at: '2020-02-14T04:24:01Z',
            git_url: 'git://github.com/lucaju/misc.git',
            ssh_url: 'git@github.com:lucaju/misc.git',
            clone_url: 'https://github.com/lucaju/misc.git',
            svn_url: 'https://github.com/lucaju/misc',
            homepage: null,
            size: 48,
            stargazers_count: 0,
            watchers_count: 0,
            language: null,
            has_issues: true,
            has_projects: true,
            has_downloads: true,
            has_wiki: true,
            has_pages: false,
            forks_count: 0,
            mirror_url: null,
            archived: false,
            disabled: false,
            open_issues_count: 1,
            license: null,
            forks: 0,
            open_issues: 1,
            watchers: 0,
            default_branch: 'master',
          },
        },
        _links: {
          self: {
            href: 'https://api.github.com/repos/lucaju/misc/pulls/6',
          },
          html: {
            href: 'https://github.com/lucaju/misc/pull/6',
          },
          issue: {
            href: 'https://api.github.com/repos/lucaju/misc/issues/6',
          },
          comments: {
            href: 'https://api.github.com/repos/lucaju/misc/issues/6/comments',
          },
          review_comments: {
            href: 'https://api.github.com/repos/lucaju/misc/pulls/6/comments',
          },
          review_comment: {
            href: 'https://api.github.com/repos/lucaju/misc/pulls/comments{/number}',
          },
          commits: {
            href: 'https://api.github.com/repos/lucaju/misc/pulls/6/commits',
          },
          statuses: {
            href:
              'https://api.github.com/repos/lucaju/misc/statuses/4fe6ae80a0676d67b25102eadd39c69cd364e8f0',
          },
        },
        author_association: 'OWNER',
        merged: false,
        mergeable: null,
        rebaseable: null,
        mergeable_state: 'unknown',
        merged_by: null,
        comments: 0,
        review_comments: 0,
        maintainer_can_modify: false,
        commits: 56,
        additions: 438,
        deletions: 46,
        changed_files: 9,
      },
      [
        'Server',
        'GitHub.com',
        'Date',
        'Fri, 14 Feb 2020 04:24:03 GMT',
        'Content-Type',
        'application/json; charset=utf-8',
        'Content-Length',
        '13716',
        'Connection',
        'close',
        'Status',
        '201 Created',
        'X-RateLimit-Limit',
        '5000',
        'X-RateLimit-Remaining',
        '4997',
        'X-RateLimit-Reset',
        '1581657838',
        'Cache-Control',
        'private, max-age=60, s-maxage=60',
        'Vary',
        'Accept, Authorization, Cookie, X-GitHub-OTP',
        'ETag',
        '"3b14233a24ab60ed3865485c8d77f0cb"',
        'X-OAuth-Scopes',
        'repo, user',
        'X-Accepted-OAuth-Scopes',
        '',
        'Location',
        'https://api.github.com/repos/lucaju/misc/pulls/6',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Vary',
        'Accept-Encoding, Accept, X-Requested-With',
        'X-GitHub-Request-Id',
        'BBC9:2C00:73B961:11D4FDF:5E4620E2',
      ]
    );
};

const missingSHANock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .post('/graphql', {
      query:
        '{\n\t\t\trepository(owner: "lucaju", name: "misc") {\n\t\t\t\tobject(expression: "dev:text.txt") {\n\t\t\t\t\t... on Blob {\n\t\t\t\t\t\toid\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}',
    })
    .reply(
      200,
      [
        '1f8b08000000000000031dc7490e80200c40d1bbf404282dd36da02d096e30c8c618efeef057ef5f20796648170cddfbd1661fe777bd6ccaf357134880265b442647a431b2776a4309240b6325e363095857b402f7db03d38e8a3c55000000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Tue, 28 Jan 2020 05:47:59 GMT',
        'Content-Type',
        'application/json; charset=utf-8',
        'Transfer-Encoding',
        'chunked',
        'Connection',
        'close',
        'Status',
        '200 OK',
        'Cache-Control',
        'no-cache',
        'X-OAuth-Scopes',
        'admin:repo_hook, repo',
        'X-Accepted-OAuth-Scopes',
        'repo',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'X-RateLimit-Limit',
        '5000',
        'X-RateLimit-Remaining',
        '4992',
        'X-RateLimit-Reset',
        '1580190622',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        'B75F:14EE:1149C6:1D3FBC:5E2FCB0F',
      ]
    );
};

const missingBranchNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/repos/jchartrand/aTest/git/refs/heads/hote')
    .query({
      access_token: config.personal_oath_for_testing,
    })
    .reply(
      404,
      [
        '1f8b08000000000000030dc9310e80201005d1ab98b555b7b0f300965ec1207cd14458038b8df1eed2cdcbbc1490b3f1a08916d16696121d75e4c49680a8464f896b4957fd87ea9d2766870797dc48833ff528db6025f033721527ec995b0fed4d5f1b09d182be1f2ef525fe67000000',
      ],
      [
        'Server',
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
        "default-src 'none'",
        'X-Runtime-rack',
        '0.038495',
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        'B458:3F8C:7397D6:FD2598:5B07144E',
      ]
    );
};

const missingPRNock = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/search/issues')
    .query({
      q: 'state%3Aopen%20type%3Apr%20repo%3Alucaju%2Fmisc%20head%3Adev',
    })
    .reply(
      200,
      [
        '1f8b0800000000000003a5555d4fdb3014fd2b959f4bdd86964124346d82eda9656c6c634c28729ddbd4e0d8993f0a6dd4ffbe6b3754b40f8cb0a728f63de75e1fdf7b5c13a71d9319d75e39920eba4428aecb4a8283cc80f5d25992ce98b4805b0e4afcfb5d136f2449c9dcb9caa694b24af40ae1e67eda432c3550694ba5e7ecced352584e85b51e2c1d922e899bc269b3ccda912056b22948db12b74d4e37f09a2a56c21ae9b0d612947b3be1130172c1e2bf983670e499bb52ee1df099b2cf35adbc94515191937474941c9f8c92937e97289d4316d6c8f8ecfcf1427e1c4c3f3f7ebbb9fe34b8b99ef4c72bbe9a9c7d188daf7e2d11ab7c390543d2619738e12420aa90da08ed6d272e7466da74be7cc5506f43604da42e84c2b84d2d4dfe41321abe3b3cd9cd7e79f4e37a',
        '22f9ddf972727579385edd9f62345b30c7ccfe1dc6459b345d145271ad1c4a1a1bcad386fffde2349cb8300d4b3c66a8eda5760c6c4fedf84a85316ca6a5d40f88dc2f75b7d79f93d32d668b17aa688d474c4db59b03aa84a5874e2d84fd579bee1412e36b1a3ed80a81c1a2be06f216c534082ce5416115751ceb48e5a7961b5139a1551b757670c8a34dc19458b1b63c88b3088f46d2e23c311e71af99d41d3137809a56462c185f06090c70100b94b335d91e12b9dcb20a63f73d8c178a8b1e9bb1bc0c23165d77fd647be8bbb7f11e5d08d715280c979adf030e4163d0cc5a5128c00085ee80c3d6fc07d34670292458a7d5767f6b60291a073780dc79c6f01d20493fe91ff4938341ff2a394c87499a0c6f309faff297628e430c97da36344d15decdb5c9b018cd45bc6e4c70f173721e6c25d8183e347ff07dc0bcad5f9600df3c2c6f70ce5ccc666dccb61700a166e6f8bc15302208dee554e74b3cbdd5257482fac2754ab09615102e9f6b837733e8f5d7b7ebbf962454cb9a070000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Mon, 10 Feb 2020 23:43:08 GMT',
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
        '27',
        'X-RateLimit-Reset',
        '1581378204',
        'Cache-Control',
        'no-cache',
        'X-OAuth-Scopes',
        'delete_repo, notifications, repo, user',
        'X-Accepted-OAuth-Scopes',
        '',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Vary',
        'Accept-Encoding, Accept',
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        'B7D7:5FF4:2D499:6D617:5E41EA8B',
      ]
    );
};

const createBranchFromMasterGetMaster = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/repos/jchartrand/aTest/branches/master')
    .query({
      access_token: config.personal_oath_for_testing,
    })
    .reply(
      200,
      [
        '1f8b0800000000000003ed574b6fdb300cfe2b81ce69fd7e05183660b79dbbcb86c2906dd956e7489e24a7eb82fcf7918af372b12e0eb05b0f011249fcf8f11329325b22e89a911559536d98224b52caf59a1bb2da12dd52d8f0a220cbe2240b82348e691a47554643166529adfdca77d3280cca9856c985291d4c2b15828cf05fc08b5e7c6ea9328a8a0a0eb335e51de03f95f7e561f953838bf740010e54d42031dff5d23b37ba73bd072f5879eeca4dbe91dd812772fe9f5e80b5a60df2a0429a96a9c55e9fc5b8b1906201cb8ba1b77497c42806a70fe2a57595866515a77e9479991fd224f613df4b3d90cfad6acf0dc3382d12',
        '170c07856ab4c6f47ae538b4e7f70d37ed50a01a8e62bdd4ced35128873e306d1c38e1a043ed5ced0894bbd5d33e72edcccc08264c5eca41404eb94bb2618ad7bca4864b813aed7fb38aac6ada69b6248a518d5b64109a3702769604bf50332850560c5db7243d7de9240523fcb9bb31a61be269cdbacb2ff53bbba557f7b3f77083607ae2e4ba74981b908306703d1a243e556c271b8efa9fa2816d0e5a4761e2c5111cdd5043d594a15dd4c198b58366aa94c200ba4de0c1d95b7fdc7c0801ae512308e2927f653f829d673f9cbff622e0682dbb4e3e03c294f165894d9d3847bb230617cd4d1860b775eceb91a3971d0ac0b5994bc8da6ca1e8b5c97985281a2457ac9a496ab4024acf02d86cedeb62e18642978af7589b73c95dd80296540d15fcb7adf3b958608b29691fbd99b1591bb0651bcceb99c67ba3add32bbea1e50b4aa258c9f80624be0970620d78e6a5c766f215d20005e786e5b45a63bdd9e76fdad7de6bd18e0befb5f8d670f0eae57aaf456838939e018fdc45255f558b3d55b63daebe1f06ba2028a234814f914549c2129a1461eab92cf4dc20f393d4cd623f669e0ff0b78c59870e3ec3cdb59d701c19c791e46a07bb477893f28e8b1f2003a8c0ba7af6985a400d972d4ca9c73f1948fa0ce6ad190ae7db832150e99534ac346703e3b832ce934cd0a2bb18277f0e1c7b24743d33e81c7894fb5098a8a52a190e407907cf3b1292750d376707975ff6de1f71b83c7978bba1fc654a9f840fedc5868084777f0066a2855f800d0000',
      ],
      [
        'Server',
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
        "default-src 'none'",
        'X-Runtime-rack',
        '0.049013',
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        '91A2:3F8D:A69BE4:1511554:5B07160E',
      ]
    );
};

const createBranchFromMasterCreateBranch = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .post('/repos/jchartrand/aTest/git/refs', {
      ref: 'refs/heads/test83',
      sha: '1539967933866a865d9a4e598af2d208543c6ad7',
    })
    .query({
      access_token: config.personal_oath_for_testing,
    })
    .reply(
      201,
      {
        ref: 'refs/heads/test83',
        url: 'https://api.github.com/repos/jchartrand/aTest/git/refs/heads/test83',
        object: {
          sha: '1539967933866a865d9a4e598af2d208543c6ad7',
          type: 'commit',
          url:
            'https://api.github.com/repos/jchartrand/aTest/git/commits/1539967933866a865d9a4e598af2d208543c6ad7',
        },
      },
      [
        'Server',
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
        "default-src 'none'",
        'X-Runtime-rack',
        '0.499281',
        'X-GitHub-Request-Id',
        '97CE:3F8E:CA4EA4:1892D34:5B07160E',
      ]
    );
};

const getDoc = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/repos/lucaju/misc/contents/text.xml')
    .query({
      ref: 'master',
    })
    .reply(
      200,
      [
        '1f8b0800000000000003ad91cd4ec3301084dfc5e7aa26a40d492584c485224e7046aafcb3a90d8e6dc51bb5a5eabbb38180d27240451c7c19ed7cde9dd9332f1a600b86b0c5296e914d5814688e95640409d525c8fa2217ba9485c821d75955ccca725655aad2baccaee6b2d6f3020891ec1b41b3f98475ad23ab418c69c1b98876bab6683a3955a1e12dc490b8eb9478e9786393e22a78048f897fed73d3427ddd8884d012d760e356c7c8116e0c922e48fee9fb661180a64ffcbfae4416ded3123f23001d36de05a14f3e6bc566b8bf4bd00ec77e4431defde7dab88b7d49b5757dba838f047d67a2daddf6cfdc2f9f1c2c1f1f9e3d8d8057415bbfa61929121433d256cefad7c4167b96c0d5ffd80a25740eed4f',
        '81f6cd8f3e39a7f5c3e11da12ace98e6020000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Sat, 25 Jan 2020 05:44:48 GMT',
        'Content-Type',
        'application/json; charset=utf-8',
        'Transfer-Encoding',
        'chunked',
        'Connection',
        'close',
        'Status',
        '200 OK',
        'X-RateLimit-Limit',
        '60',
        'X-RateLimit-Remaining',
        '36',
        'X-RateLimit-Reset',
        '1579933722',
        'Cache-Control',
        'public, max-age=60, s-maxage=60',
        'Vary',
        'Accept',
        'ETag',
        'W/"92ebf03ad8b6a3e3d196488499c9dd8175bfd56e"',
        'Last-Modified',
        'Sat, 25 Jan 2020 05:35:10 GMT',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X - RateLimit - Reset, X - OAuth - Scopes, X - Accepted - OAuth - Scopes, X - Poll - Interval, X - GitHub - Media - Type ',
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
        "default-src 'none'",
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        '9D28:528B:934091:16B1F2B:5E2BD5D0',
      ]
    );
};

const getRepoContentsTree = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .get('/repos/lucaju/misc/git/trees/2fc7a21e01174680f395f323cec364c103a097d5')
    .query({
      recursive: '1',
    })
    .reply(
      200,
      [
        '1f8b0800000000000003a5944d8bdb301086ff8bce5b5bd2e833b7c2ee712fbd961e349a51e3c5ae4d2c43da25ffbd0a94d0b217a741170dc3cba38711f32ed6631207a14bf6492b964a79e3822c106d010d99333893958424a3272b9ec4761a5be058ebb21efa3e2d43f77da8c70dbb3c4ffd899779edc72da7b7ad9f8635f7add9d713f3dadfc1b806c4e1ebbb58523d36da9797cfcfaf2fdd448d3fcdd47a4249e98c6975fdb95c6b1c676cd51f1da5adb3edbd902145321a2950bb17870610c124696cb6fa1a187eb5b8fb2faf2bb379ed855d9e6e4295874f34e7ee3c8d3b950cab441689d0151bda515ac9864ec1470590325acbd1aa9b12488007ac76f33e5ae93bb4a2ca8e404a8b8e31bae4bdcd9abdf70e922bdac498d8199d6f5a',
        '5169ff80d66ede472db843cba2549e3c9ae88261042d734160229db2892606238d062e7f69b947b476f3fed13ad7ae9eebce0f183563697b8002ba040ca4a23321b409e5481494b758c83abe2929fbc89cf6d22edfda0a386d3f72aa4ce250d2b8f2e537e8c2cc8ad7040000',
      ],
      [
        'Server',
        'GitHub.com',
        'Date',
        'Sat, 25 Jan 2020 06:07:42 GMT',
        'Content-Type',
        'application/json; charset=utf-8',
        'Transfer-Encoding',
        'chunked',
        'Connection',
        'close',
        'Status',
        '200 OK',
        'X-RateLimit-Limit',
        '60',
        'X-RateLimit-Remaining',
        '24',
        'X-RateLimit-Reset',
        '1579933721',
        'Cache-Control',
        'public, max-age=60, s-maxage=60',
        'Vary',
        'Accept',
        'ETag',
        'W/"55dedfe8210eeb22a951b65760f44b00"',
        'Last-Modified',
        'Sat, 25 Jan 2020 05:35:12 GMT',
        'X-GitHub-Media-Type',
        'github.v3; format=json',
        'Access-Control-Expose-Headers',
        'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
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
        "default-src 'none'",
        'Content-Encoding',
        'gzip',
        'X-GitHub-Request-Id',
        'A637:5522:7C531:153D6A:5E2BDB2E',
      ]
    );
};

const createBranchGeneric = () => {
  return nock('https://api.github.com:443', {
    encodedQueryParams: true,
  })
    .post((uri) => uri.includes('git/refs'))
    .query({
      access_token: config.personal_oath_for_testing,
    })
    .reply(
      201,
      {
        ref: 'refs/heads/test84',
        node_id: 'MDM6UmVmMTI5OTQxNzczOnRlc3Q4NA==',
        url: 'https://api.github.com/repos/jchartrand/aTest/git/refs/heads/test84',
        object: {
          sha: '248a708af7d740518bb7340be5eb1c3074dd5376',
          type: 'commit',
          url:
            'https://api.github.com/repos/jchartrand/aTest/git/commits/248a708af7d740518bb7340be5eb1c3074dd5376',
        },
      },
      [
        'Server',
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
        "default-src 'none'",
        'X-Runtime-rack',
        '0.489495',
        'X-GitHub-Request-Id',
        '93FC:6064:1FE5B22:3F20356:5B59CCE5',
      ]
    );
};
module.exports = {
  authenticate,
  getDetailsForAuthenticatedUserNock,
  getGithubCommitNock,
  getUpdateGithubCWRCBranchNock,
  getCreateGithubTagNock,
  getGithubTreeNock,
  getCreateGithubRepoNock,
  getMasterBranchFromGithubNock,
  getDocumentFromGithubNock,
  getAnnotationsFromGithubNock,
  getBranchInfoFromGithubNock,
  getReposForGithubUserNock,
  getReposForAuthenticatedUserNock,
  getTemplatesNock,
  getTemplateNock,
  getSearchNock,
  getRepoContentsByDrillDownBranchNock,
  getRepoContentsByDrillDownRootTreeNock,
  getReposByDrillDownSecondLevelNock,
  getReposByDrillDownThirdLevelNock,
  getRepoContentsNock,
  getCreateFileNock,
  getUpdateFileNock,
  getUserBranchHeadNock,
  getLatestFileSHANock,
  getLatestFileSHANockForNew,
  saveExistingFileNock,
  findExistingPRNock,
  saveNewFileNock,
  missingSHANock,
  pullRequestNock,
  missingBranchNock,
  missingPRNock,
  createBranchFromMasterGetMaster,
  createBranchFromMasterCreateBranch,
  getDoc,
  getRepoContentsTree,
  createBranchGeneric,
};
