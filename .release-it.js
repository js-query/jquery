"use strict";

const blogURL = process.env.BLOG_URL;

if ( !blogURL || !blogURL.startsWith( "https://blog.jquery.com/" ) ) {
	throw new Error( "A valid BLOG_URL must be set in the environment" );
}

// This is needed because until the release-it migration,
// all the previous release tags were disconnected from the 3.x branch.
// We can remove this if/when we do a 3.x release with the new setup.
const from = process.env.FROM_VERSION;

module.exports = {
	preReleaseBase: 1,
	hooks: {
		"before:init": "bash ./build/release/pre-release.sh",
		"after:version:bump":
			"sed -i 's/main\\/AUTHORS.txt/${version}\\/AUTHORS.txt/' package.json",
		"after:bump": "cross-env VERSION=${version} npm run build:all",
		"before:git:release": "git add -f dist/ dist-module/ changelog.md",
		"after:release": "echo 'Run the following to complete the release:' && " +
			`echo './build/release/post-release.sh $\{version} ${ blogURL }'`
	},
	git: {

		// Use the node script directly to avoid an npm script
		// command log entry in the GH release notes
		changelog: `node build/release/changelog.js ${ from ? from : "${from}" } $\{to}`,
		commitMessage: "Release: ${version}",
		getLatestTagFromAllRefs: true,
		pushRepo: "git@github.com:jquery/jquery.git",
		requireBranch: "main",
		requireCleanWorkingDir: true
	},
	github: {
		pushRepo: "git@github.com:jquery/jquery.git",
		release: true,
		tokenRef: "JQUERY_GITHUB_TOKEN"
	},
	npm: {
		publish: true
	}
};
