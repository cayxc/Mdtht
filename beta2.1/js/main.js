// 查询系统是否使用了dark主题
let osThemeIsDark = matchMedia("(prefers-color-scheme: dark)").matches;
let htmlElement = document.querySelector('html');

//系统开启了，但手动没有开启dark主题，没有自定义
if(osThemeIsDark && htmlElement.getAttribute('theme') != 'dark'){
  htmlElement.setAttribute("theme","dark");
}

//监听系统主题变化
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", event => {
  //event.matches: dark => true
  // console.log(event.matches);
  event.matches ? htmlElement.setAttribute("theme","dark") : htmlElement.removeAttribute("theme");
});

