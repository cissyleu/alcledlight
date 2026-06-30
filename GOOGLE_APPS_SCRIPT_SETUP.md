# ALC Website Tracking — Google Sheets + Apps Script Setup

## 1. Google Sheets 文件结构

建议创建一个新的 Google Sheets：

```text
ALC Website Tracking
└── Raw_Log
```

`Raw_Log` 第一行表头：

```text
Time | Action | Customer Action | Website | Country | Page Title | Page URL | Page Type | File Name | File URL | Source | IP Address | Visit Path | Stay Time (sec) | User Type | Device | Screen Size | Viewport Size | Language | Session ID | Scroll Depth | User Agent
```

## 2. Apps Script 建立方式

1. 打开 Google Sheets。
2. 新建文件：`ALC Website Tracking`。
3. 底部工作表命名为：`Raw_Log`。
4. 菜单点击：`扩展程序` → `Apps Script`。
5. 删除默认代码，把 `google-apps-script/Code.gs` 里的代码全部复制进去。
6. 保存项目，命名：`ALC Tracking Receiver`。
7. 先运行一次：`setupAlcTrackingSheet`，授权访问表格。
8. 点击：`部署` → `新建部署`。
9. 类型选择：`Web 应用`。
10. 执行身份选择：`我`。
11. 访问权限选择：`所有人`。
12. 点击部署，复制以 `/exec` 结尾的 Web App URL。
13. 打开网站代码：`public/assets/js/alc-tracking.js`。
14. 把：

```js
const API_URL = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_EXEC_URL_HERE";
```

替换成你的 Web App URL。

## 3. 部署后测试

1. 提交 GitHub，等待 Cloudflare 自动部署。
2. 打开 `https://alcledlight.com/`。
3. 点击 WhatsApp 或 Email。
4. 回到 Google Sheets，看 `Raw_Log` 是否出现新行。
5. Google Analytics 可用 Google Tag Assistant 或 Chrome DevTools Network 检查是否加载 `googletagmanager.com` 和 `google-analytics.com`。
