# [Chrome插件]一键切换GitHub官方/镜像站及下载代理站
发布时间：2026-01-22 00:00:00（2026/01/22）
发布地址：https://www.rliy.cn/archives/wRjNpsWX

## 前言
众所周知GitHub由于神秘原因，其直接访问的稳定性极差，再加上我这自用的小猫节点不是很稳定，以及路由器上的小猫运行也不稳定，又懒得手动启动小猫，就有了这个插件

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

##预览图片
![](https://github.com/user-attachments/assets/e8676259-b0e2-4fd0-9162-8f7d26f699ef)
![](https://github.com/user-attachments/assets/b31f4880-62ef-45f8-9560-4bd3347a74eb)
![](https://github.com/user-attachments/assets/b8012316-0528-4f43-8c7f-987472f4b1ba)
![](https://github.com/user-attachments/assets/9911870c-4e57-4e40-8d11-e874684f702c)
![](https://github.com/user-attachments/assets/59aab7cc-24b2-434f-a31e-88dbebee8125)
![](https://github.com/user-attachments/assets/8ca978f5-03f5-4d01-acb5-ae42e36d920b)
