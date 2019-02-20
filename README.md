# 

# Getting Started
默认打JSON，ES5补丁
cssSandpaper的方法不能应用在带有css3样式补丁属性如圆角的元素上。
需要执行cssSandpaper.setTransform方法的元素不能在style中含有transform:'skew(-17deg, 45deg) rotate(-125deg)'
canvas补丁必须在当前IE8.js中执行，跨脚本无效，原因未知。
