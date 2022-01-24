# MarkdownPad2AutoCatalog 

MarkdownPad2AutoCatalog 是使用 Javascript和CSS为MarkdownPad2编辑器开发的一款插件。目的是在将文件导出为html文件或预览时，自动生成导航目录、自定义网页样式。

提供了自动生成目录，自动排序编号、目录样式切换、目录搜索、提供高亮和暗黑两种文档风格样式等功能。

代码高亮显示采用的是**highlightjs**插件，有需要的可以去此地址查看：[highlightjs官网](https://highlightjs.org "highlightjs")

> **新增个性化自定义配置，可根据个人偏好自由配置；可自定义阅读模式、是否显示目录编号和自定义目录样式**

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
10. 方便的初始化设置，可自定义阅读模式、是否显示目录编号和自定义目录样式


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
4. 打开 MarkdownPad2 — 工具 — 选项 — 高级 — Html Head编辑器 — 在代码编辑器中输入 < script ></ script > 标签对 — ，然后粘贴 markdownPad2AutoCatalog.min.js 的代码到 <script></script> 标签对中 — 保存并关闭
5. 重复第 4 步，将 dist 文件夹中的 <u>highlight.min.js</u> 的代码复制到代码编辑器中
6. 保存并关闭，完成

## 如何自定义初始化配置

### 初始化参数说明 

`new MarkdownPad2AutoCatalog(openDark, showIndex, indexStyle);`

参数 | 类型 | 默认值 | 说明
:- | :- | :- | :-
openDark | Boolean | fasle | 是否开启为黑夜模式，false 为白天模式，true 为黑夜模式
showIndex | Boolean | true | 是否显示目录编号，默认显示目录编号
indexStyle | Number | 1 | 目录样式，**该值只有：1，2，3** 三个选项，默认样式 1

### 自定义初始化设置示例

1. 在 src/markdownPad2AutoCatalog.js 文件中的最后位置找到 **new MarkdownPad2AutoCatalog()**
2. 根据自身需求按上面的参数说明依次传入3个参数，**注：3个参数都要正确传入，否则自定义无效**
3. 将修改后的文件按照前面 *“如何使用”第4步* 的方法复制到编辑器中，修改后的js文件是否压缩看个人意愿 

**注：src/markdownPad2AutoCatalog.min.js 由于是经过压缩处理过，修改不方便 ，所以需要自定义时请直接复制 src/markdownPad2AutoCatalog.js 文件，然后修改，修改后的js文件是否需要压缩处理完全看个人意愿**

示例：

	//默认开启黑夜模式，不显示目录编号，目录样式选择样式2
	new MarkdownPad2AutoCatalog(true, false, 2);


## 由Typora编辑器导出的.html文件如何自动生成目录

 1. 下载 dist 文件中的 .js 和 .css 文件到你本地，如果需要自定义配置项，请下载 src 文件夹中的 .js 和 .css文件
 2. 打开Typora编辑器，导出要转为.html的.md文档，**建议注意导出时选 HTML(without styles) 选项**，可省去手动删除Typora编辑器自带样式文件这一步
 3. 在ide中编辑导出的.html文件，在 head 中引入刚刚下载的 .css 和 .js 文件，引入文件的顺序随意
 4. 保存并关闭，完成

## 注意事项（避坑指南-必看） 

使用时请注意以下 4 点：

1. 自动生成的目录和代码高亮显示功能在 MarkdownPad2 编辑器中**预览界面中是不会生效的**，只有当你将文件导出为 Html 后，在浏览器中打开该 Html 文件，目录和代码高亮显才可正常使用。
2. **在生成目录时，当检测到有多个 h1 标签时，会将除了第一个 h1 标签外的所有 h1 标签自动转换为 h2 标签，其余标签自动向下转一级（h3 转为 h4，以此类推），由于此操作会影响目录的生成速度，推荐用一个 h1 标签作为文档标题，h2 作为一级标题。**
3. 内容不要出现: < script > 标签，否则之后的内容将不会显示。
4. 插入代码的用法：
   1. 使用：< pre >< code class="xxx" >你的代码</ code >< /pre >,xxx是代码类型如：js
   2. 直接在需要设置为代码的内容前面添加空格键，一个空格不够就多来几个空格，直到空格后面的内容变色就可以了，比较方便，我最爱的方式^_^








