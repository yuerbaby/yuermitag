# yuermitag

封装实现 `git commit` 和 `git tag`，对每次提交的说明进行格式规范检验修正。 

## Installation

```
$ npm install --save-dev git+https://github.com/yuerbaby/yuermitag.git
```

## Usage

安装成功后，请自行在 `package.json` 中配置相关执行命令：

```
{
	"scripts": {
		"commit": "yuermitag",
		"release": "yuermitag tag"
	}
}
```

配置完成后，凡是用到 `git commit` 命令，一律改为使用 `npm run commit`。如果想减少代码提交步骤，可以将 `git add .` 与该命令合并，如下：

```
{
	"scripts": {
		"commit": "git add . && cross-env yuermitag",
		"release": "yuermitag tag"
	}
}
```

注意： 使用 [cross-env](https://www.npmjs.com/package/cross-env) 解决跨平台兼容性问题。

## Options

### 通过 `Command line` 设置默认值

1. 设置提交说明规范配置

- `--cz-type`: 提交类型，默认值 `''`； 
- `--cz-scope`: 说明 `commit` 影响的范围，比如数据层、控制层、视图层等等，视项目不同而不同，默认值 `''`； 
- `--cz-subject`: `commit` 目的的简短描述，不超过50个字符，默认值 `''`；
- `--cz-body`: 此次 `commit` 的详细描述，可以分成多行，默认值 `''`； 
- `--cz-issue`: 此次 `commit` 关联的 `issue`，默认值 `''`； 
- `--cz-max-header-width`: `commit` 标题的最大字数，默认值 100； 
- `--cz-max-line-width`: `commit` 的详细描述文字最大限制，默认值 100。

2. 设置生成 CHANGELOG 配置

- `--first-release`: 标记一个新的发布版本，不影响 `package.json` 中的版本号，默认值 `false`；
- `--prerelease <name>`: 标记发布的是一个预发布版本，例如： `yuermitag --prerelease alpha` -> `1.0.0-alpha.0`；
- `--release-as <version|preset>`: 发布指定版本，预置的值： `major`，`minor`，`patch` 和版本号，例如：`yuermitag --release-as minor`，`yuermitag --release-as 1.0.1`。

## Technical

1. [commitlint](https://www.npmjs.com/package/@commitlint/cli)
2. [Husky](https://www.npmjs.com/package/husky)
3. [Lint-staged](https://www.npmjs.com/package/lint-staged)
4. [ESlint](https://www.npmjs.com/package/eslint)
5. [Prettier](https://www.npmjs.com/package/prettier)
6. [Standard-version](https://www.npmjs.com/package/standard-version)

## Note

1. 配置冲突 

`yuermitag` 依赖包的相关配置都是动态创建的，如果当前项目中已使用相关的配置，会自动覆盖，解决方式，优先备份当前配置，在 `yuermitag` 初始化完成（在 `package.json` 新增 `yuermitag.initialized` 作为完成标记）后，根据需求自行调整。

2. 代码风格检测和修正

我们强烈建议使用我们的提供的代码风格规范进行代码检测和修正，如果需要扩展，可在根文件下的 `.eslintrc.js` 中设置 `extends` 或 `rules`。

3. Npm 包支持

目前该工程代码还未提交到任何的 Npm 私服，只支持 `git+https://github.com/yuerbaby/yuermitag.git` 方式安装，如若后续有改动，会及时更新相关信息。

## License

MIT
