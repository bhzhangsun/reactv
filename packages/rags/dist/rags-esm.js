import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';

function main() {
    const args = yargs(hideBin(process.argv))
        .usage("Usage: $0 <command> [options]")
        // .option("language", {
        //   alias: "l",
        //   description: "select a program language",
        //   choices: ["ts", "js"],
        // })
        .option("format", {
        alias: "f",
        type: "boolean",
        description: "Can you install format support?",
        default: false,
    })
        .option("commit", {
        alias: "c",
        type: "boolean",
        description: "Can you install git commit support?",
        default: false,
    })
        .option("verbose", {
        alias: "v",
        type: "boolean",
        description: "Run with verbose logging",
    })
        .parse();
    install(args);
}
function install(args) {
    if (pathExists(cwdResolve("./package.json"))) {
        console.log("项目已存在");
    }
    console.log("args:", args);
    // if (args.language && !pathExists(cwdResolve("./rollup.config"))) {
    //   // 安装构建
    //   fs.cpSync(
    //     path.resolve(__dirname, `../template-${args.language}`),
    //     process.cwd(),
    //     {
    //       filter: (src) => src.indexOf("package.json") < 0,
    //       recursive: true,
    //     }
    //   );
    // }
    if (args.format && !pathExists(cwdResolve("./.eslintrc"))) {
        const srcPath = path.resolve(__dirname, `../template-lint`);
        // 安装构建
        fs.cpSync(srcPath, process.cwd(), {
            filter: (src) => src.indexOf("package.json") < 0,
            recursive: true,
        });
        resolveDependence(path.resolve(srcPath, "./package.json"));
    }
    if (args.commit && !pathExists(cwdResolve("./.commitlint.config"))) {
        const srcPath = path.resolve(__dirname, `../template-commit`);
        // 安装构建
        fs.cpSync(srcPath, process.cwd(), {
            filter: (src) => src.indexOf("package.json") < 0,
            recursive: true,
        });
        resolveDependence(path.resolve(srcPath, "./package.json"));
    }
}
function resolveDependence(pkgPath) {
    if (!pathExists(pkgPath)) {
        return console.error("[]: 不存在此模板或末班已损坏");
    }
    const destPath = cwdResolve("./package.json");
    if (pathExists(destPath)) {
        // merge
        const srcPkg = require(pkgPath);
        const destPkg = require(destPath);
        fs.writeFileSync(destPath, JSON.stringify({
            ...destPkg,
            scripts: {
                ...destPkg.scripts,
                ...srcPkg.scripts,
            },
            dependencies: {
                ...destPkg.dependencies,
                ...srcPkg.dependencies,
            },
            devDependencies: {
                ...destPkg.devDependencies,
                ...srcPkg.devDependencies,
            },
            peerDependencies: {
                ...destPkg.peerDependencies,
                ...srcPkg.peerDependencies,
            },
            commitlint: {
                ...destPkg.commitlint,
                ...srcPkg.commitlint,
            },
            config: {
                ...destPkg.config,
                ...srcPkg.config,
            },
        }, null, 4));
    }
    else {
        fs.cpSync(pkgPath, process.cwd());
    }
}
function cwdResolve(suffix) {
    return path.resolve(process.cwd(), suffix);
}
function pathExists(path) {
    const extensions = ["json", "js"];
    const ext = path.split(".").slice(-1)[0];
    if (fs.existsSync(path)) {
        return path;
    }
    else if (ext && extensions.indexOf(ext) > -1) {
        return false;
    }
    // 缺少后缀名，补全后测试
    for (const ext of extensions) {
        const name = `${path}.${ext}`;
        if (fs.existsSync(name)) {
            return name;
        }
    }
    return false;
}
main();
