# 

# Getting Started
默认打JSON，ES5补丁
cssSandpaper的方法不能应用在带有css3样式补丁属性如圆角的元素上。
需要执行cssSandpaper.setTransform方法的元素不能在style中含有transform:'skew(-17deg, 45deg) rotate(-125deg)'
canvas补丁必须在当前IE8.js中执行，跨脚本无效，原因未知。
// svg降级
// https://css-tricks.com/a-complete-guide-to-svg-fallbacks/
// VML和SVG raphael
// http://www.cnblogs.com/hongru/archive/2011/06/18/2084215.html

// Promise.race([
//     fetch(URL),
//     new Promise(function(resolve,reject){
//         setTimeout(function () {
//             xhr.abort()
//             reject(new TypeError('Network request timeout'))
//         },2000)
//     })])
//     .then(function () {
//
//     })['catch'](function () {
//
// })

https://mathjax-chinese-doc.readthedocs.io/en/latest/configuration.html
MathJax的内容全部都部署在js路径下，保留config，extensions,fonts,jax,localization
删除/config下多余的配置文件。

我保留了Tex-MML-AM_CHTML.js，表示支持Tex，MathML和ASCIIMath输入，CommonHTML输出，也是官方推荐的选项。

删除/docs，/test和/unpacked，包含Mathjax的文档及用于测试的文件。

保留/fonts/HTML-CSS下的一种字体，并只保留这种字体的woff版本。

我保留了Tex，是最小的字体。

保留/localization下的一种语言或全部删除(使用默认的英语)。

删除/jax/output下不必要的输出格式，如果保留SVG则可以删除整个/font目录。

我保留了CommonHTML。
将MathJax.js打包成补丁后。MathJax.js的资源路径会发生改变，直接将根路径当作MathJax.js的目录，具体可以在Chrome看到。可以使用Spring MVC目录映射功能修正。