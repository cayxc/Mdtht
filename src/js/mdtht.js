/*
 * ------------------------------------------------------------------------
 * mdtht.js
 * (c) 2022-2024
 * Author: cayxc
 * Homepage:  https://gitee.com/cayxc/mdtht  https://github.com/cayxc/Mdtht
 * License: BSD-3-Clause
 * ------------------------------------------------------------------------
 */
let objThis;

class Mdtht {
  //indexStyle 目录样式 1, 2, 3
  //firstTagToTitle  第一个标题是否作为文档标题，不计入目录中
  //titleCenter 文章标题是否居中
  //showIndex  是否显示目录序号
  //showTitleIndex  是否开启正文标题序号
  //showTree   是否开启树状线
  //openShadow  是否开启文字阴影
  //openDark   是否开启夜览模式
  constructor(
      indexStyle      = 1,
      firstTagToTitle = false,
      titleCenter     = true,
      showIndex       = false,
      showTitleIndex  = false,
      showTree        = true,
      openShadow      = false,
      openDark        = false
  ) {
    try {
      if ((typeof indexStyle) !== 'number' || 1 > indexStyle || indexStyle >
          3) {
        indexStyle = 1;
        throw new Error('参数: indexStyle 类型有误，已按照默认配置执行，该参数类型为：Number, 1<= Number <=3');
      }
      if ((typeof firstTagToTitle) !== 'boolean') {
        firstTagToTitle = false;
        throw new Error('参数: firstTagToTitle 类型有误，已按照默认配置执行，该参数类型为：Boolean');
      }
      if ((typeof titleCenter) !== 'boolean') {
        titleCenter = false;
        throw new Error('参数: titleCenter 类型有误，已按照默认配置执行，该参数类型为：Boolean');
      }
      if ((typeof showIndex) !== 'boolean') {
        showIndex = true;
        throw new Error('参数: showIndex 类型有误，已按照默认配置执行，该参数类型为：Boolean');
      }
      if ((typeof showTitleIndex) !== 'boolean') {
        showTitleIndex = true;
        throw new Error('参数: showTitleIndex 类型有误，已按照默认配置执行，该参数类型为：Boolean');
      }
      if ((typeof showTree) !== 'boolean') {
        showTree = true;
        throw new Error('参数: showTree 类型有误，已按照默认配置执行，该参数类型为：Boolean');
      }
      if ((typeof openShadow) !== 'boolean') {
        openShadow = false;
        throw new Error('参数: openShadow 类型有误，已按照默认配置执行，该参数类型为：Boolean');
      }
      if ((typeof openDark) !== 'boolean') {
        openDark = false;
        throw new Error('参数: openDark 类型有误，已按照默认配置执行，该参数类型为：Boolean');
      }
    } catch (err) {
      this.showError(err);
      console.log(err); //打印详细的错误，方便调试
    } finally {
      objThis = this; //当前对象的 this
      this.showIndex = showIndex;
      this.indexStyle = indexStyle;
      this.openDark = openDark;
      this.openShadow = openShadow;
      this.showTitleIndex = showTitleIndex;
      this.showTree = showTree;
      this.firstTagToTitle = firstTagToTitle;
      this.titleCenter = titleCenter;
      this.acticleTitle = '';
      this.handleHarr = '';
      //目录构建
      if ((document.querySelector('#body-container')) === null) { //替换文档内容，防止重复生成
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
      this.themeChange();
      this.showCatalogIndex();
      this.choseCatalogStyle();
      this.switchCatalog();
      this.switchCatalogList();
      this.catalogIconClick();
      this.searchCatalog();
      this.catalogTrack();
      this.internalLinkJump();
      this.singleCatalogClick();
      this.sidebarResize();
    }
  }

  /*
   * ----------------------------------------
   * 错误提示
   * ----------------------------------------
   */
  showError(info) {
    const errorBlock = document.createElement('p');
    errorBlock.setAttribute('class', 'error');
    errorBlock.innerHTML = info;
    const content = document.querySelector('body');
    content.prepend(errorBlock);
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
        throw new Error('noteTips() 调用时参数类型错误！');
      }
      const exp = document.createElement(tag);
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
    const oldContent = document.body.innerHTML;
    //清空已有内容
    document.body.innerHTML = '';
    //设置主题属性
    document.documentElement.setAttribute('theme', 'light');
    // 如果将 body{overflow:hidden;} 样式写在 css中,
    // 会出现在 MarkdownPad2 编辑器中预览时，超出屏幕的内容无法滑动的 bug
    document.body.style.overflow = 'hidden';
    //创建左侧目录、右侧内容及其外层包裹结构元素
    //1.创建目录、内容结构父级空元素
    const bodyBlock = document.createElement('div');
    const leftBlock = document.createElement('aside');
    const rightBlock = document.createElement('section');
    //2.设置目录、内容父级元素、拖动控件id属性
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
    if (this.openDark === true) {
      modeStyleClass = 'icon-moon';
      document.documentElement.setAttribute('theme', 'dark');
    }
    if (this.openDark === false) {
      modeStyleClass = 'icon-sun';
      document.documentElement.setAttribute('theme', 'light');
    }
    let indexStyleElement = '';
    const styleIndex = ['A', 'B', 'C'];
    for (let i = 1, len = 3; i <= len; i++) {
      if (this.indexStyle == i) {
        indexStyleElement +=
            `<li class="style-chose">
                <input type="radio" name="style${styleIndex[i -
            1]}" checked="checked" disabled="disabled"><label for="style${styleIndex[i -
            1]}">图标-${styleIndex[i - 1]}</label>
            </li>`;
      } else {
        indexStyleElement +=
            `<li class="style-chose">
                <input type="radio" name="style${styleIndex[i -
            1]}" disabled="disabled"><label for="style${styleIndex[i -
            1]}">图标-${styleIndex[i - 1]}</label>
            </li>`;
      }
    }
    leftBlock.innerHTML =
        `<div id="resize-control" title="按住鼠标拖动调整侧边栏宽度"></div>
        <header class="top-container">
            <i class="catalog-button iconfont icon-catalog-show" title="展开/收起侧边栏"></i>
            <div class="search-container">
                <input type="text" class="search" name="search" placeholder="输入关键字搜索目录">
                <i class="search-icon iconfont icon-close"></i>
            </div>
            <div class="search-result"></div>
        </header>
        <nav id="list-container">
            <div class="list-wrapper js-launch"></div>
        </nav>
        <footer class="bottom-container">
            <div class="mode-container">
                <div class="mode" title="亮色/暗色模式">
                    <i class="iconfont modeStyleClass+'"></i>
                </div>
                <div class="index" title="显示/隐藏目录索引编号">${indexItem}</div>
                <div class="structure" title="风格样式">
                    <i class="iconfont icon-style"></i>
                    <ul class="structure-child">
                        <li>
                            <input type="radio" id="title-index" name="titleIndex" value="false" disabled="disabled">
                            <label for="titleIndex">标题索引</label>
                        </li>
                        <li>
                            <input type="radio" id="show-tree" name="showTree" value="true" disabled="disabled">
                            <label for="showTree">目录树</label>
                        </li>
                        <li>
                            <input type="radio" id="text-shadow" name="textShadow" value="true" disabled="disabled">
                            <label for="textShadow">阴影效果</label>
                        </li>
                        ${indexStyleElement}
                    </ul>
                </div>
                <div class="quit-menu" title="展开/收起全部子目录">
                    <i class="iconfont icon-quit" value="true"></i>
                </div>
            </div>
        </footer>`;
    //4.设置内容父级元素的内容结构
    rightBlock.innerHTML = `<div id="content">${oldContent}</div></div>`;
    bodyBlock.innerHTML =
        `<div id="switch-button">
            <i class="iconfont icon-label"></i>
            <i class="iconfont icon-catalog-close"></i>
        </div>`;
    //5.追加结构元素到页面
    document.body.appendChild(bodyBlock);
    bodyBlock.appendChild(leftBlock);
    bodyBlock.appendChild(rightBlock);
    //6.底部提示
    const msg =
              `<p class="note-tips">DOCUMENT STYLE CREATED BY Mdtht&nbsp;ABOUT Mdtht：<a href="https://github.com/cayxc/Mdtht" target="_blank">Github</a>&emsp;<a href="https://gitee.com/cayxc/mdtht" target="_blank">Gitee</a>
              </p>`;
    //5.追加结构元素到页面
    this.noteTips('footer', msg, 'content');
  }

  /**
   * ----------------------------------------
   * 获取目录等级编号前缀，和最后的目录索引number
   * ----------------------------------------
   * @param levelStr 需要处理的目录编号字符串，如：level-1.2
   * @return arr [String:prefixStr, Number:lastIndex]  [目录等级编号前缀, 目录索引number]
   */
  getPrefixIndex(levelStr) {
    try {
      if ((typeof levelStr) !== 'string') {
        throw new Error('getPrefixIndex() 需要传入一个字符，且如level-1或level-1.2.2的形式');
      }
      let lastIndex; //上一级的目录索引编号
      let prefixStr; //前缀 level-1.
      let indexPoint = levelStr.lastIndexOf('.'); //去除'.'后的最后位置
      if (indexPoint === -1) { //没有 '.' 一级目录 level-1
        prefixStr = levelStr.slice(0, levelStr.lastIndexOf('-') + 1);
        lastIndex = levelStr.slice(levelStr.lastIndexOf('-') + 1);
      } else { //有 '.' 其他等级目录 level-1.2.3
        prefixStr = levelStr.slice(0, indexPoint + 1);
        lastIndex = levelStr.slice(indexPoint + 1);
      }
      return [prefixStr, Number(lastIndex)];
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
    // 获取所有h1~h6标签
    let allTag = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
    if (allTag.length == 0) {
      return false;
    }
    if (this.firstTagToTitle === true) { //将第一个标题作为文档标题
      this.acticleTitle = allTag[0];
      allTag[0].parentNode.removeChild(allTag[0]);
      //处理后的h标签集合
      // 去除第一个标题的目录,重新查询
      allTag = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
    }
    this.handleHarr = allTag; //处理后的h标签集合
    const tagLength = allTag.length;
    //判断目录数量
    if (tagLength == 0) {
      return false;
    }
    if (tagLength >= 1) {
      allTag[0].id = 'level-1'; //设置第一个标题带层级的id
      for (let i = 1, len = allTag.length; i < len; i++) {
        /*后一个和从前一个比较*/
        //第2个标签数字 > 前1个的标签数字 ，则是前1个的子级
        if (this.getTagNumber(allTag[i]) > this.getTagNumber(allTag[i - 1])) {
          allTag[i].id = allTag[i - 1].id + '.1';
          continue;
        }
        //第2个标签数字 == 前1个的标签数字 ，则是前1个的同级
        if (this.getTagNumber(allTag[i]) == this.getTagNumber(allTag[i - 1])) {
          allTag[i].id = this.getPrefixIndex(allTag[i - 1].id)[0] +
              (this.getPrefixIndex(allTag[i - 1].id)[1] + 1);
          continue;
        }
        //第2个标签数字 < 前1个标签数字，则和前面的比较
        if (this.getTagNumber(allTag[i]) < this.getTagNumber(allTag[i - 1])) {
          for (let j = i - 1; j >= 0; j--) {
            if (this.getTagNumber(allTag[i]) ==
                this.getTagNumber(allTag[j - 1])) { //和第j-1个同级
              allTag[i].id = this.getPrefixIndex(allTag[j - 1].id)[0] +
                  (this.getPrefixIndex(allTag[j - 1].id)[1] + 1);
              break;
            } else if (this.getTagNumber(allTag[i]) >
                this.getTagNumber(allTag[j - 1])) { //和前一个/第i-1个同级
              allTag[i].id = this.getPrefixIndex(allTag[i - 1].id)[0] +
                  (this.getPrefixIndex(allTag[i - 1].id)[1] + 1);
              break;
            } else { //继续向前找
              allTag[i].id = this.getPrefixIndex(allTag[j].id)[0] +
                  (this.getPrefixIndex(allTag[j].id)[1] + 1);
              //如果前一个：allTag[j] 是一级目录了,停止继续查找，结束循环
              if (allTag[j].id.indexOf('.') === -1) {
                break;
              }
            }
          }
        }
      }
      //添加标题索引
      for (let k = 0; k < tagLength; k++) {
        const titleIndex = document.createElement('span');
        titleIndex.innerHTML = allTag[k].id.slice(
            allTag[k].id.lastIndexOf('-') + 1);
        allTag[k].prepend(titleIndex);
      }
      return true;
    }
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
      if ((typeof tag) !== 'object') {
        throw new Error('getTagNumber() 调用时参数类型错误，必须是一个h标签的对象集合！');
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
        throw new Error('findStrFre() 调用时参数类型错误！');
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
        throw new Error('levelTagArr() 调用时参数类型错误！');
      }
      // 所有目录集合,处理后的
      let allTag = this.handleHarr;
      const [level1, level2, level3, level4, level5, level6] = [
        [],
        [],
        [],
        [],
        [],
        []
      ];
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
          return [];
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
      if ((typeof tag) !== 'object') {
        throw new Error('setLevelNumber() 调用时参数类型错误，必须是一个h标签的对象集合！');
      }
      const str = tag.id;
      if (str.lastIndexOf('.') == -1) { //如果是一级目录形式 level-1000
        const newValue = parseInt(str.slice(6)) + 1;
        return 'level-' + newValue;
      } else {
        //如果是大于一级的目录形式 level-1.1 level-1.1.1 ...
        const lastIndex = str.lastIndexOf('.');
        const oldValue = str.slice(0, lastIndex);
        const newValue = parseInt(str.slice(lastIndex + 1)) + 1;
        return oldValue + '.' + newValue;
      }
    } catch (err) {
      return err;
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
        throw new Error('catalogForParent()参数类型错误，参数为string');
      }
      //上级目录
      const ceilCatalog = [];
      //判断传入的name的目录等级
      let level = objThis.findStrFre(str, '.') + 1; //0级为一级
      if (level > 1) {
        //当前目录的父目录
        const childArr = objThis.levelTagArr(level - 1);
        if (childArr.length == 0) {
          return [];
        }
        for (let i = 0, len = childArr.length; i < len; i++) {
          //父目录
          const pName = childArr[i].id;
          //当前目录 str 去除最后一段是否和父级相同
          const hName = str.slice(0, str.lastIndexOf('.'));
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
        throw new Error('findAllCeilCatalog() 参数类型错误，参数类型为string');
      }
      //父级目录 h 元素
      let ceilCatalog = objThis.findCeilCatalog(str);
      if (ceilCatalog.length > 0) { //不是1级目录
        let ceilName = ceilCatalog[0].id; //上一级目录class
        let ceilElement = document.getElementsByClassName(
            ceilName)[0].parentElement;
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
    let res = this.setTagLevel();
    // 目录容器
    let catalogueBlock = document.querySelector('.list-wrapper');
    // 创建余子目录容器
    let ulElement = document.createElement('ul');
    if (res) {
      //确定1级目录
      let level1;
      let firstLevelNum; //确定第二级目录的起始等级
      for (let s = 1; s <= 6; s++) {
        level1 = this.levelTagArr(s);
        if (level1.length > 0) {
          level1 = this.levelTagArr(s);
          firstLevelNum = s;
          break;
        }
      }
      if (level1.length > 0) { //有目录
        for (let i = 0, len = level1.length; i < len; i++) {
          let liElement = document.createElement('li');
          liElement.innerHTML =
              `<a class="${level1[i].id}" href="#${level1[i].id}">
                <div>
                    <p>${level1[i].id.slice(6)}</p>
                    <span>${level1[i].innerText}</span>
                </div>
              </a>`;
          ulElement.appendChild(liElement);
          catalogueBlock.appendChild(ulElement);
        }

        //目录icon
        const iconStyle = ['A', 'B', 'c']; //样式
        //2级及以后的目录
        for (let j = firstLevelNum + 1; j <= 6; j++) {
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
                let ceilLi = document.getElementsByClassName(
                    ceilElement[0].id)[0].parentElement;
                //子目录内容
                let content = document.createElement('li');
                content.innerHTML =
                    `<a class="${cName}" href="#${cName}">
                        <div>
                            <p>${cName.slice(6)}</p>
                            <span>${levelOther[k].innerText}</span>
                        </div>
                    </a>`;
                //查询是否存在 ul
                let haveUl = ceilLi.querySelector('ul');
                if (haveUl === null) { //之前没有子目录
                  let ulElement = document.createElement('ul');
                  //添加目录到相应目录下
                  ulElement.appendChild(content);
                  ceilLi.appendChild(ulElement);
                  //给上级目录添加icon
                  let iconI = document.createElement('i');
                  iconI.setAttribute('class',
                      'iconfont icon-launch' + iconStyle[this.indexStyle - 1]);
                  ceilLi.prepend(iconI);
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
          let liElement = document.getElementsByClassName(
              level1[m].id)[0].parentElement;
          if (liElement.children[0].nodeName !== 'I') {
            //给上级目录添加icon
            let iconI = document.createElement('i');
            iconI.setAttribute('class',
                'iconfont icon-launch' + iconStyle[this.indexStyle - 1]);
            liElement.prepend(iconI);
          }
        }
        return true;
      }
    } else {
      let emptyCatalog = document.createElement('div');
      emptyCatalog.setAttribute('class', 'empty-catalog');
      emptyCatalog.innerHTML =
          '<i class="iconfont icon-fail"></i><p>哦～～&nbsp;正文中未发现&nbsp;h1~h6&nbsp;标签，无法生成目录</p>';
      catalogueBlock.appendChild(emptyCatalog);
      return false;
    }
  }

  /*
   * ----------------------------------------
   * //替换旧文档
   * ----------------------------------------
   */
  replaceOld() {
    this.createContent();
    let res = this.createCatalogue();
    let contentBox = document.querySelector('#content');
    if (res) {
      // 第一个目录默认样式
      (document.querySelector('.list-wrapper')).querySelector('li').
          classList.
          add('js-active');
      //给正文一级标题添加下划线样式
      let allLevel1 = this.levelTagArr(1);
      if (allLevel1.length > 0) {
        for (let i = 0, len = allLevel1.length; i < len; i++) {
          allLevel1[i].classList.add('js-level1-style');
        }
        //开启第一个标题作为文档标题， 标题居中
        if (this.firstTagToTitle === true && this.titleCenter === true) {
          this.acticleTitle.setAttribute('class', 'text-center');
        }
      }
    }
    //还原删去了的第一个H1到正文
    contentBox.prepend(this.acticleTitle);
  }

  /*
   * ----------------------------------------
   * 点击隐藏侧边目录
   * ----------------------------------------
   */
  switchCatalog() {
    let asideButton = this.asideButton;
    let leftElement = this.leftElement;
    let rightElement = this.rightElement;
    let switchButton = this.switchButton;
    asideButton.addEventListener('click', () => {
      leftElement.setAttribute('class', 'js-width-0');
      rightElement.style.marginLeft = 0;
      switchButton.className = 'js-height-1';
    });
    switchButton.addEventListener('click', () => {
      switchButton.style.height = switchButton.className = 'js-height-0';
      leftElement.removeAttribute('class');
      leftElement.style.display = 'block';
    });
    //屏幕小于768时，目录展开时，点击内容区，收起目录
    let mediaStatus = window.matchMedia('(max-width: 768px)').matches;
    let asideStatus = leftElement.classList.contains('js-width-0');
    if (mediaStatus && !asideStatus) {
      this.rightElement.addEventListener('click', () => {
        leftElement.classList.add('js-width-0');
        switchButton.className = 'js-height-1';
        rightElement.style.marginLeft = 0;
      });
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
        throw new Error('changeIcon() 调用时参数1类型错误，必须为object');
      }
      if ((typeof index) !== 'number' || index > 3) {
        throw new Error('changeIcon() 调用时参数2类型错误，必须为number,且小于等于 3');
      }
      //改变整体icon风格
      const arr = ['A', 'B', 'C'];
      for (let i = 0, len = iconArr.length; i < len; i++) {
        const oldClass = iconArr[i].getAttribute('class');
        const newClass = oldClass.slice(0, -1) + arr[index - 1];
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
        throw new Error('changeIcon() 调用时参数1类型错误，该参数为图标元素的容器');
      }
      //仅改变状态：展开/关闭
      const oldClass = icon.getAttribute('class');
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
    const switchListButton = this.switchListButton;
    let status = switchListButton.children[0].getAttribute('value');
    const allIcon = this.allIcon;
    const changeSingleIcon = this.changeSingleIcon;
    switchListButton.addEventListener('click', function() {
      //清除单个目录点已经过击赋予的样式，避免样式冲突
      const oldLi = document.querySelectorAll('.js-item-retract');
      for (let j = 0, len = oldLi.length; j < len; j++) {
        oldLi[j].classList.remove('js-item-retract');
      }
      const oldLi2 = document.querySelectorAll('.js-item-launch');
      for (let k = 0, len = oldLi2.length; k < len; k++) {
        oldLi2[k].classList.remove('js-item-launch');
      }
      if (status === 'true') {
        //收起子目录
        document.querySelector('.list-wrapper').classList.add('js-retract');
        //切换底部按钮 icon
        this.children[0].setAttribute('class', 'iconfont icon-branchB');
        this.children[0].setAttribute('value', 'false');
        status = 'false';
      } else {
        //展开子目录
        document.querySelector('.list-wrapper').classList.remove('js-retract');
        //切换底部按钮 icon
        this.children[0].setAttribute('class', 'iconfont icon-quit');
        this.children[0].setAttribute('value', 'true');
        status = 'true';
      }
      //改变icon状态：展开/关闭
      for (let i = 0, len = allIcon.length; i < len; i++) {
        const topClass = document.querySelector('.list-wrapper').
            getAttribute('class');
        const iconClass = allIcon[i].getAttribute('class');
        if (topClass.includes('js-retract')) { //收起目录
          //更换icon
          allIcon[i].setAttribute('class',
              'iconfont icon-retract' + iconClass.slice(-1));
          //收起子目录
          document.querySelector('.list-wrapper').
              setAttribute('class', 'list-wrapper js-retract');
        } else { //展开目录
          allIcon[i].setAttribute('class',
              'iconfont icon-launch' + iconClass.slice(-1));
          document.querySelector('.list-wrapper').
              setAttribute('class', 'list-wrapper js-launch');
        }
        //给没有子目录的一级目录单独设置icon
        const lastChild = allIcon[i].parentElement.lastElementChild;
        if (lastChild.nodeName == 'A') {
          const cName = allIcon[i].getAttribute('class');
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
    const listElement = document.querySelector('.list-wrapper');
    const allIcon = listElement.querySelectorAll('i');
    const changeSingleIcon = this.changeSingleIcon;
    for (let i = 0, len = allIcon.length; i < len; i++) {
      allIcon[i].addEventListener('click', e => {
        e = e || window.event;
        e.stopPropagation();
        e.preventDefault();
        //当前目录下是否有子目录
        const parCatalog = allIcon[i].parentElement;
        if (parCatalog.lastElementChild.nodeName === 'UL') { //有子目录
          changeSingleIcon(allIcon[i]); //修改图标样式
          //点击后的icon
          const iconClass = allIcon[i].getAttribute('class');
          if (iconClass.includes('launch')) { //展开子目录
            allIcon[i].parentElement.classList.add('js-item-launch');
            allIcon[i].parentElement.classList.remove('js-item-retract');
          } else {//收起子目录
            allIcon[i].parentElement.classList.add('js-item-retract');
            allIcon[i].parentElement.classList.remove('js-item-launch');
          }
        }
      });
    }
  }

  /*
   * ----------------------------------------
   * 单个目录点击
   * ----------------------------------------
   */
  singleCatalogClick() {
    const rightElement = this.rightElement;
    const allCatalog = document.querySelectorAll('.list-wrapper a');
    for (let i = 0, len = allCatalog.length; i < len; i++) {
      allCatalog[i].addEventListener('click', function(e) {
        e = e || window.event;
        e.stopPropagation();
        e.preventDefault();
        let linkId = allCatalog[i].getAttribute('href').slice(1);
        rightElement.scrollTo(
            {top: document.getElementById(linkId).offsetTop - 10});
      });
    }
  }

  /*
   * ----------------------------------------
   * 主题切换（light/dark）
   * ----------------------------------------
   */
  themeChange() {
    const htmlElement = document.documentElement;
    const viewModeButton = this.viewModeButton;

    //初始配置
    //let openDark = this.openDark;
    if (this.openDark === true) {
      htmlElement.setAttribute('theme', 'dark');
      viewModeButton.children[0].setAttribute('class', 'iconfont icon-moon');
    } else {
      htmlElement.setAttribute('theme', 'light');
      viewModeButton.children[0].setAttribute('class', 'iconfont icon-sun');
    }

    //点击按钮切换模式
    viewModeButton.addEventListener('click', function() {
      const isDarkMode = htmlElement.getAttribute('theme');
      if (isDarkMode == 'light') {
        this.children[0].setAttribute('class', 'iconfont icon-moon');
        htmlElement.setAttribute('theme', 'dark');
      }
      if (isDarkMode == 'dark') {
        this.children[0].setAttribute('class', 'iconfont icon-sun');
        htmlElement.setAttribute('theme', 'light');
      }
    });

    // 查询系统是否使用了dark主题 osThemeIsDark => true/false;
    // 开启后优先级高于初始配置 openDark 的设置，是否使用以下设置看个人
    const osThemeIsDark = matchMedia('(prefers-color-scheme: dark)').matches;
    if (osThemeIsDark) {
      this.openDark = true;
      viewModeButton.children[0].setAttribute('class', 'iconfont icon-moon');
      htmlElement.setAttribute('theme', 'dark');
    } else {
      this.openDark = false;
      viewModeButton.children[0].setAttribute('class', 'iconfont icon-sun');
      htmlElement.setAttribute('theme', 'light');
    }

    //监听系统主题变化
    matchMedia('(prefers-color-scheme: dark)').
        addEventListener('change', event => {
          //event.matches: dark => true
          if (event.matches) {
            this.openDark = true;
            viewModeButton.children[0].setAttribute('class',
                'iconfont icon-moon');
            document.documentElement.setAttribute('theme', 'dark');
          } else {
            this.openDark = false;
            viewModeButton.children[0].setAttribute('class',
                'iconfont icon-sun');
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
    const indexStyle = this.indexStyle;
    const listElement = document.querySelector('#list-container');
    const switchIndex = document.querySelector('.index');
    //配置选择
    if (this.showIndex === false) { //关闭目录序号
      listElement.classList.add('js-noindex');
      switchIndex.children[0].setAttribute('class',
          'iconfont icon-catalog-closeB');
    } else { //显示目录序号
      listElement.classList.remove('js-noindex');
      switchIndex.children[0].setAttribute('class', 'iconfont icon-menu-index');
    }
    //按钮点击
    let status = this.showIndex;
    switchIndex.addEventListener('click', () => {
      if (status === false) { //关闭目录序号
        listElement.classList.remove('js-noindex');
        switchIndex.children[0].setAttribute('class',
            'iconfont icon-menu-index');
        status = true;
      } else { //显示目录序号
        listElement.classList.add('js-noindex');
        switchIndex.children[0].setAttribute('class',
            'iconfont icon-catalog-closeB');
        status = false;
      }
    });
  }

  /*
   * ----------------------------------------
   * 风格样式选择
   * ----------------------------------------
   */
  choseCatalogStyle() {
    //目录图标样式
    const allStyle = document.querySelectorAll('.style-chose');
    //所有的目录
    const allIcon = this.allIcon;
    const changeIcons = this.changeIcons;
    //初始化配置目录图标样式
    changeIcons(allIcon, this.indexStyle);
    // 改变icon 图标;
    for (let i = 0, len = allStyle.length; i < len; i++) {
      allStyle[i].addEventListener('click', function() {
        //改变icon
        changeIcons(allIcon, i + 1);
        //样式按钮选中
        for (let j = 0, len = allStyle.length; j < len; j++) {
          allStyle[j].children[0].removeAttribute('checked');
        }
        this.children[0].setAttribute('checked', 'checked');
      });
    }

    //文字阴影显示隐藏
    const shadowButton = document.querySelector(
        '[name="textShadow"]').parentElement;
    shadowButton.addEventListener('click', function() {
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
    });
    //初始配置
    if (this.openShadow === true) {
      document.querySelector('body').setAttribute('class', 'js-show-shadow');
      shadowButton.children[0].setAttribute('checked', 'checked');
    } else {
      document.querySelector('body').setAttribute('class', 'js-close-shadow');
      shadowButton.children[0].removeAttribute('checked');
    }

    //目录树显示隐藏
    const treeButton = document.querySelector(
        '[name="showTree"]').parentElement;
    treeButton.addEventListener('click', function() {
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
    });
    //初始配置
    if (this.showTree === true) {
      document.querySelector('#body-container').
          setAttribute('class', 'js-show-tree');
      treeButton.children[0].setAttribute('checked', 'checked');
    } else {
      document.querySelector('#body-container').
          setAttribute('class', 'js-close-tree');
      treeButton.children[0].removeAttribute('checked');
    }
    //显示正文标题索引
    const contentBox = document.querySelector('#content');
    const titleButton = document.querySelector(
        '[name="titleIndex"]').parentElement;
    const titleIndex = document.getElementById('title-index');
    titleButton.addEventListener('click', function() {
      if (titleIndex.value == 'true') {
        contentBox.classList.remove('js-show');
        titleIndex.removeAttribute('checked');
        titleIndex.value = 'false';
      } else {
        contentBox.classList.add('js-show');
        titleIndex.setAttribute('checked', 'checked');
        titleIndex.value = 'true';
      }
    });
    //初始配置
    if (this.showTitleIndex === false) {
      contentBox.classList.remove('js-show');
      titleIndex.removeAttribute('checked');
      titleIndex.value = 'false';
    } else {
      contentBox.classList.add('js-show');
      titleIndex.setAttribute('checked', 'checked');
      titleIndex.value = 'true';
    }
  }

  /**
   * ----------------------------------------
   * 防抖函数
   * ----------------------------------------
   * @param  fun function 要防抖的函数
   * @param  t   number 需要延迟的毫秒数
   * @return {(function(): void)|*}
   */
  debounce(fun, t = 500) {
    try {
      if ((typeof fun) !== 'function') {
        throw new Error('fun 参数必须是一个函数');
      }
      if ((typeof t) !== 'number' || t < 0) {
        throw new Error('t 参数必须是 >0 的整数');
      }
      this.t = t;
      let timer;
      return function() {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(function() {
          fun();
        }, t);
      };
    } catch (err) {
      this.showError(err);
    }
  }

  /**
   * ----------------------------------------
   * 节流函数
   * ----------------------------------------
   * @param  fun function 要节流的函数
   * @param  t   number 需要节流的时间/毫秒
   * @return {(function(): void)|*}
   */
  throttle(fun, t = 500) {
    try {
      if ((typeof fun) !== 'function') {
        throw new Error('fun 参数必须是一个函数');
      }
      if ((typeof t) !== 'number' || t < 0) {
        throw new Error('t 参数必须是 >0 的整数');
      }
      this.t = t;
      let timer = null;
      return function() {
        if (!timer) {
          timer = setTimeout(function() {
            fun();
            timer = null;
          }, t);
        }
      };
    } catch (err) {
      this.showError(err);
    }
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
      if ((typeof value) !== 'string') {
        throw new Error('comparison() 参数必须是一个字符串');
      }
      value = value.toLowerCase();
      let result = '';
      let allCatalogElement = this.allCatalogElement;
      for (let i = 0, len = allCatalogElement.length; i < len; i++) {
        let text = allCatalogElement[i].innerText.replace(/\s+/g, '');
        if (text.toLowerCase().indexOf(value) != -1) {
          let href = allCatalogElement[i].getAttribute('href');
          result += '<a href="' + href + '">' + allCatalogElement[i].innerText +
              '</a>';
        }
      }
      if (result == '') {
        result = '<div><i class="iconfont icon-search"></i>\n<span>目录中暂无相关搜索结果</span><span>试试 Ctrl+F  在全文搜索</span></div>';
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
    const searchElement = document.querySelector('.search');
    const searchResultElement = document.querySelector('.search-result');
    const searchIconElement = searchElement.nextElementSibling;
    const rightElement = this.rightElement;

    //键盘抬起
    searchElement.addEventListener('keyup', this.debounce(() => {
      let searchNewValue = (searchElement.value).replace(/\s+/g, '');
      if (searchNewValue) { // 不为空时
        searchResultElement.classList.add('js-search');
        searchIconElement.style.display = 'block';
        let results = objThis.comparison(searchNewValue);
        searchResultElement.innerHTML = '<nav>' + results + '</nav>';

        // 记录当前已点选过的搜索结果
        let searchContainer = document.querySelector('.search-result nav');
        searchContainer.addEventListener('click', function(e) {
          e = e || window.event;
          if (e.target.nodeName === 'A') {
            e.preventDefault();
            rightElement.scrollTo({
              top: document.getElementById(e.target.href.slice(
                  e.target.href.indexOf('#') + 1)).offsetTop - 10
            });
            e.target.setAttribute('class', 'search-click');
          }
        });
      } else {
        searchIconElement.style.display = 'none';
        searchResultElement.classList.remove('js-search');
      }
    }, 500));

    // 点击取消
    searchIconElement.addEventListener('click', function() {
      this.style.display = 'none';
      searchResultElement.classList.remove('js-search');
      searchElement.value = '';
    });
  }

  /*
   * ----------------------------------------
   * 根据内容区阅读位置自动追踪目录
   * ----------------------------------------
   */
  catalogTrack() {
    //获取内容区所有 h1~h6 标题及它们距离浏览器顶部的距离
    const allTag = this.handleHarr;
    const rightElement = this.rightElement;
    const catalog = document.querySelectorAll('.list-wrapper li');
    const allTitleDistance = [];
    for (let i = 0, len = allTag.length; i < len; i++) {
      allTitleDistance.push(allTag[i].offsetTop);
    }
    //滑动正文内容时
    rightElement.addEventListener('scroll', this.throttle(function() {
      //滑动到相应区域目录添加active样式
      let roll = rightElement.scrollTop; //滚动距离
      for (let i = 0, len = allTag.length; i < len; i++) {
        if (roll + 32 > allTag[i].offsetTop) {
          const activeElement = document.querySelectorAll('.js-active');
          for (let j = 0, len = activeElement.length; j < len; j++) {
            activeElement[j].classList.remove('js-active');
          }
          //当前目录添加激活样式，展开子目录，修改icon图标
          catalog[i].setAttribute('class', 'js-active js-item-launch');
          if (catalog[i].children[0].nodeName === 'I') {
            const oldIcon = catalog[i].children[0].getAttribute('class');
            catalog[i].children[0].setAttribute('class',
                oldIcon.replace('retract', 'launch'));
          }
          //前一个同级目录如果有子目录则收起 -->?????
          //父级目录,添加激活样式，展开子目录，修改icon图标
          const currentClass = catalog[i].querySelector('a').
              getAttribute('class');
          const allCeil = objThis.findAllCeilCatalog(currentClass);
          if (allCeil.length > 0) {
            for (let k = 0, len = allCeil.length; k < len; k++) {
              allCeil[k].setAttribute('class', 'js-active js-item-launch');
            }
          }
        } else { //去除激活样式，收起子目录，修改icon图标
          catalog[i].setAttribute('class', 'js-item-retract');
          if (catalog[i].children[0].nodeName === 'I' &&
              catalog[i].lastChild.nodeName === 'UL') {
            const oldIcon = catalog[i].children[0].getAttribute('class');
            catalog[i].children[0].setAttribute('class',
                oldIcon.replace('launch', 'retract'));
          }
        }
      }
      if (roll + 32 <= allTag[0].offsetTop) {
        //收起子目录，修改icon图标
        catalog[0].setAttribute('class', 'js-active js-item-retract');
        if (catalog[0].children[0].nodeName === 'I' &&
            catalog[0].lastChild.nodeName === 'UL') {
          const oldIcon = catalog[0].children[0].getAttribute('class');
          catalog[0].children[0].setAttribute('class',
              oldIcon.replace('launch', 'retract'));
        }
      }
      // 目录内容超出可视区域后，滚动到可视区域中间位置
      const active = document.querySelectorAll('.js-active');
      const originalLastItem = active[active.length - 1];
      const topBoxHeight = document.querySelector(
          '#list-container').clientHeight;
      const listBoxHeight = document.querySelector(
          '.list-wrapper ul').clientHeight;
      if (listBoxHeight > topBoxHeight) {
        originalLastItem.scrollIntoView(
            {behavior: 'smooth', block: 'center', inline: 'nearest'});
      }
    }, 500));
  }

  /*
   * ----------------------------------------
   * 内部链接跳转方式改变为滑动到相应位置
   * ----------------------------------------
   */
  internalLinkJump() {
    const aLink = document.querySelector('#content');
    aLink.addEventListener('click', e => {
      e = e || window.event;
      if (e.target.nodeName === 'A') {
        const hrefLink = e.target.getAttribute('href');
        const linkEl = document.getElementById(hrefLink.slice(1));
        // 单独的A标签
        if (hrefLink !== null && linkEl !== null) {
          e.preventDefault();
          document.getElementById(hrefLink.slice(1)).
              scrollIntoView(
                  {behavior: 'smooth', block: 'start', inline: 'nearest'});
        }
        // Typora中的引用的链接
        const currentName = e.target.getAttribute('name');
        if (currentName !== null) {
          e.preventDefault();
          document.querySelector('[href="#' + currentName + '"]').
              scrollIntoView(
                  {behavior: 'smooth', block: 'start', inline: 'nearest'});
        }
      }
    });
  }
  /*
   * ----------------------------------------
   * 侧边栏拖拽宽度
   * ----------------------------------------
   */
  sidebarResize() {
    const resizeControl = document.querySelector('#resize-control');
    const leftElement = this.leftElement;
    const rightElement = this.rightElement;
    let currentX;
    let minWidth = 240;  //最小宽度
    let maxWidth = Math.floor(window.innerWidth * 0.75);  //最大宽度
    resizeControl.onmousedown = function() {
      document.onmousemove = function(e) {
        e = e || window.event;
        currentX = e.clientX;
        // 侧边栏宽度修改
        resizeControl.style.left = currentX-2 + 'px';
        leftElement.style.width = currentX +'px';
        rightElement.style.marginLeft = currentX +'px';
        // 控制侧边栏宽度拖动范围
        if (currentX <= minWidth) {
          resizeControl.style.left = minWidth-2 + 'px';
          leftElement.style.width = minWidth +'px';
          rightElement.style.marginLeft = minWidth +'px';
        }
        if (currentX > maxWidth) {
          resizeControl.style.left = maxWidth-2 + 'px';
          leftElement.style.width = maxWidth +'px';
          rightElement.style.marginLeft = maxWidth +'px';
        }
      }
    }
    //拖拽事件解绑
    resizeControl.onmouseup = function() {
      document.onmousemove = null;
    }
    document.onmouseup = function() {
      document.onmousemove = null;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => new Mdtht());


