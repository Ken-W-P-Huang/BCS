# 面向对象  
  1. 封装  
  使用ES5的写法。ES6 class不支持私有属性，不少浏览器暂时不支持ES6语法，虽然有babel，还是很容易搞成和IE8以下不兼容，不采用。    
  ``` javascript    
  function A(){    
    var privateAttr = 'a'    
    /*使用私有属性的公有方法必须在构造函数中声明。为了减少内存的损耗，可以在构造函数中声明get/set方法或者在prototype中实现带有需要使用的    
      私有属性作为参数的公共方法，然后再在构造方法中声明对外的公共方法 */   
    this.sayHello = function(){    
        this._sayHello(privateAttr)    
    }    
  }    
  A.prototype._sayHello = function(privateAttr){    
    console.log(""+privateAttr)    
  }
  ```
  静态方法和属性和其他面向对象语言类似，为类对象的属性和方法。 
  ``` javascript     
  A.staticAttr  = 10    
  A.staticFunction = function(){}    
  ```  
  另一种方式，减少方法对内存的占用，我越来越倾向于使用这种写法。   
  ``` javascript   
  (function () {
         /*map用于存放该类所有对象的私有属性。需要使用数组实现的兼容补丁。WeakMap也可以是Map/Object。小心内存泄露！*/
          var map = new WeakMap()     
          window.A = function () {    
              var data = {    
                  a:10,    
                  b:20    
              }    
              map.set(this,data)    
          }    
          A.prototype.getA = function () {    
              var data = map.get(this)    
              return data.a    
          }    
          A.prototype.setA = function (a) {    
              var data = map.get(this)    
              data.a = a    
          }    
          A.prototype.getB = function () {    
              var data = map.get(this)    
              return data.b    
          }    
   })()
  ```     
  2. 继承   
  ``` javascript 
Function.prototype.extend = function(superClass,publicObject,staticObject) {    
            if(typeof this  === 'function'){    
                if(typeof superClass === 'function' ){    
                    var Super = function(){}    
                    Super.prototype = superClass.prototype    
                    this.prototype = new Super()    
                    this.prototype.constructor = this    
                }    
                //可能删除以下代码    
                if(typeof publicObject === 'object'){    
                    this.prototype.shallowCopy(publicObject)    
                }    
                if(typeof staticObject === 'object'){    
                    this.shallowCopy(staticObject)    
                }    
            }    
}    
function Super(){    
}    
function Sub(){    
    Super.call(this,....)    
}    
Sub.extend(Super) 
  ```     
  3. 多态    
  由于部分公共方法存放在prototype中，部分存在对象中，建议使用变量存放父类方法，然后在子类方法中利用此变量调用父类方法。    
  ``` javascript 
  function Super(){    
    this.sayHello = function(){}    
  }    
  function Sub(){    
    Super.call(this,....)    
    var superSayHello = this.sayHello //如果是原型方法则直接调用。    
    this.sayHello = function(){    
        superSayHello()    
        ...    
    }    
  }    
  Sub.extend(Super) 
  ```   
  4. 重载    
  常用的js重载是利用js的变量可以保存不同类型的值，在函数内部使用条件判断变量类型以实现重载。这里使用在函数名后面加数字进行假重载，以下是对
  构造函数BCSView的重载。       
 ``` javascript
export function BCSView(element, style) {    
    //以下注释代码是想让js和swift的创建对象的语法一致。    
    //swift创建对象语法 var view = BCSView()    
    //js部分类如Object，Date支持这种创建对象的语法，部分类如Set，Map不支持（Chrome下验证）    
    // 而且多这么一步会导致所有类都需要如此写，不但麻烦而且还要包装系统自带不支持的类，故不为了swift而swift。 
    // if (!this || this.constructor !== BCSView){    
    //     return new BCSView(element, style)    
    // }    
    Function.requireArgumentNumber(1)    
    this.layer = element    
    if(typeof style === 'object'){    
        style.position = 'absolute'    
    }else{    
        style = {position:'absolute'}    
    }    
    this.setStyle(style)    
    this.subViews = generateSubViews(this.layer)    
    /* 方便调试 */    
    this.layer.setAttribute('view',this.getClass())    
}    
    
function BCSView1(style,elementType) {    
    elementType = elementType || 'div'    
    var element = document.createElement(elementType)    
    if(this.constructor === BCSView1){    
        /*通过new BCSView1构建*/    
        return new BCSView(element,style)    
    }else{    
        BCSView.call(this,element,style)    
    }    
}  
```  
    
# html5兼容补丁（polyfill）  
&nbsp;&nbsp;&nbsp;&nbsp;从[HTML5-Cross-browser-Polyfills](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills)
中挑选兼容性较好的补丁，并按照IE的版本分别打包。使用时根据需要调用browser.applyPatches(PatchEnum.Audio,....),所有可用的补丁名称存放
在PatchEnum中，其中有不少补丁可以兼容IE6。我没有全部测试过这些补丁,而且还有部分是个人代码...以下是验证过兼容到IE6的补丁清单：    
 -  JSON（默认启用）    
 -  ES5（默认启用，不兼容部分语法）    
 -  Dom2（默认启用）    
 -  LocalStorage/SessionStorage    
 -  Promise    
 -  fetch(IE67不支持跨域) 和fetchJSONP     
 -  canvas    
-   Video/Audio    
-   Css3 BackgroundsBorders（PIE_IE678_uncompressed补丁）    
-   Console（默认启用，防止IE9及以下非调试时报错）    
-   Transform    
-   Placeholder    
-   CSS3Filter    
-   MathJax    
     
# 前后端分离    
&nbsp;&nbsp;&nbsp;&nbsp;目前，主流将B/S和C/S看成两种独立的架构。本人更愿意将B/S看成是一种特殊C/S架构，http协议建立在tcp协议上就是佐证！这也是这个项
目叫做BC/S的原因。BC/S即Browser client/Server架构的简称，即将浏览器看作和iOS/Android类似的终端（事实也是如此）。它们的开发思路很类似，
以iOS和前端作为对比：html css对应iOS的StoryBoard（StoryBoard是xml文件）和配置文件，javascript对应OC/Swift。甚至于javascript有
document.getElementById API,而Android有findViewById....那么如何在浏览器实现前后端分离呢？单页面应用完全可以做到前后端分离，有问题的
是多页面应用。能否在单页面应用的基础上，将json数据传递给新打开的页面呢？答案是肯定的。可以用来在页面间传递数据的有localStorage，
sessionStorage,window.name。其中localStorage是全局的不合适；sessionStorage在Chrome打开新页面的瞬间有bug（不知道算不算），而且IE6
的sessionStorage使用window.name进行兼容，故只能使用window.name。浏览器打开新页面的API为window.open(url,windowname....)。    
  1. 过程如下：    
  旧页面获取到JSON数据后调用BCSViewController.prototype.openWindow方法，将json数据传递给新页面    
  （这里的新页面可以是在本窗口打开的新页面也可以是在新窗口中打开的新页面）的window.name    
  新页面打开后调用loadPageInfo方法，从window.name获取JSON数据。
  有没有可能发生会话上的问题？能否通过浏览器cookie相关API解决？    
  2. 实现代码如下：    
  旧页面获取到JSON数据后调用 
  ``` javascript 
  BCSViewController.prototype.openWindow = function (pageInfo,windowName,newWindow) {  
           Function.requireArgumentNumber(arguments,2)  
           Function.requireArgumentType(pageInfo,'object')  
          if(pageInfo instanceof Object){  
              var url,name,object,WindowNameEnum = window.WindowNameEnum  
              if (pageInfo.url) {  
                  url = pageInfo.url  
              }else if(pageInfo.pathname){  
                  url = location.href.replace(location.pathname,'') + pageInfo.pathname  
              }else{  
                  throw new TypeError('invalid url & pathname')  
              }  
              windowName = windowName || WindowNameEnum.SELF  
              newWindow= newWindow ||window.open('',windowName)  
              if(newWindow){  
                  if (newWindow.name) {  
                      object = JSON.parse(newWindow.name)  
                  }else {  
                      object = {}  
                  }  
                  object[BCSViewController.key] = pageInfo  
                  /*bluebird内部机制未知，但感觉会在调用外部函数JSON.stringify时切换以让出CPU。  
                   此时打开另一个页面会导致页面loadPageInfo执行，目前放在这个位置似乎可以顺利执行*/  
                  name = JSON.stringify(object)  
                  newWindow.name = name  
                  newWindow.location.assign(url)  
              }else{  
                  throw new OpenWindowException('Failed to open window.Please check if url is correct ' +// jshint ignore:line  
                      'or popup new window function is blocked!')  
              }  
          }else{  
              throw new TypeError('invalid pageinfo') // jshint ignore:line  
          }  
      }  
  ```  
  新页面中调用 
  ``` javascript  
  BCSViewController.prototype.loadPageInfo = function (dataURL,errorCallback,method,data) {  
          var pageinfo,key = BCSViewController.key  
          if(window.name){  
              var object = JSON.parse(window.name)  
              pageinfo = object[key]  
              if(pageinfo){  
                  try{  
                      delete object[key]  
                  }catch(e){  
                      object[key] = undefined  
                  }  
                  window.name = JSON.stringify(object)  
              }  
          }  
          if(!pageinfo && dataURL ){  
              method = method || window.HttpMethodEnum.GET  
              var request = new XMLHttpRequest()  
              if (request !== null) {  
                  /* window.location.search 用户可能输入参数 */  
                  request.open(method, '' + dataURL + window.location.search, false)  
                  request.onreadystatechange = function () {  
                      if (request.readyState === 4) {  
                          switch (request.status) {  
                              case 302:  
                              case 200:  
                                  if (request.responseText) {  
                                      pageinfo = JSON.parse(request.responseText)  
                                  }  
                                  break  
                              default:  
                                  errorCallback && errorCallback(request.status, request.statusText)  
                                  break  
                          }  
                      }  
                  }  
                  request.send(data)  
              }else{  
                  throw new TypeError('XMLHttpRequest is not supported')  
              }  
          }  
          if(pageinfo && pageinfo.title){  
              document.title = pageinfo.title  
          }  
          return pageinfo  
      }  
  ``` 
  优点：  
  1. 在浏览器端实现前后端分离  
  2. 将页面动态数据的渲染放在浏览器端，降低服务器的运算负担。（没有实际测试过，只是觉得生成JSON数据的开销总归比渲染页面的开销小）  
  缺点：  
  每个页面多一次请求。  
   
# 以iOS开发思想编写前端应用  
  1. MVVM  
    ![MVVM](https://upload-images.jianshu.io/upload_images/3238517-48101429f177b86f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)  
&nbsp;&nbsp;&nbsp;&nbsp;这是iOS很经典的MVVM设计模式图，可以应用到Android，理论上也可以应用到html应用。可能写惯了React或者Vue的朋友会
  鄙视它。本人学了点React和Vue的皮毛，依然还是觉得iOS的MVVM比较好（上文的前后端分离的方式可能会让人觉得Vue不错），个人看法，拒绝在这个问题
  上打口水战，就是这么专制。哈哈。尤其想吐槽的是React Redux和VueX。这两个玩意儿无非是用来存放model数据，却因为html应用一直在使用函数编程
  思维，将一个本来使用面向对象的单例设计模式即可解决的问题变成一个需要使用3-4步的框架才能搞定的问题。单例设计模式的意思是创建一个整个应用全
  局都能访问的对象，这个对象是其类的唯一一个实例对象。由于可以通过对象.constructor得到构造函数，目前个人认为较好的单例模式如下：  
   a.java 懒汉饿汉随便挑一个吧，js多线程应该没什么人用。
   ``` javascript  
   (function () {  
       var singleton = new Model()  
       function Model() {  
           if(singleton){  
               throw new TypeError(this.getClass() + ' could be instantiated only once!')  
           }  
           ...  
       }  
       Model.getInstance = function () {  
           return singleton  
       }  
       window.Model = Model //export  
   })()  
   ``` 
   b.swift
   ``` javascript    
   (function () {  
          var singleton = new Model()  
          function Model() {  
              if(singleton){  
                    throw new TypeError(this.getClass() + ' could be instantiated only once!')   
              }  
              ...  
          }  
          Model['default'] = singleton  
          window.Model = Model //export  
   })() 
   ```   
   c. Symbol方式  
   
  2. 观察者模式  
  iOS有两种观察者模式的实现，一个是KVO，另一个是NotificationCenter.default。和iOS类似的js版KVO使用defineProperty实现，其使用范围和
  Vue一样，区别是KVO是单向的，而Vue是双向的。KVO只支持公有直接属性（不支持私有属性和path）。 不支持defineProperty的浏览器如IE8及以下可
  以使用NotificationCenter.default，没有深入研究pubsub，但应该就是pubsub机制，只不过为符合swift语法，才写成这个样子。  
  ``` javascript  
  function Model(){  
    var map = new ListMap()   
    //启用KVO功能
    //enableKVO是在Object.prototype中的扩展，故请放弃使用jQuery的想法，也没有使用jQuery必要！  
    this.enableKVO(map) 
  }  
  ```  
  3. BCSView和iOS UIView  
  UIView是iOS整个UIKit框架的基石。UIView有个layer属性。BCS仿照UI框架，BCSView同样有layer属性，而这个layer属性就是html元素。开发者可
  以通过调用BCSView的API操作layer，也可以直接获取layer。BCSView的layer的默认css样式含有position = 'absolute'。 据说这种样式可以让
  浏览器在进行重绘/重排时只针对这个元素，而不会影响到其他元素，契合iOS的UIView，只能说软件世界中很多原理其实是一样的。 虽然BCS山寨UIKit
  框架，但考虑到实际情况，并不可能完全模仿。例如使用setStyle设置BCSView的外观，iOS对外观的设置实在太麻烦了....  
  ``` javascript  
      BCSView.prototype.setStyle = function (cssObject) {  
          var cssText = ''  
          for(var name in cssObject){  
              if(cssObject.hasOwnProperty(name)){  
                  cssText += name.replace(/([A-Z])/g,function(match){  
                          return '-'+match.toLowerCase()  
                      }) + ":" + cssObject[name] + ';'  
              }  
          }  
          if( typeof( this.layer.style.cssText ) !== 'undefined' ) {  
              this.layer.style.cssText += ';' + cssText  
          } else {  
              this.layer.setAttribute('style',cssText);  
          }  
      }
  ```      
  cssObject的内容和React类似： 
  ``` javascript       
      var cssObject =  {  
                  bottom:'0px',  
                  width:'100%'  
      }  
  ```            
  看到这里，做前端的哥们该吐槽了。本人虽然前端代码写的少，但也看了不少(右键就能看谷歌的css我会乱讲？^_^)，个人认为css其实已经臃肿不堪，即
  使使用less，stylus并不能改变现状，因为html的功能越来越强大，页面越来越复杂，跟iOS/Android APP并没有太大差距。为什么不将特殊样式直接写
  到元素的内联样式中，让内嵌或者外部样式只负责通用样式，例如带有公司风格的样式，反而让内联样式白白留空？style.cssText只会让浏览器重绘一次
  和设置class效果是一样的。jQuery对样式的修改可能也全部都是在内联样式中完成的。React和Vue对样式的处理甚至组件这个概念也是化整为零的思路，
  毕竟同一个组件的元素，外观，js代码都在同一个文件中，方便修改。利用document.body生成的BCSView对象作为所有view的window属性。  
   
 4. 手势识别  
    已经实现语法和swift类似的手势识别器，以及NavigationController的基本功能（bar上的按钮没实现...）详见例子
    BC-S/src/main/webapp/WEB-INF/html/controller.html。其中test.js的代码不是标准的MVVM设计模式，请勿吐槽。在山寨手势识别时发现iOS
 各个手势识别器的识别机制并不是很一致。猜测iOS的不同识别器的实现代码是不同人写的。我只想尽量贴近iOS，并无改进想法。  
   
 5. 调试  
    使用Firefox Version46 3DView调试DOM，可以获得和Xcode类似的体验，不过很差。  
   
# 未完成的工作    
  - 我还没想到表示swift协议/代理概念的好方法。目前是想弄个协议/代理的清单，让开发者自行复制黏贴到代码中，再实现相应的方法。  
  - 极度缺乏测试。    
  - 大部分UI类未完成。    
  - IE9以上，低版本Chrome，Firefox，Opera及手机端兼容验证。    
  - 验证dom4.js已经包含KeyboardEvent，classList，document.head等polyfill。    
  - 整理补丁和参考代码作者清单。    
  - 尚未加入svg,webform 验证和input属性功能补丁。    
  - 验证patchBackgroundBorder可以修复IE6 PNG图片透明问题。  
    
这个项目目前还是半成品。我最大的问题是做前端的朋友对这个项目有何看法？有没有应用到实际项目中的价值？
欢迎想贡献代码和提供测试帮助的朋友。  
