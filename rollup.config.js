const path = require("path");
const process = require("process");
const typescript = require("rollup-plugin-typescript2");
const json = require("@rollup/plugin-json");
const clear = require("rollup-plugin-clear");
const dts = require("rollup-plugin-dts").default;

const target = process.env["TARGET"];
const targetPath = `${__dirname}/packages/${target}`;
const inputOptions = path.resolve(targetPath, "./src/index.ts");
const targetPackage = path.resolve(targetPath, "./package.json");
const packageJson = require(targetPackage);

const outputPrefix = "dist";
const outputDir = path.resolve(
  __dirname,
  `./packages/${target}/${outputPrefix}/`
);

const formats = ["esm", "cjs"];

const outputName = (format) =>
  path.resolve(outputDir, `${target}-${format}.js`);
const outputOptions = formats.map((fmt) => ({
  file: outputName(fmt),
  format: fmt,
}));

const typesDir = path.resolve(outputDir, "./types/");

console.log(`${targetPath}/src/**/*`, typesDir);
module.exports = [
  {
    input: inputOptions,
    external: [
      ...["path", "fs", "os", "http"],
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
    ],
    plugins: [
      clear({ targets: [outputDir] }),
      json(),
      typescript({
        tsconfigOverride: {
          include: [`packages/${target}/**/*`],
          exclude: [`packages/${target}/dist/**/*`],
          outDir: outputDir,
        },
      }),
    ],
    output: outputOptions,
  },
  {
    input: inputOptions,
    plugins: [dts()],
    output: [
      {
        file: path.resolve(targetPath, `./dist/${target}.d.ts`),
        format: "es",
      },
    ],
  },
];
