# prepare before start

1. npm i
2. 安装 victoria-metrics、victoria-logs、grafana（grafana cloud 无法与本地网络通信）
3. 将三者的可执行文件添加到环境变量 path 中，支持全局执行
4. 在项目路径下的终端中执行 npm run start:monitor，没有问题进入下一步
5. 生成一对RAS秘钥（ chrome://extensions/ 页面开启“开发者模式”，使用“打包扩展程序”功能，工具会自动生成一对密钥文件（.pem 和 .crx））
6. 去掉公钥中的换行符，替换掉 manifest.ts 中 key field
7. 开机自启动 npm run start:monitor
   1. windows 系统：创建 /bat/start_monitor.bat 快捷方式，移动到自启动目录下
   2. mac 待补充

# 数据存储

## 本机存储

metric 和 log 数据都是存储在本地，具体存储位置在 victoria-metrics安装目录/victoria-metrics-data、victoria-logs安装目录/victoria-logs-data

## 浏览器容错存储

1. content-script 收集数据上报到 sw 失败时，数据暂存到 localstorage，刷新页面触发重新上报
2. sw 上报 metric or log 失败时，数据与错误信息暂存到 chrome.storage.local，重启扩展触发重新上报
3. 错误只上报 log

# 开发步骤

1. npm run dev:all 启动本地客户端和服务端，支持 live reload extension，不支持 live reload page
2. 浏览器打开 chrome://extensions/
3. 加载未打包的扩展（如已加载，手动刷新扩展）
4. 点击检查视图：service worker，会弹出来 service worker 对应的 devtools

# 调试 popup

在页面中点击扩展 icon，弹出 popup，右击，选择“检查”菜单项，弹出 popup 对应的 devtools

# 调试 content-script&injectscript

这两部分代码已经被注入到页面中，所以使用页面的 devtools 调试即可

# 构建正式版

npm run build
