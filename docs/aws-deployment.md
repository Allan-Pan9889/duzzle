# Duzzle AWS 部署指南

将 Duzzle（Next.js 16 + Prisma + PostgreSQL）部署到 AWS：**EC2 运行应用 + RDS PostgreSQL**。适合印度市场，推荐区域 **ap-south-1（孟买）**。

---

## 1. 架构概览

```
用户 → Route 53（可选）→ EC2 (Nginx :443) → Next.js (:3000, PM2)
                              ↓
                         RDS PostgreSQL (:5432, 内网)
```

| 组件 | 建议规格 | 说明 |
|------|----------|------|
| EC2 | `t3.small`（2 vCPU / 2GB） | 跑 Next.js + Nginx |
| RDS | `db.t4g.micro`（PostgreSQL 16） | 生产数据库 |
| 存储 | EC2 30GB gp3 | 代码 + `public/demo` 图片已在仓库内 |
| 域名 | 可选 | 绑定 HTTPS 与 Razorpay 回调 |

预估月费（按需）：约 **$25–40 USD**（视实例与流量而定）。

---

## 2. 前置准备

- AWS 账号（建议开启 MFA）
- 域名（可选，例如 `shop.yourdomain.com`）
- GitHub 仓库已就绪：`https://github.com/Allan-Pan9889/duzzle`
- Razorpay **Live** 密钥（上线支付时）
- 本地已验证：`npm run build` 可通过

---

## 3. 创建 RDS PostgreSQL

### 3.1 创建数据库

1. 打开 **RDS → Create database**
2. 选择 **PostgreSQL 16**
3. 模板：**Production** 或 **Dev/Test**（测试可用后者）
4. 设置：
   - DB instance identifier: `duzzle-db`
   - Master username: `duzzle_admin`
   - Master password: **强密码**（记下来）
   - DB name: `duzzle`
5. 实例类：`db.t4g.micro`（小流量够用）
6. **Storage**：20GB，启用 autoscaling 可选
7. **Connectivity**：
   - VPC：默认或新建
   - **Public access：No**（推荐，仅 EC2 内网访问）
   - 新建或选用 **DB subnet group**
8. 创建完成后，记下 **Endpoint**，形如：
   ```
   duzzle-db.xxxxx.ap-south-1.rds.amazonaws.com
   ```

### 3.2 安全组（RDS）

创建或编辑 RDS 安全组 `duzzle-rds-sg`：

| 类型 | 端口 | 来源 |
|------|------|------|
| PostgreSQL | 5432 | EC2 安全组 ID（下一步创建） |

**不要**对 `0.0.0.0/0` 开放 5432。

---

## 4. 创建 EC2 实例

### 4.1 启动实例

1. **EC2 → Launch instance**
2. 名称：`duzzle-app`
3. AMI：**Ubuntu Server 22.04 LTS**
4. 实例类型：`t3.small`
5. 密钥对：新建或选用已有 `.pem`（下载保存）
6. 网络：与 RDS **同一 VPC**
7. 安全组 `duzzle-ec2-sg`：

| 类型 | 端口 | 来源 |
|------|------|------|
| SSH | 22 | 你的办公 IP（勿用 0.0.0.0/0） |
| HTTP | 80 | 0.0.0.0/0 |
| HTTPS | 443 | 0.0.0.0/0 |

8. 存储：30GB gp3
9. （推荐）分配 **Elastic IP**，避免重启换 IP

### 4.2 回写 RDS 安全组

将 RDS 的 5432 入站来源设为 **`duzzle-ec2-sg`**。

---

## 5. 登录 EC2 并安装依赖

```bash
# 本地连接（替换密钥与 IP）
ssh -i ~/Downloads/duzzle-key.pem ubuntu@<EC2_PUBLIC_IP>
```

```bash
# 系统更新
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# 验证
node -v   # v20.x
npm -v

# PM2 进程管理
sudo npm install -g pm2

# 应用目录
sudo mkdir -p /var/www/duzzle
sudo chown ubuntu:ubuntu /var/www/duzzle
cd /var/www/duzzle
```

---

## 6. 拉取代码并配置环境

```bash
cd /var/www/duzzle
git clone https://github.com/Allan-Pan9889/duzzle.git .
# 若仓库私有：配置 Deploy Key 或 PAT

cp .env.example .env
nano .env
```

### 6.1 生产环境变量示例

```env
DATABASE_URL="postgresql://duzzle_admin:YOUR_STRONG_PASSWORD@duzzle-db.xxxxx.ap-south-1.rds.amazonaws.com:5432/duzzle?sslmode=require"

JWT_SECRET="用 openssl rand -base64 32 生成"

RAZORPAY_KEY_ID="rzp_live_xxxx"
RAZORPAY_KEY_SECRET="xxxx"
RAZORPAY_WEBHOOK_SECRET="xxxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxx"

ADMIN_EMAIL="admin@duzzle.com"
ADMIN_PASSWORD="生产环境强密码"

NEXT_PUBLIC_APP_URL="https://shop.yourdomain.com"
```

生成 JWT 密钥：

```bash
openssl rand -base64 32
```

> **安全**：`.env` 不要提交到 Git；生产务必修改默认 `admin123`。

---

## 7. 构建与初始化数据库

```bash
cd /var/www/duzzle

npm ci
npm run build

# 同步表结构 + 种子数据（管理员、站点配置）
npm run db:push
npm run db:seed

# 可选：导入演示商品（Myntra 图片，已在 public/demo/）
npm run seed:urbanic
```

若 `db:push` 连不上 RDS，检查：

1. EC2 与 RDS 是否同 VPC
2. RDS 安全组是否允许 EC2 安全组访问 5432
3. `DATABASE_URL` 用户名、密码、库名是否正确

---

## 8. 使用 PM2 启动应用

```bash
cd /var/www/duzzle

pm2 start npm --name duzzle -- start
pm2 save
pm2 startup
# 按提示执行 sudo 命令，实现开机自启

pm2 status
pm2 logs duzzle
```

应用监听 **3000** 端口（仅本机，由 Nginx 反向代理）。

---

## 9. Nginx 反向代理

```bash
sudo nano /etc/nginx/sites-available/duzzle
```

```nginx
server {
    listen 80;
    server_name shop.yourdomain.com;  # 或 EC2 公网 IP

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/duzzle /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

浏览器访问 `http://<EC2_IP>` 应能看到首页。

---

## 10. HTTPS（Let's Encrypt）

需已解析域名到 EC2 公网 IP（Route 53 或域名商 DNS）。

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d shop.yourdomain.com
```

按提示选择重定向 HTTP → HTTPS。证书自动续期。

更新 `.env`：

```env
NEXT_PUBLIC_APP_URL="https://shop.yourdomain.com"
```

然后重启应用：

```bash
cd /var/www/duzzle && pm2 restart duzzle
```

---

## 11. Razorpay 生产配置

1. [Razorpay Dashboard](https://dashboard.razorpay.com) → **Live Mode**
2. 填入 `.env` 中的 Live Key ID / Secret
3. `NEXT_PUBLIC_RAZORPAY_KEY_ID` 与 Key ID 一致
4. Webhook（若启用）：回调 URL 设为  
   `https://shop.yourdomain.com/api/payments/razorpay/verify`  
   （以你实际路由为准）
5. 重启：`pm2 restart duzzle`

开发环境 OTP 固定 `123456`；**生产需接入 MSG91**（代码中已预留扩展点）。

---

## 12. 部署后检查清单

| 项 | 验证方式 |
|----|----------|
| 首页 / 男女装列表 | 图片为服装图，非占位图 |
| 用户 OTP 登录 | 手机号 + OTP |
| 购物车 / COD 下单 | 完整走通 |
| 管理后台 | `https://你的域名/admin/login` |
| 修改管理员密码 | 登录后立即在后台或 DB 修改 |
| HTTPS | 浏览器锁标志正常 |
| RDS 备份 | RDS 控制台开启自动备份（建议 7 天） |

---

## 13. 日常更新发布

```bash
cd /var/www/duzzle
git pull origin main
npm ci
npm run build
pm2 restart duzzle
```

若 schema 有变更：

```bash
npm run db:push
```

若仅更新演示图片：

```bash
npm run update:demo-images
npm run update:home-images
pm2 restart duzzle
```

---

## 14. 常见问题

### 图片仍显示旧占位图

Next.js 会缓存优化后的图片。在服务器执行：

```bash
npm run clear:image-cache
rm -rf .next
npm run build
pm2 restart duzzle
```

浏览器 **硬刷新**（Cmd+Shift+R）。

### 构建内存不足

`t3.small` 若 build OOM，临时加 swap：

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

或升级到 `t3.medium`。

### 连接 RDS 超时

- 确认 RDS **非 Public** 时，只能从同 VPC 的 EC2 连接
- 检查安全组链：EC2 → RDS 5432

---

## 15. 可选优化（后续）

| 需求 | AWS 服务 |
|------|----------|
| 静态资源 CDN | CloudFront + S3（迁移 `public/demo`） |
| 日志与监控 | CloudWatch Agent + PM2 logs |
| 自动扩缩 | ALB + Auto Scaling（流量大时） |
| 数据库高可用 | RDS Multi-AZ |
| CI/CD | GitHub Actions → SSH 部署 EC2 |

---

## 16. 最小命令速查

```bash
# 首次部署
git clone https://github.com/Allan-Pan9889/duzzle.git /var/www/duzzle
cd /var/www/duzzle && cp .env.example .env && nano .env
npm ci && npm run build && npm run db:push && npm run db:seed
pm2 start npm --name duzzle -- start && pm2 save

# 更新
git pull && npm ci && npm run build && pm2 restart duzzle
```

---

**联系**（站点内已配置）：duzzlecode2026@gmail.com · +91 8680014906
