# PC/H5 前端

TanStack Start + React 19 前端，承载 Agent、Admin、Supplier、移动 Web、增长工具和客户方案页面。

## 版本

- 组件版本：`0.1.0-alpha`
- 版本来源：`package.json`
- 仓库稳定发布：`v0.1.0-alpha`
- 当前实现基线：主要对应 V4.7，不能按 V6.6 完成度理解

## 本地运行

```bash
npm ci
npm run dev
```

## 验证

```bash
npm run check:type
npm run check:build
npm run lint
```

## 关键入口

- `src/routes/`：文件路由。
- [`src/routes/README.md`](src/routes/README.md)：路由目录说明。
- `src/shared/`：共享组件、Mock、工具和 Design Token。
- `src/styles.css`：全局样式。
- `.hermes.md`：前端编码和视觉护栏。

路由和组件速查仍保留在 `../project-center/`，当前项目和版本事实以 `../docs/` 为准。
