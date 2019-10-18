#!/usr/bin/env node

'use strict'

const path = require('path')
const editJsonFile = require('edit-json-file')
const standardVersion = require('standard-version')
const shell = require('shelljs')
const chalk = require('chalk')
const argv = require('yargs').argv
const { name, version, author } = require('./package.json')

// constant
const ROOT = process.cwd()
const assign = Object.assign
const targetPkgJson = editJsonFile(`${ROOT}/package.json`)

// Determine yuermitag's configuration is exist
const configFileIsExist = () => {
	return !!targetPkgJson.get('yuermitag.initialized')
}

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

// Verify the spcified field in target package.json
const verifyInDeps = field => {
	return targetPkgJson.get(`dependencies.${field}`) || targetPkgJson.get(`devDependencies.${field}`)
}

const install = (packageName, callback) => {
	if (!verifyInDeps(packageName) && packageName === 'husky') {
		log.bright(`install ${packageName}...`)
		try {
			// shell
			// 	.exec(`npm install --save-dev ${packageName}`, { silent: true, async: true })
			// 	.stdout.on('data', function(data) {
			// 		/* ... do something with data ... */
			// 		log.warn('-----------------> 1111 ', shell.exec('npm list husky'))
			// 	})
		} catch (err) {
			throw err
		}
		log.success(`${packageName} installed successfully.`)
	}
	callback && callback()
}

// Initial
async function init() {
	/**
	 * husky
	 * 1.determine the husky is installed.
	 * 2.create the configuration
	 */
	await install('husky', () => {
		const precommit = targetPkgJson.get('husky.hooks.pre-commit')
		targetPkgJson.set('husky.hooks', {
			'pre-commit': precommit && precommit.indexOf('lint-staged') !== -1 ? precommit : `${precommit} && lint-staged`,
			'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS'
		})
	})

	/**
	 * lint-staged
	 */
	install('lint-staged', () => {
		let staged = targetPkgJson.get('lint-staged') || {}
		targetPkgJson.set(
			'lint-staged',
			assign(
				{
					// default lint-staged rules
					'*.{js}': ['eslint --fix', 'git add'],
					'*.{vue}': ['prettier --write', 'eslint --fix', 'git add'],
					'*.{json,css,scss,less,sass,md,html,flow,ts,tsd}': ['prettier --write', 'git add']
				},
				staged
			)
		)
	})

	/**
	 * commitlint
	 */
	install('@commitlint/cli', () => {
		// TODO
	})
	install('@commitlint/config-conventional', () => {
		targetPkgJson.set('commitlint', {
			extends: ['@commitlint/config-conventional']
		})
	})

	install('prettier', () => {
		// TODO
	})

	const CZ_TYPE = ['', 'feat', 'fix', 'docs', 'style', 'refactor', 'improvement', 'perf']
	const {
		czType = '',
		czScope = '',
		czSubject = '',
		czBody = '',
		czIssues = '',
		czMaxHeaderWidth = 100,
		czMaxLineWidth = 100
	} = argv
	if (CZ_TYPE.indexOf(czType) === -1) {
		const error = new Error(`The value of --cz-type must be the following: ${CZ_TYPE.join()}`)
		reject(error)
		throw error
	}
	targetPkgJson.set('config.commitizen', {
		path: './node_modules/cz-conventional-changelog',
		maxHeaderWidth: czMaxHeaderWidth,
		maxLineWidth: czMaxLineWidth,
		defaultType: czType,
		defaultScope: czScope,
		defaultSubject: czSubject,
		defaultBody: czBody,
		defaultIssues: czIssues
	})
}

// CLI behavior for yuert
const commands = {
	// yuert release
	tag() {
		// standardVersion returns a Promise
		standardVersion({
			noVerify: true,
			infile: './CHANGELOG.md',
			silent: true
		})
			.then(() => {
				// standard-version is done
			})
			.catch(err => {
				console.error(`standard-version failed with message: ${err.message}`)
			})
	},

	// yuert commit
	commit() {
		const bootstrap = require('commitizen/dist/cli/git-cz').bootstrap
		bootstrap({
			cliPath: path.join(__dirname, './node_modules/commitizen'),
			config: {
				path: 'cz-conventional-changelog'
			}
		})
	}
}

function run() {
	if (!configFileIsExist()) {
		init()
	}
	// Execute the specified command
	argv._.forEach(commandName => {
		const handler = commands[commandName]
		handler()
	})

	// Execute the default command
	if (!argv._.length) {
		commands['commit']()
	}
}
run()