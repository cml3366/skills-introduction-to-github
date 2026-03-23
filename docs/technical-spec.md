# 免费起名 Agent APP 技术规格说明

## 1. 数据库设计

### 1.1 用户表 `users`

| 字段 | 类型建议 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| mobile | varchar(32) | 手机号 |
| email | varchar(128) | 邮箱 |
| password_hash | varchar(255) | 密码哈希 |
| wechat_openid | varchar(128) | 微信标识 |
| nickname | varchar(64) | 昵称 |
| gender | tinyint | 性别 |
| device_fingerprint | varchar(128) | 设备指纹 |
| register_ip | varchar(64) | 注册 IP |
| last_login_ip | varchar(64) | 最近登录 IP |
| membership_level | varchar(32) | 会员等级 |
| membership_expire_at | datetime | 会员到期时间 |
| free_quota_total | int | 免费总额度，默认 6 |
| free_quota_used | int | 已使用免费次数 |
| account_status | varchar(32) | 账号状态 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### 1.2 起名请求表 `naming_requests`

| 字段 | 类型建议 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| user_id | bigint | 用户 ID |
| surname | varchar(16) | 姓氏 |
| gender | tinyint | 性别 |
| birth_date | date | 出生日期 |
| birth_time | time | 出生时间 |
| birth_place | varchar(128) | 出生地 |
| name_mode | varchar(16) | 单名 / 双名 |
| style_preference | varchar(255) | 风格偏好 |
| fixed_word | varchar(32) | 固定字 |
| avoid_words | varchar(255) | 避用字 |
| bazi_result_json | json | 八字分析结果 |
| is_counted | tinyint | 是否计次 |
| is_free | tinyint | 是否使用免费额度 |
| request_status | varchar(32) | 请求状态 |
| created_at | datetime | 创建时间 |

### 1.3 候选名字表 `name_candidates`

| 字段 | 类型建议 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| request_id | bigint | 请求 ID |
| user_id | bigint | 用户 ID |
| full_name | varchar(32) | 全名 |
| name_pinyin | varchar(64) | 拼音 |
| first_char | varchar(8) | 第一个字 |
| second_char | varchar(8) | 第二个字 |
| score_total | decimal(5,2) | 综合评分 |
| score_wuge | decimal(5,2) | 五格得分 |
| score_bazi | decimal(5,2) | 八字得分 |
| score_meaning | decimal(5,2) | 字义得分 |
| score_sound | decimal(5,2) | 音律得分 |
| score_shape | decimal(5,2) | 字形得分 |
| score_practical | decimal(5,2) | 实用传播得分 |
| wuge_json | json | 五格详情 |
| meaning_json | json | 字义详情 |
| risk_json | json | 风险详情 |
| recommend_reason | text | 推荐理由 |
| rank_no | int | 排名 |
| is_favorite | tinyint | 是否收藏 |
| created_at | datetime | 创建时间 |

### 1.4 字库表 `character_library`

核心字段包括：

- `character`
- `traditional_character`
- `pinyin`
- `tone`
- `wuxing`
- `kangxi_strokes`
- `radical`
- `structure_type`
- `gender_tag`
- `style_tags`
- `common_level`
- `rare_level`
- `polyphone_flag`
- `homophone_risk`
- `usable_flag`
- `created_at`
- `updated_at`

### 1.5 其他核心表

- `character_meanings`：字义、延展义、命名义、出处与编辑备注
- `wuge_rules`：五格数理吉凶规则库
- `quota_logs`：免费额度与次数包使用流水
- `orders`：次数包、会员与报告订单
- `membership_packages`：会员与次数包配置
- `risk_control_logs`：风控命中与动作记录

## 2. 前后端接口规划

### 2.1 用户接口

- `POST /api/auth/register`：用户注册
- `POST /api/auth/login`：用户登录
- `GET /api/user/profile`：获取用户信息
- `GET /api/user/quota`：获取剩余免费次数

### 2.2 起名接口

- `POST /api/naming/requests`：提交起名请求
- `GET /api/naming/requests/{id}`：获取起名结果
- `GET /api/naming/candidates/{id}`：获取候选名详情
- `POST /api/naming/requests/{id}/regenerate`：重新生成名字
- `POST /api/naming/candidates/{id}/favorite`：收藏名字
- `POST /api/naming/compare`：对比名字

### 2.3 次数与支付接口

- `GET /api/quota/balance`：查询次数余额
- `POST /api/quota/deduct`：扣减免费次数 / 次数包次数
- `POST /api/orders`：创建订单
- `POST /api/payments/create`：发起支付
- `POST /api/payments/callback`：支付回调
- `GET /api/orders/{orderNo}`：查询订单状态

### 2.4 会员与报告接口

- `GET /api/membership/packages`：获取会员套餐
- `POST /api/membership/subscribe`：开通会员
- `GET /api/membership/rights`：查询会员权益
- `POST /api/reports`：生成报告
- `GET /api/reports/{id}`：查看报告详情
- `GET /api/reports/{id}/download`：下载报告

## 3. 评分模型

默认总分 100 分，推荐权重：

- 五格数理：25 分
- 八字适配：25 分
- 字义文化：20 分
- 音律美感：10 分
- 字形结构：10 分
- 实用传播：10 分

### 扣分项

- 多音字
- 生僻字
- 谐音不佳
- 笔画过繁
- 常用语歧义
- 网络语境不佳

### 后台可调参数

后台必须支持调整：

- 各评分维度权重
- 风险扣分规则
- 单次生成候选数量
- 免费次数上限
- 弹窗策略与阈值

## 4. 会员规则与套餐设计

### 免费用户

- 总计 6 次免费
- 输出基础候选名
- 查看基础分析
- 可注册登录、查看记录

### 次数包用户

- 增加附加次数
- 支持继续生成
- 可解锁部分深度内容

### 会员用户

- 更高额度或周期额度
- 更高单次候选数量
- 深度五格与八字分析
- 收藏、对比、长期历史、报告下载

### 高级定制用户

- 人工复核
- 多轮迭代优化
- 专属定制报告
- 扩展品牌名、笔名等服务

## 5. 后台管理模块

### 用户管理

- 用户列表
- 注册信息
- 次数使用情况
- 会员状态
- 风控状态

### 订单管理

- 次数包订单
- 会员订单
- 报告订单
- 支付状态

### 字库管理

- 字增删改查
- 五行标注
- 笔画标注
- 字义编辑
- 风格标签编辑
- 禁用字设置

### 规则管理

- 免费次数上限
- 每次生成数量
- 五格评分权重
- 八字评分权重
- 风险扣分规则
- 弹窗策略设置

### 数据统计

- 访问人数
- 生成次数
- 注册转化率
- 付费转化率
- 热门姓氏 / 风格 / 标签

## 6. 埋点建议

### 核心埋点事件

- `home_view`
- `home_cta_click`
- `input_submit`
- `generation_success`
- `generation_failed`
- `candidate_expand`
- `favorite_click`
- `compare_click`
- `quota_warning_show`
- `paywall_show`
- `times_pack_purchase_click`
- `membership_purchase_click`
- `report_purchase_click`

### 关键分析口径

- 首页到输入页点击率 = `home_cta_click / home_view`
- 输入页提交率 = `input_submit / input_view`
- 免费用尽率 = 用尽 6 次人数 / 体验用户数
- 付费转化率 = 付费用户数 / 免费体验用户数

## 7. 开发优先级

### 第一优先级：最小闭环

- 首页入口
- 输入页
- 基础起名逻辑
- 结果页
- 6 次免费限制
- 简单付费弹窗
- 注册登录

### 第二优先级：转化增强

- 收藏
- 历史记录
- 次数包
- 会员体系
- 报告下载

### 第三优先级：产品增强

- 名字对比
- 专家风格
- 出处展开
- 风控增强
- 高级后台配置
