// 查询系统是否使用了暗色主题
const osThemeIsDark = matchMedia("(prefers-color-scheme: dark)").matches;
let htmlElement = document.querySelector('html');
if(osThemeIsDark){
  htmlElement.setAttribute("theme","dark");
}else{
  htmlElement.setAttribute("theme","");
}
//监听系统主题变化
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", event => {
  // htmlElement.dataset.theme = event.matches ? 'dark' : '';
  let theme = event.matches ? 'dark': '';
  htmlElement.setAttribute('theme', theme);
});

