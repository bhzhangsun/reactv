# ReactV

这是一个简单的 react 实现，其中 jsx-runtime 包实现了 jsx 转换，core 包实现了基本的 fiber 实现循环

本项目使用 pnpm 作为包依赖管理工具，rollup 进行代码打包，ts 作为 ts，jsx 解析器。

## Build

```bash
# 以下三种命令均可执行
nr build targets=core
nr build targets=%packageName%
pnpm build targets=%packageName%
```

> 目前由于 core 包依赖 jsx-runtime, 需要先 build jsx-runtime
