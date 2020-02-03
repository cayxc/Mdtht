# MarkdownPad2AutoCatalog 

MarkdownPad2 编辑器导出 html 文件时自动生成目录、自定义风格样式及代码高亮显示整合。

代码高亮显示采用的是**highlightjs**插件，有需要的可以去下此地址查看：[highlightjs官网](https://highlightjs.org "highlightjs")

## 实现的功能

1. 根据 html 文档中 h1~h6 标签自动生成对应的目录
2. 自动生成目录编号，可选择是否显示目录编号
3. 提供三种目录样式，可自由选择
4. 提供白天和夜间 2 种阅读模式
5. 根据当前阅读位置，自动显示所在目录及父级目录
6. 目录搜索功能，全文搜索使用浏览器自带的 Ctrl+F
7. 一键展开收起目录列表
8. 整个左侧栏目可展开和收起
9. 代码高亮显示 highlightjs 插件整合


## 最终效果

##### 整体效果：

![整体效果](https://raw.githubusercontent.com/cayxc/MarkdownPad2AutoCatalog/master/img/mkdac-1.png)

##### 夜览模式：

![夜览模式](https://raw.githubusercontent.com/cayxc/MarkdownPad2AutoCatalog/master/img/mkdac-2.png)

##### 目录收起效果：

![目录收起效果](https://raw.githubusercontent.com/cayxc/MarkdownPad2AutoCatalog/master/img/mkdac-4.png)

##### 3 种目录样式及隐藏目录编号：

![3 种目录样式](https://raw.githubusercontent.com/cayxc/MarkdownPad2AutoCatalog/master/img/mkdac-3.png)

##### 搜索功能效果：

![搜索功能效果](https://raw.githubusercontent.com/cayxc/MarkdownPad2AutoCatalog/master/img/mkdac-5.png)


## 如何使用 

使用 **MarkdownPad2AutoCatalog** 目录自动生成非常简单，你只需要将 dist 文件夹中的样式文件 markdownPad2AutoCatalog.min.css 加载到编辑器中并引入 markdownPad2AutoCatalog.min.js 和 highlight.min.js 到编辑器的 Html Head头中即可，具体步骤如下：

1. 复制 dist 文件夹中的 <u>markdownPad2AutoCatalog.min.css</u> 的代码
2. 打开 MarkdownPad2 — 工具 — 选项 — 样式表 — 添加，然后粘贴 markdownPad2AutoCatalog.min.css 的代码 — 给样式表取一个以.css结尾的名字 — 保存并关闭 
3. 复制 dist 文件夹中的 <u>markdownPad2AutoCatalog.min.js</u>的代码。
4. 打开 MarkdownPad2 — 工具 — 选项 — 高级 — Html Head编辑器 — 在代码编辑器中输入 <script></script> 标签对 — ，然后粘贴 markdownPad2AutoCatalog.min.js 的代码到 <script></script> 标签对中 — 保存并关闭
5. 重复第 4 步，将 dist 文件夹中的 <u>highlight.min.js</u> 的代码复制到代码编辑器中
6. 保存并关闭，完成

## 注意事项（避坑指南-必看） 

使用时请注意以下 4 点：

1. 自动生成的目录和代码高亮显示功能在 MarkdownPad2 编辑器中**预览界面中是不会生效的**，只有当你将文件导出为 Html 后，在浏览器中打开该 Html 文件，目录和代码高亮显才可正常使用。
2. 在 MarkdownPad2 编辑器中按 F6 可以快速生成一个 Html 文件，此时目录会正常显示，但是点击目录并不会做相应的跳转，而是会跳转到该文件所在的目录，使用时还请注意。
3. **在生成目录时，当检测到有多个 h1 标签时，会将除了第一个 h1 标签外的所有 h1 标签自动转换为 h2 标签，其余标签自动向下转一级（h3 转为 h4，以此类推），由于此操作会影响目录的生成速度，推荐用一个 h1 标签作为文档标题，h2 作为一级标题。**
4. 内容不要出现: <script> 标签，否则之后的内容将不会显示。







