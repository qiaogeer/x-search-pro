# Twitter 高级搜索插件

一个强大的 Chrome 扩展，提供便捷的 Twitter 高级搜索功能。

## 功能特点

- 🔍 关键词搜索
  - 包含特定关键词
  - 排除特定关键词
  - 精确匹配短语
  - 任意匹配多个关键词

- 👤 用户筛选
  - 来自特定用户
  - 发送给特定用户
  - 提及特定用户

- 📊 互动数据筛选
  - 最少点赞数
  - 最少转发数
  - 最少评论数

- 📅 时间范围
  - 自定义起始时间
  - 自定义结束时间

- 🔤 内容筛选
  - 包含链接的推文
  - 包含图片/视频的推文

- 🔄 其他功能
  - 搜索条件自动保存
  - 搜索结果在当前标签页打开
  - 支持中文界面

## 安装方法

1. 从 Chrome 网上应用店安装（暂未上传）
   - 访问插件页面
   - 点击"添加到 Chrome"

2. 手动安装（开发模式）
   - 下载源代码
   - 打开 Chrome 扩展管理页面 (chrome://extensions/)
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择插件目录

## 使用说明

1. 点击浏览器工具栏中的插件图标
2. 在弹出窗口中设置搜索条件：
   - 输入关键词
   - 选择用户筛选条件
   - 设置互动数据要求
   - 选择时间范围
   - 设置其他筛选条件
3. 点击"搜索"按钮
4. 搜索结果将在当前标签页显示

## 开发说明

项目结构：
```
twitter-advanced-search/
├── manifest.json        # 插件配置文件
├── background/          # 后台脚本
│   └── background.js    # 处理后台逻辑
├── popup/              # 弹出窗口
│   ├── popup.html      # 弹出窗口界面
│   ├── popup.css       # 样式表
│   └── popup.js        # 交互逻辑
└── icons/              # 图标资源
    └── icon.png        # 插件图标
```

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基本的高级搜索功能
- 支持搜索条件保存
- 优化了界面布局

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

MIT License
