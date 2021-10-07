const { buildSync, transformSync } = require('esbuild');
const esbuild = require('esbuild')

// buildSync({
//     entryPoints: ['src/main.js'],
//     write: true,
//     outdir: 'dist/out',
// })


// const result = buildSync({
//     entryPoints: ['src/main.js'],
//     write: false,
//     outdir: 'dist/out',
// })


// for (let out of result.outputFiles) {
//     console.log(out.path, out.contents, '!!!!!')
// }

const nodePath = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const chalk = require('chalk');
const globby = require('globby');

const ecDir = nodePath.resolve(__dirname, '..');
const esmDir = 'static';

/**
 * {patterns}: ss
*/
async function readFilePaths({ patterns, cwd }) {
    return (
        // await globby(patterns, { cwd })
        await globby(patterns)
    )
    // .map(
    //     srcPath => nodePath.resolve(cwd, srcPath)
    // );
}

async function transformDistributionFiles(rooltFolder) {
    const files = await readFilePaths({
        // patterns: ['static/**/*.js', 'static/*/*.js'],
        patterns: ['dist/static/**/Bar.js'],
        cwd: rooltFolder
    });
    for (let fileName of files) {
        let moduleStr = '';
        let code = fs.readFileSync(fileName, 'utf-8')
            .replace(/\['.\S+.class',\s+'\S+']/g, ($0, $1) => {
                $0.substring(1, $0.length - 1).split(',').forEach(item => {
                    let moduleName, modulePath = item;
                    if (/.class/g.test(item)) {
                        moduleName = item.replace(/\.\/|(.class)|\s*/g, '')
                    } else {
                        moduleName = item.replace(/(\.\.\/)+\S+\/|\s*/g, '')
                    }
                    moduleStr += `import ${moduleName.substring(1, moduleName.length - 1)} from ${modulePath}\n`
                })
                return ''
            }).replace(/define\(\,\s*\S+\,\s*\S+\)\s*\{|\}\)\s*$/g, '')
            .replace(/return\s*\{\s*\S+:\s*\S+\s*\}/g, ($0, $1) => {
                const name = $0.replace(/return\s*\{\s*\S+:|\s*\}/g, '');
                return `export default ${name}`
            })
        let newCode = moduleStr + code
        fs.writeFileSync(fileName, newCode, 'utf-8')
    }


}

async function main() {
    // 先删除dist文件夹
    fsExtra.removeSync(nodePath.resolve(ecDir, 'dist'));

    process.stdout.write(chalk.green.dim(`compiling start...`));
    // 将要处理的文件先拷贝到dist文件夹下
    await fsExtra.copySync('static', 'dist/static')
    // 处理要替换的内容
    transformDistributionFiles(nodePath.resolve(ecDir, esmDir))

    process.stdout.write(chalk.green.dim(`compiling end...`));
}

main()