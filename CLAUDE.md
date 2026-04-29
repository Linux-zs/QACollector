# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

TDXQAcollector — 通达信知识问答词条收集与检索网站。用户可以实时搜索、浏览、创建和管理知识词条。

## 技术栈

- **前端**: React 18 + Vite + TypeScript + Tailwind CSS
- **后端**: Express + TypeScript + sql.js（纯 JS SQLite）
- **认证**: JWT + bcryptjs，三种角色：admin / contributor / viewer

## 常用命令

```bash
# 后端
cd server
npm run dev          # 启动开发服务器 (tsx watch, 端口 3001)
npm run seed         # 填充示例数据（admin/admin123, contributor/contrib123, viewer/viewer123）
npm run build        # TypeScript 编译

# 前端
cd client
npm run dev          # 启动 Vite 开发服务器 (端口 5173, 代理 /api 到 3001)
npm run build        # 生产构建
```

## 架构

```
server/src/
├── index.ts         # Express 入口，初始化数据库后启动
├── db.ts            # sql.js 数据库初始化，initDB() / getDB() / saveDB()
├── seed.ts          # 示例数据填充脚本
├── middleware/auth.ts  # JWT 验证 + roleGuard 角色守卫
├── models/
│   ├── User.ts      # 用户 CRUD，bcryptjs 密码哈希
│   └── Term.ts      # 词条 CRUD + 搜索
└── routes/
    ├── auth.ts      # POST /register, /login, GET /me
    ├── terms.ts     # GET /search, /latest, /recent-searches, CRUD
    └── users.ts     # 管理员用户管理

client/src/
├── context/AuthContext.tsx  # 用户认证状态，useAuth() hook
├── api/client.ts           # API 请求封装，自动附带 JWT
├── hooks/useSearch.ts      # 防抖搜索 hook (300ms)
├── components/
│   ├── SearchBox.tsx       # 实时搜索下拉框
│   ├── TermCard.tsx        # 词条卡片
│   ├── TermForm.tsx        # 词条创建/编辑表单
│   └── Navbar.tsx          # 顶部导航
└── pages/
    ├── HomePage.tsx        # 主页：搜索 + 最近搜索 + 最新词条
    ├── TermDetailPage.tsx  # 词条详情
    ├── CreateTermPage.tsx  # 新建词条
    ├── EditTermPage.tsx    # 编辑词条
    ├── LoginPage.tsx       # 登录
    ├── RegisterPage.tsx    # 注册
    └── AdminPage.tsx       # 管理员用户管理
```

## API 端点

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/register | 注册 | 公开 |
| POST | /api/auth/login | 登录 | 公开 |
| GET | /api/auth/me | 当前用户信息 | 登录 |
| GET | /api/terms/search?q=xxx | 搜索词条 | 公开 |
| GET | /api/terms/latest | 最新词条 | 公开 |
| GET | /api/terms/recent-searches | 最近搜索 | 登录 |
| GET | /api/terms/:id | 词条详情 | 公开 |
| POST | /api/terms | 创建词条 | contributor/admin |
| PUT | /api/terms/:id | 更新词条 | 创建者/admin |
| DELETE | /api/terms/:id | 删除词条 | admin |
| GET | /api/users | 用户列表 | admin |
| PATCH | /api/users/:id/role | 修改角色 | admin |
| DELETE | /api/users/:id | 删除用户 | admin |

## 权限模型

- **admin**: 全部权限，可删除词条和管理用户
- **contributor**: 可创建词条，编辑自己创建的词条
- **viewer**: 只读

## 数据存储

- 数据库文件: `server/data.db`（SQLite，sql.js 纯 JS 实现）
- sql.js 是异步初始化的：先调用 `initDB()`，之后用 `getDB()` 获取实例
- 每次写操作后调用 `saveDB()` 将内存数据持久化到文件
