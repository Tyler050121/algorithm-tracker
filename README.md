# 算法打卡监督助手 (Algorithm Tracker)

一个帮助你规划每日算法练习、跟踪复习节奏，并系统性巩固 LeetCode Hot 100 题目的工具。

## ✨ 功能特性

- **可视化数据**: 直观展示练习覆盖率、学习热力图、21 日学习曲线、今日/明日复习计划等关键指标。
- **学习足迹**: 详细记录每日学习与复习动态，精确到分钟的时间轴展示。
- **题目总览**: 支持通过题号或关键字快速搜索题目，并内置题解管理功能。
- **艾宾浩斯遗忘曲线**: 根据科学的复习周期（1, 2, 4, 7, 15, 30 天）自动为你安排复习计划。
- **多语言支持**: 内置中英双语切换。
- **暗黑模式**: 支持根据系统偏好或手动切换的暗黑模式。
- **数据本地存储**: 所有学习数据都保存在浏览器的 `localStorage` 中，确保隐私和离线可用性。

## 🚀 快速开始

1.  **安装依赖**:
    ```bash
    npm install
    ```

2.  **启动开发服务器**:
    ```bash
    npm run dev
    ```

3.  在浏览器中打开 `http://localhost:5173` 即可开始使用。

## 🛠️ 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **UI 组件库**: Chakra UI
- **路由管理**: React Router v6
- **状态管理**: React Context API
- **图表**: Recharts, React Calendar Heatmap
- **国际化**: i18next
- **工具库**: date-fns, framer-motion

## 📂 目录结构

```
api/                # 模拟后端 API 数据
src/
├── assets/         # 静态资源
├── components/     # 通用 UI 组件 (Modal, Drawer 等)
├── context/        # 全局状态管理 (ProblemContext)
├── hooks/          # 自定义 Hooks (useDashboardStats, useHistoryStats)
├── layouts/        # 页面布局组件
├── pages/          # 路由页面组件 (Dashboard, Problems, History)
├── utils/          # 工具函数
├── App.jsx         # 应用入口与路由配置
├── main.jsx        # 渲染入口
└── theme.js        # Chakra UI 主题配置
```

## 🤝 贡献

欢迎提交 Issue 或 Pull Request 来改进这个项目！

