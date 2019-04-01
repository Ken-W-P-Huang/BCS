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
    exports.BCSCollectionViewController = BCSCollectionViewController;
    exports.BCSNavigationController = BCSNavigationController;
    exports.BCSPageViewController = BCSPageViewController;
    exports.BCSSearchController = BCSSearchController;
    exports.BCSSplitViewController = BCSSplitViewController;
    exports.BCSTabBarController = BCSTabBarController;
    exports.BCSViewController = BCSViewController;
    exports.BCSWindowController = BCSWindowController;
    exports.NotificationCenter = NotificationCenter;
    exports.BCSBarItem = BCSBarItem;
    exports.BCSBarButtonItem = BCSBarButtonItem;
    exports.BCSButton = BCSButton;
    exports.BCSCanvasView = BCSCanvasView;
    exports.BCSCanvasView1 = BCSCanvasView1;
    exports.BCSCanvasView2 = BCSCanvasView2;
    exports.BCSCollectionView = BCSCollectionView;
    exports.BCSCollectionViewCell = BCSCollectionViewCell;
    exports.BCSDatePicker = BCSDatePicker;
    exports.BCSGestureRecognizer = BCSGestureRecognizer;
    exports.BCSImageView = BCSImageView;
    exports.BCSLabel = BCSLabel;
    exports.BCSLongPressGestureRecognizer = BCSLongPressGestureRecognizer;
    exports.BCSNavigationBar = BCSNavigationBar;
    exports.BCSNavigationItem = BCSNavigationItem;
    exports.BCSPageControl = BCSPageControl;
    exports.BCSPanGestureRecognizer = BCSPanGestureRecognizer;
    exports.BCSPickerView = BCSPickerView;
    exports.BCSPinchGestureRecognizer = BCSPinchGestureRecognizer;
    exports.BCSPoint = BCSPoint;
    exports.BCSSize = BCSSize;
    exports.BCSVector = BCSVector;
    exports.BCSRect = BCSRect;
    exports.BCSRect1 = BCSRect1;
    exports.BCSProgressView = BCSProgressView;
    exports.BCSRotateGestureRecognizer = BCSRotateGestureRecognizer;
    exports.BCSScrollView = BCSScrollView;
    exports.BCSSlider = BCSSlider;
    exports.BCSSwipeGestureRecognizer = BCSSwipeGestureRecognizer;
    exports.BCSSwitch = BCSSwitch;
    exports.BCSTabBar = BCSTabBar;
    exports.BCSTabBarItem = BCSTabBarItem;
    exports.BCSTableView = BCSTableView;
    exports.BCSTableViewCell = BCSTableViewCell;
    exports.BCSTapGestureRecognizer = BCSTapGestureRecognizer;
    exports.BCSTextField = BCSTextField;
    exports.BCSTextView = BCSTextView;
    exports.BCSToolbar = BCSToolbar;
    exports.BCSView = BCSView;
    exports.BCSView1 = BCSView1;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    // Source: src/main/frontend/js/bcs/model/Browser.js
    /**
     * Created by kenhuang on 2019/1/25.
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
        var script = scripts[scripts.length - 1];
        if (document.documentMode >= 8) {
            return new File(script.src);
        } else {
            return new File(script.getAttribute("src", 4));
        }
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
    var browser = new Browser(window);
    function Browser(window) {
        if (browser) {
            throw new TypeError(this.getClass() + ' could be instantiated only once!');
        }
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
        var extensions = new Extensions(window);
        extensions.apply();
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
            extensions.applyMobile();
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
                    if (this.isMobile) {
                        document.addEventListener('touchstart', function (event) {
                            event = event || window.event;
                            event.preventDefault();
                        });
                        document.body.style.cssText = "height:100%;overflow:hidden;";
                        document.getElementsByTagName('html')[0].style.cssText = "height:100%;overflow:hidden;";
                    }
                    controller = new controllerClass(element);
                    window.rootViewController = controller;
                    if (!element) {
                        /* 将rootViewController的view的layer作为body的唯一满屏元素 */
                        document.body.appendChild(controller.view.getLayer());
                    }
                    BCSView.prototype.window = new BCSView(document.body, { position: 'relative' });
                }.bind(this));
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
                    if (controller) {
                        controller.viewWillUnload();
                    }
                };

                window.onunload = function () {
                    if (controller) {
                        controller.viewDidUnload();
                    }
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
                    if (window.console) {
                        console.log('No patch called ' + arguments[i] + ' is found!');
                    }
                }
            }
        };
    }

    if (typeof window === 'undefined') {
        throw new Error('This script could only be used in frontend!');
    } else {
        window.browser = browser;
        window.PatchEnum = {
            /* IE7 */
            'STORAGE': 'patchStorage',
            'DETAILS': 'patchDetails',
            // 'PNG':'patchPNG',
            /* IE8 */
            'CANVAS': 'patchCanvas',
            // 'VIDEO': 'patchVideo',
            // 'AUDIO': 'patchAudio',
            'MEDIA': 'patchMedia',
            'GEO_LOCATION': 'patchGeoLocation',
            'DOM_IMPLEMENTATION': 'patchDOMImplementation',
            'BACKGROUND_BORDER': 'patchBackgroundBorder',
            'VIEW_PORT_UNITS': 'patchViewportUnits',
            'CSS_OBJECT_FIT': 'patchCSSObjectFit',
            'MEDIA_QUERIES': 'patchMediaQueries',
            'HTML_SELECT_ELEMENT': 'patchHTMLSelectElement',
            /* IE9 */
            'WEB_SOCKETS': 'patchWebSockets',
            'HISTORY': 'patchHistory',
            'WEB_PERFORMANCE': 'patchWebPerformance',
            'TRANSFORM': 'patchTransform',
            'PLACEHOLDER': 'patchPlaceholder',
            'CONSOLE': 'patchConsole',
            'BLOB': 'patchBlob',
            'BASE64': 'patchBase64',
            'TYPED_ARRAY': 'patchTypedArray',
            'WORKER': 'patchWorker',
            // 'HTML5':'patchHTML5',
            'PAGE_VISIBILITY': 'patchPageVisibility',
            'REQUEST_ANIMATION_FRAME': 'patchRequestAnimationFrame',
            'PROGRESS': 'patchProgress',
            'RANGE_SELECTION': 'patchRangeSelection',
            'CSS3_FILTER': 'patchCSS3Filter',
            /* IE10 */
            'RESOURCE_HINTS': 'patchResourceHints',
            'DIALOG': 'patchDialog',
            'DATA_SET': 'patchDataset',
            'POINTER_EVENTS': 'patchPointerEvents',
            /* IE11 */
            'GET_USER_MEDIA': 'patchGetUserMedia',
            'CLASS_LIST': 'patchClassList',
            'CURRENT_SCRIPT': 'patchCurrentScript',
            'IE_TOUCH': 'patchIETouch',
            'POINTER_ACCURACY': 'patchPointerAccuracy',
            'CSS_SUPPORTS': 'patchCSSSupports',
            'FLEXIBILITY': 'patchFlexibility',
            'CAPTIONATOR': 'patchCaptionator',
            /* Edge */
            'PROMISE': 'patchPromise',
            'FETCH': 'patchFetch',
            'ES6': 'patchES6',
            'SEND_BEACON': 'patchSendBeacon',
            'FORM_DATA': 'patchFormData',
            'INDEXED_DB': 'patchIndexedDB',
            'METER': 'patchMeter',
            'OL_REVERSE': 'patchOlReverse',
            'FILE_SAVER': 'patchFileSaver',
            'MATHML': 'patchMathML',
            'ARIAAccessibility': 'patchARIAAccessibility',
            'PICTURE': 'patchPicture',
            'IMG_SRCSET': 'patchImgSrcset',
            'EVENT_SOURCE': 'patchEventSource',
            'FULL_SCREEN': 'patchFullScreen',
            'FONT_FACE': 'patchFontFace',
            // 'CSS_REGION':'patchCssRegion',
            // 'CSS_GRID':'patchCssGrid',
            'APNG': 'patchAPNG',
            'DATA_LIST': 'patchDatalist',
            'SET_IMMEDIATE': 'patchSetImmediate',
            /* Common */
            'FETCH_JSONP': 'patchFetchJSONP',
            'RAPHAEL': 'patchRaphael',
            'OVER_THROW': 'patchOverthrow',
            'CANGO3D': 'patchCango3D',
            'EASYXDM': 'patchEasyXDM',
            'STYLE_SCOPED': 'patchStyleScoped'
        };
    }

    ;
    // Source: src/main/frontend/js/bcs/controller/BCSCollectionViewController.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSCollectionViewController(element) {
        BCSCollectionViewController.call(this, element);
    }
    BCSCollectionViewController.extend(BCSViewController);
    // Source: src/main/frontend/js/bcs/controller/BCSNavigationController.js
    /**
     * Created by kenhuang on 2019/1/26.
     */

    var UINavigationControllerOperationEnum = exports.UINavigationControllerOperationEnum = {
        none: 'none',
        push: 'push',
        pop: 'pop'
    };

    function BCSNavigationController(rootViewController) {
        BCSViewController.call(this);
        var toolbar = new BCSToolbar();
        this.isToolbarHidden = false;
        this.toolbarItems = [];
        var navigationBar = new BCSNavigationBar();
        this.isNavigationBarHidden = false;
        this.hidesBarsOnTap = false;
        this.hidesBarsOnSwipe = false;
        this.hidesBarsWhenVerticallyCompact = false;
        var viewControllers = [];
        this.delegate = null;
        var wrapperView = new BCSView1({
            width: '100%',
            height: '100%'
        });

        this.getNavigationBar = function () {
            return navigationBar;
        };
        this.getToolbar = function () {
            return toolbar;
        };
        this.getContainerView = function () {
            return wrapperView;
        };
        this.getTopViewController = function () {
            var length = viewControllers.length;
            if (length > 0) {
                return viewControllers[viewControllers.length - 1];
            }
        };
        this.getVisibleViewController = function () {
            //todo 似乎一样
            return this.getTopViewController();
        };
        this.getViewControllers = function () {
            return viewControllers;
        };

        this.view.addSubView(wrapperView);
        this.view.addSubView(navigationBar);
        this.view.addSubView(toolbar);
        if (rootViewController) {
            this.pushViewController(rootViewController);
        }
    }
    function clearScene(navigationController, viewController, lastController, animated) {
        viewController.viewDidAppear(animated);
        viewController.view.getLayer().style.transition = '';
        if (lastController) {
            lastController.view.getLayer().style.transition = '';
            lastController.viewWillDisappear(animated);
            navigationController.getContainerView().removeSubView(lastController.view);
            lastController.viewDidDisappear(animated);
        }
    }
    function clearSceneAfterTransition(layer, navigationController, viewController, lastController, animated) {
        if (layer.style.transition) {
            layer.addEventListener('transitionend', function handleTransitionend(event) {
                if (event.target === layer) {
                    clearScene(navigationController, viewController, lastController, animated);
                    layer.removeEventListener('transitionend', handleTransitionend);
                }
            });
            return true;
        }
        return false;
    }

    function switchScene(navigationController, viewController, viewControllerInitStyle, viewControllerFinalStyle, lastController, lastControllerInitStyle, lastControllerFinalStyle, animated, isPoped) {
        animated = animated || false;
        viewController.viewWillAppear(animated);
        navigationController.getContainerView().addSubView(viewController.view);
        if (animated) {
            if (isPoped) {
                navigationController.getContainerView().addSubView(lastController.view);
            }
            viewController.view.setStyle(viewControllerInitStyle);
            if (lastController) {
                lastController.view.setStyle(lastControllerInitStyle);
            }
            setTimeout(function () {
                clearSceneAfterTransition(viewController.view.getLayer(), navigationController, viewController, lastController, animated);
                viewController.view.setStyle(viewControllerFinalStyle);
                if (lastController) {
                    lastController.view.setStyle(lastControllerFinalStyle);
                }
            }, 0);
        } else {
            /* 如果Controller上有过渡，则等待过渡完成再清空*/
            clearSceneAfterTransition(viewController.view.getLayer(), navigationController, viewController, lastController, animated) || clearSceneAfterTransition(navigationController.view.getLayer(), navigationController, viewController, lastController, animated) || clearScene(navigationController, viewController, lastController, animated);
        }
    }

    {
        BCSNavigationController.extend(BCSViewController);
        BCSNavigationController.prototype.pushViewController = function (viewController, animated) {
            var self = this;
            var viewControllers = this.getViewControllers();
            viewControllers.push(viewController);
            viewController.navigationController = this;
            var lastController = viewControllers[viewControllers.length - 2];
            switchScene(this, viewController, {
                left: '100%',
                transition: 'left 0.5s;'
            }, {
                left: '0px'
            }, lastController, {
                left: '0px',
                transition: 'left 0.5s;'
            }, {
                left: '-33%'
            }, animated);
        };

        /**
         * 不能pop rootViewController
         * @param animated
         */
        BCSNavigationController.prototype.popViewController = function (animated) {
            var viewControllers = this.getViewControllers();
            if (viewControllers.length > 1) {
                var self = this;
                var lastController = viewControllers.pop();
                var viewController = viewControllers[viewControllers.length - 1];
                switchScene(this, viewController, {
                    transition: 'left 0.5s;'
                }, {
                    left: '0px'
                }, lastController, {
                    transition: 'left 0.5s;'
                }, {
                    left: '100%'
                }, animated, true);
            }
        };

        BCSNavigationController.prototype.setToolbarItems = function (toolbarItems, animated) {};

        BCSNavigationController.prototype.popToRootViewController = function (animated) {
            var viewControllers = this.getViewControllers();
            if (viewControllers.length > 1) {
                viewControllers.splice(1, viewControllers.length - 2);
                this.popViewController(animated);
            }
        };
    }

    ;
    // Source: src/main/frontend/js/bcs/controller/BCSPageViewController.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSPageViewController(element) {
        BCSPageViewController.call(this, element);
    }
    BCSPageViewController.extend(BCSViewController);
    // Source: src/main/frontend/js/bcs/controller/BCSSearchController.js
    /**
     * Created by kenhuang on 2019/3/5.
     */

    function BCSSearchController(element) {
        BCSViewController.call(this, element);
    }
    BCSSearchController.extend(BCSViewController);
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
        var childViewControllers = [];
        var parent = null;
        var presentedViewController = null;
        var presentingViewController = null;
        if (Element.isElement(element)) {
            this.view = new BCSView(element);
        } else if (typeof element === "string") {
            this.view = BCSView.findViewById(element);
        } else {
            this.view = new BCSView1();
        }
        this.view.setStyle({ width: '100%', height: '100%' });
        this.view.getLayer().setAttribute('controller', this.getClass());
        this.getChildViewControllers = function () {
            return childViewControllers;
        };
        this.getParent = function () {
            return parent;
        };
        this.getPresentedViewController = function () {
            return presentedViewController;
        };
        this.getPresentingViewController = function () {
            return presentingViewController;
        };
    }

    {
        // 构造函数会在document.onload事件触发时调用，viewDidLoad则在window.onload事件中调用
        BCSViewController.prototype.viewDidLoad = function () {};
        BCSViewController.prototype.layoutSubViews = function () {};

        BCSViewController.prototype.viewWillAppear = function (animated) {};
        BCSViewController.prototype.viewDidAppear = function (animated) {};
        BCSViewController.prototype.viewWillDisappear = function (animated) {};
        BCSViewController.prototype.viewDidDisappear = function (animated) {};
        BCSViewController.prototype.viewWillUnload = function () {};
        BCSViewController.prototype.viewDidUnload = function () {};
        BCSViewController.prototype.addChildViewController = function (viewController) {};

        BCSViewController.prototype.insertChildViewController = function (viewControllerIndex) {};
        BCSViewController.prototype.removeFromParentViewController = function () {};

        BCSViewController.prototype.removeChildViewController = function (index) {};
        /**
         *
         * @param dataURL
         * @param errorCallback
         * @param method
         * @param data  Post所需的data，应该没用
         * @returns {*}
         */
        BCSViewController.prototype.loadPageInfo = function (dataURL, errorCallback, method, data) {
            var pageinfo,
                key = BCSViewController.key;
            if (window.name) {
                var object = JSON.parse(window.name);
                pageinfo = object[key];
                if (pageinfo) {
                    try {
                        delete object[key];
                    } catch (e) {
                        object[key] = undefined;
                    }
                    window.name = JSON.stringify(object);
                }
            }
            if (!pageinfo && dataURL) {
                method = method || window.HttpMethodEnum.GET;
                var request = new XMLHttpRequest();
                if (request !== null) {
                    /* window.location.search 用户可能输入参数 */
                    request.open(method, '' + dataURL + window.location.search, false);
                    request.onreadystatechange = function () {
                        if (request.readyState === 4) {
                            switch (request.status) {
                                case 302:
                                case 200:
                                    if (request.responseText) {
                                        pageinfo = JSON.parse(request.responseText);
                                    }
                                    break;
                                default:
                                    errorCallback && errorCallback(request.status, request.statusText);
                                    break;
                            }
                        }
                    };
                    request.send(data);
                } else {
                    throw new TypeError('XMLHttpRequest is not supported');
                }
            }
            if (pageinfo && pageinfo.title) {
                document.title = pageinfo.title;
            }
            return pageinfo;
        };

        /**
         * 1.Chrome打开新页面的瞬间,newWindow和当前window似乎共用同一个sessionStorage。此时不能设置newWindow的sessionStorage，
         * 否则会引起newWindow的sessionStorage异常。只能直接将页面数据保存在window.name下。
         * 2.Chrome在当前tab打开新页面时，ajax异步模式和Chrome插件会导致浏览器前进后退功能异常。异步模式下，Firefox,Safari浏览器必须
         * 在异步代码外使用newWindow=window.open('',WindowNameEnum.blank)创建新window。建议使用Ajax同步模式，反正要等收到服务器端的数
         * 据之后才能打开新页面。
         * 3.Safari 从页面打开另一新页面时，浏览器可以后退。切换页面之后才正常。
         * 4.字符串长度
         * 5.sessionStorage会保留同一个tab下同一个域名不同页面的信息，故为了兼容sessionStorage，window.name的内容必须保留
         *  Mac Chrome 512M  Safari 1G Firefox 128M
         *  XP Chrome 128M IE8 128M
         * @param pageInfo 含有url表示跳转页面完整路径或者相对根路径的pathname
         * @param windowName "_blank" "_self".(_parent，_top，自定义name的情况未测试，暂时无用。)
         * @param newWindow 为了和Safari浏览器兼容，在同步时，如ajax async=false可以忽略此参数。
         */
        BCSViewController.prototype.openWindow = function (pageInfo, windowName, newWindow) {
            Function.requireArgumentNumber(arguments, 2);
            Function.requireArgumentType(pageInfo, 'object');
            if (pageInfo instanceof Object) {
                var url,
                    name,
                    object,
                    WindowNameEnum = window.WindowNameEnum;
                if (pageInfo.url) {
                    url = pageInfo.url;
                } else if (pageInfo.pathname) {
                    url = location.href.replace(location.pathname, '') + pageInfo.pathname;
                } else {
                    throw new TypeError('invalid url & pathname');
                }
                windowName = windowName || WindowNameEnum.SELF;
                newWindow = newWindow || window.open('', windowName);
                if (newWindow) {
                    if (newWindow.name) {
                        object = JSON.parse(newWindow.name);
                    } else {
                        object = {};
                    }
                    object[BCSViewController.key] = pageInfo;
                    /*bluebird内部机制未知，但感觉会在调用外部函数JSON.stringify时切换以让出CPU，而非等待函数结束后再切换*/
                    name = JSON.stringify(object);
                    newWindow.name = name;
                    newWindow.location.assign(url);
                } else {
                    throw new OpenWindowException('Failed to open window.Please check if url is correct ' + // jshint ignore:line
                    'or popup new window function is blocked!');
                }
            } else {
                throw new TypeError('invalid pageinfo'); // jshint ignore:line
            }
        };
        BCSViewController.key = "$page";
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
    BCSWindowController.extend(BCSViewController);
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

            Object.prototype.deinit = function () {
                if ('delegate' in this) {
                    this.delegate = undefined;
                }
                if ('dataSource' in this) {
                    this.dataSource = undefined;
                }
                NotificationCenter["default"].removeObserver(this);
            };

            function remove(observerListMap, key, observerList, observer) {
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
                observerListMap.set(key, observerList);
            }
            /**
             * 观察者模式,KVO仅限IE9及以上的直接属性。IE9以下全部使用NotificationCenter。
             * 在构造方法中使用，observerListMap为私有属性。
             * ListMap的每一个List的第0个元素为key对应当前值。故Observer从List第1个元素开始
             * swift允许重复添加observer，即多次添加时会多次触发。每次删除只删除一次添加。
             * 与swift不同的是这里是先添加先触发，swift是后添加先触发
             * @param observerListMap
             */
            Object.prototype.enableKVO = function (observerListMap) {
                Function.requireArgumentNumber(arguments, 1);
                if (observerListMap.isKindOf(window.ListMap)) {
                    this.addObserver = function (observer, key) {
                        Function.requireArgumentNumber(arguments, 2);
                        function setter(newValue) {
                            var observerList = observerListMap.getAll(key);
                            var oldValue = observerList[0];
                            observerList[0] = newValue;
                            for (var i = 1; i < observerList.length; i++) {
                                if (typeof observerList[i].observeValueForKey === 'function') {
                                    observerList[i].observeValueForKey(this, key, oldValue, newValue);
                                }
                            }
                        }
                        function getter(key) {
                            return observerListMap.get(key)[0];
                        }
                        if (!(observer instanceof Object)) {
                            throw new TypeError('Observer must be object type.');
                        } else if (!key || typeof key !== 'string') {
                            throw new TypeError('Key must be string type.');
                        } else if (!this.hasOwnProperty(key)) {
                            throw new TypeError(this.getClass() + ' doesn\'t have such property \'' + key + '\'.');
                        }
                        if (!observerListMap.has(key)) {
                            observerListMap.append(key, this[key]);
                            /* 此时已经应用ES5补丁 */
                            if (Object.defineProperty) {
                                Object.defineProperty(this, key, {
                                    set: setter,
                                    get: getter
                                });
                            } else {
                                throw new TypeError('Object.defineProperty is not supported in this browser');
                            }
                            // else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) {
                            //     Object.prototype.__defineGetter__.call(this, key, getter);
                            //     Object.prototype.__defineSetter__.call(this, key, setter);
                            // }
                        }
                        // else{
                        //     var isAppended = false
                        //     var observerList = observerListMap.getAll(key)
                        //     for(var i = 1;i<observerList.length;i++){
                        //         if(value === observer){
                        //             isAppended = true
                        //         }
                        //         break
                        //     }
                        //     if(!isAppended){
                        //
                        //     }
                        // }
                        observerListMap.append(key, observer);
                    };

                    this.removeObserver = function (observer, key) {
                        if (key) {
                            /* 删除指定属性的指定观察者 */
                            var observerList = observerListMap.getAll(key);
                            remove(observerListMap, key, observerList, observer);
                        } else {
                            /* 删除所有属性的指定观察者 */
                            observerListMap.forEach(function (observerList, key) {
                                remove(observerListMap, key, observerList, observer);
                            });
                        }
                    };
                } else {
                    throw new TypeError('observerListMap is not ListMap type');
                }
            };

            Object.prototype.isMemberOf = function (Clazz) {
                if (typeof Clazz === 'function') {
                    if (this.__proto__) {
                        // jshint ignore:line
                        return this.__proto__ === Clazz.prototype; // jshint ignore:line
                    }
                    return this.constructor === Clazz;
                } else {
                    throw new TypeError('Clazz\'s value is not valid Class');
                }
            };

            Object.prototype.isKindOf = function (Clazz) {
                if (typeof Clazz === 'function') {
                    Function.requireArgumentNumber(arguments, 1);
                    return this instanceof Clazz;
                } else {
                    throw new TypeError('Clazz\'s value is not valid Class');
                }
            };
            Object.isPlainObject = function (object) {
                throw new TypeError('waiting to implement!');
            };

            var toString = Object.prototype.toString;
            Object.prototype.toString = function () {
                if (this.getClass) {
                    return '[object ' + this.getClass() + ']';
                } else {
                    return toString.call(this);
                }
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

            Function.requireArgumentNumber = function (args, expected) {
                if (args.length < expected) {
                    throw new TypeError(expected + ' argument required, but only ' + args.length + ' present.');
                }
            };

            Function.requireArgumentType = function (arg, type) {
                var className = type.toFirstUpperCase();
                var isFunction = window[className]['is' + className];
                var is;
                if (isFunction) {
                    is = isFunction(arg);
                } else {
                    is = arg instanceof window[className];
                    if (!is) {
                        is = (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === type;
                    }
                }
                if (!is) {
                    throw new TypeError((typeof arg === "undefined" ? "undefined" : _typeof(arg)) + " " + arg + " is not a " + type);
                }
            };
        }

        /**
         * IE6 无法对Window.prototype进行扩展
         */
        function extendWindow() {
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
            window.TypeEnum = {
                'NUMBER': 'number',
                'STRING': 'string',
                'NULL': 'null',
                'ARRAY': 'array',
                'UNDEFINED': 'undefined',
                'OBJECT': 'object',
                'FUNCTION': 'function',
                'BOOLEAN': 'boolean'

                /* 错误处理 */
            };function Exception(msg, name) {
                /* 不能使用Error.apply(this, arguments)  */
                this.message = msg;
                this.stack = new Error().stack;
                this.name = name || "Exception";
            }
            Exception.extend(Error);
            window.Exception = Exception;
            window.Error.prototype.printStackTrace = function () {
                if (this.stack) {
                    window.print(this.stack);
                } else {
                    window.console.log("No stack exists!Maybe you are using old version of IE.\n" + "name:" + this.name + "\n" + "functionName:" + this.functionName + "\n" + "lineNumber:" + this.lineNumber + "\n" + "message:" + this.message);
                }
            };
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
            if (!window.execScript) {
                // jshint ignore:line
                window.execScript = function (script, lang) {
                    // jshint ignore:line
                    if (lang && lang.toUpperCase().indexOf("VB") >= 0) {
                        throw new TypeError('VBScript is not supported in this browser');
                    }
                    window["eval"].call(window, script); // jshint ignore:line
                };
            }
            window.document.ready = function (callback) {
                if (callback) {
                    if (document.attachEvent) {
                        /* 兼容IE */
                        document.attachEvent('onreadystatechange', function handleReadyStateChange() {
                            if (document.readyState === "complete") {
                                document.detachEvent("onreadystatechange", handleReadyStateChange);
                                callback();
                            }
                        });
                    } else if (document.addEventListener) {
                        /* 兼容FF,Google */
                        document.addEventListener('DOMContentLoaded', function handleDOMContentLoaded() {
                            document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded, false);
                            callback();
                        }, false);
                    } else if (document.lastChild === document.body) {
                        callback();
                    }
                }
            };
        }
        function extendString() {
            /* 会被cssSandpaper覆盖 */
            if (!String.prototype.trim) {
                String.prototype.trim = function () {
                    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
                };
            }
            if (!String.prototype.toFirstUpperCase) {
                String.prototype.toFirstUpperCase = function () {
                    return this.charAt(0).toUpperCase() + this.slice(1);
                };
            }
            if (!String.prototype.startsWith) {
                String.prototype.startsWith = function (searchString, position) {
                    position = position === undefined ? 0 : Number(position);
                    if (position < 0) {
                        position = 0;
                    }
                    return this.indexOf(String(searchString)) === position;
                };
                String.prototype.endsWith = function (searchString, position) {
                    var index = this.indexOf(String(searchString));
                    if (index === -1) {
                        return false;
                    }
                    position = position === undefined ? this.length : Number(position);
                    if (position < 0) {
                        position = 0;
                    }
                    return index + searchString.length === position;
                };
            }
            //获取/设置cookie
            if (!String.prototype.get) {
                String.prototype.get = function (name) {
                    Function.requireArgumentNumber(arguments, 1);
                    var array = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
                    if (array !== null) {
                        return decodeURIComponent(array[2]);
                    }
                    return null;
                };

                String.prototype.set = function (name, value, seconds, domain, path) {
                    Function.requireArgumentNumber(arguments, 2);
                    var expires = new Date();
                    value = value || '';
                    seconds = seconds || -2592000;
                    domain = domain || document.domain;
                    if (value === null || seconds <= 0) {
                        value = '';
                        seconds = -2592000;
                    }
                    if (!isNaN(seconds)) {
                        expires.setTime(expires.getTime() + seconds * 1000);
                    }
                    document.cookie = name + '=' + encodeURIComponent(value) + (expires ? '; expires=' + expires.toGMTString() : '') + '; path=' + path + (domain ? '; domain=' + domain : '');
                };
            }
            String.isString = function (any) {
                Function.requireArgumentNumber(arguments, 1);
                if (any instanceof Object) {
                    return any.isKindOf(String);
                } else {
                    return Object.prototype.toString.call(any) === '[object String]';
                }
            };
            String.prototype.byteLength = function () {
                var length = 0;
                for (var i = 0; i < this.length; i++) {
                    if (this.charCodeAt(i) > 127 || this.charCodeAt(i) < 0) {
                        length += 2;
                    } else {
                        length++;
                    }
                }
                return length;
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
                Function.requireArgumentNumber(arguments, 1);
                var index = this.indexOf(element);
                if (index > -1) {
                    return this.splice(index, 1);
                }
            };
        }

        function extendOthers() {
            if (!window.Element) {
                window.Element = function () {};
            }
            Element.isElement = function (object) {
                Function.requireArgumentNumber(arguments, 1);
                return object instanceof Object && object.nodeType === 1;
            };
        }
        function extendNumber() {
            if (!Number.isNumber) {
                Number.isNumber = function (any) {
                    Function.requireArgumentNumber(arguments, 1);
                    if (any instanceof Object) {
                        return any.isKindOf(Number);
                    } else {
                        return Object.prototype.toString.call(any) === '[object Number]';
                    }
                };
            }
        }

        function extendCollections() {
            /* jshint ignore:start */
            function Iterator(array) {
                var index = 0;
                this.next = function () {
                    if (index < array.length) {
                        return { done: false, value: array[index++] };
                    } else {
                        return { done: true, value: undefined };
                    }
                };
            }
            if (!window.Map && !window.Set) {
                var transformValue = function transformValue(value) {
                    if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === 'object') {
                        if (value.isKindOf(Symbol)) {
                            throw new TypeError('Cannot convert a Symbol value to a string');
                        } else {
                            return value.toString();
                        }
                    } else if (value === undefined) {
                        return '';
                    } else {
                        return String(value);
                    }
                };

                var map = new Map();
                var isConstructor = false;

                window.Symbol = function _Symbol(value) {
                    if (isConstructor) {
                        var timestamp = String(+new Date());
                        value = transformValue(value);
                        this.toString = function () {
                            if (value) {
                                return 'Symbol(' + value + ')@' + timestamp;
                            }
                            return 'Symbol()@' + timestamp;
                        };
                        isConstructor = false;
                    } else {
                        if (this.constructor === _Symbol) {
                            throw new TypeError('Symbol is not a constructor');
                        }
                        isConstructor = true;
                        return new _Symbol(value);
                    }
                };

                {
                    Symbol["for"] = function (key) {
                        var symbol;
                        if (key === undefined) {
                            key = 'undefined';
                        } else {
                            key = transformValue(key);
                        }
                        if (map.has(key)) {
                            return map.get(key);
                        }
                        symbol = Symbol(key);
                        map.set(key, symbol);
                        return symbol;
                    };
                    Symbol.keyFor = function (symbol) {
                        if (!symbol.isMemberOf(Symbol)) {
                            throw new TypeError((typeof symbol === "undefined" ? "undefined" : _typeof(symbol)) + ' is not a symbol');
                        }
                        var entry,
                            entries = map.entries();
                        while (!(entry = entries.next()).done) {
                            if (entry.value[1] === symbol) {
                                return entry.value[0];
                            }
                        }
                        return undefined;
                    };

                    // Symbol.iterator = Symbol('Symbol.iterator')
                }

                /**
                 * Map的key，value可以是任意数据类型，故无须做参数判断
                 * @constructor
                 */
                window.Map = function Map(iterable) {
                    var items = [];
                    this.clear = function () {
                        items = [];
                    };
                    this['delete'] = function (key) {
                        var i = items.findIndex(function (item) {
                            return item[0] === key;
                        });
                        if (i >= 0) {
                            items.splice(i, 1);
                            return true;
                        }
                        return false;
                    };

                    this.get = function (key) {
                        var item = items.find(function (item) {
                            return item[0] === key;
                        });
                        if (item) {
                            return item[1];
                        }
                        return undefined;
                    };
                    /* Map可以存放undefined。通过get方法会漏掉undefined */
                    this.has = function (key) {
                        return items.some(function (item) {
                            return item[0] === key;
                        });
                    };

                    this.set = function (key, value) {
                        var item = items.find(function (item) {
                            return item[0] === key;
                        });
                        if (item) {
                            item[1] = value;
                        } else {
                            items.push([key, value]);
                        }
                        return this;
                    };

                    this.getSize = function () {
                        return items.length;
                    };
                    this.keys = function () {
                        return new MapIterator(items.slice(), 'keys');
                    };

                    this.values = function () {
                        return new MapIterator(items.slice(), 'values');
                    };
                    this.entries = function () {
                        return new MapIterator(items.slice(), 'entries');
                    };

                    if (iterable) {
                        if (iterable instanceof Object && iterable[Symbol.iterator]) {
                            var iterator = iterable[Symbol.iterator]();
                            var entry, nextResult;
                            while (true) {
                                nextResult = iterator.next();
                                if (nextResult.done) {
                                    break;
                                } else {
                                    entry = nextResult.value;
                                    if (entry.isKindOf(Object)) {
                                        if (Array.isArray(entry)) {
                                            /* 不需要判断数组长度 */
                                            this.set(entry[0], entry[1]);
                                        } else {
                                            this.set();
                                        }
                                    } else {
                                        throw new TypeError('Iterator value ' + entry + ' is not an entry object');
                                    }
                                }
                            }
                        } else {
                            throw new TypeError((typeof iterable === "undefined" ? "undefined" : _typeof(iterable)) + ' ' + iterable + ' is not iterable (cannot read property ' + 'Symbol(Symbol.iterator))');
                        }
                    }
                };
                {
                    var keepKey = function keepKey(item) {
                        item.value = item.value[0];
                        return item;
                    };

                    var keepValue = function keepValue(item) {
                        item.value = item.value[1];
                        return item;
                    };

                    var keepEntry = function keepEntry(item) {
                        return item;
                    };

                    var _MapIterator = function _MapIterator(array, kind) {
                        Iterator.call(this, array);
                        var superNext = this.next;
                        var handler = MapIteratorKindEnum[kind];
                        this.next = function () {
                            return handler(superNext.call(this, array));
                        };
                    };

                    var MapIteratorKindEnum = {
                        'keys': keepKey,
                        'values': keepValue,
                        'entries': keepEntry
                    };

                    _MapIterator.extend(Iterator);
                    Map.prototype.forEach = function (callback, thisArg) {
                        Function.requireArgumentType(callback, window.TypeEnum.FUNCTION);
                        var entries = this.entries();
                        var entry;
                        while (entry = entries.next().value) {
                            callback.call(thisArg, entry[1], entry[0], this);
                        }
                    };
                    Map.prototype[Symbol.iterator] = Map.prototype.entries;
                }

                window.WeakMap = function (iterable) {
                    var map = new Map();
                    this['delete'] = function (key) {
                        if (key instanceof Object) {
                            return map['delete'](key);
                        }
                        return false;
                    };
                    this.get = map.get;
                    this.has = map.has;
                    this.set = function (key, value) {
                        if (key instanceof Object) {
                            map.set(key, value);
                        } else {
                            throw new TypeError('Invalid value used as weak map key');
                        }
                        return this;
                    };
                    if (iterable) {
                        if (iterable instanceof Object && iterable[Symbol.iterator]) {
                            var iterator = iterable[Symbol.iterator]();
                            var entry, nextResult;
                            while (true) {
                                nextResult = iterator.next();
                                if (nextResult.done) {
                                    break;
                                } else {
                                    entry = nextResult.value;
                                    if (entry.isKindOf(Object)) {
                                        if (Array.isArray(entry) && entry[0] && entry[0] instanceof Object) {
                                            /* 不需要判断数组长度 */
                                            this.set(entry[0], entry[1]);
                                        } else {
                                            throw new TypeError('Invalid value used as weak map key');
                                        }
                                    } else {
                                        throw new TypeError('Iterator value ' + entry + ' is not an entry object');
                                    }
                                }
                            }
                        } else {
                            throw new TypeError((typeof iterable === "undefined" ? "undefined" : _typeof(iterable)) + '' + iterable + ' is not iterable (cannot read property ' + 'Symbol(Symbol.iterator))');
                        }
                    }
                };

                window.Set = function (iterable) {
                    var map = new Map();
                    this.add = function (value) {
                        map.set(value, value);
                        return this;
                    };
                    this.clear = map.clear;
                    this['delete'] = map['delete'];
                    this.has = map.has;
                    this.getSize = map.getSize;
                    this.entries = function () {
                        return new SetIterator(map.entries());
                    };
                    this.values = function () {
                        return new SetIterator(map.values());
                    };
                    this.keys = this.values;
                    if (iterable) {
                        if (iterable instanceof Object && iterable[Symbol.iterator]) {
                            var iterator = iterable[Symbol.iterator]();
                            var nextResult;
                            while (true) {
                                nextResult = iterator.next();
                                if (nextResult.done) {
                                    break;
                                } else {
                                    map.set(nextResult.value, nextResult.value);
                                }
                            }
                        } else {
                            throw new TypeError((typeof iterable === "undefined" ? "undefined" : _typeof(iterable)) + ' ' + iterable + ' is not iterable (cannot read property ' + 'Symbol(Symbol.iterator))');
                        }
                    }
                };
                {
                    var _SetIterator = function _SetIterator(mapIterator) {
                        this.next = function () {
                            return mapIterator.next();
                        };
                    };

                    _SetIterator.extend(Iterator);
                    Set.prototype.forEach = Map.prototype.forEach;
                    Set.prototype[Symbol.iterator] = Set.prototype.values;
                }

                window.WeakSet = function (iterable) {
                    var set = new Set();
                    this.add = function (value) {
                        if (value instanceof Object) {
                            set.add(value);
                            return this;
                        } else {
                            throw new TypeError('Invalid value used in weak set');
                        }
                    };
                    this['delete'] = set['delete'];
                    this.has = set.has;
                    if (iterable) {
                        if (iterable instanceof Object && iterable[Symbol.iterator]) {
                            var iterator = iterable[Symbol.iterator]();
                            var nextResult;
                            while (true) {
                                nextResult = iterator.next();
                                if (nextResult.done) {
                                    break;
                                } else {
                                    if (nextResult.value instanceof Object) {
                                        set.add(nextResult.value);
                                    } else {
                                        throw new TypeError('Invalid value used in weak set');
                                    }
                                }
                            }
                        } else {
                            throw new TypeError((typeof iterable === "undefined" ? "undefined" : _typeof(iterable)) + '' + iterable + ' is not iterable (cannot read property ' + 'Symbol(Symbol.iterator))');
                        }
                    }
                };
            }
            window.ListMap = function (iterable) {
                var list,
                    map = new Map();
                this.append = function (key, value) {
                    var list = map.get(key);
                    if (!list) {
                        list = [];
                        map.set(key, list);
                    }
                    list.push(value);
                    return this;
                };
                this['delete'] = function (key) {
                    return map['delete'](key);
                };
                this.get = function (key) {
                    list = map.get(key);
                    return list ? list[0] : undefined;
                };
                this.getAll = function (key) {
                    list = map.get(key);
                    return list ? list.slice(0) : [];
                };

                this.has = function (key) {
                    return map.has(key);
                };
                this.set = function (key, value) {
                    return map.set(key, [value]);
                };
                this.entries = function () {
                    return new ListMapIterator(map.entries());
                };
                this.values = function () {
                    return new ListMapIterator(map.values());
                };
                this.keys = function () {
                    return new ListMapIterator(map.keys());
                };

                if (iterable) {
                    if (iterable instanceof Object && iterable[Symbol.iterator]) {
                        var iterator = iterable[Symbol.iterator]();
                        var entry, nextResult;
                        while (true) {
                            nextResult = iterator.next();
                            if (nextResult.done) {
                                break;
                            } else {
                                entry = nextResult.value;
                                if (entry.isKindOf(Object)) {
                                    if (Array.isArray(entry)) {
                                        /* 不需要判断数组长度 */
                                        if (Array.isArray(entry[1])) {
                                            this.set(entry[0], entry[1]);
                                        } else {
                                            this.set(entry[0], [entry[1]]);
                                        }
                                    } else {
                                        this.set();
                                    }
                                } else {
                                    throw new TypeError('Iterator value ' + entry + ' is not an entry object');
                                }
                            }
                        }
                    } else {
                        throw new TypeError((typeof iterable === "undefined" ? "undefined" : _typeof(iterable)) + '' + iterable + ' is not iterable (cannot read property ' + 'Symbol(Symbol.iterator))');
                    }
                }
            };
            {
                var _ListMapIterator = function _ListMapIterator(mapIterator) {
                    SetIterator.call(this, mapIterator);
                };

                _ListMapIterator.extend(Iterator);
                ListMap.prototype.forEach = Map.prototype.forEach;
            }

            window.SetMap = function (iterable) {
                var set,
                    map = new Map();
                this.append = function (key, value) {
                    var set = map.get(key);
                    if (!set) {
                        set = new Set();
                        map.set(key, set);
                    }
                    set.add(value);
                    return this;
                };
                this['delete'] = function (key) {
                    return map['delete'](key);
                };
                this.get = function (key) {
                    set = map.get(key);
                    return set ? set.values().next().value : null;
                };

                this.getAll = function (key) {
                    return map.get(key);
                };

                this.has = function (key) {
                    return map.has(key);
                };
                this.set = function (key, value) {
                    return map.set(key, new Set([value]));
                };
                this.entries = function () {
                    return new SetMapIterator(map.entries());
                };
                this.values = function () {
                    return new SetMapIterator(map.values());
                };
                this.keys = function () {
                    return new SetMapIterator(map.keys());
                };
                if (iterable) {
                    if (iterable instanceof Object && iterable[Symbol.iterator]) {
                        var iterator = iterable[Symbol.iterator]();
                        var entry, nextResult;
                        while (true) {
                            nextResult = iterator.next();
                            if (nextResult.done) {
                                break;
                            } else {
                                entry = nextResult.value;
                                if (entry.isKindOf(Object)) {
                                    if (Array.isArray(entry)) {
                                        /* 不需要判断数组长度 */
                                        if (entry[1].isKindOf(Set)) {
                                            this.set(entry[0], entry[1]);
                                        } else {
                                            this.set(entry[0], new Set([entry[1]]));
                                        }
                                    } else {
                                        this.set();
                                    }
                                } else {
                                    throw new TypeError('Iterator value ' + entry + ' is not an entry object');
                                }
                            }
                        }
                    } else {
                        throw new TypeError((typeof iterable === "undefined" ? "undefined" : _typeof(iterable)) + '' + iterable + ' is not iterable (cannot read property ' + 'Symbol(Symbol.iterator))');
                    }
                }
            };
            {
                var _SetMapIterator = function _SetMapIterator(mapIterator) {
                    SetIterator.call(this, mapIterator);
                };

                _SetMapIterator.extend(Iterator);
                SetMap.prototype.forEach = Map.prototype.forEach;
            }
            /* jshint ignore:end */
        }

        this.apply = function () {
            extendObject();
            extendFunction();
            extendWindow();
            extendString();
            extendArray();
            extendNumber();
            extendOthers();
            extendCollections();
        };

        this.applyMobile = function () {
            if (!Event) {
                window.Event = function Event() {
                    throw new TypeError('This browser doesn\'t support instantiation of class Event');
                };
            }
            window.EventTypeEnum = {
                'TOUCH_START': 'touchstart',
                'TOUCH_MOVE': 'touchmove',
                'TOUCH_END': 'touchend',
                'TOUCH_CANCEL': 'touchcancel',
                'values': ['touchstart', 'touchmove', 'touchend', 'touchcancel']
            };
        };
    }

    ;
    // Source: src/main/frontend/js/bcs/model/NotificationCenter.js
    /**
     * Created by kenhuang on 2019/1/25.
     */
    /**
     * 按照队列的顺序进行响应。可以重复添加，多次响应。
     * @constructor
     */
    var singleton = new NotificationCenter();
    function NotificationCenter() {
        if (singleton) {
            throw new TypeError(this.getClass() + ' could be instantiated only once!');
        }
        var observerList = [];
        /**
         *
         * @param observer 观察者
         * @param selector 观察者响应方法
         * @param name     消息, null表示接收任意的消息
         * @param object   发送者，null表示接收所有发送者发送的消息
         */
        this.addObserver = function (observer, selector, name, object) {
            Function.requireArgumentNumber(arguments, 3);
            name = name || null;
            object = object || null;
            if ((typeof observer === "undefined" ? "undefined" : _typeof(observer)) !== "object" || typeof selector !== "function" || typeof name !== "string" && name !== null || (typeof object === "undefined" ? "undefined" : _typeof(object)) !== "object" && object !== null) {
                throw new TypeError('Invalid parameters.');
            }
            observerList.push({
                observer: observer,
                selectors: selector,
                name: name,
                object: object
            });
        };

        this.post = function (name, object, userInfo) {
            Function.requireArgumentNumber(arguments, 1);
            object = object || null;
            if (typeof name === 'string') {
                if (observerList) {
                    for (var i = 0; i < observerList.length; i++) {
                        if ((observerList[i].name === name || observerList[i].name === null) && (observerList[i].object === object || observerList[i].object === null)) {
                            try {
                                observerList[i].selectors({
                                    name: name,
                                    object: object,
                                    userInfo: userInfo
                                });
                            } catch (e) {
                                e.printStackTrace();
                            }
                        }
                    }
                }
            } else {
                throw new TypeError('Variable \'name\' must be string type');
            }
        };

        this.removeObserver = function (observer, name, object) {
            Function.requireArgumentNumber(arguments, 1);
            for (var i = observerList.length - 1; i >= 0; i--) {
                if ((!name || name === observerList[i]) && (!object || object === observerList[i])) {
                    observerList.splice(i, 1);
                }
            }
        };
    }
    NotificationCenter['default'] = singleton;
    // Source: src/main/frontend/js/bcs/view/BCSBarButtonItem.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSBarItem() {
        this.isEnabled = true;
        this.title = '';
        this.image = '';
        this.landscapeImagePhone = '';
        this.largeContentSizeImage = '';
        this.imageInsets = null;
        this.landscapeImagePhoneInsets = null;
        this.largeContentSizeImageInsets = null;
        this.tag = 0;
    }
    {
        BCSBarItem.prototype.setTitleTextAttributes = function (attributes, state) {};
        BCSBarItem.prototype.titleTextAttributes = function (state) {};
    }

    function BCSBarButtonItem(element) {
        BCSView.call(this, element);
    }
    BCSBarButtonItem.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSButton.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSButton(style) {
        BCSView1.call(this, style, 'button');
        var titleLabel = new BCSLabel();
        var imageView = new BCSImageView();
        this.addSubView(titleLabel);
        this.addSubView(imageView);

        this.getTitleLabel = function () {
            return titleLabel;
        };
        this.getImageView = function () {
            return imageView;
        };
    }
    {
        BCSButton.extend(BCSView);
        BCSButton.prototype.addTarget = function (target, action, controlEvents) {};
        BCSButton.prototype.removeTarget = function (target, action, controlEvents) {};
    }
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

    function BCSCollectionView(element) {
        BCSView.call(this, element);
    }
    BCSCollectionView.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSCollectionViewCell.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSCollectionViewCell(element) {
        BCSView.call(this, element);
    }
    BCSCollectionViewCell.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSDatePicker.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSDatePicker(element) {
        BCSView.call(this, element);
    }
    BCSDatePicker.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSGestureRecognizer.js
    /**
     * Created by kenhuang on 2019/3/12.
     */

    var BCSGestureRecognizerStateEnum = exports.BCSGestureRecognizerStateEnum = {
        // 识别器还没有识别出它的手势(状态)(Possible)，但是可能计算触摸事件。这是默认状态
        POSSIBLE: 0,
        // 识别器已经接收识别为此手势(状态)的触摸(Began)。在下一轮run循环中，响应方法将会被调用。
        BEGAN: 1,
        // 识别器已经接收到触摸，并且识别为手势改变(Changed)。在下一轮run循环中，响应方法将会被调用。
        CHANGED: 2,
        // 识别器已经接收到触摸，并且识别为手势结束(Ended)。在下一轮run循环中，响应方法将会被调用并且识别器将会被重置到UIGestureRecognizerStatePossible状态。
        ENDED: 3,
        // 识别器已经接收到触摸，这种触摸导致手势取消(Cancelled)。在下一轮run循环中，响应方法将会被调用。识别器将会被重置到UIGestureRecognizerStatePossible状态。
        CANCELLED: 4,
        FAILED: 5
        //更改请注意，部分条件判断使用 ">" "<"而非使用"==="
    };

    var defaults = {
        /*可以当作连续敲击的最长时间间隔*/
        onInterval: 750,
        offInterval: 350,
        /*在屏幕上允许的最大偏移量*/
        offsetThreshold: 45,
        /*最多5根手指在屏幕上,超过会被cancel*/
        touchesThreshold: 5,
        /*扫屏时判定手势所需的移动距离*/
        swipeOffsetThreshold: 75,
        /*扫屏时最长持续时间*/
        swipeMaxDuration: 500,
        /*确定为缩放的中心点最小移动距离*/
        panMinOffset: 4

        /**
         * BCSGestureRecognizer可以存放同一个target的不同action，不同target可能有相同的action名
         * iOS event.allTouches会一直存在，touches表示触发当前事件的touches。
         * 不同event的相同identifier的touch可能不是同一个对象（几乎是100%确定）
         * 前端event
         * 　touches：当前屏幕上所有触摸点的列表;
         *   targetTouches：当前对象上所有触摸点的列表
         *   changedTouches：涉及当前(引发)事件的触摸点的列表
         * 多用一根手指触摸会再次触发touchstart事件，只要有手指抬起就触发touchend
         * 故按照iOS API，target为对象，action为方法指针而非名称
         * @param target
         * @param action
         * @constructor
         */
    };function BCSGestureRecognizer(target, action) {
        Function.requireArgumentType(target, 'object');
        Function.requireArgumentType(action, 'function');
        var key = Symbol();
        this.getKey = function () {
            return key;
        };
        gestureRecognizerMap[key] = {
            actionMap: new Map(),
            view: null,
            /*手势识别器本次识别应该考虑的touch (identifier:touch),按照identifier排序*/
            availableTouches: {},
            dependentSet: new Set()
        };
        this.state = BCSGestureRecognizerStateEnum.POSSIBLE;
        this.delegate = null;
        this.isEnabled = true;
        this.cancelsTouchesInView = true;
        this.delaysTouchesBegan = false;
        this.delaysTouchesEnded = true;
        this.allowedTouchTypes = [];
        // this.allowedPressTypes = []
        this.requiresExclusiveTouchType = true;
        this.name = this.getClass();
        this.addTarget(target, action);
    }

    var gestureRecognizerMap = {};
    var prototype = BCSGestureRecognizer.prototype;
    prototype.reset = function () {
        var data = gestureRecognizerMap[this.getKey()];
        data.availableTouches = {};
        data.dependentSet = new Set();
    };
    //本识别器失败后，dependent才能继续识别
    prototype.addDependent = function (dependent) {
        gestureRecognizerMap[this.getKey()].dependentSet.add(dependent);
    };
    prototype.hasDependent = function (dependent) {
        return gestureRecognizerMap[this.getKey()].dependentSet.has(dependent);
    };

    prototype.ignoreAvailableTouches = function () {
        var data = gestureRecognizerMap[this.getKey()],
            availableTouches = data.availableTouches;
        for (var identifier in availableTouches) {
            if (availableTouches.hasOwnProperty(identifier)) {
                this.ignore(availableTouches[identifier], data.event);
            }
        }
    };

    prototype.ignore = function (touch, event) {
        delete gestureRecognizerMap[this.getKey()].availableTouches[touch.identifier];
    };

    /* number of touches involved for which locations can be queried */
    prototype.getNumberOfTouches = function () {
        return Object.keys(gestureRecognizerMap[this.getKey()].availableTouches).length;
    };

    prototype.hasAvailableTouch = function (touch) {
        return gestureRecognizerMap[this.getKey()].availableTouches.hasOwnProperty(touch.identifier);
    };

    prototype.removeAvailableTouches = function (touches) {
        var availableTouches = gestureRecognizerMap[this.getKey()].availableTouches;
        if (touches) {
            for (var i = 0; i < touches.length; i++) {
                delete availableTouches[touches[i].identifier];
            }
        } else {
            gestureRecognizerMap[this.getKey()].availableTouches = {};
        }
    };

    /**
     * 手势在view中的大概位置，通常是中心点
     * @param view
     * @returns {{}}
     */
    prototype.locate = function (view) {
        var touches = gestureRecognizerMap[this.getKey()].availableTouches,
            length = Object.keys(touches).length;
        if (view && length > 0) {
            var averageX = 0,
                averageY = 0;
            for (var identifier in touches) {
                if (touches.hasOwnProperty(identifier)) {
                    averageX += touches[identifier].pageX;
                    averageY += touches[identifier].pageY;
                }
            }
            return new BCSPoint(averageX / length - view.getStyle('left'), averageY / length - view.getStyle('top'));
        } else {
            return new BCSPoint();
        }
    };
    /**
     * 指定的touch在view中的位置
     * @param index
     * @param view
     * @returns {{}}
     */
    prototype.locateTouch = function (index, view) {
        var touches = gestureRecognizerMap[this.getKey()].availableTouches;
        if (view && index >= 0) {
            var key = Object.keys(touches)[index];
            if (key) {
                return new BCSPoint(touches[key].pageX - view.getStyle('left'), touches[key].pageY - view.getStyle('top'));
            } else {
                throw new TypeError('Index out of bounds');
            }
        } else {
            throw new Error('Could not locate touch.');
        }
    };

    prototype.require = function (otherGestureRecognizer) {};

    prototype.canPrevent = function (preventingGestureRecognizer) {
        return true;
    };

    prototype.canBePrevented = function (preventedGestureRecognizer) {
        return true;
    };

    prototype.shouldRequireFailure = function (otherGestureRecognizer) {
        return false;
    };

    prototype.shouldBeRequiredToFail = function (otherGestureRecognizer) {
        return false;
    };
    prototype.addTarget = function (target, action) {
        var actionMap = gestureRecognizerMap[this.getKey()].actionMap;
        if (target && action) {
            Function.requireArgumentType(target, 'object');
            Function.requireArgumentType(action, 'function');
            actionMap.set(action, target);
        }
    };

    prototype.removeTarget = function (target, action) {
        var actionMap = gestureRecognizerMap[this.getKey()].actionMap;
        if (action) {
            actionMap["delete"](action);
        } else if (target) {
            actionMap.forEach(function (value, key) {
                if (value === target) {
                    actionMap["delete"](key);
                }
            });
        } else {
            actionMap.clear();
        }
    };

    prototype.getView = function () {
        return gestureRecognizerMap[this.getKey()].view;
    };

    prototype.setView = function (newView) {
        Function.requireArgumentType(newView, 'BCSView');
        gestureRecognizerMap[this.getKey()].view = newView;
    };

    prototype.executeActions = function () {
        var actionMap = gestureRecognizerMap[this.getKey()].actionMap;
        actionMap.forEach(function (target, action) {
            action.call(target, this);
        });
    };

    function refreshAvailableTouches(self, touches, isStrict) {
        var availableTouches = gestureRecognizerMap[self.getKey()].availableTouches;
        for (var i = 0; i < touches.length; i++) {
            if (isStrict) {
                if (availableTouches.hasOwnProperty(touches[i].identifier)) {
                    availableTouches[touches[i].identifier] = touches[i];
                }
            } else {
                availableTouches[touches[i].identifier] = touches[i];
            }
        }
    }
    prototype.touchesBegan = function (touches, event) {
        refreshAvailableTouches(this, touches);
    };
    prototype.touchesMoved = function (touches, event) {
        refreshAvailableTouches(this, touches, true);
    };
    prototype.touchesEnded = function (touches, event) {
        refreshAvailableTouches(this, touches, true);
    };
    prototype.touchesCancelled = function (touches, event) {
        this.state = BCSGestureRecognizerStateEnum.CANCELLED;
    };

    prototype.deinit = function () {
        Object.prototype.deinit.call(this);
        try {
            delete gestureRecognizerMap[this.getKey()];
        } catch (e) {
            gestureRecognizerMap[this.getKey()] = undefined;
        }
    };
    // Source: src/main/frontend/js/bcs/view/BCSImageView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSImageView(style, imageSrc) {
        BCSView1.call(this, style, 'img');
        if (imageSrc) {
            this.getLayer().src = imageSrc;
        }
        //todo animation
    }
    BCSImageView.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSLabel.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSLabel(style) {
        BCSView1.call(this, style);
        var element = this.getLayer();
        this.setText = function (text) {
            if ('innerText' in element) {
                element.innerText = text;
            } else {
                element.textContent = text;
            }
        };
    }
    {
        BCSLabel.extend(BCSView);
    }
    ;
    // Source: src/main/frontend/js/bcs/view/BCSLongPressGestureRecognizer.js
    /**
     * Created by kenhuang on 2019/3/12.
     */

    /**
     * 未达到numberOfTapsRequired和numberOfTouchesRequired条件时，getNumberOfTouches一直为0
     * 满足后即可改变，但此时state仍为0。长按期间不允许大幅度移动
     * 允许移动期间触发长按，长按触发后（state=1）第一次touchend就触发事件
     * @param target
     * @param action
     * @constructor
     */
    function BCSLongPressGestureRecognizer(target, action) {
        BCSGestureRecognizer.call(this, target, action);
        // Default is 0. The number of full taps required before the press for gesture to be recognized
        this.numberOfTapsRequired = 0;
        this.numberOfTouchesRequired = 1;
        //秒为单位
        this.minimumPressDuration = 0.5;
        this.allowableMovement = 10;
        longPressGestureRecognizerMap[this.getKey()] = {
            numberOfContinualTaps: 0,
            /*第一次点击时的位置即基准位置，或者长按的基准位置。两个位置可以不同*/
            initTapStartLocation: new BCSPoint(),
            currentTouchBeganTimeStamp: 0,
            numberOfOffTouches: 0,
            isAvailableTouchesRemovable: false,
            timer: undefined
        };
    }

    var longPressGestureRecognizerMap = {};
    BCSLongPressGestureRecognizer.extend(BCSGestureRecognizer);
    var prototype = BCSLongPressGestureRecognizer.prototype;
    prototype.getNumberOfTouches = function () {
        return BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired && longPressGestureRecognizerMap[this.getKey()].numberOfContinualTaps === this.numberOfTapsRequired ? this.numberOfTouchesRequired : 0;
    };

    prototype.locate = function (view) {
        if (this.getNumberOfTouches() > 0) {
            return BCSGestureRecognizer.locate(view);
        } else {
            return new BCSPoint(-view.getStyle('left'), -view.getStyle('top'));
        }
    };

    prototype.locateTouch = function (index, view) {
        if (this.getNumberOfTouches() > 0) {
            return BCSGestureRecognizer.prototype.locateTouch(index, view);
        } else {
            return BCSGestureRecognizer.prototype.locateTouch(-1, view);
        }
    };
    prototype.reset = function () {
        BCSGestureRecognizer.prototype.reset.call(this);
        var data = longPressGestureRecognizerMap[this.getKey()];
        data.numberOfContinualTaps = 0;
        data.initTapStartLocation = new BCSPoint();
        data.currentTouchBeganTimeStamp = 0;
        data.numberOfOffTouches = 0;
        data.isAvailableTouchesRemovable = false;
        clearTimeout(data.timer);
        data.timer = undefined;
    };

    prototype.shouldRequireFailureOf = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSLongPressGestureRecognizer) && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSLongPressGestureRecognizer) && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    function startTimer(self, data, interval) {
        data.timer = setTimeout(function () {
            self.state = BCSGestureRecognizerStateEnum.FAILED;
            self.ignoreAvailableTouches();
            self.reset();
            console.log('reset');
        }, interval);
    }
    /**
     * touches不一定同时进来
     * @param touches
     * @param event
     */
    prototype.touchesBegan = function (touches, event) {
        var data = longPressGestureRecognizerMap[this.getKey()];
        if (this.state !== BCSGestureRecognizerStateEnum.BEGAN && this.state !== BCSGestureRecognizerStateEnum.CHANGED) {
            if (touches.length + BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) <= this.numberOfTouchesRequired) {
                if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === 0) {
                    /*停止连续敲击倒计时并开始新一轮敲击计时*/
                    data.timer = clearTimeout(data.timer);
                    data.currentTouchBeganTimeStamp = event.timeStamp;
                    data.isAvailableTouchesRemovable = false;
                    this.state = BCSGestureRecognizerStateEnum.POSSIBLE;
                    if (longPressGestureRecognizerMap[this.getKey()].numberOfContinualTaps < this.numberOfTapsRequired) {
                        startTimer(this, data, defaults.onInterval);
                    }
                }
                BCSGestureRecognizer.prototype.touchesBegan.call(this, touches, event);
                if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired) {
                    if (longPressGestureRecognizerMap[this.getKey()].numberOfContinualTaps < this.numberOfTapsRequired) {
                        if (data.numberOfContinualTaps === 0) {
                            data.initTapStartLocation = BCSGestureRecognizer.prototype.locate.call(this, this.getView().window);
                        } else {
                            /* 检查本次触点和第一次触点距离是否过大*/
                            if (data.initTapStartLocation.distanceFrom(BCSGestureRecognizer.prototype.locate.call(this, this.getView().window)) > defaults.offsetThreshold) {
                                data.timer = clearTimeout(data.timer);
                                this.state = BCSGestureRecognizerStateEnum.FAILED;
                                return;
                            }
                        }
                        data.timer = clearTimeout(data.timer);
                        startTimer(this, data, defaults.onInterval * 2 - event.timeStamp + data.currentTouchBeganTimeStamp);
                    } else {
                        /*开始长按*/
                        data.currentTouchBeganTimeStamp = event.timeStamp;
                        data.initTapStartLocation = BCSGestureRecognizer.prototype.locate.call(this, this.getView().window);
                        data.timer = setTimeout(function () {
                            this.state = BCSGestureRecognizerStateEnum.BEGAN;
                            this.getView().executeStateChangedRecognizers([this]);
                        }.bind(this), this.minimumPressDuration * 1000);
                    }
                }
            } else {
                data.timer = clearTimeout(data.timer);
                this.state = BCSGestureRecognizerStateEnum.FAILED;
            }
        } else {
            for (var i = 0; i < touches.length; i++) {
                this.ignore(touches[i], event);
            }
        }
    };

    prototype.touchesMoved = function (touches, event) {
        var data = longPressGestureRecognizerMap[this.getKey()];
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired) {
            if (longPressGestureRecognizerMap[this.getKey()].numberOfContinualTaps < this.numberOfTapsRequired) {
                if (event.targetTouches.length < this.numberOfTouchesRequired || data.initTapStartLocation.distanceFrom(BCSGestureRecognizer.prototype.locate.call(this, this.getView().window)) > defaults.offsetThreshold) {
                    data.timer = clearTimeout(data.timer);
                    this.state = BCSGestureRecognizerStateEnum.FAILED;
                }
            } else {
                /*长按移动*/
                if (BCSGestureRecognizer.prototype.locate.call(this, this.getView().window).distanceFrom(data.initTapStartLocation) > this.allowableMovement) {
                    data.timer = clearTimeout(data.timer);
                    this.state = BCSGestureRecognizerStateEnum.FAILED;
                } else {
                    if (this.state === BCSGestureRecognizerStateEnum.BEGAN) {
                        this.state = BCSGestureRecognizerStateEnum.CHANGED;
                    }
                }
            }
        }
    };

    prototype.touchesEnded = function (touches, event) {
        var data = longPressGestureRecognizerMap[this.getKey()];
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired) {
            if (data.numberOfContinualTaps === this.numberOfTapsRequired) {
                /*长按未完成，则报错*/
                if (this.state !== BCSGestureRecognizerStateEnum.BEGAN && this.state !== BCSGestureRecognizerStateEnum.CHANGED || this.delegate && this.delegate.shouldBegin && !this.delegate.shouldBegin()) {
                    data.timer = clearTimeout(data.timer);
                    this.state = BCSGestureRecognizerStateEnum.FAILED;
                } else {
                    this.state = BCSGestureRecognizerStateEnum.ENDED;
                }
            } else {
                /* 手指可能先后离开屏幕,从而触发多次touchesEnded */
                for (var i = 0; i < touches.length; i++) {
                    // console.log(Date(),data.numberOfOffTouches)
                    if (this.hasAvailableTouch(touches[i])) {
                        if (data.numberOfOffTouches + 1 === this.numberOfTouchesRequired) {
                            /*本轮结束，停止计时*/
                            data.timer = clearTimeout(data.timer);
                            data.numberOfContinualTaps++;
                            /*连续敲击倒计时*/
                            startTimer(this, data, defaults.offInterval);
                            data.isAvailableTouchesRemovable = true;
                        } else {
                            data.numberOfOffTouches++;
                        }
                    }
                }
            }
        } else {
            data.timer = clearTimeout(data.timer);
            this.state = BCSGestureRecognizerStateEnum.FAILED;
        }
    };

    prototype.removeAvailableTouches = function (touches) {
        var data = longPressGestureRecognizerMap[this.getKey()];
        if (data.isAvailableTouchesRemovable) {
            data.numberOfOffTouches = 0;
            BCSGestureRecognizer.prototype.removeAvailableTouches.call(this);
        }
    };

    prototype.deinit = function () {
        BCSGestureRecognizer.prototype.deinit.call(this);
        try {
            delete longPressGestureRecognizerMap[this.getKey()];
        } catch (e) {
            longPressGestureRecognizerMap[this.getKey()] = undefined;
        }
    };
    // Source: src/main/frontend/js/bcs/view/BCSNavigationBar.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSBarButton() {}
    BCSBarButton.extend(BCSButton);

    function BCSNavigationBar() {
        BCSView1.call(this, BCSNavigationBar.style);
        this.isTranslucent = false;
        this.delegate = null;
    }

    {
        BCSNavigationBar.extend(BCSView);
        BCSNavigationBar.style = {
            width: '100%',
            height: '44px',
            // borderBottom:'solid 1px #333',
            backgroundColor: 'rgba(255,255,255,0.8)'
        };
    }
    ;
    // Source: src/main/frontend/js/bcs/view/BCSNavigationItem.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    var LargeTitleDisplayModeEnum = exports.LargeTitleDisplayModeEnum = {
        automatic: 1,
        always: 2,
        never: 3

    };

    function BCSNavigationItem(element) {
        BCSView.call(this, element);
        this.title = '';
        this.titleView = new BCSView();
        this.prompt = '';
        this.backBarButtonItem = new BCSBarButtonItem();
        this.hidesBackButton = false;
        this.largeTitleDisplayMode = LargeTitleDisplayModeEnum.automatic;
        this.hidesSearchBarWhenScrolling = false;
        this.searchController = new BCSSearchController();
        var leftBarButtonItems = [];
        var rightBarButtonItems = [];
        this.getLeftBarButtonItems = function () {
            return leftBarButtonItems;
        };
        this.getRightBarButtonItems = function () {
            return rightBarButtonItems;
        };
    }
    {
        BCSNavigationItem.extend(BCSView);
        BCSNavigationItem.prototype.setHidesBackButton = function (hidesBackButton, animated) {};

        BCSNavigationItem.prototype.setLeftBarButtonItems = function (hidesBackButton, animated) {};
        BCSNavigationItem.prototype.setRightBarButtonItems = function (hidesBackButton, animated) {};
    }
    ;
    // Source: src/main/frontend/js/bcs/view/BCSPageControl.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSPageControl(element) {
        BCSView.call(this, element);
    }
    BCSPageControl.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSPanGestureRecognizer.js
    /**
     * Created by kenhuang on 2019/3/12.
     */

    // Begins:  when at least minimumNumberOfTouches have moved enough to be considered a pan
    // Changes: when a finger moves while at least minimumNumberOfTouches are down
    // Ends:    when all fingers have lifted
    function BCSPanGestureRecognizer(target, action) {
        BCSGestureRecognizer.call(this, target, action);
    }

    var panGestureRecognizerMap = {};
    BCSPanGestureRecognizer.extend(BCSGestureRecognizer);
    BCSPanGestureRecognizer.prototype.shouldRequireFailureOf = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSPanGestureRecognizer) && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    BCSPanGestureRecognizer.prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSPanGestureRecognizer) && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    BCSPanGestureRecognizer.prototype.touchesBegan = function (touches, event) {
        var data = panGestureRecognizerMap[this.getKey()];
        BCSGestureRecognizer.prototype.touchesBegan.call(this, touches, event);
    };

    BCSPanGestureRecognizer.prototype.touchesMoved = function (touches, event) {
        var data = panGestureRecognizerMap[this.getKey()];
        BCSGestureRecognizer.prototype.touchesMoved.call(this, touches, event);

        // console.log('touchesMoved',this.name,this.state)
    };

    BCSPanGestureRecognizer.prototype.touchesEnded = function (touches, event) {
        var data = panGestureRecognizerMap[this.getKey()];
        BCSGestureRecognizer.prototype.touchesEnded.call(this, touches, event);

        console.log('touchesEnded', this.name, this.state);
    };

    BCSPanGestureRecognizer.prototype.deinit = function () {
        BCSGestureRecognizer.prototype.deinit.call(this);
        try {
            delete panGestureRecognizerMap[this.getKey()];
        } catch (e) {
            panGestureRecognizerMap[this.getKey()] = undefined;
        }
    };
    // Source: src/main/frontend/js/bcs/view/BCSPickerView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSPickerView(element) {
        BCSView.call(this, element);
    }
    BCSPickerView.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSPinchGestureRecognizer.js
    /**
     * Created by kenhuang on 2019/3/12.
     */

    var NUMBER_OF_TOUCHES_REQUIRED = 2;

    // Begins:  when two touches have moved enough to be considered a pinch
    // Changes: when a finger moves while two fingers remain down
    // Ends:    when both fingers have lifted

    function BCSPinchGestureRecognizer(target, action) {
        BCSGestureRecognizer.call(this, target, action);
        pinchGestureRecognizerMap[this.getKey()] = {
            scale: 0,
            /*放大为正，缩小为负*/
            velocity: 0

        };
    }

    var pinchGestureRecognizerMap = {};
    BCSPinchGestureRecognizer.extend(BCSGestureRecognizer);

    BCSPinchGestureRecognizer.prototype.getScale = function () {
        return pinchGestureRecognizerMap[this.getKey()].scale;
    };
    BCSPinchGestureRecognizer.prototype.getVelocity = function () {
        return pinchGestureRecognizerMap[this.getKey()].velocity;
    };
    BCSPinchGestureRecognizer.prototype.shouldRequireFailureOf = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSPinchGestureRecognizer) && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    BCSPinchGestureRecognizer.prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSPinchGestureRecognizer) && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    BCSPinchGestureRecognizer.prototype.touchesBegan = function (touches, event) {
        var data = pinchGestureRecognizerMap[this.getKey()];
        BCSGestureRecognizer.prototype.touchesBegan.call(this, touches, event);
    };

    BCSPinchGestureRecognizer.prototype.touchesMoved = function (touches, event) {
        var data = pinchGestureRecognizerMap[this.getKey()];
        BCSGestureRecognizer.prototype.touchesMoved.call(this, touches, event);
        // console.log('touchesMoved',this.name,this.state)
        this.state = BCSGestureRecognizerStateEnum.BEGAN;
        this.state = BCSGestureRecognizerStateEnum.CHANGED;
    };

    //抬起后scale和velocity保持不变，
    BCSPinchGestureRecognizer.prototype.touchesEnded = function (touches, event) {
        var data = pinchGestureRecognizerMap[this.getKey()];
        BCSGestureRecognizer.prototype.touchesEnded.call(this, touches, event);
        console.log('touchesEnded', this.name, this.state);
        this.state = BCSGestureRecognizerStateEnum.ENDED;
    };

    BCSPinchGestureRecognizer.prototype.deinit = function () {
        BCSGestureRecognizer.prototype.deinit.call(this);
        try {
            delete pinchGestureRecognizerMap[this.getKey()];
        } catch (e) {
            pinchGestureRecognizerMap[this.getKey()] = undefined;
        }
    };
    // Source: src/main/frontend/js/bcs/view/BCSPoint.js
    /**
     * Created by kenhuang on 2019/3/14.
     */

    function BCSPoint(x, y) {
        this.x = Number(x) || 0.0;
        this.y = Number(y) || 0.0;
    }

    {
        BCSPoint.prototype.equalTo = function (point2) {
            return this.x === point2.x && this.y === point2.y;
        };
        BCSPoint.prototype.distanceFrom = function (point2) {
            return Math.sqrt(Math.pow(point2.x - this.x, 2) + Math.pow(point2.y - this.y, 2));
        };
    }

    function BCSSize(width, height) {
        this.width = Number(width) || 0.0;
        this.height = Number(height) || 0.0;
    }

    function BCSVector(dx, dy) {
        this.dx = Number(dx) || 0.0;
        this.dy = Number(dx) || 0.0;
    }

    function BCSRect(origin, size) {
        this.origin = origin || new BCSPoint();
        this.size = size || new BCSSize();
    }

    function BCSRect1(x, y, width, height) {
        var origin = new BCSPoint(x, y);
        var size = new BCSSize(width, height);
        return new BCSRect(origin, size);
    };
    // Source: src/main/frontend/js/bcs/view/BCSProgressView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSProgressView(element) {
        BCSView.call(this, element);
    }
    BCSProgressView.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSRotationGestureRecognizer.js
    /**
     * Created by kenhuang on 2019/3/12.
     */

    var NUMBER_OF_TOUCHES_REQUIRED = 2;

    // Begins:  when two touches have moved enough to be considered a rotation
    // Changes: when a finger moves while two fingers are down
    // Ends:    when both fingers have lifted
    function BCSRotateGestureRecognizer(target, action) {
        BCSGestureRecognizer.call(this, target, action);
        this.rotation = 0;
        rotateGestureRecognizerMap[this.getKey()] = {
            numberOfContinualTaps: 0,
            initTouchBeganLocation: null,
            currentTouchBeganLocation: null,
            currentTouchBeganTimeStamp: 0,
            longPressStartPoint: null,
            velocity: 0
        };
    }

    var rotateGestureRecognizerMap = {};
    BCSRotateGestureRecognizer.extend(BCSGestureRecognizer);
    BCSRotateGestureRecognizer.prototype.shouldRequireFailureOf = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSRotateGestureRecognizer) && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    BCSRotateGestureRecognizer.prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSRotateGestureRecognizer) && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    BCSRotateGestureRecognizer.prototype.getVelocity = function () {
        return rotateGestureRecognizerMap[this.getKey()].velocity;
    };

    BCSRotateGestureRecognizer.prototype.touchesBegan = function (touches, event) {
        var data = rotateGestureRecognizerMap[this.getKey()];
        BCSGestureRecognizer.prototype.touchesBegan.call(this, touches, event);
    };

    BCSRotateGestureRecognizer.prototype.touchesMoved = function (touches, event) {
        var data = rotateGestureRecognizerMap[this.getKey()];
        BCSGestureRecognizer.prototype.touchesMoved.call(this, touches, event);
    };

    BCSRotateGestureRecognizer.prototype.touchesEnded = function (touches, event) {
        var data = rotateGestureRecognizerMap[this.getKey()];
        BCSGestureRecognizer.prototype.touchesEnded.call(this, touches, event);
    };

    BCSRotateGestureRecognizer.prototype.deinit = function () {
        BCSGestureRecognizer.prototype.deinit.call(this);
        try {
            delete rotateGestureRecognizerMap[this.getKey()];
        } catch (e) {
            rotateGestureRecognizerMap[this.getKey()] = undefined;
        }
    };
    // Source: src/main/frontend/js/bcs/view/BCSScrollView.js
    /**
     * Created by kenhuang on 2019/1/25.
     */

    function BCSScrollView() {
        BCSView1.call(this);

        // if(!BCSView.prototype.appendTo){
        //     BCSView.prototype.enableRubberBand = function () {
        //
        //     }
        //
        //     BCSView.prototype.enableQuickMove = function () {
        //         var lastTime = 0
        //         var currentTime =0
        //         // var lastPoint
        //         // var currentPoint
        //         //如果容器位置大于等于0时，则在拖动时就启用橡皮筋，否则进行滑屏直到屏幕底部
        //         //防止误点击
        //         // 速度残留，需要在touchstart将速度设置为0
        //         // 1/2跳转
        //         //防抖动
        //         //横竖方向都适用
        //         //即点即停
        //     }
        // }
    }
    BCSScrollView.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSSlider.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSSlider(element) {
        BCSView.call(this, element);
    }
    BCSSlider.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSSwipeGestureRecognizer.js
    /**
     * Created by kenhuang on 2019/3/12.
     */

    var BCSSwipeGestureRecognizerDirectionEnum = exports.BCSSwipeGestureRecognizerDirectionEnum = {
        RIGHT: 1,
        LEFT: 2,
        UP: 4,
        DOWN: 8
    };
    function BCSSwipeGestureRecognizer(target, action) {
        BCSGestureRecognizer.call(this, target, action);
        this.numberOfTouchesRequired = 1;
        this.direction = BCSSwipeGestureRecognizerDirectionEnum.RIGHT;
        swipeGestureRecognizerMap[this.getKey()] = {
            swipeStartPoint: null,
            swipeStartTimeStamp: 0,
            swipeNumberOfTouches: 0,
            newTotalX: 0,
            newTotalY: 0,
            /*满足开始触发swipe条件时touch成员*/
            previousTouches: {}
        };
    }

    var swipeGestureRecognizerMap = {};
    BCSSwipeGestureRecognizer.extend(BCSGestureRecognizer);
    var prototype = BCSSwipeGestureRecognizer.prototype;
    prototype.reset = function () {
        BCSGestureRecognizer.prototype.reset.call(this);
        var data = swipeGestureRecognizerMap[this.getKey()];
        data.swipeStartPoint = null;
        data.swipeStartTimeStamp = 0;
        data.swipeNumberOfTouches = 0;
        /*满足开始触发swipe条件时touch成员*/
        data.previousTouches = {};
        data.newTotalX = 0;
        data.newTotalY = 0;
    };

    prototype.getNumberOfTouches = function () {
        return this.state !== BCSGestureRecognizerStateEnum.FAILED ? swipeGestureRecognizerMap[this.getKey()].swipeNumberOfTouches : 0;
    };

    prototype.locate = function (view) {
        var location = swipeGestureRecognizerMap[this.getKey()].initTouchBeganLocation;
        if (this.getNumberOfTouches() > 0) {
            return new BCSPoint(location.x - view.getStyle('left'), location.y - view.getStyle('top'));
        } else {
            return new BCSPoint(-view.getStyle('left'), -view.getStyle('top'));
        }
    };

    prototype.locateTouch = function (index, view) {
        if (this.getNumberOfTouches() > 0) {
            return BCSGestureRecognizer.prototype.locateTouch(index, view);
        } else {
            return BCSGestureRecognizer.prototype.locateTouch(-1, view);
        }
    };

    prototype.shouldRequireFailureOf = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSSwipeGestureRecognizer)) {
            return true;
        }
        return false;
    };

    prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSSwipeGestureRecognizer)) {
            return false;
        }
        return true;
    };
    /**
     * 有多少个touch就收纳多少。但起始位置和时间按照<=numberOfTouchesRequired时计算，
     * 如果touches的数量+原来的数量超出numberOfTouchesRequired，则以上一次为准
     * @param touches
     * @param event
     */
    prototype.touchesBegan = function (touches, event) {
        var numberOfAllTouches = touches.length + BCSGestureRecognizer.prototype.getNumberOfTouches.call(this);
        BCSGestureRecognizer.prototype.touchesBegan.call(this, touches, event);
        if (numberOfAllTouches <= this.numberOfTouchesRequired) {
            var data = swipeGestureRecognizerMap[this.getKey()];
            for (var i = 0; i < touches.length; i++) {
                data.previousTouches[touches[i].identifier] = touches[i];
            }
            data.swipeStartTimeStamp = event.timeStamp;
            data.swipeStartPoint = BCSGestureRecognizer.prototype.locate.call(this, this.getView().window);
            data.swipeNumberOfTouches += touches.length;
        }
    };

    prototype.touchesMoved = function (touches, event) {
        var i,
            data = swipeGestureRecognizerMap[this.getKey()],
            numberOfTouches = this.getNumberOfTouches();
        /* 1.如果同时放入超过指定数量的手指，移动时并不会报错，直到手指抬起为止，可以往任意方向移动,从触摸到屏幕开始计算，不会超时
         * 2.可能还计算移动速率，觉得复杂，没有实现
         */
        if (touches.length <= this.getNumberOfTouches()) {
            if (event.timeStamp - data.swipeStartTimeStamp <= defaults.swipeMaxDuration) {
                var touch, previousTouch;
                switch (this.direction) {
                    case BCSSwipeGestureRecognizerDirectionEnum.RIGHT:
                        for (i = 0; i < touches.length; i++) {
                            touch = touches[i];
                            previousTouch = data.previousTouches[touch.identifier];
                            if (previousTouch) {
                                if (touch.pageX - previousTouch.pageX <= 0) {
                                    this.state = BCSGestureRecognizerStateEnum.FAILED;
                                    return;
                                } else {
                                    data.newTotalX += touch.pageX - data.previousTouches[touch.identifier].pageX;
                                    data.newTotalY += touch.pageY - data.previousTouches[touch.identifier].pageY;
                                    data.previousTouches[touch.identifier] = touch;
                                }
                            }
                        }
                        break;
                    case BCSSwipeGestureRecognizerDirectionEnum.LEFT:
                        for (i = 0; i < touches.length; i++) {
                            touch = touches[i];
                            previousTouch = data.previousTouches[touch.identifier];
                            if (previousTouch) {
                                if (touch.pageX - previousTouch.pageX >= 0) {
                                    this.state = BCSGestureRecognizerStateEnum.FAILED;
                                    return;
                                } else {
                                    data.newTotalX += touch.pageX - data.previousTouches[touch.identifier].pageX;
                                    data.newTotalY += touch.pageY - data.previousTouches[touch.identifier].pageY;
                                    data.previousTouches[touch.identifier] = touch;
                                }
                            }
                        }
                        break;
                    case BCSSwipeGestureRecognizerDirectionEnum.UP:
                        for (i = 0; i < touches.length; i++) {
                            touch = touches[i];
                            previousTouch = data.previousTouches[touch.identifier];
                            if (previousTouch) {
                                if (touch.pageY - previousTouch.pageY >= 0) {
                                    this.state = BCSGestureRecognizerStateEnum.FAILED;
                                    return;
                                } else {
                                    data.newTotalX += touch.pageX - data.previousTouches[touch.identifier].pageX;
                                    data.newTotalY += touch.pageY - data.previousTouches[touch.identifier].pageY;
                                    data.previousTouches[touch.identifier] = touch;
                                }
                            }
                        }
                        break;
                    case BCSSwipeGestureRecognizerDirectionEnum.DOWN:
                        for (i = 0; i < touches.length; i++) {
                            touch = touches[i];
                            previousTouch = data.previousTouches[touch.identifier];
                            if (previousTouch) {
                                if (touch.pageY - previousTouch.pageY <= 0) {
                                    this.state = BCSGestureRecognizerStateEnum.FAILED;
                                    return;
                                } else {
                                    data.newTotalX += touch.pageX - data.previousTouches[touch.identifier].pageX;
                                    data.newTotalY += touch.pageY - data.previousTouches[touch.identifier].pageY;
                                    data.previousTouches[touch.identifier] = touch;
                                }
                            }
                        }
                        break;
                    default:
                }

                if (this.getNumberOfTouches() === this.numberOfTouchesRequired && data.swipeStartPoint.distanceFrom(new BCSPoint(data.newTotalX / numberOfTouches, data.newTotalY / numberOfTouches)) >= defaults.swipeOffsetThreshold) {
                    this.state = BCSGestureRecognizerStateEnum.ENDED;
                }
                BCSGestureRecognizer.prototype.touchesMoved.call(this, touches, event);
            } else {
                this.state = BCSGestureRecognizerStateEnum.FAILED;
            }
        }
    };

    prototype.touchesEnded = function (touches, event) {
        this.state = BCSGestureRecognizerStateEnum.FAILED;
    };

    prototype.deinit = function () {
        BCSGestureRecognizer.prototype.deinit.call(this);
        try {
            delete swipeGestureRecognizerMap[this.getKey()];
        } catch (e) {
            swipeGestureRecognizerMap[this.getKey()] = undefined;
        }
    };
    // Source: src/main/frontend/js/bcs/view/BCSSwitch.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSSwitch(element) {
        BCSView.call(this, element);
    }
    BCSSwitch.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSTabBar.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSTabBar() {
        BCSView1.call(this, {
            bottom: '0px',
            width: '100%'
        });
    }
    BCSTabBar.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSTabBarItem.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSTabBarItem(element) {
        BCSView.call(this, element);
    }
    BCSTabBarItem.extend(BCSView);
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

    function BCSTableViewCell() {
        BCSView.call();
    }

    {
        BCSTableViewCell.extend(BCSView);
    };
    // Source: src/main/frontend/js/bcs/view/BCSTapGestureRecognizer.js
    /**
     * Created by kenhuang on 2019/3/12.
     */

    // Recognizes: when numberOfTouchesRequired have tapped numberOfTapsRequired times

    // Touch Location Behaviors:
    //     locationInView:         location of the tap, from the first tap in the sequence if numberOfTapsRequired > 1. this is the centroid if numberOfTouchesRequired > 1
    //     locationOfTouch:inView: location of a particular touch, from the first tap in the sequence if numberOfTapsRequired > 1

    function BCSTapGestureRecognizer(target, action) {
        BCSGestureRecognizer.call(this, target, action);
        tapGestureRecognizerMap[this.getKey()] = {
            numberOfContinualTaps: 0,
            /*第一次点击时的位置即基准位置，此时numberOfTouchesRequired条件已满足*/
            initTapStartLocation: new BCSPoint(),
            currentTouchBeganTimeStamp: 0,
            numberOfOffTouches: 0,
            isAvailableTouchesRemovable: false,
            timer: undefined
        };
        this.numberOfTapsRequired = 1;
        this.numberOfTouchesRequired = 1;
    }

    var tapGestureRecognizerMap = {};
    BCSTapGestureRecognizer.extend(BCSGestureRecognizer);
    var prototype = BCSTapGestureRecognizer.prototype;
    prototype.getNumberOfTouches = function () {
        return BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired ? this.numberOfTouchesRequired : 0;
    };

    prototype.locate = function (view) {
        var location = tapGestureRecognizerMap[this.getKey()].initTapStartLocation;
        return new BCSPoint(location.x - view.getStyle('left'), location.y - view.getStyle('top'));
    };
    prototype.locateTouch = function (index, view) {
        if (this.getNumberOfTouches() > 0) {
            return BCSGestureRecognizer.prototype.locateTouch(index, view);
        } else {
            return BCSGestureRecognizer.prototype.locateTouch(-1, view);
        }
    };

    prototype.reset = function () {
        BCSGestureRecognizer.prototype.reset.call(this);
        var data = tapGestureRecognizerMap[this.getKey()];
        data.numberOfContinualTaps = 0;
        data.initTapStartLocation = new BCSPoint();
        data.currentTouchBeganTimeStamp = 0;
        data.numberOfOffTouches = 0;
        data.isAvailableTouchesRemovable = false;
        clearTimeout(data.timer);
        data.timer = undefined;
    };

    prototype.shouldRequireFailureOf = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSTapGestureRecognizer) && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSTapGestureRecognizer) && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    function startTimer(self, data, interval) {
        data.timer = setTimeout(function () {
            if (self.state !== BCSGestureRecognizerStateEnum.FAILED) {
                self.state = BCSGestureRecognizerStateEnum.FAILED;
                self.ignoreAvailableTouches();
                self.reset();
            }
            console.log('reset');
        }, interval);
    }

    /**
     * touches不一定同时进来
     * @param touches
     * @param event
     */
    prototype.touchesBegan = function (touches, event) {
        var data = tapGestureRecognizerMap[this.getKey()];
        if (touches.length + BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) <= this.numberOfTouchesRequired) {
            if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === 0) {
                /*停止连续敲击倒计时并开始新一轮敲击计时*/
                data.timer = clearTimeout(data.timer);
                data.currentTouchBeganTimeStamp = event.timeStamp;
                data.isAvailableTouchesRemovable = false;
                startTimer(this, data, defaults.onInterval);
                this.state = BCSGestureRecognizerStateEnum.POSSIBLE;
            }
            BCSGestureRecognizer.prototype.touchesBegan.call(this, touches, event);
            if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired) {
                if (data.numberOfContinualTaps === 0) {
                    data.initTapStartLocation = BCSGestureRecognizer.prototype.locate.call(this, this.getView().window);
                } else {
                    /* 检查本次触点和第一次触点距离是否过大*/
                    if (data.initTapStartLocation.distanceFrom(BCSGestureRecognizer.prototype.locate.call(this, this.getView().window)) > defaults.offsetThreshold) {
                        data.timer = clearTimeout(data.timer);
                        this.state = BCSGestureRecognizerStateEnum.FAILED;
                        return;
                    }
                }
                data.timer = clearTimeout(data.timer);
                startTimer(this, data, defaults.onInterval * 2 - event.timeStamp + data.currentTouchBeganTimeStamp);
            }
        } else {
            data.timer = clearTimeout(data.timer);
            this.state = BCSGestureRecognizerStateEnum.FAILED;
        }
    };

    prototype.touchesMoved = function (touches, event) {
        var data = tapGestureRecognizerMap[this.getKey()];
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired && (event.targetTouches.length < this.numberOfTouchesRequired || data.initTapStartLocation.distanceFrom(BCSGestureRecognizer.prototype.locate.call(this, this.getView().window))) > defaults.offsetThreshold) {
            data.timer = clearTimeout(data.timer);
            this.state = BCSGestureRecognizerStateEnum.FAILED;
        }
    };

    prototype.touchesEnded = function (touches, event) {
        var data = tapGestureRecognizerMap[this.getKey()];
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired) {
            /* 手指可能先后离开屏幕,从而触发多次touchesEnded */
            for (var i = 0; i < touches.length; i++) {
                // console.log(Date(),data.numberOfOffTouches)
                if (this.hasAvailableTouch(touches[i])) {
                    if (data.numberOfOffTouches + 1 === this.numberOfTouchesRequired) {
                        /*本轮结束，停止计时*/
                        data.timer = clearTimeout(data.timer);
                        data.numberOfContinualTaps++;
                        if (data.numberOfContinualTaps === this.numberOfTapsRequired) {
                            if (this.delegate && this.delegate.shouldBegin && !this.delegate.shouldBegin()) {
                                this.state = BCSGestureRecognizerStateEnum.FAILED;
                            } else {
                                this.state = BCSGestureRecognizerStateEnum.ENDED;
                            }
                        } else {
                            /*连续敲击倒计时*/
                            startTimer(this, data, defaults.offInterval);
                            data.isAvailableTouchesRemovable = true;
                        }
                    } else {
                        data.numberOfOffTouches++;
                    }
                }
            }
        } else {
            data.timer = clearTimeout(data.timer);
            this.state = BCSGestureRecognizerStateEnum.FAILED;
        }
    };

    prototype.removeAvailableTouches = function (touches) {
        var data = tapGestureRecognizerMap[this.getKey()];
        if (data.isAvailableTouchesRemovable) {
            data.numberOfOffTouches = 0;
            BCSGestureRecognizer.prototype.removeAvailableTouches.call(this);
        }
    };

    prototype.deinit = function () {
        BCSGestureRecognizer.prototype.deinit.call(this);
        try {
            delete tapGestureRecognizerMap[this.getKey()];
        } catch (e) {
            tapGestureRecognizerMap[this.getKey()] = undefined;
        }
    };
    // Source: src/main/frontend/js/bcs/view/BCSTextField.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSTextField(element) {
        BCSView.call(this, element);
    }
    BCSTextField.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSTextView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSTextView(element) {
        BCSView.call(this, element);
    }
    BCSTextView.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSToolbar.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSToolbar() {
        BCSView1.call(this, BCSToolbar.style);
    }

    {
        BCSToolbar.extend(BCSView);
        BCSToolbar.style = {
            width: '100%',
            height: '44px',
            bottom: '0px',
            backgroundColor: 'red'
        };
    }
    ;
    // Source: src/main/frontend/js/bcs/view/BCSView.js
    /**
     * Created by kenhuang on 2019/1/10.
     */

    // import BCSData from './BCSData'
    // 兼容IE6-8暂不使用以下方式
    // Object.defineProperty(this,'layer',{
    //     getter:function () {
    //         return layer
    //     }
    // })
    function BCSView(element, style) {
        // if (this.constructor !== BCSView){
        //     return new BCSView(element, style)
        // }
        Function.requireArgumentNumber(1);
        var key = Symbol();
        this.getKey = function () {
            return key;
        };
        viewMap[key] = {
            layer: element,
            subViews: generateSubViews(element),
            gestureRecognizers: new Set(),
            isListenersAdded: false
        };
        if ((typeof style === "undefined" ? "undefined" : _typeof(style)) === 'object') {
            if (!style.hasOwnProperty('position')) {
                style.position = 'absolute';
            }
        } else {
            style = { position: 'absolute' };
        }
        this.setStyle(style);
        /* 方便调试 */
        element.setAttribute('view', this.getClass());
    }

    function BCSView1(style, elementType) {
        elementType = elementType || 'div';
        var element = document.createElement(elementType);
        if (this.constructor === BCSView1) {
            /*通过new BCSView1构建*/
            return new BCSView(element, style);
        } else {
            BCSView.call(this, element, style);
        }
    }

    var viewMap = {};
    var prototype = BCSView.prototype;
    function generateSubViews(layer) {
        var subViews = [];
        if (layer.children.length > 0) {
            var subLayers = layer.children;
            for (var i = 0; i < layer.children.length; i++) {
                subViews.push(new BCSView(subLayers[i]));
            }
        }
        return subViews;
    }
    /**
     * 1.这里假设调用者倾向于在同一个view添加不同的手势识别器，而非添加多个相同手势识别器
     * 2.和iOS不同，event和event.touches对象每次都不同,靠touch.identifier进行区分
     * 3.没有必要在这里使用定时器，例如可能出现两个tap手势识别器，它们要求的tap次数不同，如a.numberOfTouchesRequired = 1,
     * b.numberOfTouchesRequired = 2,当用户想使用a时，此时需要两个定时器，一个750ms，一个1500ms。
     * @param view
     */
    function addListeners(view) {
        var delegate, touches, recognizer, stateChangedRecognizers, i, j, gestureRecognizers;
        var handleEvent = function handleEvent(event) {
            gestureRecognizers = view.getGestureRecognizers();
            stateChangedRecognizers = [];
            /*使用手势识别器识别event*/
            for (i = 0; i < gestureRecognizers.length; i++) {
                recognizer = gestureRecognizers[i];
                if (recognizer.isEnabled) {
                    if (event.type === EventTypeEnum.TOUCH_START) {
                        recognizer.state = BCSGestureRecognizerStateEnum.POSSIBLE;
                    } else if (recognizer.state >= BCSGestureRecognizerStateEnum.ENDED) {
                        continue;
                    }
                    touches = event.changedTouches;
                    delegate = recognizer.delegate;
                    switch (event.type) {
                        case EventTypeEnum.TOUCH_START:
                            if (delegate && delegate.shouldReceiveTouch) {
                                touches = event.changedTouches.filter(function (touch) {
                                    return delegate.shouldReceiveTouch(recognizer, touch);
                                });
                            }
                            recognizer.touchesBegan(touches, event);
                            for (j = i + 1; j < gestureRecognizers.length; j++) {
                                if (recognizer.shouldRequireFailureOf(gestureRecognizers[j])) {
                                    gestureRecognizers[j].addDependent(recognizer);
                                } else if (delegate && delegate.shouldRequireFailureOf && delegate.shouldRequireFailureOf(recognizer, gestureRecognizers[j])) {
                                    gestureRecognizers[j].addDependent(recognizer);
                                } else if (recognizer.shouldBeRequiredToFailBy(gestureRecognizers[j])) {
                                    recognizer.addDependent(gestureRecognizers[j]);
                                } else if (delegate && delegate.shouldBeRequiredToFailBy && delegate.shouldBeRequiredToFailBy(recognizer, gestureRecognizers[j])) {
                                    recognizer.addDependent(gestureRecognizers[j]);
                                }
                            }
                            break;
                        case EventTypeEnum.TOUCH_MOVE:
                            recognizer.touchesMoved(touches, event);
                            break;
                        case EventTypeEnum.TOUCH_END:
                            recognizer.touchesEnded(touches, event);
                            if (recognizer.state === BCSGestureRecognizerStateEnum.POSSIBLE) {
                                recognizer.removeAvailableTouches(touches);
                            }
                            break;
                        case EventTypeEnum.TOUCH_CANCEL:
                            recognizer.touchesCancelled(touches, event);
                            break;
                        default:
                        //pc或其他
                    }
                    console.log(new Date(), new Date().getMilliseconds(), event.type, recognizer.name, "state:", recognizer.state, recognizer.getNumberOfTouches(), event.touches, event.targetTouches, event.changedTouches);
                    if (recognizer.state >= BCSGestureRecognizerStateEnum.BEGAN) {
                        stateChangedRecognizers.push(recognizer);
                    }
                }
            }
            view.executeStateChangedRecognizers(stateChangedRecognizers);
        };
        EventTypeEnum.values.forEach(function (eventName) {
            view.getLayer().addEventListener(eventName, handleEvent);
        });
    }
    prototype.addSubView = function (view) {
        var subViews = this.getSubViews(),
            length = this.getLayer().children.length;
        this.getLayer().appendChild(view.getLayer());
        if (this.getLayer().children.length === length) {
            /* layer的子元素已经包含 view的layer*/
            for (var i = 0; i < subViews.length; i++) {
                if (subViews[i].getLayer() === view.getLayer()) {
                    subViews.splice(i, 1);
                    break;
                }
            }
        }
        subViews.push(view);
    };

    prototype.getLayer = function () {
        return viewMap[this.getKey()].layer;
    };
    prototype.getSubViews = function () {
        return viewMap[this.getKey()].subViews;
    };

    prototype.getGestureRecognizers = function () {
        return Array.from(viewMap[this.getKey()].gestureRecognizers);
    };

    prototype.addGestureRecognizer = function (gestureRecognizer) {
        var data = viewMap[this.getKey()];
        data.gestureRecognizers.add(gestureRecognizer);
        gestureRecognizer.setView(this);
        if (!data.isListenersAdded) {
            addListeners(this);
            data.isListenersAdded = true;
        }
    };

    prototype.removeGestureRecognizer = function (gestureRecognizer) {
        viewMap[this.getKey()].gestureRecognizers["delete"](gestureRecognizer);
        gestureRecognizer.setView(null);
    };

    prototype.gestureRecognizerShouldBegin = function (gestureRecognizer) {
        return true;
    };

    prototype.removeSubView = function (subView) {
        var subViews = this.getSubViews();
        for (var i = 0; i < subViews.length; i++) {
            if (subViews[i] === subView) {
                subViews.splice(i, 1);
                this.getLayer().removeChild(subView.getLayer());
                return;
            }
        }
    };

    prototype.setStyle = function (cssObject) {
        var attribute,
            background,
            backgroundAttributes,
            cssText = '',
            element = this.getLayer();
        if (window.cssSandpaper) {
            ['transform', 'opacity', 'boxShadow', 'textShadow'].forEach(function (attributeName) {
                if (cssObject.hasOwnProperty(attributeName)) {
                    attribute = cssObject[attributeName];
                    delete cssObject[attributeName];
                    window.cssSandpaper['set' + attributeName.toFirstUpperCase()](element, attribute);
                }
            }.bind(this));
            background = cssObject.backgroundImage || cssObject.background;
            if (background) {
                ['rgba', 'hsla'].forEach(function (name) {
                    backgroundAttributes = new RegExp(name + '\\s*?\\((.*?)\\)').exec(background);
                    if (backgroundAttributes) {
                        window.cssSandpaper['set' + name.toUpperCase() + 'Background'](this.getLayer(), backgroundAttributes[1]);
                    }
                }.bind(this));
                backgroundAttributes = /(-(webkit|o|moz)-)?(repeating-radial|repeating-linear|radial|linear)-gradient\s*?\((.*)\)/.exec(background);
                if (backgroundAttributes) {
                    window.cssSandpaper.setGradient(element, "-sand-gradient(" + backgroundAttributes[3] + "," + backgroundAttributes[4] + ")");
                }
            }

            if (cssObject.hasOwnProperty('color')) {
                var arr = /hsl\((.*?)\)/.exec(cssObject.color);
                if (arr) {
                    window.cssSandpaper.setHSLColor(element, 'color', arr[1]);
                }
            }
        }

        if (window.PIE && (cssObject.borderRadius || cssObject.borderImage || cssObject.backgroundAttachment || cssObject.background && cssObject.background.indexOf('url') !== -1 || cssObject.backgroundSize || cssObject.backgroundRepeat || cssObject.backgroundOrigin || cssObject.backgroundClip || element.nodeName === 'IMG')) {
            window.PIE.attach(element);
        }

        for (var name in cssObject) {
            if (cssObject.hasOwnProperty(name)) {
                cssText += name.replace(/([A-Z])/g, function (match) {
                    return '-' + match.toLowerCase();
                }) + ":" + cssObject[name] + ';';
            }
        }

        if (typeof element.style.cssText !== 'undefined') {
            element.style.cssText += ';' + cssText;
        } else {
            element.setAttribute('style', cssText);
        }
    };
    //todo  100%的情况
    prototype.getStyle = function (propertyName) {
        if (typeof propertyName === 'string') {
            return Number(window.getComputedStyle(this.getLayer())[propertyName].replace('px', ''));
        }
        return window.getComputedStyle(this.getLayer());
    };

    prototype.setHTML = function (htmlText) {
        var element = this.getLayer();
        if (htmlText === undefined) {
            element.innerHTML = '';
        } else if (typeof htmlText === "string") {
            element.innerHTML = htmlText;
        }
    };

    BCSView.findViewById = function (id) {
        var element = document.getElementById(id),
            component = element.getAttribute('component');
        if (component) {
            /* 已经自行使用component='xxx'指定类型 */
            return new window[component](element);
        } else {
            switch (element.tagName) {
                //todo
                case 'button':
                    {
                        return new BCSButton();
                    }
                default:
                    {
                        return new BCSView(element);
                    }
            }
        }
    };
    prototype.deinit = function () {
        Object.prototype.deinit.call(this);
        try {
            delete viewMap[this.getKey()];
        } catch (e) {
            viewMap[this.getKey()] = undefined;
        }
    };

    prototype.executeStateChangedRecognizers = function (stateChangedRecognizers) {
        var gestureRecognizers = this.getGestureRecognizers();
        if (stateChangedRecognizers.length > 0) {
            /* 阻止识别器进行识别 */
            for (var i = 0; i < stateChangedRecognizers.length; i++) {
                switch (gestureRecognizers[i].state) {
                    case BCSGestureRecognizerStateEnum.CHANGED:
                    case BCSGestureRecognizerStateEnum.BEGAN:
                    case BCSGestureRecognizerStateEnum.ENDED:
                        for (var j = 0; j < gestureRecognizers.length; j++) {
                            if (stateChangedRecognizers[j].state !== BCSGestureRecognizerStateEnum.FAILED && stateChangedRecognizers[i] !== stateChangedRecognizers[j] && stateChangedRecognizers[j].state !== BCSGestureRecognizerStateEnum.CANCELLED) {
                                if (stateChangedRecognizers[i].hasDependent(gestureRecognizers[j])) {
                                    stateChangedRecognizers[j].state = BCSGestureRecognizerStateEnum.FAILED;
                                    stateChangedRecognizers.push(stateChangedRecognizers[j]);
                                    continue;
                                }
                                if (!stateChangedRecognizers[i].canPrevent(gestureRecognizers[j]) || !gestureRecognizers[j].canBePrevented(stateChangedRecognizers[i])) {
                                    continue;
                                }
                                if (!(stateChangedRecognizers[i].delegate && stateChangedRecognizers[i].delegate.shouldRecognizeSimultaneouslyWith && stateChangedRecognizers[i].delegate.shouldRecognizeSimultaneouslyWith(stateChangedRecognizers[i], gestureRecognizers[j])) && !(gestureRecognizers[j].delegate && gestureRecognizers[j].delegate.shouldRecognizeSimultaneouslyWith && gestureRecognizers[j].delegate.shouldRecognizeSimultaneouslyWith(gestureRecognizers[j], stateChangedRecognizers[i]))) {
                                    gestureRecognizers[j].state = BCSGestureRecognizerStateEnum.FAILED;
                                    stateChangedRecognizers.push(stateChangedRecognizers[j]);
                                }
                            }
                        }
                        break;
                    default:
                }
            }
            /*执行或者ignore touch*/
            stateChangedRecognizers.forEach(function (recognizer) {
                switch (recognizer.state) {
                    case BCSGestureRecognizerStateEnum.BEGAN:
                    case BCSGestureRecognizerStateEnum.CHANGED:
                        recognizer.executeActions();
                        break;
                    case BCSGestureRecognizerStateEnum.ENDED:
                        recognizer.executeActions();
                        recognizer.ignoreAvailableTouches();
                        break;
                    case BCSGestureRecognizerStateEnum.FAILED:
                    case BCSGestureRecognizerStateEnum.CANCELLED:
                        recognizer.ignoreAvailableTouches();
                        break;
                    default:
                }
            });
            stateChangedRecognizers.forEach(function (recognizer) {
                if (recognizer.state >= BCSGestureRecognizerStateEnum.ENDED) {
                    recognizer.reset();
                }
            });
        }
    };
    //BCSView恰好是BCS.js最后一个类
    Object.prototype.shallowCopy.call(window, module.exports);
});
