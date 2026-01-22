# [Chrome插件]一键切换GitHub官方/镜像站及下载代理站
发布时间：2026-01-22 00:00:00（2026/01/22）
发布地址：https://www.rliy.cn/archives/wRjNpsWX

## 前言
GitHub因“神秘原因”直接访问稳定性极差，叠加作者自用“小猫节点”不稳定、路由器节点运行异常且懒得手动启动节点的痛点，因此开发了这款插件。

## 核心功能说明
- 访问GitHub官方站（github.com）时，可一键切换至指定镜像站（bgithub.xyz）；
- 处于GitHub镜像站（bgithub.xyz）时，可一键切回GitHub官方站；
- 下载GitHub文件（如Releases附件、源码压缩包等）时，自动使用代理站（gh-proxy.org）及其节点加速，无需手动配置。

## 插件文件结构
### 根目录结构
```plaintext
github-proxy-extension/  # 插件根目录
├── icon.png              # 插件图标（128×128 PNG，Chrome自动缩放到16/32/48尺寸适配）
├── manifest.json         # 插件核心清单（配置权限、图标、动态规则、后台服务、弹窗入口等，符合Chrome Extension V3规范）
├── popup.html            # 插件弹窗UI（包含当前URL显示、域名切换按钮、代理地址下拉菜单、代理开关）
├── popup.js              # 弹窗交互逻辑（DOM操作、域名切换逻辑、下拉菜单状态保存、与background.js通信）
├── background.js         # 后台服务核心（动态创建/更新DNR规则、监听存储变化、处理弹窗消息）
└── rules.json            # 静态规则占位文件（内容为[]，仅满足manifest.json的rule_resources必填项，实际禁用不生效）
