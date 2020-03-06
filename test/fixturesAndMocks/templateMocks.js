/* eslint-disable quotes */
const nock = require('nock');

const templateMocks = () => {

	nock('https://api.github.com:443', {
			"encodedQueryParams": true
		})
		.get('/repos/cwrc/CWRC-Writer-Templates/contents/templates')
		.query({
			"ref": "master"
		})
		.reply(200, ["1f8b0800000000000003c5984d6f9c301086ff4a84d45b12b08d0d8e54f510f5d06b1b2987aa8a3cf6b8bb0a2c0888d236ca7faf09c9866c4c042d90cb5e98f5fb611ecd6abfdf053b956370167c537999e1d1c5e72f4719360d56a7bff22c380e4ad56cdce306dd63d5601d0e0dd61be5e640c49141c98d965a9254502e49c201184720caf28870610c25eee47afbc709132938390e6eaacc7d7bd334657d1686aadc9efedc369b1b38d5", "451e56581675a86f2b1d9e5f7e3d3fb9acb6cee0c9c5de932e760dee9a3a3cb4f981462e91fb7ccef4a942fb3157b53bc199d8347976f552bc27fc8624640584dd3163549d943bf740696a4c7742d8ead6e1849a4d71bbcb0a650eb42b75fb58f14d8dd563810f6dbf117a52dee677d9be58769ba14b7f956d77d775707617d498d977b96b57df7fe8fe53f9edebd5d35ce6d5babf3ff6615c16988f80b837d6219ca43aa61a23899a4b401adb94706e258f51279c0915836000628f70ca79b43cc14f3ed7e4b7d7cd9cf44e68784d7a7b69df8d5dff2dcf45ee84e29723775f739fdb76ef42a676d7474f2b6c08ddc1c98e5e449b101a190212e2542133915142a220546b029870a42a916c4fafa4e902f0765bf72191dbbefd4c8bf23b2c3bf3029e50f3a208bf19783d8a876dbcbceeb9409e50ff8c200fa70c0e59ee7e6f8e82d93fdad1cc0d17095520126029ca1853c5844da5e1c0d1614e08a3466bb5a799a5a9580ce7cee9fa3c7b7567067a42d32b003d94786da2bd3e96417ac205cc8eb437e62ba6dbc53d8a68dfe023cf2c95409101129e460200ad8da48d251512a46409182b109f7996942cb79e5b9febd3ec519d9be5f12dafc0b23fefda247b5c2cc4f1f8f267e7d813f235c55551e3388c7d931dc782aa4843228dc395805bc1862171ff6e612462860a234625b349b2dfcbeeaf30c1165bcc65ebf41d48f6c8ce8cf284a2d740d91f7875963d3696817942fdf3c3ec49e968fef1176593b827b4160000"], [
			'Server',
			'GitHub.com',
			'Date',
			'Tue, 28 Jan 2020 05:34:21 GMT',
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
			'4991',
			'X-RateLimit-Reset',
			'1580190208',
			'Cache-Control',
			'private, max-age=60, s-maxage=60',
			'Vary',
			'Accept, Authorization, Cookie, X-GitHub-OTP',
			'ETag',
			'W/"c329f28d2c2cef4783bae7f7c9a7c91ae6fbaca7"',
			'Last-Modified',
			'Wed, 14 Aug 2019 22:04:36 GMT',
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
			'8D42:0410:111610:1C67C9:5E2FC7DD'
		]);

}

module.exports = templateMocks