/**
 * Created by kenhuang on 2019/1/25.
 */

import {BCSViewController} from '../controller/BCSViewController'
import {BCSView} from '../view/BCSView'
import {BCSWindow} from '../view/BCSWindow'
import {Extensions} from './Extensions'

function File(fullPath) {
    var name,path
    var arr = fullPath.split("/")
    name = arr[arr.length - 1]
    delete arr[arr.length - 1]
    path = arr.join("/")
    this.getName = function () {
        return name
    }
    this.getPath = function () {
        return path
    }
}
File.getCurrentJsFile = function () {
    var scripts = document.getElementsByTagName("script")
    var script = scripts[scripts.length - 1]
    if (document.documentMode >= 8 ) {
        return new File(script.src)
    }else{
        return new File(script.getAttribute("src",4))
    }
}
File.importScript = function (scriptPath) {
    document.write('<script type="text/javascript" src="'+scriptPath+'"><\/script>') // jshint ignore:line
}
File.importCss = function (cssPath) {
    document.write('<link rel="stylesheet" type="text/css" href="'+cssPath+'"\/>') // jshint ignore:line
}

/**
 * 单例，无须将公共方法放在prototype中
 * 1.获取浏览器环境信息
 * 2.根据需要启用补丁
 * @constructor
 */
var browser = new Browser(window)
function Browser(window) {
    if(browser){
        throw new TypeError(this.getClass() + ' could be instantiated only once!')
    }
    var patchMap = {}
    var i,splitItems,info = {}
    var regexps = {
        withParentheses: /\((.*?)\)/g,
        withSlash:/\b(\S*)?\/(\S*)?\b/g
    }
    var userAgent = window.navigator.userAgent
    var itemsWithParentheses = userAgent.match(regexps.withParentheses)
    var extensions = new Extensions(window)
    extensions.apply()
    /* 解析括号的内容 */
    for(i = 0;i < itemsWithParentheses.length;i++){
        resolveWithinParentheses(itemsWithParentheses[i])
        userAgent = userAgent.replace(itemsWithParentheses[i],'')
    }
    /* 解析非括号的内容 */
    resolveHighLevel(info, userAgent,' ')
    finalizeInfo(this)
    downloadPatches(this)
/**********************************************************************************************************************
 * 私有方法
 **********************************************************************************************************************/
    /**
     *  解析userAgent的内容，获取系统信息
     *  无用的解析异常： 1.(Windows NT 6.1; 125LA;)
     *                 2. () like Gecko"
     */
    function resolveHighLevel (info, userAgent,separator) {
        var subItems,items = userAgent.split(separator)
        for(var i = 0;i < items.length;i++){
            if(items[i]){
                subItems = items[i].split('/')
                if(subItems.length === 1){
                    info[subItems[0]] = true
                }else{
                    info[subItems[0]] = subItems[1]
                }
            }
        }
    }

    function resolveWithinParentheses (item) {
        if(item.indexOf('KHTML, like Gecko') !== -1){
            info.KHTML = true
        }else{
            var temp = {},value,index = 0,matches
            var regexp = /(.*?)(\d+[\._]?.*)/
            item = item.substring(1,item.length - 1)
            resolveHighLevel(temp,item,';')
            for(var name in temp){
                if(temp.hasOwnProperty(name)){
                    value = temp[name]
                    if((index = name.indexOf('Build')) !== -1){
                        info.model = name.substring(0,index).trim()
                        info.Build = value
                    }else if(typeof value === 'boolean'){
                        matches = name.match(regexp)
                        if(matches &&  matches.length === 3){
                            info[matches[1].trim()] = matches[2].trim()
                        }else{
                            info[name.trim()] = value
                        }
                    }else{
                        info[name.trim()] = value
                    }
                }
            }
        }
    }

    function downloadPatches (browser) {
        /**
         *  引入依赖，IE10不支持条件注释载入js文件,不建议使用IE9兼容模式
         *  https://msdn.microsoft.com/en-us/library/hh801214(v=vs.85).aspx
         *  http://www.webhek.com/post/conditional-comments-in-ie11-10.html
         */
        var file = File.getCurrentJsFile()
        if((browser.isIE && browser.version <= 7) ||
            (browser.isChrome && browser.version < 4) ||
            (browser.isSafari && browser.version < 4) ||
            (browser.isFirefox&& browser.version < 3.5) ||
            (browser.isOpera && browser.version < 10.5)){
            File.importScript(file.getPath()+'/IE7.js')
        }
        if((browser.isIE && browser.version <= 8)){
            File.importScript(file.getPath()+'/IE8.js')
        }
        if((browser.isIE && browser.version <= 9)){
            File.importScript(file.getPath()+'/IE9.js')
        }
        if((browser.isIE && browser.version <= 10)){
            File.importScript(file.getPath()+'/IE10.js')
        }
        if(((browser.isEdge && browser.version < 18) || browser.isIE ) ||
            (browser.isChrome && browser.version < 32) ||
            (browser.isSafari && browser.version < 8) ||
            (browser.isFirefox&& browser.version < 29) ||
            (browser.isOpera && browser.version < 19)){
            File.importScript(file.getPath()+'/Edge.js')
        }
        File.importScript(file.getPath()+'/Common.js')
    }
    //todo 移动端没有版本,并且chrome会伪装成safari, IE10 11,
    // fullVersion = userAgent.substr(userAgent.toLowerCase().indexOf('opr')).replace(/.*\//,'')
    function finalizeInfo(browser) {
        var fullVersion
        browser.isOpera = (window.opr !== undefined)
        if(browser.isOpera){
            browser.userAgent = 'Opera'
            if(info.hasOwnProperty('OPR')){
                fullVersion = info.OPR
            }else if(info.hasOwnProperty('opr')){
                fullVersion = info.opr
            }
        }else{
            if(!!window.ActiveXObject || "ActiveXObject" in window){
                browser.isIE = true
                browser.userAgent = 'IE'
                if(info.MSIE){
                    fullVersion = info.MSIE
                }
            }else{
                if(info.hasOwnProperty('Chrome')){
                    browser.isChrome = true
                    browser.userAgent = 'Chrome'
                    fullVersion = info.Chrome
                }else if(info.hasOwnProperty('Safari')){
                    browser.isSafari = true
                    browser.userAgent = 'Safari'
                    fullVersion = info.Safari
                }else if(info.Firefox){
                    browser.isFirefox = true
                    browser.userAgent = 'Firefox'
                    fullVersion = info.Firefox
                }
            }
        }

        if(info.Android){
            browser.OS = 'Android'
            browser.OSVersion = info.Android
            browser.isMobile = true
        }else if(info.hasOwnProperty('Linux')){
            browser.OS = 'Linux'
        }
        if(info.model){
            browser.hardware = info.model
        }
        if(info.iPhone){
            browser.OS = 'iOS'
            browser.OSVersion = info.Version
            browser.isMobile = true
            browser.hardware = 'iPhone'
        }else if(info.iPad){
            browser.OS = 'iOS'
            browser.OSVersion = info.Version
            browser.isMobile = true
            browser.hardware = 'iPad'
        }else if(info['Intel Mac OS X']){
            browser.OS = 'Intel Mac OS X'
            browser.OSVersion = info['Intel Mac OS X']
            browser.hardware = 'Intel Mac OS X'
        }
        if(info['Windows NT']){
            browser.OS = 'Windows NT'
            browser.OSVersion = info['Windows NT']
        }
        browser.fullVersion = fullVersion
        browser.version = parseFloat(browser.fullVersion)
    }
/**********************************************************************************************************************
 * 公共方法
 **********************************************************************************************************************/
    if(this.isMobile){
        extensions.applyMobile()
        this.enableRem = function (factor) {
            var cssNode = document.createElement('style')
            var width = document.documentElement.clientWidth / factor
            cssNode.innerHTML = 'html{font-size:'+width+'px!important}'
            document.head.appendChild(cssNode)
        }
        /**
         * viewport适配方案，每一个元素在不同设备上占据的css像素的个数是一样的，但css像素和物理像素的比例不一样。
         * @param designWidth
         */
        this.enableViewport = function (designWidth) {
            var scale,metaNode
            metaNode = document.querySelector("meta[name='viewport']")
            if(metaNode){
                scale = document.documentElement.clientWidth/designWidth
            }else{
                scale = screen.width / designWidth
                metaNode = document.createElement('meta')
                metaNode.name = 'viewport'
                document.head.appendChild(metaNode)
            }
            metaNode.content = 'initial-scale='+scale+',minimum-scale='+scale+',maximun-scale='+scale+',user-scalable=no'
        }
    }
    /**
     * 运行app
     * @param controllerClass
     * @param element
     */
    this.runWith = function(controllerClass) {
        var document = window.document
        var controller
        if(typeof controllerClass === 'function'){
            document.ready(function () {
                BCSView.prototype.window = new BCSWindow()
                if(this.isMobile){
                    // 阻止safari双击放大
                    // document.addEventListener('touchstart',function (event) {
                    //     if (event.touches.length > 1) {
                    //         event.preventDefault()
                    //     }
                    // })

                    document.addEventListener('touchmove', function (event) {
                        if (event.scale !== 1) { event.preventDefault() }
                    }, false)
                    var lastTouchEnd = 0
                    document.addEventListener('touchend', function(event) {
                        var now = (new Date()).getTime();
                        if (now - lastTouchEnd <= 300) {
                            event.preventDefault()
                        }
                        lastTouchEnd = now
                    }, false)
                    // 阻止safari双指放大
                    document.addEventListener('gesturestart', function(event) {
                        event.preventDefault()
                    })
                    document.body.style.cssText = "height:100%;overflow:hidden;"
                    document.getElementsByTagName('html')[0].style.cssText = "height:100%;overflow:hidden;"
                }
                controller = new controllerClass()
                BCSView.prototype.window.setRootViewController(controller)
            }.bind(this))
            //http://www.w3school.com.cn/tags/html_ref_eventattributes.asp
            // https://developer.mozilla.org/zh-CN/docs/Web/API/WindowEventHandlers
            window.onload = function () {
                controller.viewDidLoad()
            }
            window.onpageshow = function () {
                controller.viewDidAppear()
            }

            window.onpagehide = function () {
                controller.viewWillDisappear()
            }
            window.onbeforeunload = function () {
                if (controller ) {
                    controller.viewWillUnload()
                }
            }
            window.onunload = function () {
                if (controller ) {
                    controller.viewDidUnload()
                }
            }
        }else{
            throw new window.InvalidParameterException('The parameter of runWith in Browser class is not a function')
        }
    }
    /**
     * 补丁例如Edge.js会调用此方法，将补丁方法添加到patchMap中
     * @param patches
     */
    this.addPatches = function (patches) {
        patchMap.shallowCopy(patches)
    }
    /**
     * 按需给低版本的浏览器打补丁以便尽量接近现代浏览器
     */
    this.applyPatches = function (patchNames) {
        var patch
        for(var i = 0;i<arguments.length;i++){
            patch = patchMap[arguments[i]]
            if(patch && typeof patch ==='function'){
                patch.call(window,window,window.document)
            }else{
                if (window.console ) {
                    console.log('No patch called '+arguments[i] +' is found!')
                }
            }
        }
    }
}

if (typeof window === 'undefined') {
    throw new Error('This script could only be used in frontend!')
}else{
    window.browser = browser
    window.PatchEnum = {
        /* IE7 */
        'STORAGE': 'patchStorage',
        'DETAILS':'patchDetails',
        // 'PNG':'patchPNG',
        /* IE8 */
        'CANVAS':'patchCanvas',
        // 'VIDEO': 'patchVideo',
        // 'AUDIO': 'patchAudio',
        'MEDIA':'patchMedia',
        'GEO_LOCATION': 'patchGeoLocation',
        'DOM_IMPLEMENTATION':'patchDOMImplementation',
        'BACKGROUND_BORDER':'patchBackgroundBorder',
        'VIEW_PORT_UNITS':'patchViewportUnits',
        'CSS_OBJECT_FIT':'patchCSSObjectFit',
        'MEDIA_QUERIES':'patchMediaQueries',
        'HTML_SELECT_ELEMENT':'patchHTMLSelectElement',
        /* IE9 */
        'WEB_SOCKETS': 'patchWebSockets',
        'HISTORY': 'patchHistory',
        'WEB_PERFORMANCE':'patchWebPerformance',
        'TRANSFORM': 'patchTransform',
        'PLACEHOLDER': 'patchPlaceholder',
        'CONSOLE': 'patchConsole',
        'BLOB':'patchBlob',
        'BASE64':'patchBase64',
        'TYPED_ARRAY':'patchTypedArray',
        'WORKER':'patchWorker',
        // 'HTML5':'patchHTML5',
        'PAGE_VISIBILITY':'patchPageVisibility',
        'REQUEST_ANIMATION_FRAME':'patchRequestAnimationFrame',
        'PROGRESS':'patchProgress',
        'RANGE_SELECTION':'patchRangeSelection',
        'CSS3_FILTER':'patchCSS3Filter',
        /* IE10 */
        'RESOURCE_HINTS':'patchResourceHints',
        'DIALOG':'patchDialog',
        'DATA_SET':'patchDataset',
        'POINTER_EVENTS':'patchPointerEvents',
        /* IE11 */
        'GET_USER_MEDIA': 'patchGetUserMedia',
        'CLASS_LIST': 'patchClassList',
        'CURRENT_SCRIPT':'patchCurrentScript',
        'IE_TOUCH':'patchIETouch',
        'POINTER_ACCURACY':'patchPointerAccuracy',
        'CSS_SUPPORTS':'patchCSSSupports',
        'FLEXIBILITY':'patchFlexibility',
        'CAPTIONATOR':'patchCaptionator',
        /* Edge */
        'PROMISE': 'patchPromise',
        'FETCH': 'patchFetch',
        'ES6':'patchES6',
        'SEND_BEACON': 'patchSendBeacon',
        'FORM_DATA':'patchFormData',
        'INDEXED_DB':'patchIndexedDB',
        'METER':'patchMeter',
        'OL_REVERSE':'patchOlReverse',
        'FILE_SAVER':'patchFileSaver',
        'MATHML':'patchMathML',
        'ARIAAccessibility':'patchARIAAccessibility',
        'PICTURE':'patchPicture',
        'IMG_SRCSET':'patchImgSrcset',
        'EVENT_SOURCE':'patchEventSource',
        'FULL_SCREEN':'patchFullScreen',
        'FONT_FACE':'patchFontFace',
        // 'CSS_REGION':'patchCssRegion',
        // 'CSS_GRID':'patchCssGrid',
        'APNG':'patchAPNG',
        'DATA_LIST':'patchDatalist',
        'SET_IMMEDIATE':'patchSetImmediate',
        /* Common */
        'FETCH_JSONP':'patchFetchJSONP',
        'RAPHAEL':'patchRaphael',
        'OVER_THROW':'patchOverthrow',
        'CANGO3D':'patchCango3D',
        'EASYXDM':'patchEasyXDM',
        'STYLE_SCOPED':'patchStyleScoped'
    }
}


