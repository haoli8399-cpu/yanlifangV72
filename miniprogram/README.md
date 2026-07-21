# 微信小程序

uni-app + Vue 3 微信小程序。

## 版本

- 组件版本：`1.0.0`
- 版本来源：`package.json` 与 `src/manifest.json`
- 构建产物：`dist/build/mp-weixin/`，不进入 Git

## 当前源码入口

`npm` 构建链只以 `src/` 为当前源码入口：

- `src/App.vue`、`src/main.ts`
- `src/pages.json`、`src/manifest.json`
- `src/pages/`、`src/components/`、`src/stores/`、`src/styles/`

根级 `components/`、`stores/`、`styles/` 是历史重复/分叉目录；嵌套的 `miniprogram/` 是原生微信兼容资产。两者暂时保留用于追溯，新功能不要同时修改两份。完成专项运行验证后再归档。

## 本地运行与构建

```bash
npm ci
npm run dev:mp-weixin
npm run build:mp-weixin
```

微信开发者工具应导入实际构建目录；不要把 `dist/` 提交到 Git。
