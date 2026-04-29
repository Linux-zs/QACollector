# TDXQAcollector

通达信知识问答词条收集与检索平台。支持实时搜索、词条增删改查、用户角色权限管理。

## 功能

- **实时搜索**：输入关键词即时匹配词条，下拉展示结果
- **词条管理**：创建、编辑、删除问答词条，支持分类和标签
- **用户系统**：注册登录，三种角色（管理员/贡献者/查看者）
- **搜索历史**：记录用户搜索词，首页展示最近搜索

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 18 + Vite + TypeScript + Tailwind CSS |
| 后端 | Express + TypeScript + sql.js (SQLite) |
| 认证 | JWT + bcryptjs |

## 快速开始

```bash
# 安装依赖
cd server && npm install
cd ../client && npm install --legacy-peer-deps

# 填充示例数据
cd ../server && npm run seed

# 启动后端（端口 3001）
npm run dev

# 新终端，启动前端（端口 5173）
cd client && npm run dev
```

访问 `http://localhost:5173`

## 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员（全部权限）|
| contributor | contrib123 | 贡献者（可增改词条）|
| viewer | viewer123 | 查看者（只读）|

## API

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/register | 注册 | 公开 |
| POST | /api/auth/login | 登录 | 公开 |
| GET | /api/terms/search?q=xxx | 搜索词条 | 公开 |
| GET | /api/terms/latest | 最新词条 | 公开 |
| GET | /api/terms/:id | 词条详情 | 公开 |
| POST | /api/terms | 创建词条 | contributor/admin |
| PUT | /api/terms/:id | 更新词条 | 创建者/admin |
| DELETE | /api/terms/:id | 删除词条 | admin |

## 项目结构

```
├── client/                # React 前端
│   └── src/
│       ├── components/    # SearchBox, TermCard, TermForm, Navbar
│       ├── pages/         # HomePage, TermDetail, Login, Register, Admin
│       ├── hooks/         # useSearch (防抖搜索)
│       ├── context/       # AuthContext (认证状态)
│       └── api/           # API 请求封装
└── server/                # Express 后端
    └── src/
        ├── routes/        # auth, terms, users
        ├── models/        # User, Term
        └── middleware/    # JWT 验证 + 角色守卫
```
