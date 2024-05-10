# MarkdownPad2AutoCatalog 

MarkdownPad2AutoCatalog is a plugin developed for the MarkdownPad2 editor using JavaScript and CSS. Its purpose is to automatically generate a navigation menu and customize webpage styles when exporting files to HTML or previewing them.

It offers features such as automatic generation of the table of contents, automatic sorting and numbering, style switching for the table of contents, search within the table of contents, and providing both light and dark document style options with highlighting.

Code highlighting is achieved using the highlightjs plugin. Those interested can visit the official website at [highlightjs](https://highlightjs.org "highlightjs").

 > **Added personalized custom configuration, allowing users to freely configure according to their preferences; it includes options for customizing the reading mode, displaying table of contents numbering, and customizing table of contents style.**

## The implemented functionalities.

1. Automatically generate corresponding table of contents based on the **< h1 > to < h6 >** tags in the HTML documen.
2. Automatically generate table of contents numbering, with the option to choose whether to display the numbering.
3. Provide three styles for the table of contents, with the freedom to choose.
4. Offer two reading modes: light mode and dark mode.
5. Automatically display the current section in the table of contents and its parent sections based on the current reading position.
6. Table of contents search function; full-text search is performed using the browser's built-in Ctrl+F feature.
7. One-click expand/collapse functionality for the table of contents.
8. Ability to expand or collapse the entire left sidebar.
9. Integration of the highlight.js plugin for code highlighting.
10. Convenient initialization settings allowing customization of reading mode, display of table of contents numbering, and customization of table of contents style.


## The final result

##### The overall effect：

![The overall effect](https://raw.githubusercontent.com/cayxc/MarkdownPad2AutoCatalog/master/img/mkdac-1.png)

##### Night mode：

![Night mode](https://raw.githubusercontent.com/cayxc/MarkdownPad2AutoCatalog/master/img/mkdac-2.png)

##### Effect of collapsing the table of contents.：

![Effect of collapsing the table of contents.](https://raw.githubusercontent.com/cayxc/MarkdownPad2AutoCatalog/master/img/mkdac-4.png)

##### Three styles of table of contents and hiding table of contents numbering：

![3 table of contents styles](https://raw.githubusercontent.com/cayxc/MarkdownPad2AutoCatalog/master/img/mkdac-3.png)

##### Effect of the search functionality.：

![Effect of the search functionality.](https://raw.githubusercontent.com/cayxc/MarkdownPad2AutoCatalog/master/img/mkdac-5.png)


## How to use it 

Using **MarkdownPad2AutoCatalog** for automatic table of contents generation is straightforward. Just follow these steps:

1. Copy the code from the <u>markdownPad2AutoCatalog.min.css</u> file in the dist folder.
2. Open MarkdownPad2, go to Tools > Options > Stylesheets > Add, then paste the code from markdownPad2AutoCatalog.min.css - Name the stylesheet with a .css extension - Save and close.
3. Copy the code from the <u>markdownPad2AutoCatalog.min.js</u> file in the dist folder.
4. Open MarkdownPad2, go to Tools > Options > Advanced > Html Head Editor - Input <script></script> tags in the code editor - Paste the code from markdownPad2AutoCatalog.min.js between the <script></script> tags - Save and close.
5. Repeat step 4, copying the code from <u>highlight.min.js</u> in the dist folder to the code editor.
6. Save and close to finish.

## How to customize initialization configuration

### Explanation of initialization parameters. 

`new MarkdownPad2AutoCatalog(showIndex, indexStyle, openDark);`

Parameter | Type | Default Value | Description
:- | :- | :- | :-
showIndex | Boolean | true | Whether to display table of contents numbering. Default is to display table of contents numbering.
indexStyle | Number | 1 | Table of Contents Style，**This value has only three options: 1, 2, 3**. The default style is 1.
openDark | Boolean | fasle | Whether to enable dark mode. False for light mode, true for dark mode.

### Custom Initialization Settings Example

1. At the end of the `src/markdownPad2AutoCatalog.js` file, locate **new MarkdownPad2AutoCatalog()**.
2. Pass parameters according to your own needs following the parameter explanations above.
3. Copy the modified file into the editor following the method outlined in step 4 of "How to Use". Whether to compress the modified JavaScript file is up to personal preference.

Custom Configuration Example：

**1. Example of Configuration in the markdownPad2AutoCatalog.js File:**

    // 1. Find new MarkdownPad2AutoCatalog(); at the end of the code.
    // 2. By default, table of contents numbering is disabled, table of contents style is set to style 2, and dark mode is enabled.
	new MarkdownPad2AutoCatalog(true, 2, true);
	
**2. Configuration Example in markdownPad2AutoCatalog.min.js:**

    // 1. Find window.onload=function(){new r}}]); at the end of the code.
    // 2. Start Configuration: By default, table of contents numbering is disabled, table of contents style is set to style 2, and dark mode is enabled.
    window.onload=function(){new r(false, 2, true)}}]);
    
**You can choose either of the above methods**

## How to automatically generate a table of contents in an .html file exported from the Typora editor

1. Download the .js and .css files from the dist folder to your local machine. If you need to customize configuration options, download the .js and .css files from the src folder.
2. Open the Typora editor, export the .md document you want to convert to .html. **It is recommended to choose the HTML (without styles) option when exporting**, which can save you the step of manually removing the default style files provided by the Typora editor.
3. Edit the exported .html file in your IDE. In the `<head>` section, include the downloaded .css and .js files. The order of including the files is arbitrary.
4. Save and close to finish.

## Tips and Considerations (Must-Read Pitfall Guide) 

When using, please pay attention to the following 4 points:

1. The automatically generated table of contents and code highlighting functions will not take effect in the preview pane of the MarkdownPad2 editor. They will only work properly when you export the file as HTML and open the HTML file in a browser.
2. **When generating the table of contents, if multiple `<h1>` tags are detected, all `<h1>` tags except the first one will be automatically converted to `<h2>` tags, and all subsequent tags will be downgraded by one level (e.g., `<h3>` becomes `<h4>`, and so on). Since this operation may affect the speed of generating the table of contents, it is recommended to use only one `<h1>` tag as the document title and `<h2>` tags as first-level headings.**
3. Avoid using `<script>` tags in your content, as this can prevent subsequent content from displaying properly.
4. Usage of inserting code:
   1. Use: `<pre><code class="xxx">Your code</code></pre>`, where xxx is the code type, such as "js".
   2. Simply add spaces before the content you want to set as code. If one space is not enough, add more spaces until the content after the spaces changes color. This method is more convenient, and it's my favorite way ^_^








