module.exports = require('yargs')
	.usage('Usage: $0 [options]')
	.option('cz-type', {
		describe: 'Specify the type manually (like <feat|fix|docs>)',
		requiresArg: true,
		string: true
	})
	.option('-cz-scope', {
		describe: 'The scope should be the name of the commited affected',
		string: true
	})
	.option('cz-subject', {
		describe: 'Contains a succinct description of the change',
		string: true
	})
	.option('cz-body', {
		describe:
			'The body should include the motivation for the change and contrast this with previous behavior',
		type: 'string'
	})
	.option('cz-issue', {
		describe: 'Describe the associated issue',
		string: true
	})
	.option('cz-max-header-width', {
		describe: 'Specify the max number of header',
		type: 'number',
		default: 100
	})
	.option('cz-max-line-width', {
		describe: 'Specify the max number of body',
		type: 'number',
		default: 100
	})
	.option('release-as', {
		describe: 'Specify the release type manually (like npm version <major|minor|patch>)',
		requiresArg: true,
		string: true
	})
	.option('prerelease', {
		describe: 'make a pre-release with optional option value to specify a tag id',
		string: true
	})
	.option('first-release', {
		describe: 'Is this the first release?',
		type: 'boolean',
		default: false
	})