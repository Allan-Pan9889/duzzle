# Duzzle AWS 部署指南（Amazon Linux 2023 · 单机 PostgreSQL）

将 Duzzle（Next.js 16 + Prisma + PostgreSQL）部署到 **单台 EC2**：应用、Nginx、数据库全部在同一实例上运行，**不使用 RDS**。

适合印度市场，推荐区域 **ap-south-1（孟买）**。

---

## 1. 架构概览

```
用户 → Route 53（可选）→ EC2
                          ├── Nginx (:443)
                          ├── Next.js (:3000, PM2)
                          └── PostgreSQL (:5432, 仅本机 127.0.0.1)
```

| 组件 | 建议规格 | 说明 |
|------|----------|------|
| EC2 | `t3.medium`（2 vCPU / 4GB） | 应用 + 本地库；小流量可试 `t3.small` + swap |
| AMI | **Amazon Linux 2023** | 默认用户 `ec2-user` |
| PostgreSQL | 16（本机安装） | 只监听 localhost，**安全组不开放 5432** |
| 存储 | 40GB gp3 | 系统 + 代码 + 数据库数据 |
| 域名 | 可选 | HTTPS 与 Razorpay 回调 |

预估月费（按需）：约 **$15–25 USD**（无 RDS，成本更低）。

> **说明**：单机数据库适合演示、内测、中小流量。流量或数据量上来后，再迁移到 RDS 或 Aurora。

---

## 2. 前置准备

- AWS 账号（建议开启 MFA）
- 域名（可选，例如 `shop.yourdomain.com`）
- GitHub 仓库：`https://github.com/Allan-Pan9889/duzzle`
- Razorpay **Live** 密钥（正式上线支付时）
- 本地已验证：`npm run build` 可通过

---

## 3. 创建 EC2 实例

### 3.1 启动实例

1. **EC2 → Launch instance**
2. 名称：`duzzle-app`
3. AMI：**Amazon Linux 2023 AMI**
4. 实例类型：`t3.medium`（推荐）
5. 密钥对：新建或选用已有 `.pem`
6. 安全组 `duzzle-ec2-sg`：

| 类型 | 端口 | 来源 | 说明 |
|------|------|------|------|
| SSH | 22 | 你的办公 IP | 不要用 `0.0.0.0/0` |
| HTTP | 80 | 0.0.0.0/0 | Web |
| HTTPS | 443 | 0.0.0.0/0 | Web |

**不要**开放 5432（PostgreSQL 仅本机访问）。

7. 存储：**40GB** gp3
8. （推荐）分配 **Elastic IP**

### 3.2 SSH 登录

```bash
ssh -i ~/Downloads/duzzle-key.pem ec2-user@<EC2_PUBLIC_IP>
```

---

## 4. 系统初始化

```bash
# 系统更新
sudo dnf update -y

# 基础工具
sudo dnf install -y git nginx postgresql16-server postgresql16

# Node.js 20 LTS（NodeSource）
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

node -v   # v20.x
npm -v

# PM2
sudo npm install -g pm2

# 应用目录
sudo mkdir -p /var/www/duzzle
sudo chown ec2-user:ec2-user /var/www/duzzle
```

---

## 5. 配置本地 PostgreSQL

### 5.1 初始化并启动

```bash
# 初始化数据目录（仅首次）
sudo postgresql-setup --initdb

# 开机自启
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### 5.2 创建数据库与用户

```bash
sudo -u postgres psql
```

在 `psql` 中执行：

```sql
CREATE USER duzzle WITH PASSWORD 'YOUR_STRONG_DB_PASSWORD';
CREATE DATABASE duzzle OWNER duzzle;
GRANT ALL PRIVILEGES ON DATABASE duzzle TO duzzle;
\q
```

### 5.3 确认仅本机监听（默认即安全）

```bash
sudo grep "^listen_addresses" /var/lib/pgsql/data/postgresql.conf
# 应为 listen_addresses = 'localhost' 或注释掉（等同 localhost）
```

`pg_hba.conf` 默认允许本机连接，无需对公网暴露。

验证连接：

```bash
psql "postgresql://duzzle:YOUR_STRONG_DB_PASSWORD@127.0.0.1:5432/duzzle" -c "SELECT 1;"
```

---

## 6. 拉取代码并配置环境

```bash
cd /var/www/duzzle
git clone https://github.com/Allan-Pan9889/duzzle.git .
# 私有仓库：配置 Deploy Key 或 PAT

cp .env.example .env
nano .env
```

### 6.1 生产环境变量示例

```env
DATABASE_URL="postgresql://duzzle:YOUR_STRONG_DB_PASSWORD@127.0.0.1:5432/duzzle"

JWT_SECRET="用下方命令生成"

RAZORPAY_KEY_ID="rzp_live_xxxx"
RAZORPAY_KEY_SECRET="xxxx"
RAZORPAY_WEBHOOK_SECRET="xxxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxx"

ADMIN_EMAIL="admin@duzzle.com"
ADMIN_PASSWORD="生产环境强密码"

NEXT_PUBLIC_APP_URL="https://shop.yourdomain.com"

# Minibe OTP 短信（生产必填，测试可暂不填并改用 OTP_DEV_CODE）
OTP_API_KEY="your-api-key"
OTP_API_SECRET="your-api-secret"
OTP_APP_ID="your-app-id"

# 测试阶段固定 OTP（正式上线前删除）
# OTP_DEV_CODE="123456"
# NEXT_PUBLIC_OTP_DEV_CODE="123456"
```

> `NEXT_PUBLIC_OTP_DEV_CODE` 需在 **`npm run build` 之前** 写入 `.env`，构建后登录页才会显示提示。修改后需重新 `npm run build` 并 `pm2 restart duzzle`。

生成 JWT 密钥：

```bash
openssl rand -base64 32
```

> **安全**：`.env` 勿提交 Git；生产环境务必改掉默认 `admin123`。

---

## 7. 构建与初始化数据

```bash
cd /var/www/duzzle

npm ci
npm run build

# 同步表结构 + 种子（管理员、运费配置等）
npm run db:push
npm run db:seed

# 可选：导入演示商品（Myntra 图片在 public/demo/）
npm run seed:urbanic
```

若 `db:push` 失败，检查：

1. PostgreSQL 是否在运行：`sudo systemctl status postgresql`
2. `DATABASE_URL` 用户名、密码、库名是否正确
3. 是否使用 `127.0.0.1` 而非公网 IP

---

## 8. PM2 启动应用

```bash
cd /var/www/duzzle

pm2 start npm --name duzzle -- start
pm2 save

# 开机自启（按输出执行 sudo 命令）
pm2 startup systemd
```

```bash
pm2 status
pm2 logs duzzle
```

应用监听 **127.0.0.1:3000**，由 Nginx 对外暴露。

---

## 9. Nginx 反向代理

Amazon Linux 2023 使用 `/etc/nginx/conf.d/`：

```bash
sudo nano /etc/nginx/conf.d/duzzle.conf
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
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

访问 `http://<EC2_IP>` 应能看到首页。

---

## 10. HTTPS（Let's Encrypt）

域名需已解析到 EC2 公网 IP。

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d shop.yourdomain.com
```

按提示开启 HTTP → HTTPS 重定向。

更新 `.env` 后重启：

```env
NEXT_PUBLIC_APP_URL="https://shop.yourdomain.com"
```

```bash
cd /var/www/duzzle && pm2 restart duzzle
```

证书续期由 certbot 定时任务自动处理，可用下面命令自检：

```bash
sudo certbot renew --dry-run
```

---

## 11. Razorpay 生产配置

1. [Razorpay Dashboard](https://dashboard.razorpay.com) → **Live Mode**
2. 将 Live Key 写入 `.env`
3. `NEXT_PUBLIC_RAZORPAY_KEY_ID` 与 Key ID 保持一致
4. Webhook（若启用）：  
   `https://shop.yourdomain.com/api/payments/razorpay/verify`
5. `pm2 restart duzzle`

生产环境配置 Minibe OTP（见 `.env` 中 `OTP_API_*`）；测试阶段可用 `OTP_DEV_CODE=123456` 跳过短信。

---

## 12. 数据库备份（本机 PostgreSQL）

单机部署务必自行备份。示例：每日凌晨 3 点 dump 到 `/var/backups/duzzle`：

```bash
sudo mkdir -p /var/backups/duzzle
sudo chown ec2-user:ec2-user /var/backups/duzzle

crontab -e
```

加入：

```cron
0 3 * * * pg_dump "postgresql://duzzle:YOUR_STRONG_DB_PASSWORD@127.0.0.1:5432/duzzle" | gzip > /var/backups/duzzle/duzzle-$(date +\%F).sql.gz
```

保留 7 天（可选）：

```cron
0 4 * * * find /var/backups/duzzle -name "*.sql.gz" -mtime +7 -delete
```

恢复示例：

```bash
gunzip -c /var/backups/duzzle/duzzle-2026-06-08.sql.gz | psql "postgresql://duzzle:PASSWORD@127.0.0.1:5432/duzzle"
```

---

## 13. 部署后检查清单

| 项 | 验证方式 |
|----|----------|
| 首页 / 男女装 | 图片为服装实拍 |
| OTP 登录 | 10 位印度手机号 |
| 购物车 / COD | 完整下单流程 |
| 管理后台 | `/admin/login` |
| 管理员密码 | 已改为强密码 |
| HTTPS | 证书有效 |
| PostgreSQL | `sudo systemctl status postgresql` 为 active |
| 备份 cron | `ls /var/backups/duzzle` 有 dump 文件 |

---

## 14. 日常更新发布

### 14.1 常规代码更新（无 Schema 变更）

```bash
cd /var/www/duzzle
git pull origin main
npm ci
npm run build
pm2 restart duzzle
```

### 14.2 含 Schema / 商品库变更（如 2026-06 大版本）

本次类型更新包括：`KIDS` 类目、`subCategory` 字段、移除变体 `color`、1500 演示商品图等。

**在 EC2 上按顺序执行：**

```bash
cd /var/www/duzzle
git pull origin main
npm ci

# 1) 若从旧版升级且库内仍有「每尺码 × 多颜色」变体，先合并再改表
npx tsx scripts/migrate-remove-color.ts

# 2) 同步 Prisma Schema（新增 KIDS / subCategory，删除 color 列）
npx prisma db push --accept-data-loss
npx prisma generate

# 3) 构建（必须在 generate 之后）
npm run build

# 4) 导入演示商品（三选一，见下）
# …

# 5) 重启
pm2 restart duzzle
```

**演示商品入库（三选一）：**

| 方式 | 适用 | 命令 |
|------|------|------|
| A. 重新采集（慢） | 仓库无图片或需刷新价格 | `npm run seed:nykaa` 后 `npm run seed:firstcry`（约 30–60 分钟，需出网） |
| B. 仅补男装断点 | 女装/童装已有，男装未完成 | `npm run seed:nykaa:resume-men` |
| C. 本地 dump 恢复（最快） | 本地已跑完 1500 条 | 见 §14.3 |

> `git pull` 已包含 `public/demo/products/` 图片时，仍须 **写入 PostgreSQL**（图片路径在库里）。只 pull 代码不会自动出现商品列表。

### 14.3 从本地数据库恢复到 EC2（推荐，省采集时间）

在**本地 Mac**（已有 1500 条商品）：

```bash
pg_dump "postgresql://a1@localhost:5432/duzzle" \
  --no-owner --no-acl \
  | gzip > duzzle-demo-$(date +%F).sql.gz
scp -i ~/Downloads/duzzle-key.pem duzzle-demo-*.sql.gz ec2-user@<EC2_IP>:~/
```

在 **EC2** 上（会覆盖库内 `Product` 等表数据，**先备份**）：

```bash
# 可选：备份当前库
pg_dump "postgresql://duzzle:PASSWORD@127.0.0.1:5432/duzzle" | gzip > ~/duzzle-backup-$(date +%F).sql.gz

# 恢复
gunzip -c ~/duzzle-demo-*.sql.gz | psql "postgresql://duzzle:PASSWORD@127.0.0.1:5432/duzzle"

cd /var/www/duzzle
npm run clear:image-cache
rm -rf .next
npm run build
pm2 restart duzzle
```

### 14.4 更新后验证

```bash
curl -s "http://127.0.0.1:3000/api/products?category=WOMEN&limit=1" | head -c 200
curl -s -o /dev/null -w "%{http_code}\n" "http://127.0.0.1:3000/women"
curl -s -o /dev/null -w "%{http_code}\n" "http://127.0.0.1:3000/kids"
```

浏览器访问 `/search?minPrice=100&maxPrice=999`、`/women`、`/men`、`/kids`，点开任意商品详情页，确认非 404。

Schema 仅有小改动、无 `--accept-data-loss` 时：

```bash
npm run db:push
```

仅更新演示图片：

```bash
npm run update:demo-images
npm run update:home-images
pm2 restart duzzle
```

---

## 15. 常见问题

### 图片仍显示旧占位图

```bash
cd /var/www/duzzle
npm run clear:image-cache
rm -rf .next
npm run build
pm2 restart duzzle
```

浏览器 **硬刷新**（Cmd+Shift+R）。

### `npm run build` 内存不足

`t3.small` 容易 OOM，建议升 `t3.medium`，或临时加 swap：

```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
```

### PostgreSQL 连接被拒绝

```bash
sudo systemctl restart postgresql
sudo -u postgres psql -c "SELECT 1;"
```

检查 `.env` 中 `DATABASE_URL` 是否指向 `127.0.0.1`。

### Nginx 502 Bad Gateway

```bash
pm2 status          # duzzle 是否在跑
pm2 logs duzzle      # 看应用错误
curl -I http://127.0.0.1:3000
```

### SELinux 导致 Nginx 无法反代（少见）

```bash
sudo setsebool -P httpd_can_network_connect 1
```

---

## 16. 可选后续优化

| 需求 | 方案 |
|------|------|
| 数据库迁到托管 | 改用 RDS / Aurora，只改 `DATABASE_URL` |
| 静态资源加速 | CloudFront + S3 |
| 监控 | CloudWatch Agent + `pm2 logs` |
| 自动部署 | GitHub Actions SSH 到 EC2 |
| 磁盘扩容 | EC2 卷扩容后 `growpart` + `xfs_growfs` |

---

## 17. 最小命令速查

```bash
# === 首次部署（在 EC2 上，Amazon Linux 2023）===

# 1. 装依赖
sudo dnf update -y
sudo dnf install -y git nginx postgresql16-server postgresql16
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
sudo npm install -g pm2

# 2. 数据库
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql
sudo -u postgres psql -c "CREATE USER duzzle WITH PASSWORD 'YOUR_STRONG_DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE duzzle OWNER duzzle;"

# 3. 应用
sudo mkdir -p /var/www/duzzle && sudo chown ec2-user:ec2-user /var/www/duzzle
cd /var/www/duzzle
git clone https://github.com/Allan-Pan9889/duzzle.git .
cp .env.example .env && nano .env   # DATABASE_URL 指向 127.0.0.1
npm ci && npm run build && npm run db:push && npm run db:seed
pm2 start npm --name duzzle -- start && pm2 save && pm2 startup systemd

# 4. Nginx + HTTPS
# 写入 /etc/nginx/conf.d/duzzle.conf 后：
sudo systemctl restart nginx
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d shop.yourdomain.com

# === 日常更新 ===
cd /var/www/duzzle && git pull && npm ci && npm run build && pm2 restart duzzle
```

---

**联系**（站点内已配置）：duzzlecode2026@gmail.com · +91 8680014906
