# 后端 API

Fastify + TypeScript 后端，包含 API 路由、类型、数据库迁移和部署配置。

## 版本

- 组件版本：`0.1.0`
- 版本来源：`package.json`
- 仓库稳定发布：`v0.1.0-alpha`

## 本地运行

```bash
npm ci
npm run dev
```

## 验证

```bash
npm run typecheck
npm run build
```

## 目录规则

- `src/api/`：API 路由。
- `src/types/`：共享类型。
- `migrations/`：数据库迁移；已共享的迁移不可改写，修正必须新增迁移。
- `dist/`：构建产物，不进入 Git。
- `.env*`：本机或部署配置，不进入 Git。

产品规则以 `../docs/PRD.md` 为入口，当前 as-built 技术事实以 `../docs/ARCHITECTURE.md` 为准。
