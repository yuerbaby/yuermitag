#!/usr/bin/env node

'use strict'

const path = require('path')
const editJsonFile = require('edit-json-file')
const standardVersion = require('standard-version')
const shell = require('shelljs')
const chalk = require('chalk')
const fs = require('fs')
const fse = require('fs-extra')
const prettier = require('prettier')
const argv = require('./command.js').argv

// constant
const ROOT = process.cwd()
const assign = Object.assign
const targetPkgJson = editJsonFile(`${ROOT}/package.json`)

// Define the log level
const log = {
	print(msg) {
		console.log(`yuermitag > ${msg}`)
	},
	error(msg) {
		this.print(chalk.red(msg))
	},
	info(msg) {
		this.print(chalk.white(msg))
	},
	warn(msg) {
		this.print(chalk.yellow(msg))
	},
	bright(msg) {
		this.print(chalk.blue(msg))
	},
	success(msg) {
		this.print(chalk.green(msg))
	}
}

// Determine yuermitag's configuration is exist
const configIsExist = (field) => {
	return !!targetPkgJson.get(field)
}

/**
 * Initialize eslint configuration
 *
 * The priority order of eslint configuration is
 * .eslintrc.js -> .eslintrc.yaml -> .eslintrc.yml -> .eslintrc.json -> .eslintrc -> package.json
 * Create or use existing `.eslintrc.js` to force override the eslint rules
 */
const initEslint = () => {
	if (configIsExist('yuermitag.eslint')) {
		return;
	}
	targetPkgJson.set('yuermitag.eslint', true)
	const configUrl = `${ROOT}/.eslintrc.js`
	const isExist = fse.pathExistsSync(configUrl)
	let content = `
	module.exports = {
		root: true,
		// https://github.com/standard/standard/blob/master/docs/RULES-en.md
		// https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
		// https://github.com/yuerbaby/eslint-config-yuer
		extends: ['standard', 'plugin:vue/recommended', 'yuer'],
		plugins: ['vue', 'babel', 'import']
	}
	`
	if (isExist) {
		content = fs.readFileSync(configUrl).toString('utf8')
		if (content && !/\byuer\b/.test(content)) {
			content = prettier.format(
				content.replace(/extends(\s*):(\s*)\[([^\[]*)\]/g, match => {
					return match.replace(']', ', "yuer"]')
				})
			)
		}
	}
	fse.outputFileSync(configUrl, content)
}

/**
 * Initialize husky
 * Set lint-staged and commitlint in husky hooks,
 * Append setting if already exists
 */
const initHusky = () => {
	if (configIsExist('yuermitag.husky')) {
		return;
	}
	targetPkgJson.set('yuermitag.husky', true)
	const precommit = targetPkgJson.get('husky.hooks.pre-commit') || 'lint-staged'
	const commitmsg = targetPkgJson.get('husky.hooks.commit-msg') || 'commitlint -E HUSKY_GIT_PARAMS'
	targetPkgJson.set('husky.hooks', {
		'pre-commit': precommit.indexOf('lint-staged') !== -1 ? precommit : `${precommit} && lint-staged`,
		'commit-msg': commitmsg.indexOf('commitlint') !== -1 ? commitmsg : `${commitmsg} && commitlint -E HUSKY_GIT_PARAMS`
	})
}

/**
 * Initialize lint-staged
 */
const initLintStaged = () => {
	if (configIsExist('yuermitag.lint-staged')) {
		return;
	}
	targetPkgJson.set('yuermitag.lint-staged', true)
	let staged = targetPkgJson.get('lint-staged') || {}
	targetPkgJson.set(
		'lint-staged',
		assign(
			{
				// default lint-staged rules
				'*.{js}': ['eslint --fix', 'git add'],
				'*.{vue}': ['prettier --write *.vue', 'eslint --fix', 'git add'],
				'*.{json,css,scss,less,sass,md,html,flow,ts,tsd}': ['prettier --write', 'git add']
			},
			staged
		)
	)
}

/**
 * Initialzie commitlint
 */
const initCommitlint = () => {
	if (configIsExist('yuermitag.commitlint')) {
		return;
	}
	targetPkgJson.set('yuermitag.commitlint', true)
	targetPkgJson.set('commitlint', {
		extends: ['@commitlint/config-conventional']
	})
}

/**
 * Initialize commitizen
 */
const initCommitizen = () => {
	targetPkgJson.set('config.commitizen', {
		maxHeaderWidth: argv.czMaxHeaderWidth || 100,
		maxLineWidth: argv.czMaxLineWidth || 100,
		defaultType: argv.czType || '',
		defaultScope: argv.czScope || '',
		defaultSubject: argv.czSubject || '',
		defaultBody: argv.czBody || '',
		defaultIssues: argv.czIssues || ''
	})
}

// Initial
const initialize = () => {
	initEslint()
	initHusky()
	initLintStaged()
	initCommitizen()
	initCommitlint()
	targetPkgJson.save()
}

// CLI behavior for yuert
const commands = {
	// yuert release
	tag() {
		// standardVersion returns a Promise
		const options = {
			noVerify: true,
			infile: './CHANGELOG.md',
			silent: true
		}
		const { firstRelease, releaseAs, prerelease } = argv
		if (firstRelease) {
			options.firstRelease = firstRelease
		}
		if (releaseAs) {
			options.releaseAs = releaseAs
		}
		if (prerelease) {
			options.prerelease = prerelease
		}
		standardVersion(options)
			.then(() => {
				// standard-version is done
				log.success(`The tag has been generated. Please use the following command to synchronize to the remote:`)
				log.success(`git push --follow-tags origin master && npm publish`)
			})
			.catch(err => {
				console.error(`standard-version failed with message: ${err.message}`)
			})
	},

	// yuert commit
	commit() {
		const bootstrap = require('commitizen/dist/cli/git-cz').bootstrap
		bootstrap({
			cliPath: path.join(__dirname, '../../node_modules/commitizen'),
			config: {
				path: 'cz-conventional-changelog'
			}
		}, [])
	}
}

function run() {
	initialize()
	
	// Execute the specified command
	argv._.forEach(commandName => {
		const handler = commands[commandName]
		handler && handler()
	})

	// Execute the default command
	if (!argv._.length) {
		commands['commit']()
	}
}
run()