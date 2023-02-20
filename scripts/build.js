const fs = require('fs')
const path = require('path')
const glob = require('glob')


async function build(target) {
    const pkgDir = path.resolve(__dirname, `../packages/${target}`)
    const pkg = require(`${pkgDir}/package.json`)
    const {execa} = await import('execa')
    // -c 指使用配置文件 默认为rollup.config.js
    // --environment 向配置文件传递环境变量 配置文件通过proccess.env.获取
    await execa(
        'rollup',
        [
          '-c',
          '--environment',
          [
            `TARGET:${target}`
          ]
            .filter(Boolean)
            .join(',')
        ],
        { stdio: 'inherit' }
    )
    console.log('complate')
}

async function buildAll(maxpipe = 4) {
    const packages = glob.sync(path.resolve(__dirname, "../packages/*/")).filter(pkgDir => {
        const pkg = require(path.resolve(pkgDir, 'package.json'))
        console.log('---:', !fs.existsSync(path.resolve(pkgDir, './src/index.ts')))
        if (pkg.private || !fs.existsSync(path.resolve(pkgDir, './src/index.ts'))) {
            return false;
        }
        return true;
    })
    console.log('--packages:', packages)
    const tasks = packages.map((item) => {
        const target = item.split('/').pop()
        const task = Promise.resolve().then(() => build(target))
                        .then(() => {task})
        return task
    })
    const building = []

    while (tasks.length > 0) {
        if (building.length < maxpipe) {
            building.push(tasks.pop())
        } else {
            await Promise.race(building).then((task) => builading = building.filter(item != task.task))
        }
    }
    console.log('building:', building)
    await Promise.all(building)
}

buildAll()
