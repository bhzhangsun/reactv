# rags

> "将碎布拼成破衣"

一个 **完善项目工程化配置工具**，使用交互式命令行（待办）

面对一个工程化项目即使有 vite 这类脚手架，也只能解决创建应用模版。对于工程化的一些其他功能的集成需要一步步配置，花费大量的时间。使用 rags 快速集成这类功能

基本功能如下：

- [x] 格式化工具 pritter,eslint (yes/no)
- [x] git 提交校验 commitlint (yes/no)
- [ ] test 单元测试 jest (yes/no)
- [ ] publish 模块发布 changetset（yes/no）
- [ ] 交互式命令行

## Roadmap

后期可以对项目生命周期内的一些配置进行分解，以工具的方式进行快速配置

| 项目管理   | 代码管理 | 部署管理 |
| ---------- | -------- | -------- |
| 代码格式化 | git 提交 | CI 脚本  |
| 单元测试   | 模块发布 | 部署脚本 |
| ...        | ...      | ...      |

## Use

```bash
pnpm exec rags -f -c
```

### Install

```bash
pnpm add -D -g rags
```

## 支持

1. [yargs](https://www.npmjs.com/package/yargs)
2. [chalk](https://www.npmjs.com/package/chalk)
