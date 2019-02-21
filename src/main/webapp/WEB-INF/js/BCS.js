(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["module", "exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, mod.exports);
        global.BCS = mod.exports;
    }
})(this, function (module, exports) {
    "use strict";

    exports.__esModule = true;
    exports.BCSNavigationController = BCSNavigationController;
    exports.BCSSplitViewController = BCSSplitViewController;
    exports.BCSTabBarController = BCSTabBarController;
    exports.BCSViewController = BCSViewController;
    exports.BCSWindowController = BCSWindowController;
    exports.BCSCanvasView = BCSCanvasView;
    exports.BCSCanvasView1 = BCSCanvasView1;
    exports.BCSCanvasView2 = BCSCanvasView2;
    exports.BCSScrollView = BCSScrollView;
    exports.BCSTableView = BCSTableView;
    exports.BCSView = BCSView;
    exports.BCSView1 = BCSView1;
    exports.BCSView2 = BCSView2;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    // Source: src/main/frontend/js/bcs/model/Browser.js
    /**
     * Created by kenhuang on 2019/1/25.
     */
    /**
     *
     *
     * Blob:https://github.com/eligrey/Blob.js
     *
     */

    function File(fullPath) {
        'use strict';

        var name, path;
        var arr = fullPath.split("/");
        name = arr[arr.length - 1];
        delete arr[arr.length - 1];
        path = arr.join("/");
        this.getName = function () {
            return name;
        };
        this.getPath = function () {
            return path;
        };
    }
    File.getCurrentJsFile = function () {
        var scripts = document.getElementsByTagName("script");
        return new File(scripts[scripts.length - 1].getAttribute("src"));
    };
    File.importScript = function (scriptPath) {
        document.write('<script type="text/javascript" src="' + scriptPath + '"><\/script>'); // jshint ignore:line
    };
    File.importCss = function (cssPath) {
        document.write('<link rel="stylesheet" type="text/css" href="' + cssPath + '"\/>'); // jshint ignore:line
    };

    /**
     * 单例，无须将公共方法放在prototype中
     * 1.获取浏览器环境信息
     * 2.根据需要启用补丁
     * @constructor
     */
    function Browser(window) {
        var patchMap = {};
        var i,
            splitItems,
            info = {};
        var regexps = {
            withParentheses: /\((.*?)\)/g,
            withSlash: /\b(\S*)?\/(\S*)?\b/g
        };
        var userAgent = window.navigator.userAgent;
        var itemsWithParentheses = userAgent.match(regexps.withParentheses);
        new Extensions(window).apply();
        /* 解析括号的内容 */
        for (i = 0; i < itemsWithParentheses.length; i++) {
            resolveWithinParentheses(itemsWithParentheses[i]);
            userAgent = userAgent.replace(itemsWithParentheses[i], '');
        }
        /* 解析非括号的内容 */
        resolveHighLevel(info, userAgent, ' ');
        finalizeInfo(this);
        downloadPatches(this);
        /**********************************************************************************************************************
         * 私有方法
         **********************************************************************************************************************/
        /**
         *  解析userAgent的内容，获取系统信息
         *  无用的解析异常： 1.(Windows NT 6.1; 125LA;)
         *                 2. () like Gecko"
         */
        function resolveHighLevel(info, userAgent, separator) {
            var subItems,
                items = userAgent.split(separator);
            for (var i = 0; i < items.length; i++) {
                if (items[i]) {
                    subItems = items[i].split('/');
                    if (subItems.length === 1) {
                        info[subItems[0]] = true;
                    } else {
                        info[subItems[0]] = subItems[1];
                    }
                }
            }
        }
        function resolveWithinParentheses(item) {
            if (item.indexOf('KHTML, like Gecko') !== -1) {
                info.KHTML = true;
            } else {
                var temp = {},
                    value,
                    index = 0,
                    matches;
                var regexp = /(.*?)(\d+[\._]?.*)/;
                item = item.substring(1, item.length - 1);
                resolveHighLevel(temp, item, ';');
                for (var name in temp) {
                    if (temp.hasOwnProperty(name)) {
                        value = temp[name];
                        if ((index = name.indexOf('Build')) !== -1) {
                            info.model = name.substring(0, index).trim();
                            info.Build = value;
                        } else if (typeof value === 'boolean') {
                            matches = name.match(regexp);
                            if (matches && matches.length === 3) {
                                info[matches[1].trim()] = matches[2].trim();
                            } else {
                                info[name.trim()] = value;
                            }
                        } else {
                            info[name.trim()] = value;
                        }
                    }
                }
            }
        }

        function downloadPatches(browser) {
            /**
             *  引入依赖，IE10不支持条件注释载入js文件,不建议使用IE9兼容模式
             *  https://msdn.microsoft.com/en-us/library/hh801214(v=vs.85).aspx
             *  http://www.webhek.com/post/conditional-comments-in-ie11-10.html
             */
            var file = File.getCurrentJsFile();
            if (browser.isIE && browser.version <= 7 || browser.isChrome && browser.version < 4 || browser.isSafari && browser.version < 4 || browser.isFirefox && browser.version < 3.5 || browser.isOpera && browser.version < 10.5) {
                File.importScript(file.getPath() + '/IE7.js');
            }
            if (browser.isIE && browser.version <= 8) {
                File.importScript(file.getPath() + '/IE8.js');
            }
            if (browser.isIE && browser.version <= 9) {
                File.importScript(file.getPath() + '/IE9.js');
            }
            if (browser.isIE && browser.version <= 10) {
                File.importScript(file.getPath() + '/IE10.js');
            }
            if (browser.isEdge && browser.version < 18 || browser.isIE || browser.isChrome && browser.version < 32 || browser.isSafari && browser.version < 8 || browser.isFirefox && browser.version < 29 || browser.isOpera && browser.version < 19) {
                File.importScript(file.getPath() + '/Edge.js');
            }
            File.importScript(file.getPath() + '/Common.js');
        }
        //todo 移动端没有版本,并且chrome会伪装成safari, IE10 11,
        // fullVersion = userAgent.substr(userAgent.toLowerCase().indexOf('opr')).replace(/.*\//,'')
        function finalizeInfo(browser) {
            var fullVersion;
            browser.isOpera = window.opr !== undefined;
            if (browser.isOpera) {
                browser.userAgent = 'Opera';
                if (info.hasOwnProperty('OPR')) {
                    fullVersion = info.OPR;
                } else if (info.hasOwnProperty('opr')) {
                    fullVersion = info.opr;
                }
            } else {
                if (!!window.ActiveXObject || "ActiveXObject" in window) {
                    browser.isIE = true;
                    browser.userAgent = 'IE';
                    if (info.MSIE) {
                        fullVersion = info.MSIE;
                    }
                } else {
                    if (info.hasOwnProperty('Chrome')) {
                        browser.isChrome = true;
                        browser.userAgent = 'Chrome';
                        fullVersion = info.Chrome;
                    } else if (info.hasOwnProperty('Safari')) {
                        browser.isSafari = true;
                        browser.userAgent = 'Safari';
                        fullVersion = info.Safari;
                    } else if (info.Firefox) {
                        browser.isFirefox = true;
                        browser.userAgent = 'Firefox';
                        fullVersion = info.Firefox;
                    }
                }
            }

            if (info.Android) {
                browser.OS = 'Android';
                browser.OSVersion = info.Android;
                browser.isMobile = true;
            } else if (info.hasOwnProperty('Linux')) {
                browser.OS = 'Linux';
            }
            if (info.model) {
                browser.hardware = info.model;
            }
            if (info.iPhone) {
                browser.OS = 'iOS';
                browser.OSVersion = info.Version;
                browser.isMobile = true;
                browser.hardware = 'iPhone';
            } else if (info.iPad) {
                browser.OS = 'iOS';
                browser.OSVersion = info.Version;
                browser.isMobile = true;
                browser.hardware = 'iPad';
            } else if (info['Intel Mac OS X']) {
                browser.OS = 'Intel Mac OS X';
                browser.OSVersion = info['Intel Mac OS X'];
                browser.hardware = 'Intel Mac OS X';
            }
            if (info['Windows NT']) {
                browser.OS = 'Windows NT';
                browser.OSVersion = info['Windows NT'];
            }
            browser.fullVersion = fullVersion;
            browser.version = parseFloat(browser.fullVersion);
        }
        /**********************************************************************************************************************
         * 公共方法
         **********************************************************************************************************************/
        if (this.isMobile) {
            this.enableRem = function (factor) {
                var cssNode = document.createElement('style');
                var width = document.documentElement.clientWidth / factor;
                cssNode.innerHTML = 'html{font-size:' + width + 'px!important}';
                document.head.appendChild(cssNode);
            };
            /**
             * viewport适配方案，每一个元素在不同设备上占据的css像素的个数是一样的，但css像素和物理像素的比例不一样。
             * @param designWidth
             */
            this.enableViewport = function (designWidth) {
                var scale, metaNode;
                metaNode = document.querySelector("meta[name='viewport']");
                if (metaNode) {
                    scale = document.documentElement.clientWidth / designWidth;
                } else {
                    scale = screen.width / designWidth;
                    metaNode = document.createElement('meta');
                    metaNode.name = 'viewport';
                    document.head.appendChild(metaNode);
                }
                metaNode.content = 'initial-scale=' + scale + ',minimum-scale=' + scale + ',maximun-scale=' + scale + ',user-scalable=no';
            };
        }
        /**
         * 运行app
         * @param controllerClass
         * @param element
         */
        this.runWith = function (controllerClass, element) {
            var document = window.document;
            var controller;
            if (typeof controllerClass === 'function') {
                document.ready(function () {
                    controller = new controllerClass(element);
                    window.rootViewController = controller;
                    controller.getReady();
                    if (!element) {
                        /* 将rootViewController的view的layer作为body的唯一满屏元素 */
                        document.body.appendChild(controller.view.layer);
                    }
                    /* 让所有的ViewController都能找得到window */
                    BCSViewController.prototype.window = window;
                });
                //http://www.w3school.com.cn/tags/html_ref_eventattributes.asp
                // https://developer.mozilla.org/zh-CN/docs/Web/API/WindowEventHandlers
                window.onload = function () {
                    controller.viewDidLoad();
                };
                window.onpageshow = function () {
                    controller.viewDidAppear();
                };
                window.onpagehide = function () {
                    controller.viewWillDisappear();
                };

                window.onbeforeunload = function () {
                    controller.viewWillUnload();
                };
                window.onunload = function () {
                    controller.viewDidUnload();
                };
            } else {
                throw new window.InvalidParameterException('The parameter of runWith in Browser class is not a function');
            }
        };
        /**
         * 补丁例如Edge.js会调用此方法，将补丁方法添加到patchMap中
         * @param patches
         */
        this.addPatches = function (patches) {
            patchMap.shallowCopy(patches);
        };
        /**
         * 按需给低版本的浏览器打补丁以便尽量接近现代浏览器
         */
        this.applyPatches = function (patchNames) {
            var patch;
            for (var i = 0; i < arguments.length; i++) {
                patch = patchMap[arguments[i]];
                if (patch && typeof patch === 'function') {
                    patch.call(window, window, window.document);
                } else {
                    console.log('No patch called ' + arguments[i] + ' is found!');
                }
            }
        };
    }

    if (typeof window === 'undefined') {
        throw new Error('This script could only be used in frontend!');
    } else {
        window.browser = new Browser(window);
        window.PatchEnum = {
            /* IE7 */
            'STORAGE': 'patchStorage',
            /* IE8 */
            // 'CANVAS':'patchCanvas',
            'VIDEO': 'patchVideo',
            'AUDIO': 'patchAudio',
            'PNG': 'patchPNG',
            'GEO_LOCATION': 'patchGeoLocation',
            'CSS3': 'patchCSS3',
            /* IE9 */
            'WEB_SOCKETS': 'patchWebSockets',
            'HISTORY': 'patchHistory',
            'WEB_PERFORMANCE': 'patchWebPerformance',
            'TRANSFORM': 'patchTransform',
            'PLACEHOLDER': 'patchPlaceholder',
            'CONSOLE': 'patchConsole',
            'BLOB': 'patchBlob',
            /* IE10 */
            'LOCATION_ORIGIN': 'patchLocationOrigin',
            /* Edge */
            'PROMISE': 'patchPromise',
            'FETCH': 'patchFetch',
            'ES6': 'patchES6',
            'HTML5': 'patchHTML5',
            'BEACON': 'patchBeacon',
            'FORM_DATA': 'patchFormData',
            /* Common */
            'FETCH_JSONP': 'patchFetchJSONP',
            'FILE_SAVER': 'patchFileSaver'
        };
        Object.prototype.shallowCopy.call(window, module.exports);
    }

    ;
    // Source: src/main/frontend/js/bcs/controller/BCSCollectionViewController.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/controller/BCSNavigationController.js
    /**
     * Created by kenhuang on 2019/1/26.
     */

    function BCSNavigationController(element) {
        BCSViewController.call(this, element);
        this.viewControllers = [];
    }
    BCSNavigationController.extend(BCSViewController, {
        pushViewController: function pushViewController(viewController, animated) {
            this.viewControllers.push(viewController);
            var self = this;
            viewController.appear(function () {
                self.view.addSubView(viewController.view);
            });
        },
        popViewController: function popViewController(animated) {
            var controller = this.viewControllers.pop();
            if (controller) {
                var self = this;
                controller.disappear(function () {
                    self.view.removeSubView(controller.view);
                });
                if (this.viewControllers.length >= 1) {
                    controller = this.viewControllers[this.viewControllers.length - 1];
                    controller.appear(function () {
                        self.view.addSubView(controller.view);
                    });
                }
            }
        }
    });
    // Source: src/main/frontend/js/bcs/controller/BCSPageViewController.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/controller/BCSSplitViewController.js
    /**
     * Created by kenhuang on 2019/1/26.
     */

    function BCSSplitViewController(element) {
        BCSViewController.call(this, element);
        this.viewControllers = [];
    }
    BCSSplitViewController.extend(BCSViewController);
    // Source: src/main/frontend/js/bcs/controller/BCSTabBarController.js
    /**
     * Created by kenhuang on 2019/1/26.
     */

    function BCSTabBarController(element) {
        BCSViewController.call(this, element);
        this.viewControllers = [];
    }
    BCSTabBarController.extend(BCSViewController);
    // Source: src/main/frontend/js/bcs/controller/BCSViewController.js
    /**
     * Created by kenhuang on 2019/1/26.
     */

    function BCSViewController(element) {
        this.childViewControllers = [];
        if (Object.isElement(element)) {
            this.view = new BCSView(element);
        } else if (typeof element === "string") {
            this.view = new BCSView1(element);
        } else {
            this.view = BCSView2();
        }
        this.view.setStyle({ width: '100%', height: '100%' });
        this.parent = null;
    }

    {
        BCSViewController.prototype.loadView = function () {};
        BCSViewController.prototype.getReady = function () {};
        BCSViewController.prototype.viewDidLoad = function () {};
        BCSViewController.prototype.layoutSubViews = function () {};
        BCSViewController.prototype.viewWillAppear = function () {};
        BCSViewController.prototype.viewDidAppear = function () {};
        BCSViewController.prototype.viewWillDisappear = function () {};
        BCSViewController.prototype.viewDidDisappear = function () {};
        BCSViewController.prototype.viewWillUnload = function () {};
        BCSViewController.prototype.viewDidUnload = function () {};
        BCSViewController.prototype.appear = function (callback) {
            this.viewWillAppear();
            if (typeof callback === 'function') {
                callback();
            }
            this.viewDidAppear();
        };
        BCSViewController.prototype.disappear = function (callback) {
            this.viewWillDisappear();
            if (typeof callback === 'function') {
                callback();
            }
            this.viewDidDisappear();
        };
        BCSViewController.prototype.addChildViewController = function (viewController) {};
        BCSViewController.prototype.insertChildViewController = function (viewControllerindex) {};
        BCSViewController.prototype.removeFromParentViewController = function () {};
        BCSViewController.prototype.removeChildViewController = function (index) {};
    }

    ;
    // Source: src/main/frontend/js/bcs/controller/BCSWindowController.js
    /**
     * Created by kenhuang on 2019/1/26.
     */

    /**
     * 用于PC端
     * @param element
     * @constructor
     */
    function BCSWindowController(element) {
        BCSViewController.call(this, element);
    }
    BCSWindowController.extend(BCSViewController, {
        loadPageInfo: function loadPageInfo(dataURL, errorCallback, method, data) {
            if (!this.window[BCSWindowController.key]) {
                if (this.window.name) {
                    var obj = JSON.parse(this.window.name);
                    this.window[BCSWindowController.key] = obj[BCSWindowController.key];
                    this.window.name = '';
                }
                if (!this.window[BCSWindowController.key] && dataURL) {
                    method = method || this.window.HttpMethodEnum.get;
                    var xmlhttp;
                    if (this.window.XMLHttpRequest) {
                        xmlhttp = new XMLHttpRequest();
                    } else if (this.window.ActiveXObject) {
                        xmlhttp = new this.window.ActiveXObject("Microsoft.XMLHTTP");
                    }
                    if (xmlhttp) {
                        /* window.location.search 用户可能输入参数 */
                        xmlhttp.open(method, '' + dataURL + this.window.location.search, false);
                        xmlhttp.onreadystatechange = function () {
                            if (xmlhttp.readyState === 4) {
                                switch (xmlhttp.status) {
                                    case 302:
                                    case 200:
                                        if (xmlhttp.responseText) {
                                            this.window[BCSWindowController.key] = JSON.parse(xmlhttp.responseText);
                                        }
                                        break;
                                    default:
                                        if (errorCallback) {
                                            errorCallback(xmlhttp.status, xmlhttp.statusText);
                                        }
                                        break;
                                }
                            }
                        };
                        xmlhttp.send(data);
                    } else {
                        if (errorCallback) {
                            errorCallback(-1, "This browser does not support XMLHttpRequest.");
                        }
                    }
                }
            }
            if (this.window[BCSWindowController.key]) {
                document.title = this.window[BCSWindowController.key].title || document.title;
            }
        },
        /**
         * 1.Chrome打开新页面的瞬间,newWindow和当前window似乎共用同一个sessionStorage。此时不能设置sessionStorage，
         * 否则会引起newWindow的sessionStorage异常。只能直接将页面数据保存在window.name下。
         * 2.Chrome在当前tab打开新页面时，ajax异步模式和Chrome插件会导致浏览器前进后退功能异常。异步模式下，Firefox,Safari浏览器必须
         * 在异步代码外使用newWindow=window.open('',WindowNameEnum.blank)创建新window。建议使用Ajax同步模式，反正要等收到服务器端的数
         * 据之后才能打开新页面。
         * 3.Safari 从页面打开另一新页面时，浏览器可以后退。切换页面之后才正常。
         * 4.字符串长度
         *  Mac Chrome 512M  Safari 1G Firefox 128M
         *  XP Chrome 128M IE8 128M
         * @param pageInfo
         * @param windowName "_blank" "_self".(_parent，_top，自定义name的情况未测试，暂时无用。)
         * @param newWindow 为了和Safari浏览器兼容，在同步时，如ajax async=false可以忽略此参数。
         */
        openWindow: function openWindow(pageInfo, windowName, newWindow) {
            if (pageInfo && pageInfo.url) {
                windowName = windowName || this.window.WindowNameEnum.self;
                newWindow = newWindow || this.window.open('', windowName);
                if (newWindow) {
                    newWindow.location.assign(pageInfo.url);
                    var obj = {};
                    obj[BCSWindowController.key] = pageInfo;
                    newWindow.name = JSON.stringify(obj);
                } else {
                    throw new OpenWindowException('Failed to open window.Please check if url is correct ' + // jshint ignore:line
                    'or popup new window function is blocked!');
                }
            } else {
                throw new MalformedURLException('Member pageInfo.url should not be null!'); // jshint ignore:line
            }
        }
    }, {
        key: "$page"
    });
    // Source: src/main/frontend/js/bcs/model/Encryption.js
    var RC4 = exports.RC4 = {
        decode: function decode(key, cipherText) {
            return this.encode(key, cipherText);
        },
        encode: function encode(key, data) {
            var keyLength = key.length,
                dataLength = data.length,
                cipherText = [],
                seq = [],
                j = 0,
                r = 0,
                q = 0,
                temp,
                i;
            for (i = 0; i < 256; ++i) {
                seq[i] = i;
            }
            for (i = 0; i < 256; ++i) {
                j = (j + (temp = seq[i]) + key.charCodeAt(i % keyLength)) % 256;
                seq[i] = seq[j];
                seq[j] = temp;
            }
            for (j = 0; r < dataLength; ++r) {
                i = r % 256;
                j = (j + (temp = seq[i])) % 256;
                keyLength = seq[i] = seq[j];
                seq[j] = temp;
                cipherText[q++] = String.fromCharCode(data.charCodeAt(r) ^ seq[(keyLength + temp) % 256]);
            }
            return cipherText.join("");
        },
        key: function key(length) {
            for (var i = 0, keys = []; i < length; ++i) {
                keys[i] = String.fromCharCode(1 + (Math.random() * 255 << 0));
            }
            return keys.join("");
        }
    };
    // Source: src/main/frontend/js/bcs/model/Extensions.js
    /**
     * Created by kenhuang on 2019/1/25.
     */
    /**
     * 无需暴露
     * @constructor
     */

    function Extensions(window) {

        /**
         * 对Object进行扩展会破坏jQuery
         * https://stackoverflow.com/questions/21729895/jquery-conflict-with-native-prototype
         */
        function extendObject() {
            Object.prototype.getClass = function () {
                if (this.constructor && this.constructor.toString()) {
                    if (this.constructor.name) {
                        return this.constructor.name;
                    }
                    var arr;
                    var str = this.constructor.toString();
                    if (str.charAt(0) === '[') {
                        arr = str.match(/\[\w+\s*(\w+)\]/);
                    } else {
                        arr = str.match(/function\s*(\w+)/);
                    }
                    if (arr && arr.length === 2) {
                        return arr[1];
                    }
                }
                return undefined;
            };
            Object.prototype.overload = function (attributes, values) {
                var i, length;
                if (attributes.length > values.length) {
                    for (i = values.length; i < attributes.length; i++) {
                        this[attributes[i]] = null;
                    }
                    length = values.length;
                } else {
                    length = attributes.length;
                }

                for (i = 0; i < length; i++) {
                    this[attributes[i]] = values[i];
                }
            };
            Object.prototype.shallowCopy = function (obj) {
                for (var member in obj) {
                    if (obj.hasOwnProperty(member)) {
                        this[member] = obj[member];
                    }
                }
                return this;
            };
            /**
             * 观察者模式,仅限IE9及以上的直接属性。IE9以下全部使用NotificationCenter
             * @param observer
             * @param key
             * @param observerListMap
             */
            Object.prototype._addObserver = function (observerListMap, observer, key) {
                function setter(newValue) {
                    var observerList = observerListMap[key].list;
                    var oldValue = observerListMap[key].value;
                    observerListMap[key].value = newValue;
                    if (observerList) {
                        for (var i = 0; i < observerList.length; i++) {
                            if (typeof observerList[i].observeValueForKey === 'function') {
                                observerList[i].observeValueForKey(this, key, oldValue, newValue);
                            }
                        }
                    }
                }
                function getter(key) {
                    return observerListMap[key].value;
                }
                if ((typeof observer === "undefined" ? "undefined" : _typeof(observer)) !== "object" || !key) {
                    throw new Error('Invalid parameters.');
                } else if (!this.hasOwnProperty(key)) {
                    throw new Error('Object doesn\'t have such property \'' + key + '\'.');
                }
                if (!observerListMap[key]) {
                    observerListMap[key] = {
                        value: this[key],
                        list: []
                    };

                    if (Object.defineProperty) {
                        Object.defineProperty(this, key, {
                            set: setter,
                            get: getter
                        });
                    } else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) {
                        Object.prototype.__defineGetter__.call(this, key, getter);
                        Object.prototype.__defineSetter__.call(this, key, setter);
                    }
                }
                /* 防止重复添加 */
                var list = observerListMap[key].list;
                for (var i = 0; i < list.length; i++) {
                    if (list[i] === observer) {
                        return;
                    }
                }
                list.push(observer);
            };
            Object.prototype._removeObserver = function (observerListMap, observer, key) {
                function remove(observerList, observer) {
                    for (var i = 0; i < observerList.length; i++) {
                        if (observerList[i] === observer) {
                            if (i === 0) {
                                observerList.shift();
                                return;
                            } else if (i === length - 1) {
                                observerList.pop();
                                return;
                            } else {
                                observerList.splice(i, 1);
                                return;
                            }
                        }
                    }
                }
                if (observerListMap) {

                    if (key) {
                        /* 删除指定属性的指定观察者 */
                        var observerList = observerListMap[key].list;
                        if (observerList) {
                            remove(observerList, observer);
                        }
                    } else {
                        /* 删除所有属性的指定观察者 */
                        for (var o in observerListMap) {
                            if (observerListMap.hasOwnProperty(o)) {
                                remove(o.list, observer);
                            }
                        }
                    }
                }
            };
            /**
             * 在构造方法中使用，observerListMap为构造方法中的私有属性
             * @param observerListMap
             */
            Object.prototype.enableKVO = function (observerListMap) {
                this.addObserver = function (observer, key) {
                    this._addObserver(observerListMap, observer, key);
                };
                this.removeObserver = function (observer, key) {
                    this._removeObserver(observerListMap, observer, key);
                };
            };
            Object.isElement = function (object) {
                return (typeof object === "undefined" ? "undefined" : _typeof(object)) === 'object' && object.nodeType === 1;
            };
        }

        function extendFunction() {
            /**
             * 用于寄生组合继承,方法名不能为extends，会在IE下报错！
             * @param publicObject  公共方法（如果含有属性不报错）
             * @param superClass 父类构造函数
             * @param staticObject 静态属性和方法
             */
            Function.prototype.extend = function (superClass, publicObject, staticObject) {
                if (typeof this === 'function') {
                    if (typeof superClass === 'function') {
                        var Super = function Super() {};
                        Super.prototype = superClass.prototype;
                        this.prototype = new Super();
                        this.prototype.constructor = this;
                    }
                    if ((typeof publicObject === "undefined" ? "undefined" : _typeof(publicObject)) === 'object') {
                        this.prototype.shallowCopy(publicObject);
                    }
                    if ((typeof staticObject === "undefined" ? "undefined" : _typeof(staticObject)) === 'object') {
                        this.shallowCopy(staticObject);
                    }
                }
            };
            /**
             * 有无法处理的情况，慎用
             * @param callee
             * @returns {*}
             */
            Function.prototype.getName = function (callee) {
                // return this.name || this.toString().match(/function\s*([^(]*)\(/)[1]
                if (callee.name) {
                    return callee.name;
                }
                var _callee = callee.toString().replace(/[\s\?]*/g, ""),
                    comb = _callee.length >= 50 ? 50 : _callee.length;
                _callee = _callee.substring(0, comb);
                var name = _callee.match(/^function([^\(]+?)\(/);
                if (name && name[1]) {
                    return name[1];
                }
                if (callee.caller) {
                    var caller = callee.caller,
                        _caller = caller.toString().replace(/[\s\?]*/g, "");
                    var last = _caller.indexOf(_callee),
                        str = _caller.substring(last - 30, last);
                    name = str.match(/var([^\=]+?)\=/);
                    if (name && name[1]) {
                        return name[1];
                    }
                }
                var stack = new Error().stack;
                if (stack) {
                    name = stack.match(/Function.getName.*\n    at (.*) \(/);
                    if (name && name[1]) {
                        return name[1].replace('new window.', '').replace('new ', '');
                    }
                }
                return "anonymous";
            };
            Function.ensureArgs = function (args, expected) {
                if (args.length < expected) {
                    throw new TypeError(expected + ' argument required, but only ' + args.length + ' present.');
                }
            };
        }
        /**
         * IE6 无法对Window.prototype进行扩展
         */
        function extendWindow() {
            function Exception(msg, name) {
                /* 不能使用Error.apply(this, arguments)  */
                this.message = msg;
                this.stack = new Error().stack;
                this.name = name || "Exception";
            }
            Exception.extend(Error);
            window.Error.prototype.printStackTrace = function () {
                if (this.stack) {
                    window.print(this.stack);
                } else {
                    window.console.log("No stack exists!Maybe you are using old version of IE.\n" + "name:" + this.name + "\n" + "functionName:" + this.functionName + "\n" + "lineNumber:" + this.lineNumber + "\n" + "message:" + this.message);
                }
            };

            window.WindowNameEnum = {
                'SELF': '_self',
                'BLANK': '_blank',
                'PARENT': '_parent',
                'TOP': '_top'
            };
            window.HttpMethodEnum = {
                'POST': 'POST',
                'DELETE': 'DELETE',
                'PUT': 'PUT',
                'GET': 'GET',
                'HEAD': 'HEAD',
                'TRACE': 'TRACE',
                'OPTIONS': 'OPTIONS',
                'PATCH': 'PATCH'
            };
            window.NotificationCenter = { 'default': new NotificationCenter()
                /* 错误处理 */
            };window.onerror = function (message, url, line, column, error) {
                window.console.log(url + ":" + line + ":" + column + ":\"" + message + "\"");
                return false;
            };
            window.Exception = Exception;
            window.MalformedURLException = function (msg) {
                Exception.call(this, msg, 'MalformedURLException');
            };
            window.MalformedURLException.extend(Exception);
            window.OpenWindowException = function (msg) {
                Exception.call(this, msg, 'OpenWindowException');
            };
            window.OpenWindowException.extend(Exception);
            window.InvalidParameterException = function (msg) {
                Exception.call(this, msg, 'InvalidParameterException');
            };
            window.InvalidParameterException.extend(Exception);
            window.document.ready = function (callback) {
                /* 兼容FF,Google */
                if (document.addEventListener) {
                    document.addEventListener('DOMContentLoaded', function handleDOMContentLoaded() {
                        document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded, false);
                        callback();
                    }, false);
                } else if (document.attachEvent) {
                    /* 兼容IE */
                    document.attachEvent('onreadystatechange', function handleReadyStateChange() {
                        if (document.readyState === "complete") {
                            document.detachEvent("onreadystatechange", handleReadyStateChange);
                            callback();
                        }
                    });
                } else if (document.lastChild === document.body) {
                    callback();
                }
            };
            if (!window.Iterator) {
                window.Iterator = function (object) {
                    function MapIterator(object) {}
                    function ArrayIterator(array) {
                        var index = 0;
                        this.next = function () {
                            if (index < array.length) {
                                return { done: false, value: array[index] };
                            } else {
                                return { done: true, value: undefined };
                            }
                        };
                    }
                    if (Array.isArray(object)) {
                        return new ArrayIterator(object);
                    } else {
                        return new MapIterator(object);
                    }
                };
            }
        }
        function extendString() {
            /* 和cssSandpaper冲突 */
            if (!String.prototype.trim) {
                String.prototype.trim = function () {
                    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
                };
            }
            String.prototype.toFirstUpperCase = function () {
                return this.charAt(0).toUpperCase() + this.slice(1);
            };
        }
        function extendArray() {
            // Array.prototype.indexOf = function (element) {
            //     for (var i = 0; i < this.length; i++) {
            //         if (this[i] === element) {
            //             return i
            //         }
            //     }
            //     return -1
            // }
            Array.prototype.remove = function (element) {
                var index = this.indexOf(element);
                if (index > -1) {
                    return this.splice(index, 1);
                }
            };
        }
        this.apply = function () {
            extendObject();
            extendFunction();
            extendWindow();
            extendString();
            extendArray();
        };
    };
    // Source: src/main/frontend/js/bcs/model/NotificationCenter.js
    /**
     * Created by kenhuang on 2019/1/25.
     */
    /**
     * 无需暴露
     * @constructor
     */
    function NotificationCenter() {
        var observerListMap = {};
        /**
         *
         * @param observer 观察者
         * @param selector 观察者响应方法
         * @param name     消息, null表示接收任意的消息
         * @param object   发送者，null表示接收所有发送者发送的消息
         */
        this.addObserver = function (observer, selector, name, object) {
            name = name || null;
            object = object || null;
            if ((typeof observer === "undefined" ? "undefined" : _typeof(observer)) !== "object" || typeof selector !== "function" || typeof name !== "string" && name !== null || (typeof object === "undefined" ? "undefined" : _typeof(object)) !== "object" && object !== null) {
                throw new Error('Invalid parameters.');
            }
            if (!observerListMap[name]) {
                observerListMap[name] = [];
            }
            /* 防止重复添加 */
            for (var o in this.observerListMap[name]) {
                if (o.observer === observer && o.object === object) {
                    for (var s in o.selectors) {
                        if (s === selector) {
                            return;
                        }
                    }
                    o.selectors.push(selector);
                    return;
                }
            }
            observerListMap[name].push({
                observer: observer,
                selectors: [selector],
                object: object });
        };
        this.post = function (name, object, userInfo) {
            function send(observerList, notification) {
                if (observerList) {
                    for (var i = 0; i < observerList.length; i++) {
                        if (observerList[i].object === object || observerList[i].object === null) {
                            try {
                                observerList[i].selectors(notification);
                            } catch (e) {}
                        }
                    }
                }
            }
            object = object || null;
            if (typeof name === 'string') {
                var notification = {
                    name: name,
                    object: object,
                    userInfo: userInfo
                };
                send(observerListMap[name], notification);
                send(observerListMap[null], notification);
            }
        };
        this.removeObserver = function (observer, name, object) {
            function remove(observerList, observer, object) {
                for (var i = 0; i < observerList.length; i++) {
                    if (observerList[i].observer === observer && observerList[i].object === object) {
                        if (i === 0) {
                            observerList.shift();
                            return;
                        } else if (i === length - 1) {
                            observerList.pop();
                            return;
                        } else {
                            observerList.splice(i, 1);
                            return;
                        }
                    }
                }
            }
            var observerList;
            object = object || null;
            if (name) {
                /* 删除指定属性的指定观察者 */
                observerList = observerListMap[name];
                if (observerList) {
                    remove(observerList, observer, object);
                }
            } else {
                /* 删除所有属性的指定观察者 */
                for (observerList in this.observerListMap) {
                    if (this.observerListMap.hasOwnProperty(observerList)) {
                        remove(observerList, observer, object);
                    }
                }
            }
        };
    };
    // Source: src/main/frontend/js/bcs/view/BCSBarButtonItem.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSButton.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSCanvasView.js
    /**
     * Created by kenhuang on 2019/1/10.
     */

    function BCSCanvasView(element, style) {
        if (typeof FlashCanvas !== "undefined") {
            element = FlashCanvas.initElement(element);
        }
        BCSView.call(this, element, style);
    }

    function BCSCanvasView1(elementId, style) {
        var element = document.getElementById(elementId);
        return new BCSCanvasView(element, style);
    }

    function BCSCanvasView2(style) {
        var element = document.createElement('canvas');
        return new BCSCanvasView(element, style);
    }
    /* 应用补丁之后的canvas代码需要在window.onload执行 */
    BCSCanvasView.prototype.drawRect = function () {};
    // Source: src/main/frontend/js/bcs/view/BCSCollectionView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSCollectionViewCell.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSDatePicker.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSImageView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSLabel.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSNavigationBar.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSNavigationItem.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSPageControl.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSPickerView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSProgressView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSScrollView.js
    /**
     * Created by kenhuang on 2019/1/25.
     */

    function BCSScrollView() {
        BCSView.call(this);
        if (!BCSView.prototype.appendTo) {
            BCSView.prototype.enableRubberBand = function () {};
            BCSView.prototype.enableQuickMove = function () {
                var lastTime = 0;
                var currentTime = 0;
                // var lastPoint
                // var currentPoint
                //如果容器位置大于等于0时，则在拖动时就启用橡皮筋，否则进行滑屏直到屏幕底部
                //防止误点击
                // 速度残留，需要在touchstart将速度设置为0
                // 1/2跳转
                //防抖动
                //横竖方向都适用
                //即点即停
            };
        }
    }
    BCSScrollView.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSSlider.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSSwitch.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSTabBar.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSTabBarItem.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSTableView.js
    /**
     * Created by kenhuang on 2019/1/26.
     */

    function BCSTableView() {}
    BCSTableView.extend(BCSScrollView);
    // Source: src/main/frontend/js/bcs/view/BCSTableViewCell.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSTextField.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSTextView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSToolbar.js
    /**
     * Created by kenhuang on 2019/2/16.
     */
    ;
    // Source: src/main/frontend/js/bcs/view/BCSView.js
    /**
     * Created by kenhuang on 2019/1/10.
     */

    function BCSView(element, style) {
        this.layer = element;
        this.layer.style.position = 'absolute';
        if ((typeof style === "undefined" ? "undefined" : _typeof(style)) === 'object') {
            this.setStyle(style);
        }
        this.subViews = [];
    }

    function BCSView1(elementId, style) {
        var element = document.getElementById(elementId);
        return new BCSView(element, style);
    }

    function BCSView2(style, elementType) {
        elementType = elementType || 'div';
        var element = document.createElement(elementType);
        return new BCSView(element, style);
    }

    {
        BCSView.prototype.addSubView = function (view) {
            this.subViews.push(view);
            this.layer.appendChild(view.layer);
        };
        BCSView.prototype.removeSubView = function (subView) {
            this.layer.removeChild(subView.layer);
        };
        BCSView.prototype.setStyle = function (cssObject) {
            var cssText = '';
            for (var name in cssObject) {
                if (cssObject.hasOwnProperty(name)) {
                    cssText += name.replace(/([A-Z])/g, function (match) {
                        return '-' + match.toLowerCase();
                    }) + ":" + cssObject[name] + ';';
                }
            }
            if (typeof this.layer.style.cssText !== 'undefined') {
                this.layer.style.cssText += ';' + cssText;
            } else {
                this.layer.setAttribute('style', cssText);
            }
        };
    }
});
