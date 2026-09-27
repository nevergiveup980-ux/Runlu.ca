# RUNLU 观势 · 中文搜索发现清单

这份文件用于维护观势中文公开页面的搜索发现入口。

## 当前官方发现文件

- 标准全站 Sitemap: https://runlu.ca/sitemap.xml
- 观势中文 URL 列表: https://runlu.ca/guanshi-zh-urls.txt
- Robots: https://runlu.ca/robots.txt

## Bing / IndexNow

Bing 官方推荐 IndexNow 用于新增、更新或删除 URL 的快速通知，同时继续保留 sitemap 做全站覆盖。

上线自动 IndexNow 前，需要在部署环境安全生成并保存 IndexNow key，并在 runlu.ca 根路径提供对应 key 文件。不要把长期私钥写进公开文档或前端页面。

## 百度

百度搜索资源平台可使用链接提交/普通收录等官方入口。提交可以帮助百度更快发现链接，但不等于保证收录。

验证 runlu.ca 站点归属后，优先提交标准 sitemap.xml；需要人工批量提交中文观势页面时，可使用 guanshi-zh-urls.txt 作为维护清单。

## 发布规则

新增观势中文文章时：
1. 从 guanshi-zh.html 建立可抓取内链。
2. 加入 sitemap.xml。
3. 加入 guanshi-zh-urls.txt。
4. 发布后再通过已配置的 IndexNow 通知参与的搜索引擎。
5. 不重复高频提交同一旧 URL，不把“已提交”写成“已收录”。
