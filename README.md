# SMS Resender

一个运行在 Linux 手机上的短信转发工具。

通过监听 Chatty / Chats 的 SQLite 短信数据库，在收到新短信后自动转发到 QQ 私聊。

当前项目基于：

- Bun
- TypeScript
- node-napcat-ts
- Chatty / Chats
- SQLite

## 功能

- 监听 Linux 手机上的短信数据库
- 自动识别新收到的短信
- 过滤已发送短信，只转发接收到的短信
- 通过 NapCat 转发到指定 QQ
- 支持 Docker 部署

## 工作原理

Linux 手机收到短信后，Chats / Chatty 会把短信写入数据库：

```text
~/.purple/chatty/db/chatty-history.db
```

## 启动

> 你需要在 `napcat` 启动 3001 端口的 `websocket` 服务器

```bash
docker compose up -d --build
```
