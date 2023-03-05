const fs = require("fs");
const path = require("path");
const glob = require("glob");
const minimist = require("minimist");

async function build(target) {
  const pkgDir = path.resolve(__dirname, `../packages/${target}`);
  const pkg = require(`${pkgDir}/package.json`);
  const { execa } = await import("execa");
  // -c 指使用配置文件 默认为rollup.config.js
  // --environment 向配置文件传递环境变量 配置文件通过proccess.env.获取
  await execa(
    "rollup",
    ["-c", "--environment", [`TARGET:${target}`].filter(Boolean).join(",")],
    { stdio: "inherit" }
  );
  console.log("complate");
}

async function buildAll(maxpipe = 4) {
  const args = minimist(process.argv.slice(2));
  const filters = (args["targets"] || "").split(",");

  const packages = glob
    .sync(path.resolve(__dirname, "../packages/*/"))
    .filter((pkgDir) => {
      const pkg = require(path.resolve(pkgDir, "package.json"));

      if (
        pkg.private ||
        !fs.existsSync(path.resolve(pkgDir, "./src/index.ts"))
      ) {
        return false;
      }
      return true;
    })
    .map((item) => item.split("/").pop())
    .filter((t) => filters.indexOf(t) > -1);
  console.log("packages:", packages);
  const tasks = packages.map((target) => {
    const task = Promise.resolve()
      .then(() => build(target))
      .then(() => {
        task;
      });
    return task;
  });

  const building = [];
  while (tasks.length > 0) {
    if (building.length < maxpipe) {
      building.push(tasks.pop());
    } else {
      await Promise.race(building).then(
        (task) => (builading = building.filter(item != task.task))
      );
    }
  }
  await Promise.all(building);
}

buildAll();
