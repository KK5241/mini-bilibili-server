# Mini Bilibili 服务端

这是一个基于NestJS框架开发的小型视频学习平台后端，提供了用户注册、登录、视频浏览和评论等功能。

## 功能特性

- 用户认证（注册、登录）
- 用户关注系统
- 视频相关操作（浏览、点赞、收藏）
- 评论系统
- 弹幕系统

## 技术栈

- NestJS - 服务端框架
- TypeORM - 对象关系映射
- MySQL - 数据库
- JWT - 认证
- Passport - 身份验证中间件

## 开始使用

### 前提条件

- Node.js (>= 12.0.0)
- npm 或 yarn
- MySQL (>= 5.7)

### 安装

1. 克隆仓库
```bash
git clone <仓库地址>
cd mini-bilibili-server
```

2. 安装依赖
```bash
npm install
# 或者
yarn install
```

3. 配置环境变量

复制 `.env.example` 到 `.env` 并根据你的环境配置相应的变量。

4. 初始化数据库

使用 `init-db.sql` 脚本创建数据库和表：

```bash
mysql -u root -p < init-db.sql
```

### 运行

```bash
# 开发环境
npm run start:dev

# 生产环境
npm run build
npm run start:prod
```

## API 文档

### 认证

- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录

### 用户

- `GET /users` - 获取所有用户
- `GET /users/:id` - 获取特定用户
- `PUT /users/:id` - 更新用户信息
- `DELETE /users/:id` - 删除用户
- `POST /users/follow/:id` - 关注用户
- `POST /users/unfollow/:id` - 取消关注
- `GET /users/:id/followers` - 获取用户粉丝
- `GET /users/:id/following` - 获取用户关注列表

### 视频

- `GET /videos` - 获取所有视频
- `GET /videos/popular` - 获取热门视频
- `GET /videos/recent` - 获取最新视频
- `GET /videos/search?q=query` - 搜索视频
- `GET /videos/:id` - 获取特定视频
- `POST /videos` - 创建视频
- `PUT /videos/:id` - 更新视频
- `DELETE /videos/:id` - 删除视频
- `POST /videos/:id/view` - 增加观看数
- `POST /videos/:id/like` - 点赞视频
- `POST /videos/:id/favorite` - 收藏视频
- `POST /videos/:id/share` - 分享视频

### 评论

- `GET /comments/video/:videoId` - 获取视频的评论
- `POST /comments` - 创建评论
- `DELETE /comments/:id` - 删除评论
- `POST /comments/:id/like` - 点赞评论

## 许可证

[MIT](LICENSE) 