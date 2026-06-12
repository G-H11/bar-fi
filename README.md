# Vinothèque（酒藏）— NFT 吧台平台

> **Hackathon 赛道**: [Zai（z.ai）](https://z.ai) — 智谱 GLM-5.1 API
> **开发框架**: Scaffold-ETH 2（Hardhat + Next.js 15 + DaisyUI 5 + TailwindCSS 4）

---

## 项目目标

将酒文化与 NFT 相结合，构建一个**酒品数字资产发行与交易平台**。

- **酒庄/创作者**可以铸造代表酒品的 NFT（ERC-721），设定元数据（产区、年份、品种等）
- **收藏者**在「吧台市场」浏览、购买在售珍酿，在「我的 NFT」管理个人酒藏
- **AI 侍酒师**（由 GLM-5.1 驱动）提供智能品鉴笔记和搭配推荐（规划中）

---

## 架构总览

```
bar-fi/
├── packages/
│   ├── hardhat/                        # 智能合约层
│   │   ├── contracts/
│   │   │   └── YourCollectible.sol     # ERC-721 + 上架/购买/版税
│   │   ├── deploy/                     # Hardhat-deploy 脚本
│   │   └── test/                       # 合约测试
│   ├── nextjs/                         # 前端应用层
│   │   ├── app/
│   │   │   ├── page.tsx                # Home — 品牌介绍 + 导航
│   │   │   ├── myNFTs/                 # 我的 NFT — 个人持有展示
│   │   │   ├── creatNft/               # 发行 NFT — 单枚铸造
│   │   │   ├── creatNFTs/              # 批量发行 — 批量铸造
│   │   │   ├── ListNft/                # 上架 NFT — 设定价格上架
│   │   │   ├── BuyNft/                 # 吧台市场 — 浏览在售 + 购买
│   │   │   ├── profile/                # 用户档案 — 昵称/地址管理
│   │   │   ├── api/ipfs/               # IPFS 代理路由
│   │   │   │   ├── add/                #   元数据上传到 Pinata
│   │   │   │   ├── addimg/             #   图片上传到 Pinata
│   │   │   │   └── get-metadata/       #   从 Pinata gateway 读取
│   │   │   └── nft/[id]/               # 单品详情页
│   │   ├── components/
│   │   │   ├── Header.tsx              # 顶部导航菜单
│   │   │   ├── Footer.tsx              # 页脚
│   │   │   └── HeroSection.tsx         # 可复用 Hero 背景组件
│   │   ├── styles/globals.css          # 黑金主题 DaisyUI 配置
│   │   ├── contracts/deployedContracts.ts  # 自动生成的合约 ABI
│   │   └── utils/tokenization/
│   │       ├── ipfs-fetch.ts           # IPFS 上传/读取工具
│   │       └── nftsMetadata.ts         # NFT 元数据预定义模板
│   └── ...config files
```

### 三层架构

| 层 | 技术 | 职责 |
|----|------|------|
| **合约** | Solidity (Hardhat) | ERC-721 NFT 铸造、上架、购买、版税分配 |
| **前端** | Next.js 15 + Wagmi + RainbowKit | 用户界面、钱包连接、链上交互 |
| **存储** | IPFS (Pinata) | 图片与元数据去中心化存储 |
| **AI** | GLM-5.1 (z.ai) | 智能侍酒师品鉴与推荐（规划中） |

---

## 智能合约关键流程

### 1. 发行（Mint）

```
用户上传图片 → IPFS 上传 → 获取 CID
                    ↓
       元数据(名称+描述+图片URL) → IPFS 上传 → 获取 CID
                    ↓
       调用 mintItem(address, cid, royaltyFee)
                    ↓
       铸造成功 → tokenIdCounter++
```

- `YourCollectible.mintItem(address, uri, royaltyFeeNumber)` — 铸造单枚 NFT
- `YourCollectible.mintBatch(address, uris[], royaltyFee, quantity)` — 批量铸造（≤20）

### 2. 上架（List）

```
拥有者输入 Token ID + 价格
         ↓
 调用 placeNftOnSale(tokenId, price)
         ↓
 NFT 从拥有者转移到合约托管
 上架费用（2.5%）自动扣除
 Token ID 加入在售列表
```

### 3. 购买（Buy）

```
买家支付 ETH → 调用 purchaseNft(tokenId)
         ↓
 检查是否≥标价 + 是否不是卖家本人
         ↓
 版税计算 → 版税金额转给版税接收者
 卖家收到剩余金额
 NFT 从合约转给买家
 从在售列表移除
```

### 4. 下架（Unlist）

```
卖家调用 unlistNft(tokenId)
         ↓
 NFT 从合约转回卖家
 从在售列表移除
```

---

## GLM-5.1 调用位置

> **我是 Hermes Agent，当前对话的 AI 驱动模型（GLM-5.1）。以下是我在项目中所做的事情：**

### 我在项目中做了什么

本项目在 Zai Hackathon 赛道开发，全程由 GLM-5.1（通过 Hermes Agent CLI）驱动。智谱 GLM-5.1 API 提供底层的**大语言模型推理能力**，我在该能力基础上执行了以下工作：

#### 已完成的代码开发

1. **智能合约扩展**
   - 在 Scaffold-ETH 2 生成的 `YourCollectible.sol` 基础上扩展了完整的上架/购买/下架市场逻辑
   - 实现了 `placeNftOnSale`、`purchaseNft`、`unlistNft`、`getAllListedNfts` 等市场函数
   - 集成 OpenZeppelin ERC-721Royalty 实现版税分配
   - 实现批量铸造 `mintBatch` 函数

2. **前端翻新**
   - 设计了黑金主题（DaisyUI 自定义 theme），深青色+金色配色方案
   - 重建了 Home 页品牌展示区，含 Hero 背景图、统计面板、功能卡片
   - 开发了 6 个功能页面的 Hero 背景图（每页配不同酒文化图片）
   - 重命名所有"铸造"为"发行"
   - 统调字体颜色体系（金色标题 + 亮青描述）

3. **新建页面**
   - `/creatNft` — 单枚 NFT 发行页面（图片上传 + 名称/描述 + 链上铸造）
   - `/creatNFTs` — 批量 NFT 发行页面
   - `/ListNft` — 上架页面（Token ID + 价格 + 状态检查）
   - `/BuyNft` — 吧台市场页面（展示在售列表 + 购买）
   - `/profile` — 用户档案页面（nickname/提现地址/bio）

4. **IPFS 集成**
   - API 路由 `/api/ipfs/add` — 元数据上传到 Pinata
   - API 路由 `/api/ipfs/addimg` — 图片上传到 Pinata
   - API 路由 `/api/ipfs/get-metadata` — 从 Pinata 读取元数据
   - 工具函数集 `ipfs-fetch.ts`

5. **用户档案系统**
   - 本地存储 localStorage 持久化
   - nickname、withdrawalAddress、bio 字段

#### 规划中的 GLM-5.1 功能

> 项目赛道的核心价值——**AI 侍酒师**——将在下一阶段实现：

| 功能 | GLM-5.1 调用方式 | 状态 |
|------|-------------------|------|
| 自动品鉴笔记 | `POST https://open.bigmodel.cn/api/paas/v4/chat/completions` 传入酒品元数据 | 待开发 |
| 餐酒搭配推荐 | 同端点，传入用户偏好+酒品元数据 | 待开发 |
| NFT 酒品描述生成 | 同端点，传入图片 URL/品种/年份等 | 待开发 |
| 智能搜索 | 同端点，语义搜索吧台酒品 | 待开发 |

AI 侍酒师功能的调用位置将在 `packages/nextjs/app/api/ai/` 目录下创建，通过 Next.js API 路由代理到 z.ai 的 OpenAI-compatible 端点。

---

## 运行方式

### 本地开发

```bash
# 终端 1：启动本地链
yarn chain

# 终端 2：部署合约
yarn deploy

# 终端 3：启动前端
yarn start
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 运行测试

```bash
yarn test
```

### 测试网部署

```bash
# 生成部署账号
yarn generate

# 部署到 Sepolia
yarn deploy --network sepolia

# 验证合约
yarn verify --network sepolia

# 部署前端到 Vercel
yarn vercel
```

### 环境变量

```
# packages/hardhat/.env
ALCHEMY_API_KEY=your_alchemy_key
ETHERSCAN_API_KEY=your_etherscan_key

# packages/nextjs/.env.local
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
```

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 智能合约 | Solidity + Hardhat |
| 前端 UI | DaisyUI 5 + TailwindCSS 4 |
| Web3 | Wagmi + Viem + RainbowKit |
| 存储 | IPFS (Pinata) |
| AI | GLM-5.1 (z.ai / 智谱) |
| 钱包 | MetaMask / Burner Wallet |

---

## 项目仓库


[https://github.com/G-H11/bar-fi](https://github.com/G-H11/bar-fi)



# 项目灵感及PPT大纲
# BarFi：现实酒业 + NFT —— 现实实业在 Web3 中的价值留存关系

## 一、核心介绍
- **项目名称**：BarFi（现实酒业 + NFT）
- **研究主题**：主要关注和研究现实实业在 Web3 中的价值留存关系

## 二、为什么选择酒业 + NFT？（而非传统 RWA）

### 1. 传统酒业的四大困境
| 困境 | 描述 |
|------|------|
| ① 酿造流程与时间成本 | 生产周期长，资金占用久，中小参与者难以进入 |
| ② 存量高（仓库积压） | 大量成品酒存放于仓库，缺乏有效流转，并非真正的保管 |
| ③ 地域流通性不足 | 受限于物流、渠道和地域关系，流通效率低 |
| ④ 受众局限 | 主要以喝酒群体、宴席场地等直接消费场景为主 |

### 2. 为什么选择 NFT？
- **NFT 特性与酒业困境的高度契合**：

| NFT 特性 | 对应解决的酒业困境 |
|----------|------------------|
| 通过 NFT 预售、持有转变为小型资产 | ① 酿造流程与时间成本 → 提前回笼资金，降低参与门槛 |
| 单纯的存放转变为托管、保管 | ② 存量高（仓库积压）→ 提升存量价值，增加安全性及金融属性 |
| 数字化转型方便全球地域流通 | ③ 地域流通性不足 → 突破物理限制，实现全球二级市场 |
| 增加藏品、金融属性，受众扩大 | ④ 受众局限 → 吸引收藏家、投资者、Web3 用户，拓展非饮酒群体 |

## 三、二者结合带来的双向变化

### ✅ 对传统酒业的转型
- 从“酿造→仓储→销售”的线性模式，升级为**资产化、可流通、可增值**的数字-实体融合模式。
- 盘活存量，提升品牌溢价，拓展年轻及全球用户。

### ✅ 对 Web3 的助力（注入现实价值）
- 为 NFT 赋予**真实的实物支撑和消费场景**，避免纯炒作。
- 成为 Web3 下一个可能的**现实价值爆发点**：酒类兼具文化属性、消费刚需和投资价值。

## 四、传统酒业的数字化探索 —— 茅台案例
- 茅台已在数字化领域进行尝试（如“i茅台”数字营销平台）。
- 但仍偏重**传统电商与会员体系**，尚未真正将**实物与 NFT 所有权、金融属性、全球流通**深度结合。
- **BarFi 的差异化优势**：以 NFT 为载体，实现酒品从生产到消费的全生命周期价值留存与流转。

## 五、总结
- **BarFi** 通过 NFT 解决了传统酒业的时间成本、存量积压、流通性差、受众单一等问题。
- 同时为 Web3 注入了真实的实业价值，探索一条可行的 **现实资产 × NFT** 路径。