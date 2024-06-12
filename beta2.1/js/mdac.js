/*
 |--------------------------------------------------------------------------
 | MarkdownPad2AutoCatalog
 | MarkdownPad2 编辑器导出 html 文件时自动生成左侧目录插件
 |--------------------------------------------------------------------------
 |
 | 此插件用于将在 MarkdownPad2 编辑器中编辑的文档在转为 Html文件时自动生成左侧目录
 | 目录生成时默认将第一个 h1 标签作为文档的题目，当检测到有多个 h1 标签时，
 | 会将除了第一个 h1 外的所有 h1 标签自动转换为 h2 标签，其余标签自动向下转一级
 | 实现的功能：
 | 1. 根据 html 文档中 h1~h6 标签自动生成对应的目录
 | 2. 自动生成目录编号，可选择是否显示目录编号
 | 3. 提供三种目录样式，可自由选择
 | 4. 提供白天和夜间 2 种阅读模式
 | 5. 根据当前阅读位置，自动显示所在目录及父级目录
 | 6. 目录搜索功能，全文搜索使用浏览器自带的 Ctrl+F
 | 7. 一键展开收起目录列表
 | 8. 整个左侧栏目可展开和收起
 | 9. 代码高亮显示 highlightjs 插件整合
 | 10. 方便的初始化设置，可自定义阅读模式、是否显示目录编号和自定义目录样式
 |
 | 作者: YXC (cayxc512@163.com )
 | 插件地址：
 | GitHub https://github.com/cayxc/MarkdownPad2AutoCatalog
 | Gitee  https://gitee.com/cayxc/MarkdownPad2AutoCatalog
 |
 */
let objThis;
let indexStyleNumber;
let originShowIndex;
let isShadow;
let isTree;

class MarkdownPad2AutoCatalog {
  //showIndex  是否显示目录序号
  //indexStyle 目录样式 1, 2, 3
  //openDark   是否开启夜览模式
  //showTree   是否开树状线
  //openShadow   是否开启文字阴影
  constructor(
      showIndex  = true,
      indexStyle = 1,
      openDark   = true,
      showTree   = true,
      openShadow = false) {
    try {
      if ((typeof showIndex) != 'boolean') {
        showIndex = true;
        throw '参数: showIndex 类型有误，已按照默认配置执行，该参数类型为：Boolean';
      }
      if ((typeof indexStyle) != 'number') {
        indexStyle = 1;
        throw '参数: indexStyle 类型有误，已按照默认配置执行，该参数类型为：Number';
      }
      if ((typeof openDark) != 'boolean') {
        openDark = false;
        throw '参数: openDark 类型有误，已按照默认配置执行，该参数类型为：Boolean';
      }
      if ((typeof showTree) != 'boolean') {
        openDark = false;
        throw '参数: showTree 类型有误，已按照默认配置执行，该参数类型为：Boolean';
      }
      if ((typeof openShadow) != 'boolean') {
        openDark = false;
        throw '参数: openShadow 类型有误，已按照默认配置执行，该参数类型为：Boolean';
      }
      objThis = this; //当前对象的 this
      this.showIndex = showIndex;
      this.indexStyle = indexStyle;
      this.openDark = openDark;
      this.openDark = showTree;
      this.openDark = openShadow;
      indexStyleNumber = indexStyle;
      isShadow = openShadow;
      isTree = showTree;

      //目录构建
      if ((document.querySelector('#body-container')) == null) { //替换文档内容，防止重复生成
        this.replaceOld();
      }

      //样式控制节点元素
      this.bodyContainer = document.querySelector('#body-container');
      this.leftElement = document.querySelector('#left-container');
      this.rightElement = document.querySelector('#right-container');
      this.content = document.querySelector('#content');
      this.quitElement = document.querySelector('.quit-menu');
      this.listElement = document.querySelector('.list-wrapper');
      this.switchButton = document.querySelector('#switch-button');
      this.asideButton = document.querySelector('.catalog-button');
      this.switchListButton = document.querySelector('.quit-menu');
      this.viewModeButton = document.querySelector('.mode');
      this.allIcon = this.listElement.children[0].querySelectorAll('i');
      this.allChildLevel = this.listElement.children[0].querySelectorAll('ul');
      this.allCatalogElement = this.listElement.querySelectorAll('a');
      this.showIndexEl = document.querySelector('.index');
      this.allIndex = this.listElement.querySelectorAll('p');

      //样式控制
      this.switchCatalog();
      this.switchCatalogList();
      this.catalogIconClick();
      this.singleCatalogClick();
      this.catalogTrack();
      this.showCatalogIndex();
      this.choseCatalogStyle();
      this.searchCatalog();
      //主题随系统变化
      this.themeChange();
    } catch (err) {
      this.showError(err);
    }
  }

  /*
   * ----------------------------------------
   * 错误提示
   * ----------------------------------------
   */
  showError(info) {
    let errorBlock = document.createElement('p');
    errorBlock.setAttribute('class', 'error');
    errorBlock.innerHTML = info;
    let content = document.querySelector('body');
    content.insertBefore(errorBlock, content.firstChild);
  }

  /**
   * ----------------------------------------
   * 底部信息
   * ----------------------------------------
   * @param tag sting 提示消息的标签 div p
   * @param msg string 提示消息
   * @param id string 父容器，要追加到哪个父容器中的id
   */
  noteTips(tag, msg, id) {
    try {
      if ((typeof tag) !== 'string' || (typeof msg) !== 'string' ||
          (typeof id) !== 'string') {
        throw 'noteTips() 调用时参数类型错误！';
      }
      let exp = document.createElement(tag);
      exp.innerHTML = msg;
      //5.追加结构元素到页面
      document.getElementById(id).appendChild(exp);
    } catch (err) {
      this.showError(err);
    }

  }

  /*
   * ----------------------------------------
   * 创建新的目录、内容和底部提示的布局结构
   * ----------------------------------------
   */
  createContent() {
    //获取已有正文内容
    let oldContent = document.body.innerHTML;
    //清空已有内容
    document.body.innerHTML = '';
    //设置主题属性
    document.documentElement.setAttribute('theme', 'light');
    // 如果将 body{overflow:hidden;} 样式写在 css中,
    // 会出现在 MarkdownPad2 编辑器中预览时，超出屏幕的内容无法滑动的 bug
    document.body.style.overflow = 'hidden';
    //创建左侧目录、右侧内容及其外层包裹结构元素
    //1.创建目录、内容结构父级空元素
    let bodyBlock = document.createElement('div');
    let leftBlock = document.createElement('aside');
    let rightBlock = document.createElement('section');
    //2.设置目录、内容父级元素id属性
    bodyBlock.id = 'body-container';
    leftBlock.id = 'left-container';
    rightBlock.id = 'right-container';
    //3.设置目录父级元素的内容结构
    //是否显示目录序号
    let isShowIndex = this.showIndex;
    let indexItem;
    if (isShowIndex) {
      indexItem = '<i class="iconfont icon-menu-index"></i>';
    } else {
      indexItem = '<i class="iconfont icon-catalog-closeB"></i>';
    }
    //目录样式
    //是否开启夜览模式
    let modeStyleClass;
    if (this.openDark) {
      modeStyleClass = 'icon-moon';
    } else {
      document.body.className = '';
      modeStyleClass = 'icon-sun';
    }
    let indexStyleElement = '';
    let styleIndex = [
      'A',
      'B',
      'C'];
    for (let i = 1, len = 3; i <= len; i++) {
      if (this.indexStyle == i) {
        indexStyleElement
            += '<li class="style-chose">' + '<input type="radio" name="style' +
            styleIndex[i - 1] + '" checked="checked">' + '<label for="style' +
            styleIndex[i - 1] + '">图标-' + styleIndex[i - 1] + '</label>' +
            '</li>';
      } else {
        indexStyleElement
            += '<li class="style-chose">' + '<input type="radio" name="style' +
            styleIndex[i - 1] + '">' + '<label for="style' + styleIndex[i - 1] +
            '">图标-' + styleIndex[i - 1] + '</label>' + '</li>';
      }
    }
    leftBlock.innerHTML
        = '<header class="top-container">' +
        '        <i class="catalog-button iconfont icon-catalog-show"></i>' +
        '        <div class="search-container">' +
        '            <input type="text" class="search" name="search" placeholder="输入关键字搜索目录">' +
        '            <i class="search-icon iconfont icon-close"></i>' +
        '        </div>' + '        <div class="search-result"></div>' +
        '    </header>' + '    <nav id="list-container">' +
        '        <div class="list-wrapper js-launch">' + '        </div>' + '    </nav>' +
        '    <footer class="bottom-container">' +
        '        <div class="mode-container">' +
        '            <div class="mode">' +
        '                <i class="iconfont ' + modeStyleClass + '"></i>' +
        '            </div>' +
        '            <div class="index" title="显示/隐藏目录索引编号">' + indexItem + '</div>' +
        '            <div class="structure" title="风格样式">' +
        '                <i class="iconfont icon-style"></i>' +
        '                <ul class="structure-child">' +
        '                   <li>' +
        '                      <input type="radio" id="show-tree" name="showTree" value="true">' +
        '                      <label for="showTree">目录树</label>' +
        '                    </li>' + '                    <li>' +
        '                      <input type="radio" id="text-shadow" name="textShadow" value="true">' +
        '                      <label for="textShadow">阴影效果</label>' +
        '                   </li>' + indexStyleElement +
        '                </ul>' + '            </div>' +
        '            <div class="quit-menu" title="展开收起子目录">' +
        '                <i class="iconfont icon-quit" value="true"></i>' +
        '            </div>' + '        </footer>' + '    </div>';
    //4.设置内容父级元素的内容结构
    rightBlock.innerHTML
        = '<div id="content">' + oldContent + '</div>' + '</div>';
    bodyBlock.innerHTML
        = '<div id="switch-button">' + '<i class="iconfont icon-label"></i>' +
        ' <i class="iconfont icon-catalog-close"></i>' + '</div>';
    //5.追加结构元素到页面
    document.body.appendChild(bodyBlock);
    bodyBlock.appendChild(leftBlock);
    bodyBlock.appendChild(rightBlock);
    //6.底部提示
    let msg = '<p class="note-tips">' +
        ' 本文档风格样式经过 MarkdownPad2AutoCatalog 目录生成插件转换生成，' +
        '插件地址：<a href="https://github.com/cayxc/MarkdownPad2AutoCatalog" target="_blank"> GitHub地址</a>&emsp;<a href="https://gitee.com/cayxc/MarkdownPad2AutoCatalog" target="_blank">Gitee地址</a></p>';
    //5.追加结构元素到页面
    this.noteTips('footer', msg, 'content');
  }

  /**
   * ----------------------------------------
   * 获取 H 标签后的数字
   * ----------------------------------------
   * @param tag obj 标签对象
   *
   */
  getTagNumber(tag) {
    try {
      if ((typeof tag) != 'object') {
        throw 'getTagNumber() 调用时参数类型错误，必须是一个h标签的对象集合！';
      }
      return Number(tag.nodeName.slice(1));
    } catch (err) {
      return err;
    }
  }

  /**
   * ----------------------------------------
   * 判断目录等级，最大为 6 级即 h6 标签
   * 根据指 id 属性中 level- 中 "." 字符出现的次数判断
   * 0为一级，1为二级，依次类推
   * ----------------------------------------
   * @param str string 需要在哪个字符串中查找
   * @param char string 要查找的字符串
   * @return number 返回指定字符char出现的数字
   */
  findStrFre(str, char) {
    try {
      if ((typeof str) !== 'string' || (typeof str) !== 'string') {
        throw 'findStrFre() 调用时参数类型错误！';
      }
      let number = 0;
      let index = str.indexOf(char);
      while (index !== -1) {
        number++;
        // 从字符串出现的位置的下一位置开始继续查找
        index = str.indexOf(char, index + 1);
      }
      return number;
    } catch (err) {
      return err;
    }
  }

  /**
   * ----------------------------------------
   * 寻找指定等级的目录的集合
   * ----------------------------------------
   *
   * @param level number 第几级目录，最大 6
   *
   */
  levelTagArr(level) {
    try {
      if (level < 1 || level > 6 || (typeof level) !== 'number') {
        throw 'levelTagArr() 调用时参数类型错误！';
      }
      // 所有目录集合
      let allTag = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
      let level1 = [];
      let level2 = [];
      let level3 = [];
      let level4 = [];
      let level5 = [];
      let level6 = [];
      for (let i = 0, len = allTag.length; i < len; i++) {
        let number = this.findStrFre(allTag[i].id, '.');
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
          case 5:
            level6.push(allTag[i]);
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
        case 6:
          return level6;
          break;
        default:
          return;
      }
    } catch (err) {
      return err;
    }

  }

  /**
   * ----------------------------------------
   * 设置递增的 level 编号
   * ----------------------------------------
   * @param tag obj 标签对象
   *
   */
  setLevelNumber(tag) {
    try {
      if ((typeof tag) != 'object') {
        throw 'setLevelNumber() 调用时参数类型错误，必须是一个h标签的对象集合！';
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
    } catch (err) {
      return err;
    }
  }

  /*
   * ----------------------------------------
   * 设置所有 h 标签带层级的 id
   * ----------------------------------------
   */
  setTagLevel() {
    let allH1 = document.querySelectorAll('h1');
    // 获取所有h1~h6标签
    let allTag = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
    //如果只有一个 H1 且在第一个位置，将默认为文章标题,该H1将不计入目录中
    if(allH1.length == 1 && allTag.length > 1 && allTag[0].nodeName === "H1"){
      allTag = document.querySelectorAll('h2,h3,h4,h5,h6');
    }
    let tagLength = allTag.length;
    //判断目录数量，确定第一、二个标题的层级
    if (tagLength == 0) {
      let container = document.querySelector('.list-wrapper');
      container.innerHTML
          = '<ul>' +
          '<li style="text-align:center;color:#999999;font-size:1.4rem; line-height: 2.4rem">' +
          '<i class="iconfont icon-fail"></i>抱歉...<br/>文档中未发现 h1~h6 的标签<br/>无法生成目录</p>\n</li>' +
          '</ul>';
    }
    if (tagLength == 1) {
      allTag[0].id = 'level-' + '1'; //第一个标签肯定为一级标题
    }
    if (tagLength > 1) {
      allTag[0].id = 'level-' + '1';
      let result = this.getTagNumber(allTag[1]) - this.getTagNumber(allTag[0]);
      if (result <= 0) {  //第二个与第一个属于同级标题
        allTag[1].id = this.setLevelNumber(allTag[0]);
      } else {  // 第二个是第一个的子标题
        allTag[1].id = allTag[0].id + '.1';
      }
      for (let i = 2, len = tagLength - 1; i <= len; i++) {
        let currentTagNumber = this.getTagNumber(allTag[i]);
        let prevTagNumber = this.getTagNumber(allTag[i - 1]);
        if (currentTagNumber < prevTagNumber) {
          for (let j = i - 1; j >= 0; j--) {
            //如果两个标签的数字值相差 等于 1 或 0，代表这两个标签是同级
            let status = this.getTagNumber(allTag[j]) - currentTagNumber;
            if (status == 1) {
              if (j > 0) {
                // 类似 h3 h4 h3 的特殊情况
                if (this.getTagNumber(allTag[j - 1]) == currentTagNumber) {
                  allTag[i].id = this.setLevelNumber(allTag[j - 1]);
                  break;
                }
              } else {
                allTag[i].id = this.setLevelNumber(allTag[j]);
                break;
              }
            }
            if (status == 0) {
              allTag[i].id = this.setLevelNumber(allTag[j]);
              break;
            }
          }
        }

        if (currentTagNumber > prevTagNumber) {
          allTag[i].id = allTag[i - 1].id + '.1';
        }

        if (currentTagNumber == prevTagNumber) {
          allTag[i].id = this.setLevelNumber(allTag[i - 1]);
        }
      }
    } else {
      return;
    }
  }

  /**
   * ----------------------------------------
   * 根据当前目录中的 class或id 查找父目录
   * ----------------------------------------
   * @param str  当前目录的 id/class =>(level-1.1)
   */
  findCeilCatalog(str) {
    try {
      if ((typeof str) !== 'string') {
        throw 'catalogForParent()参数类型错误，参数为string';
      }
      //上级目录
      let ceilCatalog = [];
      //判断传入的name的目录等级
      let level = objThis.findStrFre(str, '.') + 1; //0级为一级
      if (level > 1) {
        //当前目录的父目录
        let childArr = objThis.levelTagArr(level - 1);
        if (childArr.length == 0) {
          return [];
        }
        for (let i = 0, len = childArr.length; i < len; i++) {
          //父目录
          let pName = childArr[i].id;
          //当前目录 str 去除最后一段是否和父级相同
          let hName = str.slice(0, str.lastIndexOf('.'));
          if (hName == pName) {
            ceilCatalog.push(childArr[i]);
          }
        }
      }
      return ceilCatalog;
    } catch (err) {
      return err;
    }
  }

  /**
   * ----------------------------------------
   * 根据当前目录中的 class或id 递归查找所有父目录
   * ----------------------------------------
   * @param str  当前目录的 id/class =>(level-1.1)
   */
  findAllCeilCatalog(str, ceilArr = []) {
    try {
      if ((typeof str) !== 'string') {
        throw 'findAllCeilCatalog() 参数类型错误，参数类型为string';
      }
      //父级目录 h 元素
      let ceilCatalog = objThis.findCeilCatalog(str);
      if (ceilCatalog.length > 0) { //不是1级目录
        let ceilName = ceilCatalog[0].id; //上一级目录class
        let ceilElement = document.getElementsByClassName(ceilName)[0].parentElement;
        ceilArr.push(ceilElement);
        this.findAllCeilCatalog(ceilName, ceilArr);
      }
      return ceilArr;
    } catch (err) {
      return err;
    }
  }

  /*
   * ----------------------------------------
   * 创建目录
   * ----------------------------------------
   */
  createCatalogue() {
    // 设置所有 h 标签的等级 id
    this.setTagLevel();
    // 目录容器
    let catalogueBlock = document.querySelector('.list-wrapper');
    // 创建余子目录容器
    let ulElement = document.createElement('ul');
    //1级目录
    let level1 = this.levelTagArr(1);
    if (level1.length == 0) { //没有目录
      let divElement = document.createElement('div');
      divElement.innerHTML =
          '<i class="iconfont icon-fail"></i><p>正文中未发现 h1~h6 标签，无法生成没有目录</p>';
      catalogueBlock.appendChild(divElement);
    } else { //有目录
      for (let i = 0, len = level1.length; i < len; i++) {
        let liElement = document.createElement('li');
        liElement.innerHTML =
            '<a class="' + level1[i].id + '" href="' + window.location.pathname + '#' + level1[i].id + '"' + '>' + '<div><p>' +
            level1[i].id.slice(6) + '</p>' + '<span>' + level1[i].innerText +
            '</span></div>' + '</a>';
        ulElement.appendChild(liElement);
        catalogueBlock.appendChild(ulElement);
      }
    }
    //目录icon
    let iconStyle = ['A', 'B', 'c']; //样式
    //2级及以后的目录
    for (let j = 2; j <= 6; j++) {
      let levelOther = this.levelTagArr(j);
      if (levelOther.length > 0) {
        for (let k = 0, len = levelOther.length; k < len; k++) {
          //当前目录id
          let cName = levelOther[k].id;
          let handleName = cName.slice(0, cName.lastIndexOf('.'));
          //当前目录的上级目录
          let ceilElement = this.findCeilCatalog(cName);
          if (handleName == ceilElement[0].id) { //找到相应的上级目录
            //上级目录li
            let ceilLi = document.getElementsByClassName(ceilElement[0].id)[0].parentElement;
            //子目录内容
            let content = document.createElement('li');
            content.innerHTML =
                '<a class="' + cName + '" href="' + window.location.pathname + '#' + cName + '"' + '>' + '<div><p>' +
                cName.slice(6) + '</p>' + '<span>' + levelOther[k].innerText +
                '</span></div>' + '</a>';
            //查询是否存在 ul
            let haveUl = ceilLi.querySelector('ul');
            if (haveUl == null) { //之前没有子目录
              let ulElement = document.createElement('ul');
              //添加目录到相应目录下
              ulElement.appendChild(content);
              ceilLi.appendChild(ulElement);
              //给上级目录添加icon
              let iconI = document.createElement('i');
              iconI.setAttribute('class', 'iconfont icon-launch' + iconStyle[indexStyleNumber - 1]);
              ceilLi.insertBefore(iconI, ceilLi.children[0]);
            } else { //有子目录
              let container = ceilLi.querySelector('ul');
              container.appendChild(content);
            }
          }
        }
      }
    }
    //给没有子目录的一级目录单独设置icon
    for (let m = 0, len = level1.length; m < len; m++) {
      let liElement = document.getElementsByClassName(level1[m].id)[0].parentElement;
      if (liElement.children[0].nodeName != 'I') {
        //给上级目录添加icon
        let iconI = document.createElement('i');
        iconI.setAttribute('class', 'iconfont icon-launch' + iconStyle[indexStyleNumber - 1]);
        liElement.insertBefore(iconI, liElement.children[0]);
      }
    }
  }

  /*
   * ----------------------------------------
   * //替换旧文档
   * ----------------------------------------
   */
  replaceOld() {
    this.createContent();
    this.createCatalogue();
    // 第一个目录默认样式
    (document.querySelector('.list-wrapper')).querySelector('li').classList.add('js-active');
    //给正文一级标题添加下划线样式
    let allLevel1 = this.levelTagArr(1);
    for(let i=0,len=allLevel1.length;i<len;i++){
      allLevel1[i].classList.add('js-level1-style');
    }
  }

  /*
   * ----------------------------------------
   * 点击隐藏侧边目录
   * ----------------------------------------
   */
  switchCatalog() {
    let asideButton = this.asideButton;
    let leftElement = this.leftElement;
    let switchButton = this.switchButton;
    asideButton.onclick = function() {
      leftElement.setAttribute('class', 'js-width-0');
      switchButton.className = 'js-height-1';
    };
    switchButton.onclick = function() {
      switchButton.style.height = switchButton.className = 'js-height-0';
      leftElement.removeAttribute('class');
      leftElement.style.display = 'block';
    };
    //屏幕小于768时，收起目录展开时，点击内容区，收起目录
    let mediaStatus = window.matchMedia('(max-width: 768px)').matches;
    let asideStatus = leftElement.classList.contains('js-width-0');
    if (mediaStatus && !asideStatus) {
      this.rightElement.onclick = function() {
        leftElement.classList.add('js-width-0');
        switchButton.className = 'js-height-1';
      };
    }
  }

  /*
   * ----------------------------------------
   * 改变所有icon为对应的图标
   * ----------------------------------------
   * @param iconArr 所有icon图标元素集合
   * @param index icon图标样式序号：A,B,C ...
   *
   */
  changeIcons(iconArr, index = 1) {
    try {
      if ((typeof iconArr) !== 'object') {
        throw 'changeIcon() 调用时参数1类型错误，必须为object';
      }
      if ((typeof index) !== 'number' || index > 3) {
        throw 'changeIcon() 调用时参数2类型错误，必须为number,且小于等于 3';
      }
      //改变整体icon风格
      let arr = ['A', 'B', 'C'];
      for (let i = 0, len = iconArr.length; i < len; i++) {
        let oldClass = iconArr[i].getAttribute('class');
        let newClass = oldClass.slice(0, -1) + arr[index - 1];
        iconArr[i].setAttribute('class', newClass);
      }
    } catch (err) {
      return err;
    }

  }

  /**
   * ----------------------------------------
   * 切换单个icon状态
   * ----------------------------------------
   * @param icon 需要切换icon图标元素容器
   */
  changeSingleIcon(icon) {
    try {
      if ((typeof icon) !== 'object') {
        throw 'changeIcon() 调用时参数1类型错误，该参数为图标元素的容器';
      }
      //仅改变状态：展开/关闭
      let oldClass = icon.getAttribute('class');
      if (oldClass.includes('launch')) {
        icon.setAttribute('class', oldClass.replace('launch', 'retract'));
      }
      if (oldClass.includes('retract')) {
        icon.setAttribute('class', oldClass.replace('retract', 'launch'));
      }
    } catch (err) {
      return err;
    }
  }

  /*
   * ----------------------------------------
   * 整个子目录列表展开、收起
   * ----------------------------------------
   */
  switchCatalogList() {
    let switchListButton = this.switchListButton;
    let status = switchListButton.children[0].getAttribute('value');
    let allIcon = this.allIcon;
    let changeSingleIcon = this.changeSingleIcon;
    switchListButton.addEventListener('click', function() {
      //清除单个目录点已经过击赋予的样式，避免样式冲突
      let oldLi = document.querySelectorAll('.js-item-retract');
      for(let j = 0, len = oldLi.length; j < len; j++){
        oldLi[j].classList.remove('js-item-retract');
      }
      let oldLi2 = document.querySelectorAll('.js-item-launch');
      for(let k = 0, len = oldLi2.length; k < len; k++){
        oldLi2[k].classList.remove('js-item-launch');
      }
      if (status) {
        //收起子目录
        document.querySelector('.list-wrapper').classList.add('js-retract');
        //切换底部按钮 icon
        this.children[0].setAttribute('class', 'iconfont icon-branchB');
        this.children[0].setAttribute('value', 'false');
        status = false;
      } else {
        //展开子目录
        document.querySelector('.list-wrapper').classList.remove('js-retract');
        //切换底部按钮 icon
        this.children[0].setAttribute('class', 'iconfont icon-quit');
        this.children[0].setAttribute('value', 'true');
        status = true;
      }
      //改变icon状态：展开/关闭
      for (let i = 0, len = allIcon.length; i < len; i++) {
        let topClass = document.querySelector('.list-wrapper').getAttribute('class');
        let iconClass = allIcon[i].getAttribute('class');
        if(topClass.includes('js-retract')){ //收起目录
          //更换icon
          allIcon[i].setAttribute('class','iconfont icon-retract'+iconClass.slice(-1));
          //收起子目录
          document.querySelector('.list-wrapper').setAttribute('class','list-wrapper js-retract');
        }else{ //展开目录
          allIcon[i].setAttribute('class','iconfont icon-launch'+iconClass.slice(-1));
          document.querySelector('.list-wrapper').setAttribute('class','list-wrapper js-launch');
        }
        //给没有子目录的一级目录单独设置icon
        let lastChild = allIcon[i].parentElement.lastElementChild;
        if (lastChild.nodeName == 'A') {
          let cName = allIcon[i].getAttribute('class');
          //设置新class
          allIcon[i].setAttribute('class', cName.replace('retract', 'launch'));
        }
      }
    });
  }

  /*
   * ----------------------------------------
   * 目录图标点击
   * ----------------------------------------
   */
  catalogIconClick() {
    let listElement = document.querySelector('.list-wrapper');
    let allIcon = listElement.querySelectorAll('i');
    let changeSingleIcon = this.changeSingleIcon;
    for (let i = 0, len = allIcon.length; i < len; i++) {
      allIcon[i].onclick = function(event) {
        event.stopPropagation();
        //当前目录下是否有子目录
        let parCatalog = allIcon[i].parentElement;
        if (parCatalog.lastElementChild.nodeName == 'UL') { //有子目录
          changeSingleIcon(allIcon[i]); //修改图标样式
          //点击后的icon
          let iconClass = allIcon[i].getAttribute('class');
          if(iconClass.includes('launch')){ //展开子目录
            allIcon[i].parentElement.classList.add('js-item-launch');
            allIcon[i].parentElement.classList.remove('js-item-retract');
          }else{//收起子目录
            allIcon[i].parentElement.classList.add('js-item-retract');
            allIcon[i].parentElement.classList.remove('js-item-launch');
          }
        }
      }
    }
  }

  /**
   * ----------------------------------------
   * 目录点击事件
   * ----------------------------------------
   * @param  catalog 需要执行点击事件的目录容器 Li
   */
  catalogClickEvent(catalog) {
    try {
      if ((typeof catalog) !== 'object') {
        throw 'catalogClickEvent(catalog)参数类型错误，参数：catalog为目录元素';
      }
      let findCeilCatalog = objThis.findCeilCatalog;
      catalog.onclick = function(event) {
        event.stopPropagation(); //会一直找到其上一级，直到1级目录
        event.preventDefault();

        let thisClass = catalog.querySelector('a').getAttribute('class');
        document.getElementById(thisClass).scrollIntoView({behavior: 'smooth'});
        //清除已有的active样式
        let activeArr = document.querySelectorAll('.js-active');
        for (let j = 0, len = activeArr.length; j < len; j++) {
          activeArr[j].classList.remove('js-active');
        }
        //给当前目录设置 active
        catalog.classList.add('js-active');
        //上级目录
        let ceilCatalog = findCeilCatalog(thisClass);
        let allCeil = objThis.findAllCeilCatalog(thisClass);
        if (allCeil.length > 0) {
          for (let k = 0, len = allCeil.length; k < len; k++) {
            //给上级目录设置 active
            allCeil[k].classList.add('js-active');
          }
        }
      };
    } catch (err) {
      return err;
    }
  }

  /*
   * ----------------------------------------
   * 单个目录点击
   * ----------------------------------------
   */
  singleCatalogClick() {
    let listElement = document.querySelector('.list-wrapper');
    let allCatalog = listElement.querySelectorAll('li');
    for (let i = 0, len = allCatalog.length; i < len; i++) {
      this.catalogClickEvent(allCatalog[i]);
    }
  }

  /*
   * ----------------------------------------
   * 主题切换（light/dark）
   * ----------------------------------------
   */
  themeChange() {
    //点击按钮切换模式
    let viewModeButton = this.viewModeButton;
    let htmlElement = document.documentElement;
    viewModeButton.onclick = function() {
      let isDarkMode = htmlElement.getAttribute('theme');
      if (isDarkMode == 'light') {
        this.children[0].setAttribute('class', 'iconfont icon-moon');
        htmlElement.setAttribute('theme', 'dark');
      } else {
        this.children[0].setAttribute('class', 'iconfont icon-sun');
        htmlElement.setAttribute('theme', 'light');
      }
    };

    // 查询系统是否使用了dark主题 osThemeIsDark => true/false;
    let osThemeIsDark = matchMedia('(prefers-color-scheme: dark)').matches;
    if (osThemeIsDark) {
      viewModeButton.children[0].setAttribute('class', 'iconfont icon-moon');
      htmlElement.setAttribute('theme', 'dark');
    } else {
      viewModeButton.children[0].setAttribute('class', 'iconfont icon-sun');
      htmlElement.setAttribute('theme', 'light');
    }

    //监听系统主题变化
    matchMedia('(prefers-color-scheme: dark)').
        addEventListener('change', event => {
          //event.matches: dark => true
          if (event.matches) {
            viewModeButton.children[0].setAttribute(
                'class', 'iconfont icon-moon');
            document.documentElement.setAttribute('theme', 'dark');
          } else {
            viewModeButton.children[0].setAttribute(
                'class', 'iconfont icon-sun');
            document.documentElement.setAttribute('theme', 'light');
          }
        });
  }

  /*
   * ----------------------------------------
   * 显示隐藏目录序号
   * ----------------------------------------
   */
  showCatalogIndex() {
    let status = true;
    let showIndex = originShowIndex;
    let listElement = this.listElement;
    this.showIndexEl.children[0].addEventListener('click', function() {
      if (status) { //关闭目录序号
        listElement.classList.add('js-noindex');
        this.setAttribute('class', 'iconfont icon-catalog-closeB');
        status = false;
      } else { //显示目录序号
        listElement.classList.remove('js-noindex');
        this.setAttribute('class', 'iconfont icon-menu-index');
        status = true;
      }
    });
  }

  /*
   * ----------------------------------------
   * 风格样式选择
   * ----------------------------------------
   */
  choseCatalogStyle() {
    let allStyle = document.querySelectorAll('.style-chose');

    //所有的目录
    let allIcon = this.allIcon;
    let changeIcons = this.changeIcons;
    // 改变icon 图标;
    for (let i = 0, len = allStyle.length; i < len; i++) {
      allStyle[i].onclick = function() {
        //改变icon
        changeIcons(allIcon, i + 1);
        //样式按钮选中
        for (let j = 0, len = allStyle.length; j < len; j++) {
          allStyle[j].children[0].removeAttribute('checked');
        }
        this.children[0].setAttribute('checked', 'checked');
      };
    }

    //文字阴影显示隐藏
    let shadowButton = document.querySelector(
        '[name="textShadow"]').parentElement;
    shadowButton.onclick = function() {
      let isShadow = document.querySelector('body').
          classList.
          contains('js-show-shadow');
      if (!isShadow) {
        document.querySelector('body').setAttribute('class', 'js-show-shadow');
        this.children[0].setAttribute('checked', 'checked');
      } else {
        document.querySelector('body').setAttribute('class', 'js-close-shadow');
        this.children[0].removeAttribute('checked');
      }
    };
    if (isShadow == true) {
      document.querySelector('body').setAttribute('class', 'js-show-shadow');
      shadowButton.children[0].setAttribute('checked', 'checked');
    } else {
      document.querySelector('body').setAttribute('class', 'js-close-shadow');
      shadowButton.children[0].removeAttribute('checked');
    }

    //目录树显示隐藏
    let treeButton = document.querySelector('[name="showTree"]').parentElement;
    treeButton.onclick = function() {
      let isTree = document.querySelector('#body-container').
          classList.
          contains('js-show-tree');
      if (!isTree) {
        document.querySelector('#body-container').
            setAttribute('class', 'js-show-tree');
        this.children[0].setAttribute('checked', 'checked');
      } else {
        document.querySelector('#body-container').
            setAttribute('class', 'js-close-tree');
        this.children[0].removeAttribute('checked');
      }
    };
    if (isTree == true) {
      document.querySelector('#body-container').
          setAttribute('class', 'js-show-tree');
      treeButton.children[0].setAttribute('checked', 'checked');
    } else {
      document.querySelector('#body-container').
          setAttribute('class', 'js-close-tree');
      treeButton.children[0].removeAttribute('checked');
    }

  }

  /*
   * ----------------------------------------
   * 根据内容区阅读位置自动追踪目录
   * ----------------------------------------
   */
  catalogTrack() {
    //获取内容区所有 h1~h6 标题及它们距离浏览器顶部的距离
    let allTag = this.content.querySelectorAll('h1,h2,h3,h4,h5,h6');
    let rightElement = this.rightElement;
    let catalog = document.querySelectorAll('.list-wrapper li');
    let allTitleDistance = [];
    for (let i = 0, len = allTag.length; i < len; i++) {
      allTitleDistance.push(allTag[i].offsetTop);
    }
    //滑动正文内容时
    rightElement.onscroll = function(event) {
      //滑动到相应区域目录添加active样式
      let roll = rightElement.scrollTop; //滚动距离
      for (let i = 0, len = allTag.length; i < len; i++) {
        if (roll + 30 > allTag[i].offsetTop) {
          let activeElement = document.querySelectorAll('.js-active');
          for (let j = 0, len = activeElement.length; j < len; j++) {
            activeElement[j].classList.remove('js-active');
          }
          catalog[i].classList.add('js-active');
          //父级目录
          let currentClass = catalog[i].querySelector('a').getAttribute('class');
          let allCeil = objThis.findAllCeilCatalog(currentClass);
          if (allCeil.length > 0) {
            for (let k = 0, len = allCeil.length; k < len; k++) {
              allCeil[k].classList.add('js-active');
            }
          }
        } else {
          catalog[i].classList.remove('js-active');
        }
      }
      if (roll < allTag[0].offsetTop) {
        catalog[0].classList.add('js-active');
      }
      // 目录超出可视区域后，滚动到可视区域
      let active = document.querySelectorAll('.js-active');
      let originalLastItem = active[active.length - 1].querySelector('a');
      originalLastItem.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'center',
                                        inline: 'center',
                                      });
    };
  }

  /**
   * ----------------------------------------
   * 比对搜索框和所有目录的值
   * ----------------------------------------
   * @param value 要比对的原始值，即 input 输入框的 value 值
   *
   */
  comparison(value) {
    try {
      if ((typeof value) != 'string') {
        throw 'comparison() 参数必须是一个字符串';
      }
      value = value.toLowerCase();
      let result = '';
      let allCatalogElement = this.allCatalogElement;
      for (let i = 0, len = allCatalogElement.length; i < len; i++) {
        let text = allCatalogElement[i].innerText.replace(/\s+/g, '');
        if (text.toLowerCase().indexOf(value) != -1) {
          let href = allCatalogElement[i].getAttribute('href');
          result +=
              '<a href="' + href + '">' + allCatalogElement[i].innerText + '</a>';
        }
      }
      if (result == '') {
        result =
            '<i class="iconfont icon-search"></i>\n<span>目录中暂无相关搜索结果</span>\n<span>试试 Ctrl+F  在全文档搜索</span>';
      }
      return result;
    } catch (err) {
      this.showError(err);
    }
  }

  /*
   * ----------------------------------------
   * 搜索目录
   * ----------------------------------------
   */
  searchCatalog() {
    let searchElement = document.querySelector('.search');
    let searchResultElement = document.querySelector('.search-result');
    let searchIconElement = searchElement.nextElementSibling;
    // 获取焦点
    searchElement.onfocus = function() {
      searchElement.onkeyup = function() {
        let searchNewValue = (searchElement.value).replace(/\s+/g, '');
        if (searchNewValue) { // 不为空时
          searchResultElement.style.display = 'block';
          searchIconElement.style.display = 'block';
          let results = objThis.comparison(searchNewValue);
          searchResultElement.innerHTML = results;
          // 记录当前已点选过的搜索结果
          let allSearch = searchResultElement.querySelectorAll('a');
          for (let j = 0, len = allSearch.length; j < len; j++) {
            allSearch[j].onclick = function() {
              allSearch[j].classList.add('js-active');
            };
          }
        } else {
          searchResultElement.style.display = 'none';
          searchIconElement.style.display = 'none';
        }
      };
    };
    // 点击取消
    searchIconElement.onclick = function() {
      this.style.display = 'none';
      searchResultElement.style.display = 'none';
      searchElement.value = '';
    };
  }
}

window.addEventListener('DOMContentLoaded', function() {
  new MarkdownPad2AutoCatalog();
});


