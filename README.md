# BionicHub · 拟生机器人商城

纯静态拟生机器人电商展示站，蓝白科技风，参考 [Robotics Center Store](https://roboticscenter.ai/store) 的信息架构。

## 页面

| 文件 | 说明 |
|------|------|
| `index.html` | 首页：Hero、信任背书、精选产品 |
| `store.html` | 商城：搜索、分类/品牌筛选、排序 |
| `product.html?id=...` | 详情：图片画廊、GitHub、联系方式 |

## 本地预览

页首/页尾通过 `fetch` 加载，**需用本地静态服务器**（直接双击打开 `index.html` 无法加载页首页尾）：

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

然后访问 `http://localhost:8080`。

## 页首 / 页尾

公共部分拆成独立 HTML 文件，改一处全站生效：

| 文件 | 说明 |
|------|------|
| `partials/header.html` | 页首导航 |
| `partials/footer.html` | 页尾 |

各页面通过占位容器 + `js/include.js` 加载：

```html
<body data-page="home">   <!-- 或 store，用于导航高亮 -->
  <div id="site-header"></div>
  <!-- 页面内容 -->
  <div id="site-footer"></div>
  <script src="js/include.js"></script>
</body>
```

## 自定义产品

编辑 `js/data.js` 中的 `PRODUCTS` 数组，替换图片 URL、GitHub 链接与联系方式即可。

## 技术栈

- HTML5 + CSS3 + 原生 JavaScript
- 无构建步骤、无框架依赖
- 页首/页尾为独立 HTML，由 `js/include.js` 异步引入
