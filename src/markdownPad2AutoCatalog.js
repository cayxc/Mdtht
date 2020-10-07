/*
|--------------------------------------------------------------------------
| MarkdownPad2 编辑器导出 html 文件时自动生成左侧目录插件
|--------------------------------------------------------------------------
|
| 此插件用于将在 MarkdownPad2 编辑器中编辑的文档在转为 Html文件时自动生成左侧目录
| 目录生成时默认将第一个 h1 标签作为文档的题目，当检测到有多个 h1 标签时，
| 会将除了第一个 h1 外的所有 h1 标签自动转换为 h2 标签，其余标签自动向下转一级
| 实现的功能：
| 1. 根据 Html 文档中 h1~h6 标签自动生成对应的目录
| 2. 自动生成目录编号，可选择是否显示目录编号
| 3. 目录搜索功能，全文搜索使用浏览器自带的 Ctrl+F
| 4. 提供三种目录样式，可自由选择
| 5. 提供白天和夜间 2 种阅读模式
| 6. 根据当前阅读位置，自动显示所在目录及父级目录
| 7. 一键展开收起目录列表
| 8. 整个左侧栏目可展开和收起
|
| 作者: YXC (cayang512@163.com )
| GitHub https://github.com/cayxc/MarkdownPad2AutoCatalog
| Gitee https://gitee.com/cayxc/MarkdownPad2AutoCatalog
|
*/
window.onload = function () {
  /*
   * ----------------------------------------
   * 创建新的目录、内容和底部提示 布局结构
   * ----------------------------------------
  */
  function createContent() {
    //获取已有正文内容
    let oldContent = document.body.innerHTML;
    //清空已有内容
    document.body.innerHTML = '';
    // 如果写在将 body{overflow:hidden;} 样式写在 css中,
    // 会出现在 MarkdownPad2 编辑器中预览时，超出屏幕的内容无法滑动的 bug
    document.body.style.overflow = 'hidden';
    //创建左侧目录、右侧内容结构元素
    //1.创建目录、内容结构父级空元素
    let leftBlock = document.createElement('div');
    let rightBlock = document.createElement('div');
    //2.设置目录、内容父级元素id属性
    leftBlock.id = 'left-container';
    rightBlock.id = 'right-container';
    //3.设置目录父级元素的内容结构
    leftBlock.innerHTML = '\n<div class="top-container">\n' +
      '        <i class="catalog-button iconfont icon-catalogOpen"></i>\n' +
      '        <div class="search-container">\n' +
      '            <input type="text" class="search" name="search" placeholder="输入关键字搜索 . . .">\n' +
      '            <i class="search-icon iconfont icon-cancel"></i>\n' +
      '        </div>\n' +
      '        <div class="search-result"></div>\n' +
      '    </div>\n' +
      '    <div id="list-container">\n' +
      '        <div class="list-wrapper">\n' +
      '        </div>\n' +
      '    </div>\n' +
      '    <div class="bottom-container">\n' +
      '        <div class="mode-container">\n' +
      '            <div class="mode">\n' +
      '                <i class="iconfont icon-sun"></i>\n' +
      '            </div>\n' +
      '            <div class="index">\n' +
      '                <i class="iconfont icon-indexA"></i>\n' +
      '            </div>\n' +
      '            <div class="structure">\n' +
      '                <i class="iconfont icon-process"></i>\n' +
      '                <ul class="structure-child">\n' +
      '                    <li>\n' +
      '                        <input type="radio" id="styleA" name="catalogStyle" value="1" checked="checked">\n' +
      '                        <label for="styleA">样式 A</label>\n' +
      '                    </li>\n' +
      '                    <li>\n' +
      '                        <input type="radio" id="styleB" value="2" name="catalogStyle">\n' +
      '                        <label for="styleB">样式 B</label>\n' +
      '                    </li>\n' +
      '                    <li>\n' +
      '                        <input type="radio" id="styleC" value="3" name="catalogStyle">\n' +
      '                        <label for="styleC">样式 C</label>\n' +
      '                    </li>\n' +
      '                </ul>\n' +
      '            </div>\n' +
      '            <div class="color" style="display: none;">\n' +
      '                <i class="iconfont icon-color"></i>\n' +
      '                <div class="color-child">\n' +
      '                    <span>自定义颜色</span>\n' +
      '                    <input type="color">\n' +
      '                </div>\n' +
      '            </div>\n' +
      '        </div>\n' +
      '    </div>\n' +
      '   <div id="switch-button">\n' +
      '   <i class="iconfont icon-arrLeft"></i>\n' +
      '   </div>\n';
    //4.设置内容父级元素的内容结构
    rightBlock.innerHTML = '\n<div id="content">\n' +
      oldContent +
      '\n</div>\n' + '</div>\n';

    //5.追加结构元素到页面
    document.body.appendChild(leftBlock);
    document.body.appendChild(rightBlock);

    //6.底部提示
    let msg = '\n<p class="note-tips">\n' +
      ' 本文档经过 MarkdownPad2AutoCatalog 目录生成插件转换生成&emsp;' +
      '作者： cayang512@163.com&emsp;插件详情：&emsp;<a href="https://github.com/cayxc/MarkdownPad2AutoCatalog" target="_blank"> GitHub地址</a>&emsp;<a href="https://gitee.com/cayxc/MarkdownPad2AutoCatalog" target="_blank">Gitee地址</a></p>\n';
    //5.追加结构元素到页面
    noteTips('div', msg, 'content');
  }

  /*
  * ----------------------------------------
  * 将除了第一个 h1 外的 h1 转为 h2，
  * 并依次将其他 h 标签降一级，h6 不变
  * ----------------------------------------
  */
  function changeTag() {
    let h1Tag = document.querySelectorAll('h1');
    //转换 h1
    if (h1Tag.length > 1) {
      let otherTag = document.querySelectorAll('h2,h3,h4,h5');
      for (let i = 1, len = h1Tag.length; i < len; i++) {
        let newTag = document.createElement('h2');
        newTag.innerHTML = h1Tag[i].innerHTML;
        // 替换内容
        h1Tag[i].parentNode.replaceChild(newTag, h1Tag[i]);
      }
      for (let j = 0, len = otherTag.length; j < len; j++) {
        let tagName = 'h' + (parseInt(otherTag[j].nodeName.slice(1)) + 1);
        let newTag2 = document.createElement(tagName);
        newTag2.innerHTML = otherTag[j].innerHTML;
        // 替换内容
        otherTag[j].parentNode.replaceChild(newTag2, otherTag[j]);
      }
    }
  }

  /**
   * ----------------------------------------
   * 获取 H 标签后的数字
   * ----------------------------------------
   * @param tag obj 标签对象
   *
   */
  function getTagNumber(tag) {
    if ((typeof tag) != 'object') {
      console.log('getTagNumber() 调用时参数类型错误，必须是一个h标签的对象集合！');
      return;
    }
    return Number(tag.nodeName.slice(1));
  }

  /**
   * ----------------------------------------
   * 判断目录等级，最大为 5 级即 h6 标签
   * 根据指 id 属性中 level- 中 "." 字符出现的次数判断
   * 0为一级，1为二级，依次类推
   * ----------------------------------------
   * @param str string 需要在哪个字符串中查找
   * @param char string 要查找的字符串
   * @return number 返回指定字符char出现的数字
   */

  function findStrFre(str, char) {
    if ((typeof str) !== 'string' || (typeof str) !== 'string') {
      console.log('findStrFre() 调用时参数类型错误！');
      return;
    }
    let index = str.indexOf(char);
    let number = 0;
    while (index !== -1) {
      number++; // 每出现一次 次数加一
      // 从字符串出现的位置的下一位置开始继续查找
      index = str.indexOf(char, index + 1);
    }
    return number;
  }

  /**
   * ----------------------------------------
   * 寻找指定等级的目录的集合
   * ----------------------------------------
   *
   * @param level number 第几级目录，最大 5
   *
   */
  function levelTagArr(level) {
    if (level < 1 || level > 5 || (typeof level) !== 'number') {
      console.log('levelTagArr() 调用时参数类型错误！');
      return;
    }
    // 所有目录集合
    let allTag = document.querySelectorAll('h2,h3,h4,h5,h6');
    let level1 = [];
    let level2 = [];
    let level3 = [];
    let level4 = [];
    let level5 = [];
    for (let i = 0, len = allTag.length; i < len; i++) {
      let number = findStrFre(allTag[i].id, '.');
      switch (number) {
        case 0:
          level1.push(allTag[i]);
          break;
        case 1:
          level2.push(allTag[i]);
          break;
        case 2:
          level3.push(allTag[i]);
          break;
        case 3:
          level4.push(allTag[i]);
          break;
        case 4:
          level5.push(allTag[i]);
          break;
        default:
          return;
      }
    }
    switch (level) {
      case 1:
        return level1;
      case 2:
        return level2;
      case 3:
        return level3;
      case 4:
        return level4;
      case 5:
        return level5;
      default:
        return;
    }
  }

  /**
   * ----------------------------------------
   * 设置递增的 level 编号
   * ----------------------------------------
   * @param tag obj 标签对象
   *
   */
  function setLevelNumber(tag) {
    if ((typeof tag) != 'object') {
      console.log('setLevelNumber() 调用时参数类型错误，必须是一个h标签的对象集合！');
      return;
    }
    let str = tag.id;
    if (str.lastIndexOf('.') == -1) { //如果是一级目录形式 level-1000
      let newValue = parseInt(str.slice(6)) + 1;
      return 'level-' + newValue;
    } else {
      //如果是大于一级的目录形式 level-1.1 level-1.1.1 ...
      let lastIndex = str.lastIndexOf('.');
      let oldValue = str.slice(0, lastIndex);
      let newValue = parseInt(str.slice(lastIndex + 1)) + 1;
      return oldValue + '.' + newValue;
    }

  }

  /*
   * ----------------------------------------
   * 设置所有 h 标签带层级的 id
   * ----------------------------------------
   */
  function setTagLevel() {
    // 将多余的 H1 转为 H2
    changeTag();
    // 获取所有h2~h6标签，h1作为文档的题目，不作为目录标签
    let allTag = document.querySelectorAll('h2,h3,h4,h5,h6');
    let tagLength = allTag.length;
    //判断目录数量，确定第一、二个标题的层级
    if (tagLength == 0) {
      let container = document.querySelector('.list-wrapper');
      container.innerHTML = '<ul>\n'+
        '<li style="text-align:center;color: #ccc;font-size:14px;">\n'+
        '抱歉...<br/>文档中未发现 h1~h6 标签<br/>无法生成目录</p>\n</li>\n'+
        '</ul>\n';
      return;
    }
    if (tagLength == 1) {
      allTag[0].id = 'level-' + '1'; //第一个标签肯定为一级标题
    }
    if (tagLength > 1) {
      allTag[0].id = 'level-' + '1';
      let result = getTagNumber(allTag[1]) - getTagNumber(allTag[0]);
      if (result <= 0) {  //第二个与第一个属于同级标题
        allTag[1].id = setLevelNumber(allTag[0]);
      } else {  // 第二个是第一个的子标题
        allTag[1].id = allTag[0].id + '.1';
      }
      for (let i = 2, len = tagLength - 1; i < len; i++) {
        let currentTagNumber = getTagNumber(allTag[i]);
        let prevTagNumber = getTagNumber(allTag[i - 1]);
        if (currentTagNumber < prevTagNumber) {
          for (let j = i - 1; j >= 0; j--) {
            //如果两个标签的数字值相差 等于 1 或 0，代表这两个标签是同级
            let status = getTagNumber(allTag[j]) - currentTagNumber;
            if (status == 1) {
              if (j > 0) {
                // 类似 h3 h4 h3 的特殊情况
                if (getTagNumber(allTag[j - 1]) == currentTagNumber) {
                  allTag[i].id = setLevelNumber(allTag[j - 1]);
                  break;
                }
              } else {
                allTag[i].id = setLevelNumber(allTag[j]);
                break;
              }
            }
            if (status == 0) {
              allTag[i].id = setLevelNumber(allTag[j]);
              break;
            }
          }
        }

        if (currentTagNumber > prevTagNumber) {
          allTag[i].id = allTag[i - 1].id + '.1';
        }

        if (currentTagNumber == prevTagNumber) {
          allTag[i].id = setLevelNumber(allTag[i-1]);
        }
      }
      //确定最后一个标题 allTag[tagLength-1] 的层级
      if(tagLength > 2){
        // 与之相同的标签集合
        let lasTagArr = document.querySelectorAll(allTag[tagLength-1].nodeName);
        if(lasTagArr.length > 1){
          allTag[tagLength-1].id = setLevelNumber(lasTagArr[lasTagArr.length - 2]);
        }else{
          allTag[tagLength-1].id = allTag[tagLength-2].id + '.1';
        }
      }
    } else {
      return;
    }
  }

  /*
* 目录结构
*
*  <ul>
       <li>
           <a href="">
               <p>1</p>
               <span>1 级标题</span>
           </a>
           <ul>
               <li>
                   <a href="">
                       <p>1.1</p>
                       <span>2 级标题</span>
                   </a>
                   <ul>
                       <li>
                           <a href="">
                               <p>1.1.1</p>
                               <span>3 级标题</span>
                           </a>
                       </li>
                       <li>
                           <a href="">
                               <p>1.1.1.1</p>
                               <span>4 级标题</span>
                           </a>
                           <ul>
                               <li>
                                   <a href="">
                                       <p>1.1.1.2</p>
                                       <span>5 级标题</span>
                                   </a>
                               </li>
                           </ul>
                       </li>
                   </ul>
               </li>
           </ul>
       </li>
   </ul>
*
*/

  /*
   * ----------------------------------------
   * 创建目录
   * ----------------------------------------
   */
  function creatCatalogue() {
    // 设置所有 h 标签的等级 id
    setTagLevel();
    // 目录父容器
    let catalogueBlock = document.querySelector('.list-wrapper');
    // 创建其余子目录
    let ulElement = document.createElement('ul');
    for (let j = 1; j <= 5; j++) {
      let levelArr = levelTagArr(j); // 指定等级的目录集合
      let levelLength = levelArr.length;
      if (levelLength == 0) {
        break;
      }
      if(j == 1){
        for (let k = 0, len = levelLength; k < len; k++) {
          let liElement = document.createElement('li');
          liElement.innerHTML = '\n<a href="#' + levelArr[k].id + '" class=' + levelArr[k].id + '>\n' +
            '<p>' + levelArr[k].id.slice(6) + '</p>\n' +
            '<span>' + levelArr[k].innerText + '</span>' +
            '</a>\n';
          ulElement.appendChild(liElement);
          // 追加目录到目录容器中
          catalogueBlock.appendChild(ulElement);
        }
      }
      if (j > 1) {
        for (let n = 0, len = levelLength; n < len; n++) {
          // 上一级目录
          // 2.追加 ul 到该 上级目录的 li 中
          let prevLevelArr = levelTagArr(j - 1);
          for (let m = 0, preLen = prevLevelArr.length; m < preLen; m++) {
            // 当前的 id 值 （去掉 level-和最后一个 "."之后所有值的中间值）
            let currentId = levelArr[n].id.slice(6, levelArr[n].id.lastIndexOf('.'));
            // 父目录的 id 值 （去掉 level-）
            let prevId = prevLevelArr[m].id.slice(6);
            // 找到所属的上一级目录
            if (currentId == prevId) {
              // 找到父目录 li 并添加 class
              let className = prevLevelArr[m].id;
              let prevElement = document.getElementsByClassName(className)[0].parentNode;
              prevElement.setAttribute('class', 'parent-level');
              let liElement = document.createElement('li');
              liElement.innerHTML = '\n<a href="#' + levelArr[n].id + '" class=' + levelArr[n].id + '>\n' +
                '<p>' + levelArr[n].id.slice(6) + '</p>\n' +
                '<span>' + levelArr[n].innerText + '</span>' +
                '</a>\n';
              let currentUlElement = prevElement.querySelector('ul');
              if (currentUlElement !== null) {
                currentUlElement.appendChild(liElement);
              } else {
                // 创建父目录的 ul
                currentUlElement = document.createElement('ul');
                currentUlElement.setAttribute('class','js-open');
                currentUlElement.appendChild(liElement);
                prevElement.appendChild(currentUlElement);
                // 创建 父目录样式
                let parentStyle = document.createElement('i');
                parentStyle.setAttribute('class', 'iconfont icon-openA');
                prevElement.insertBefore(parentStyle, prevElement.childNodes[0]);
              }
              break;
            }
          }
        }

      }
    }
  }

  /**
   * ----------------------------------------
   * 提示说明
   * ----------------------------------------
   * @param tag sting 提示消息的标签 div p
   * @param msg string 提示消息
   * @param id string 父容器，要追加到哪个父容器中的id
   */
  function noteTips(tag, msg, id) {
    if ((typeof tag) !== 'string' || (typeof msg) !== 'string' ||
      (typeof id) !== 'string') {
      console.log('noteTips() 调用时参数类型错误！');
      return;
    }
    let exp = document.createElement(tag);
    exp.innerHTML = msg;
    //5.追加结构元素到页面
    document.getElementById(id).appendChild(exp);
  }

  // 生成修改后的内容及目录，注意执行顺序
  //防止重复生成
  let isCreated = document.body.children[0].getAttribute('id');
  if(isCreated != 'left-container'){
    createContent();
    let allTags = document.querySelectorAll('h2,h3,h4,h5,h6');
    if(allTags){
      creatCatalogue();
      // 第一个目录默认样式
      (document.querySelector('.list-wrapper')).querySelector('li').classList.add('js-active');
    }
  }

  /*
  * 样式控制  =============================
  */
  let leftElement = document.querySelector('#left-container');
  let rightElement = document.querySelector('#right-container');
  let content = document.querySelector('#content');
  let topElement = document.querySelector('.top-container');
  let listElement = document.querySelector('.list-wrapper');
  let switchButton = document.querySelector('#switch-button');
  let switchListButton = document.querySelector('.catalog-button');
  let viewModeButton = document.querySelector('.mode');

  let allIcon = listElement.children[0].querySelectorAll('i');
  let allChildLevel = listElement.children[0].querySelectorAll('ul');
  let allCatalogElement = listElement.querySelectorAll('a');

  /*
  * ----------------------------------------
  * 没有子目录时改变最外层 ul 的 padding-left的值
  * ----------------------------------------
  */
  function haveChileLevel(){
    let childLevel = listElement.querySelector('.parent-level');
    if(!childLevel){
      listElement.children[0].style.paddingLeft = '0';
    }
  }
  haveChileLevel();

  /*
  * ----------------------------------------
  * 点击隐藏左侧
  * ----------------------------------------
  */
  function switchCatalog() {
    let status = 0;
    switchButton.onclick = function () {
      let browsertWidth = document.documentElement.clientWidth;
      if (status == 1) {
        this.children[0].setAttribute('class', 'iconfont icon-arrLeft');
        if (browsertWidth > 750) {
          leftElement.style.width = '280px';
        } else {
          leftElement.style.width = '60%';
        }
        leftElement.classList.remove('js-switch-button');
        rightElement.style.padding = '15px 15px 0 295px';
        status = 0;
      } else {
        this.children[0].setAttribute('class', 'iconfont icon-closeC');
        leftElement.style.width = '0';
        leftElement.style.padding = '0';
        leftElement.classList.add('js-switch-button');
        leftElement.classList.add('js-switch-button');
        rightElement.style.padding = '15px 15px 0';
        status = 1;
      }
    }
  }
  switchCatalog();

  /*
  * ----------------------------------------
  * 整个目录列表展开、收起
  * ----------------------------------------
  */
  function switchCatalogList() {
    switchListButton.onclick = function () {
      let indexNumber = getStyleIndex();
      let isClose = topElement.querySelector('.icon-catalogClose');
      if (isClose) { // 已收起所有目录
        // 改变当前目录列表按钮 class
        this.setAttribute('class', 'catalog-button iconfont icon-catalogOpen');
        // 改变所有父级目录中 i 的 class
        for (let i = 0, len = allIcon.length; i < len; i++) {
          if (indexNumber == 1) {
            allIcon[i].setAttribute('class', 'iconfont icon-openA');
          } else if (indexNumber == 2) {
            allIcon[i].setAttribute('class', 'iconfont icon-openB');
          } else {
            allIcon[i].setAttribute('class', 'iconfont icon-openC');
          }
        }
        // 打开其所有子目录
        for (let j = 0, chLen = allChildLevel.length; j < chLen; j++) {
          allChildLevel[j].setAttribute('class', 'js-open');
        }
      } else {  // 已展开所有目录
        this.setAttribute('class', 'catalog-button iconfont icon-catalogClose');
        // 改变所有父级目录中 i 的 class
        for (let i = 0, allLen = allIcon.length; i < allLen; i++) {
          if (indexNumber == 1) {
            allIcon[i].setAttribute('class', 'iconfont icon-closeA');
          } else if (indexNumber == 2) {
            allIcon[i].setAttribute('class', 'iconfont icon-closeB');
          } else {
            allIcon[i].setAttribute('class', 'iconfont icon-closeC');
          }
        }
        // 关闭其所有子目录
        for (let j = 0, allChLen = allChildLevel.length; j < allChLen; j++) {
          allChildLevel[j].setAttribute('class', 'js-close');
        }
      }
    }
  }
  switchCatalogList();

  /*
  * ----------------------------------------
  * 父目录点击展开、收起子目录
  * ----------------------------------------
  */
  function switchParentCatalog() {
    for (let i = 0, len = allIcon.length; i < len; i++) {
      allIcon[i].onclick = function () {
        let indexNumber = getStyleIndex();
        // 目录样式 class 名称
        let closeClass = '';
        let openClass = '';
        // 确定目录样式
        if (indexNumber == 1) {
          closeClass = 'iconfont icon-closeA';
          openClass = 'iconfont icon-openA';
        } else if (indexNumber == 2) {
          closeClass = 'iconfont icon-closeB';
          openClass = 'iconfont icon-openB';
        } else {
          closeClass = 'iconfont icon-closeC';
          openClass = 'iconfont icon-openC';
        }
        let status = allIcon[i].nextElementSibling.nextElementSibling.getAttribute('class');
        if (status == 'js-open') { // 子目录已展开
          allIcon[i].setAttribute('class', closeClass);
          allIcon[i].nextElementSibling.nextElementSibling.setAttribute('class', 'js-close');
        } else { // 子目录已收起
          allIcon[i].setAttribute('class', openClass);
          allIcon[i].nextElementSibling.nextElementSibling.setAttribute('class', 'js-open');
        }
        // 目录是否已经全部收起
        let isAllClose = listElement.querySelector('.js-open');
        if (!isAllClose) {
          topElement.children[0].setAttribute('class', 'catalog-button iconfont icon-catalogClose');
        }
        // 目录是否已经全部展开
        let isAllOpen = listElement.querySelector('.js-close');
        if(!isAllOpen){
          topElement.children[0].setAttribute('class', 'catalog-button iconfont icon-catalogOpen');
        }
      }
    }
  }
  switchParentCatalog();

  /**
   * ----------------------------------------
   * 递归改变父级目录样式
   * ----------------------------------------
   * @param itemLi 需要寻找父目录的当前 li 元素对象
   * @return {string|boolean}
   */
  function changeParentColor(itemLi) {
    if ((typeof itemLi) !== 'object') {
      console.log( 'changeParentColor() 参数必须是一个标签对象！');
      return  false;
    }
    itemLi.classList.add('js-active');
    if (itemLi.parentElement.parentElement.nodeName == 'LI') {
      changeParentColor(itemLi.parentElement.parentElement);
    } else {
      return;
    }
  }

  /*
  * ----------------------------------------
  * 单个目录点击
  * ----------------------------------------
  */
  function singLeCatalogClick() {
    for (let i = 0, len = allCatalogElement.length; i < len; i++) {
      allCatalogElement[i].onclick = function () {
        // 其他目录恢复原始颜色
        let oldActiveElement = listElement.querySelectorAll('.js-active');
        for (let j = 0, oldLen = oldActiveElement.length; j < oldLen; j++) {
          oldActiveElement[j].classList.remove('js-active');
        }
        // 当前目录改变颜色
        this.parentElement.classList.add('js-active');
        // 当前父目录添加样式
        changeParentColor(allCatalogElement[i].parentElement);
      }
    }
  }
  singLeCatalogClick();


  /*
   * ----------------------------------------
   * 根据内容区阅读位置自动追踪目录
   * ----------------------------------------
   */
  function catalogTrack() {
    //获取内容区所有 h2~h6 标题及它们距离浏览器顶部的距离
    let allTag = content.querySelectorAll('h2,h3,h4,h5,h6');
    let allTtitleDistance = [];
    for (let i = 0, len = allTag.length; i < len; i++) {
      allTtitleDistance.push(allTag[i].offsetTop - 50);
    }

    //滑动正文内容时
    rightElement.onscroll = function () {
      let roll = rightElement.scrollTop;
      for (let i = 0, len = allTtitleDistance.length; i < len; i++) {
        if (allTtitleDistance[i] <= roll) {
          // 其他目录恢复原始颜色
          let oldActiveElement = listElement.querySelectorAll('.js-active');
          for (let j = 0, len2 = oldActiveElement.length; j < len2; j++) {
            oldActiveElement[j].classList.remove('js-active');
          }
          // 当前目录改变颜色
          allCatalogElement[i].parentElement.classList.add('js-active');
          // 当前父目录添加样式
          changeParentColor(allCatalogElement[i].parentElement);
        }
      }
    }
  }
  catalogTrack();


  /*
  * ----------------------------------------
  * 夜览模式
  * ----------------------------------------
  */
  function nightView() {
    let status = 0;
    viewModeButton.onclick = function () {
      if (status == 0) {
        viewModeButton.children[0].setAttribute('class', 'iconfont icon-night');
        document.body.classList.add('js-night-view');
        status = 1;
        leftElement.style.borderColor = '#3E3D42';
      } else {
        viewModeButton.children[0].setAttribute('class', 'iconfont icon-sun');
        document.body.classList.remove('js-night-view');
        status = 0;
        leftElement.style.borderColor = '#ccc';
      }
    }

    //left-container border-color
    let leftBdColor = leftElement.getAttribute('border-color');
    switchButton.onmouseover = function () {
      leftElement.style.borderColor = '#3cae7c';
    }
    switchButton.onmouseout = function () {
      leftElement.style.borderColor = leftBdColor;
    }
  }
  nightView();

  /*
   * ----------------------------------------
   * 是否显示目录序号
   * ----------------------------------------
   */
  let showIndex = document.querySelector('.index');
  let allIndex = listElement.querySelectorAll('p');

  function showCatalogIndex() {
    let status = 0;
    showIndex.onclick = function () {
      if (status == 1) { //显示目录序号
        this.children[0].setAttribute('class', 'iconfont icon-indexA');
        for (let i = 0, len = allIndex.length; i < len; i++) {
          allIndex[i].classList.remove('js-close');
        }
        status = 0;
      } else { //关闭目录序号
        this.children[0].setAttribute('class', 'iconfont icon-indexB');
        for (let i = 0, len = allIndex.length; i < len; i++) {
          allIndex[i].classList.add('js-close');
        }
        status = 1;
      }
    }
  }
  showCatalogIndex();

  /*
   * ----------------------------------------
   * 目录样式选择
   * ----------------------------------------
   */
  function catalogStyle() {
    let allStyle = document.querySelector('.structure-child').querySelectorAll('li');
    let allRadio = document.querySelector('.structure-child').querySelectorAll('input');
    for (let i = 0, len1 = allStyle.length; i < len1; i++) {
      allStyle[i].onclick = function () {
        for (let j = 0, len2 = allIcon.length; j < len2; j++) {
          let isClose = allIcon[j].nextElementSibling.nextElementSibling.getAttribute('class');
          if (i == 0) {
            if (isClose == 'js-close') { //子目录处于关闭状态
              allIcon[j].setAttribute('class', 'iconfont icon-closeA');
            } else { //子目录处于打开状态
              allIcon[j].setAttribute('class', 'iconfont icon-openA');
            }
          } else if (i == 1) {
            if (isClose == 'js-close') { //子目录处于关闭状态
              allIcon[j].setAttribute('class', 'iconfont icon-closeB');
            } else { //子目录处于打开状态
              allIcon[j].setAttribute('class', 'iconfont icon-openB');
            }
          } else {
            if (isClose == 'js-close') { //子目录处于关闭状态
              allIcon[j].setAttribute('class', 'iconfont icon-closeC');
            } else { //子目录处于打开状态
              allIcon[j].setAttribute('class', 'iconfont icon-openC');
            }
          }
        }
        for (let k = 0, len3 = allRadio.length; k < len3; k++) {
          if ((allRadio[k].getAttribute('checked')) == 'checked') {
            allRadio[k].removeAttribute('checked');
          }
        }
        allStyle[i].children[0].setAttribute('checked', 'checked');
      }
    }
  }
  catalogStyle();


  // 获取目录样式编号
  function getStyleIndex() {
    let indexNumber;
    let allStyleNumber = document.getElementsByName('catalogStyle');
    for (let j = 0, len = allStyleNumber.length; j < len; j++) {
      if ((allStyleNumber[j].getAttribute('checked')) == 'checked') {
        indexNumber = allStyleNumber[j].value;
        break;
      }
    }
    return indexNumber;
  }


  /**
   * ----------------------------------------
   * 比对搜索框和所有目录的值
   * ----------------------------------------
   * @param value 要比对的原始值，即 input 输入框的 value 值
   *
   */
  function comparison(value) {
    if ((typeof value) != 'string') {
      console.log( 'comparison() 参数必须是一个字符串');
      return  false;
    }
    value = value.toLowerCase();
    let result = '';
    for (let i = 0, len = allCatalogElement.length; i < len; i++) {
      let text = allCatalogElement[i].innerText.replace(/\s+/g, '');
      if (text.toLowerCase().indexOf(value) != -1) {
        let href = allCatalogElement[i].getAttribute('href');
        result += '\n<a href="' + href + '">' + allCatalogElement[i].innerText + '</a>\n';
      }
    }
    if (result == '') {
      result = '\n<i class="iconfont icon-search"></i>\n<span>目录中暂无相关搜索结果</span>\n<span>试试 Ctrl+F  在全文档搜索</span>\n';
    }
    return result;
  }

  /*
   * ----------------------------------------
   * 搜索目录
   * ----------------------------------------
   */
  function searchCatalog() {
    let searchElement = document.querySelector('.search');
    let searchResultElement = document.querySelector('.search-result');
    let searchIconElement = searchElement.nextElementSibling;
    // 获取焦点
    searchElement.onfocus = function () {
      searchElement.onkeyup = function () {
        let searchNewValue = (searchElement.value).replace(/\s+/g, '');
        if (searchNewValue) { // 不为空时
          searchResultElement.style.display = 'block';
          searchIconElement.style.display = 'block';
          let results = comparison(searchNewValue);
          searchResultElement.innerHTML = results;
          // 记录当前已点选过的搜索结果
          let allSearch = searchResultElement.querySelectorAll('a');
          for (let j = 0, len = allSearch.length; j < len; j++) {
            allSearch[j].onclick = function () {
              allSearch[j].classList.add('js-active');
            }
          }
        } else {
          searchResultElement.style.display = 'none';
          searchIconElement.style.display = 'none';
        }
      }
    }
    // 点击取消
    searchIconElement.onclick = function () {
      this.style.display = 'none';
      searchResultElement.style.display = 'none';
      searchElement.value = '';
    }

  }
  searchCatalog();
}

