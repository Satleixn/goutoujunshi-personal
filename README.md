# 狗头军师 · 个人专属版 (goutoujunshi-personal)

面向心动、暧昧、追求、冷淡、投入失衡、冲突与分手的 **AI 恋爱参谋与人际情绪决策助手**。
基于 Next.js + React + Tailwind CSS 构建，专为**手机端使用**与**个人单人纯净体验**特化，支持一键部署到 Vercel。

---

## 核心特性

- 📱 **移动端专属优化 (Mobile-First)**：
  - 针对手机竖屏、iOS/Android 软键盘弹出与底部安全区（Home Bar）做防抖与自适应布局。
  - 支持 **PWA（渐进式 Web 应用）**：Safari 点击「分享 → 添加到主屏幕」，即可生成独立桌面 App 图标，无浏览器地址栏，全屏沉浸使用。
- 📋 **话术一键复制卡片**：
  - 军师给出的推荐成文回复直接高亮为独立卡片，右下角提供「一键复制」按钮，手机轻触即复制，秒切微信/社交软件直接粘贴。
- 👥 **多对象独立关系档案**：
  - 支持切换咨询对象（对象 A、对象 B、本人档案），分别记录 MBTI、主观心动评分（0-100）、当前关系阶段与近期关键事件。
  - **100% 隐私本地存储**：档案全保存在手机本地 `localStorage`，不入库不上云，运维成本为 0。
- 🧠 **内置官方决策内核 (goutoujunshi SKILL.md)**：
  - 严格遵循：**情绪落地（先稳住不内耗） → 事实/推测拆分 → 利益评估与真实信号 → 明确可执行话术 → 观察与停止条件**。
- ⚡ **DeepSeek V4.1 flash 原生直连**：
  - 采用 Server-Sent Events (SSE) 逐字打字机流式响应。
  - 预留双轨配置：可在 Vercel 环境变量中预设 Key（手机打开 0 密码直接用），也可以在右上角设置面板随时修改 Base URL / Key / Model。

---

## 快速本地运行

```bash
# 1. 安装依赖
npm install

# 2. 启动本地开发
npm run dev
```

在手机浏览器或电脑端打开 `http://localhost:3000` 即可体验。

---

## 部署到 Vercel 指南（推荐）

1. **推送代码到您的 GitHub 仓库**：
   ```bash
   git init
   git add .
   git commit -m "feat: 狗头军师个人专属移动端"
   # 创建名为 goutoujunshi-personal 的 GitHub 仓库并推送
   git remote add origin https://github.com/<your-username>/goutoujunshi-personal.git
   git branch -M main
   git push -u origin main
   ```
2. **在 Vercel 导入**：
   - 打开 [vercel.com](https://vercel.com/)，点击 **Add New Project**，导入该 GitHub 仓库。
   - Framework Preset 选择 **Next.js**。
   - **Environment Variables（环境变量配置，可选）**：
     - `DEEPSEEK_API_KEY`: 填写您的 DeepSeek API Key（填入后，手机打开网页无需手动输入 Key，直接开聊）。
     - `ACCESS_CODE`: （强烈推荐）设置您的专属访问密码。配置后网页会自动开启密码锁屏，输入正确密码才能进入，彻底防止他人窥探与额度盗刷。
     - `DEEPSEEK_BASE_URL`: （可选，若使用官方地址保持默认即可；若使用第三方中转聚合平台则填其中转地址）。
     - `DEEPSEEK_MODEL`: （可选，默认 `deepseek-v4.1-flash-1017`）。
   - 点击 **Deploy**，约 1 分钟即可生成公网可访问的专属专属链接（例如 `https://goutoujunshi-personal.vercel.app`）。

3. **手机上添加到主屏幕**：
   - 用手机浏览器（iOS Safari 或 Android Chrome）打开 Vercel 生成的网址。
   - iOS：点击底部「分享」按钮，选择「**添加到主屏幕**」。
   - Android：点击右上角菜单，选择「**安装应用**」或「**添加到主屏幕**」。
   - 手机桌面上会生成狗头军师图标，点击即进入原生全屏 App 体验！
