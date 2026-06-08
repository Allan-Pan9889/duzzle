# Duzzle 印度服装电商 — 设计规格书

> 版本：1.0 · 日期：2026-06-08 · 状态：已批准

## 1. 项目概述

**品牌**：Duzzle  
**市场**：印度  
**类型**：完整电商（用户注册、在线支付、订单管理后台）  
**参考风格**：[Urbanic India](https://in.urbanic.com/) 的布局与交互 + Duzzle 黑白奢华视觉  
**Logo**：`/duzzle.png`（黑底衬线字标 DUZZLE）

### 联系方式（页脚 & 联系页）

- Email：duzzlecode2026@gmail.com
- Mobile：+91 8680014906

---

## 2. 需求确认

| 维度 | 决策 |
|------|------|
| 范围 | 完整电商（C） |
| 品类 | 男女装（C） |
| 演示数据 | 爬取 Urbanic，仅开发用（D） |
| 语言 | 仅英文（A） |
| 终端 | 响应式网站（A） |
| 支付 | Razorpay + COD（B） |
| 登录 | 手机号 + OTP（A） |
| 后台 | 基础运营，营销/分析后续迭代（D） |
| 配送 | 全印度 + 满额免运费（B） |
| 视觉 | Urbanic 布局 + Duzzle 黑白奢华（C） |

### 已确认默认值

| 配置项 | 值 |
|--------|-----|
| 免运费门槛 | ₹999 |
| 基础运费 | ₹79 |
| 开发 OTP | 固定验证码 `123456` |
| 生产 OTP | MSG91（上线时接入） |
| 技术方案 | Next.js 全栈单体（方案 1） |

---

## 3. 信息架构

```
/                         首页
/women                    女装列表
/men                      男装列表
/new-arrivals             新品
/search                   搜索结果
/product/[slug]           商品详情
/cart                     购物车
/checkout                 结账
/account                  我的账户
/account/orders           订单列表
/account/orders/[id]      订单详情
/account/addresses        地址管理
/account/wishlist         收藏夹
/shipping-policy          配送政策
/return-policy            退换货政策
/privacy-policy           隐私政策
/contact                  联系我们
/admin                    管理后台（独立登录）
/admin/products           商品管理
/admin/orders             订单管理
/admin/settings           运费配置
```

---

## 4. 视觉设计系统

### 色彩

| 角色 | 色值 | 用途 |
|------|------|------|
| Primary | `#0A0A0A` | 文字、导航、按钮 |
| Background | `#FFFFFF` | 页面底色 |
| Surface | `#F5F5F5` | 卡片背景、分隔 |
| Accent | `#C9A96E` | 折扣标签、强调（可选） |
| Muted | `#6B6B6B` | 次要文字 |

### 字体

- 标题 / Logo 风格：衬线体（Playfair Display 或 Cormorant Garamond）
- 正文 / UI：无衬线体（Inter 或 DM Sans）

### 布局原则（继承 Urbanic）

- 顶部固定导航，移动端汉堡菜单
- 首页全宽 Banner 轮播
- 商品网格：手机 2 列 / 平板 3 列 / 桌面 4 列
- 大量留白，黑白摄影风 Banner
- 商品卡片：图片 + 名称 + 价格（₹）+ 折扣标签 + 收藏按钮

---

## 5. 核心用户流程

### 5.1 浏览 → 购买

1. 用户浏览首页 / 分类页 / 搜索
2. 进入商品详情，选择尺码、颜色
3. 加入购物车或立即购买
4. 未登录 → 手机号 OTP 登录
5. 填写 / 选择收货地址（含 Pin Code）
6. 选择支付方式（Razorpay 或 COD）
7. 确认订单 → 支付（在线）或下单（COD）
8. 订单成功页 + 邮件/页面确认

### 5.2 订单状态流转

```
PENDING_PAYMENT → PAID → SHIPPED → DELIVERED → COMPLETED
                 ↘ CANCELLED
COD 路径：PENDING_PAYMENT（待发货）→ SHIPPED → DELIVERED → COMPLETED
```

---

## 6. 技术架构

```
┌─────────────────────────────────────────┐
│         Next.js 14+ App Router          │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │ 前台页面 │  │ API Routes│  │ /admin │ │
│  └─────────┘  └──────────┘  └────────┘ │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┬────────────┐
    ▼          ▼          ▼            ▼
 PostgreSQL  Razorpay   Dev OTP      Seed Script
 + Prisma    (支付)     (123456)     (Urbanic 演示)
```

### 技术选型

| 模块 | 技术 |
|------|------|
| 框架 | Next.js 14+ App Router, TypeScript |
| 样式 | Tailwind CSS |
| 数据库 | PostgreSQL + Prisma ORM |
| 认证 | 自定义 JWT + 手机号 OTP |
| 支付 | Razorpay Node SDK |
| 部署 | Vercel + Neon PostgreSQL |
| 图片 | `public/` 本地存储（演示），上线可换 Cloudinary |

### 环境变量

```env
DATABASE_URL=
JWT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
NEXT_PUBLIC_APP_URL=
# 生产环境
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=
```

---

## 7. 数据模型（核心实体）

### User

- id, phone (unique), name?, createdAt

### OtpSession

- id, phone, code, expiresAt, verified

### Product

- id, name, slug, description, price, compareAtPrice?, category (WOMEN|MEN), images[], isDemo, isActive, createdAt

### ProductVariant

- id, productId, size, color, sku, stock

### Cart / CartItem

- userId, productVariantId, quantity

### Address

- userId, fullName, phone, line1, line2?, city, state, pinCode, isDefault

### Order

- id, orderNumber, userId, status, paymentMethod (RAZORPAY|COD), paymentStatus, subtotal, shippingFee, total, addressSnapshot (JSON), razorpayOrderId?, razorpayPaymentId?, createdAt

### OrderItem

- orderId, productVariantId, productName, size, color, price, quantity

### SiteSettings

- freeShippingThreshold (999), baseShippingFee (79)

### Admin

- id, email, passwordHash

---

## 8. 支付与配送规则

| 规则 | 值 |
|------|-----|
| 货币 | INR (₹) |
| 免运费门槛 | ₹999（订单 subtotal ≥ 999 时 shippingFee = 0） |
| 基础运费 | ₹79 |
| COD | 全印度可用（第一版不做 Pin Code 限制） |
| Razorpay | 支持 UPI、信用卡/借记卡、Net Banking |
| 支付失败 | 订单保持 PENDING_PAYMENT，用户可重试 |

---

## 9. 管理后台

### 功能范围（v1）

| 模块 | 能力 |
|------|------|
| 商品管理 | 列表、新增、编辑、上下架、删除、库存 |
| 订单管理 | 列表、详情、状态更新（发货/完成/取消） |
| 运费配置 | 修改免运费门槛和基础运费 |
| 管理员认证 | 邮箱 + 密码，与前台用户分离 |

### 不在 v1 范围

- 优惠券 / Banner 配置
- 数据分析报表
- 多语言
- BNPL

---

## 10. 演示数据策略

- 开发阶段运行 `scripts/seed-urbanic.ts` 爬取 Urbanic 公开商品
- 字段：名称、价格、图片 URL、分类（男装/女装推断）
- 数据库标记 `isDemo = true`
- 图片下载至 `public/demo/products/`
- **上线前必须删除所有 `isDemo` 商品并替换为自有数据**（版权与合规要求）

---

## 11. 交付分期

| Sprint | 内容 | 预估 |
|--------|------|------|
| Sprint 1 | 脚手架、数据库、Seed、首页+列表+详情 | 3–4 天 |
| Sprint 2 | 购物车、OTP 登录、地址管理 | 2–3 天 |
| Sprint 3 | Razorpay + COD 结账、订单流程 | 2–3 天 |
| Sprint 4 | 管理后台、政策页、联系页、部署 | 2–3 天 |

**合计**：约 9–13 天

---

## 12. 政策页内容要点

### Shipping Policy

- 全印度配送，5–9 个工作日
- 满 ₹999 免运费，未满收 ₹79
- Pin Code 必填

### Return Policy

- 15 天内退换（未使用、原包装）
- 免费上门取件（文字说明，v1 不接入物流 API）

### Privacy Policy

- 收集手机号、地址用于订单履约
- 不向第三方出售个人信息

---

## 13. 风险与约束

| 风险 | 缓解 |
|------|------|
| Urbanic 演示数据版权 | 仅开发用，`isDemo` 标记，上线前清除 |
| Urbanic 反爬 | Seed 脚本限速、失败重试、可手动补充 JSON |
| Razorpay 测试模式 | 开发用 Razorpay Test Keys |
| OTP 成本 | 开发阶段固定验证码，上线接 MSG91 |

---

## 14. 批准记录

- 设计方案：2026-06-08 用户确认
- 默认值（运费/OTP/技术栈）：2026-06-08 用户确认
