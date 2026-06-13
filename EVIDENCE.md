# 链上 / 测试网证据

> 测试网：**Sepolia**
> 合约：**YourCollectible**（ERC-721 + 市场逻辑）
> 操作时间：Hackathon Zai 赛道提交期间

---

## 合约部署

| 项目 | 值 |
|------|-----|
| 部署账号 | `0x5200D7BC43d6b26C1BD3B2F9645FFB1450F5528D` |
| 部署交易 | `0xd8bd20fef6d2ceb343f09ec63149bab525fff7307ecfbf5476a32e90a5556868` |
| 合约地址 | ⬜ **待补充**（运行 `yarn deploy --network sepolia` 后从终端输出获取） |
| Etherscan | ⬜ **待补充**（合约部署并验证后补充链接） |

---

## 测试账号

| 角色 | 地址 | 说明 |
|------|------|------|
| 卖方 | `0xABAc2257E07d4A8216DabCd9fad4d03ebfCE644F` | 用于铸造和上架 NFT |
| 买方 | `0x49f8eA7bD41ba3Ba08500CA5c436e4E492f6744A` | 用于在吧台市场购买 NFT |

---

## 操作记录

| # | 交易哈希 | 操作类型 | 说明 |
|---|----------|----------|------|
| 1 | `0x4d2839f8452fec537f1d55b449eeb252a28975e10f7b416364e7c9fd3bae8567` | `mintItem` | 铸造 Token ID #1 — 酒品 NFT |
| 2 | `0xfb2896c99988024ccd2c2e40fc53fa09facb60c900c924a539962de6c055c4a0` | `mintItem` | 铸造 Token ID #2 |
| 3 | `0x531bdeb1152eea13b3e3a5452906fbafcf2df1f2ab69b426f4197ef7fb9453b6` | `mintBatch` | 批量铸造 × 3（Token ID #3-#5） |
| 4 | `0xb8fce082d38ab7f797acb3d3d40169e82338ad8ced8403f7882e8495d1b16319` | `placeNftOnSale` | 上架 Token ID #1 |
| 5 | `0xa60d935a12be1cd72547bfc195f6e552115845d45969675d53d9dc52a45a1aa1` | `purchaseNft` | 购买 Token ID #1 |
| 6 | `0xab82bf7de2bbbbb7255b41d3b32a09641ce164115df132e331d5c56bbe1e28d8` | `placeNftOnSale` | 上架 Token ID #2 |
| 7 | `0x8e7a16be127a4c82501c4ebf289fcf776826f7580a953abd0bc0fb3ac9213d15` | `purchaseNft` | 购买 Token ID #2 |
| 8 | `0x201b83040d57e3c6d3e3a0111a5427f3d2ab1e8907797822a0ed410c8803e307` | `mintBatch` | 批量铸造 × 3（Token ID #6-#8） |

---

## AI 工具操作记录

| 工具 | 操作 | 说明 |
|------|------|------|
| Hermes Agent（GLM-5.1） | 智能合约扩展 | 编写 `YourCollectible.sol` 市场逻辑（上架/购买/下架/版税/批量铸造） |
| Hermes Agent（GLM-5.1） | 前端开发 | 重建 Home 页、创建 6 个功能页面、黑金主题 UI |
| Hermes Agent（GLM-5.1） | IPFS 集成 | 实现 Pinata 上传/读取 API 路由 |
| Hermes Agent（GLM-5.1） | 文档编写 | README、PROPOSAL、链上证据、用户档案系统 |

---

## 需要补充的截图

部署验证后，将以下截图放入 `screenshots/` 目录：

- `screenshot-01-etherscan-contract.png` — Etherscan 合约页面（显示已验证状态和合约地址）
- `screenshot-02-etherscan-mint.png` — 一笔 mintItem 交易的 Etherscan 详情
- `screenshot-03-etherscan-purchase.png` — 一笔 purchaseNft 交易的 Etherscan 详情
- `screenshot-04-homepage.png` — 前端首页（Hero 区域 + 统计面板）
- `screenshot-05-createnft.png` — 发行页面
- `screenshot-06-market.png` — 吧台市场页面
- `screenshot-07-mynfts.png` — 我的 NFT 页面
