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
    exports.BCSCollectionView = BCSCollectionView;
    exports.BCSCollectionViewCell = BCSCollectionViewCell;
    exports.BCSControl = BCSControl;
    exports.BCSDatePicker = BCSDatePicker;
    exports.BCSImageView = BCSImageView;
    exports.BCSLabel = BCSLabel;
    exports.BCSNavigationBar = BCSNavigationBar;
    exports.BCSNavigationItem = BCSNavigationItem;
    exports.BCSPageControl = BCSPageControl;
    exports.BCSPickerView = BCSPickerView;
    exports.BCSPoint = BCSPoint;
    exports.BCSSize = BCSSize;
    exports.BCSVector = BCSVector;
    exports.BCSVector1 = BCSVector1;
    exports.BCSRect = BCSRect;
    exports.BCSRect1 = BCSRect1;
    exports.BCSEdgeInsets = BCSEdgeInsets;
    exports.BCSProgressView = BCSProgressView;
    exports.BCSRefreshControl = BCSRefreshControl;
    exports.BCSScrollView = BCSScrollView;
    exports.BCSScrollViewDecelerationRate = BCSScrollViewDecelerationRate;
    exports.BCSSlider = BCSSlider;
    exports.BCSSwitch = BCSSwitch;
    exports.BCSTabBar = BCSTabBar;
    exports.BCSTabBarItem = BCSTabBarItem;
    exports.BCSTableViewRowAction = BCSTableViewRowAction;
    exports.BCSTableView = BCSTableView;
    exports.BCSTableViewCell = BCSTableViewCell;
    exports.BCSTextField = BCSTextField;
    exports.BCSTextView = BCSTextView;
    exports.BCSToolbar = BCSToolbar;
    exports.BCSView = BCSView;
    exports.BCSGestureRecognizer = BCSGestureRecognizer;
    exports.BCSLongPressGestureRecognizer = BCSLongPressGestureRecognizer;
    exports.BCSPanGestureRecognizer = BCSPanGestureRecognizer;
    exports.BCSPinchGestureRecognizer = BCSPinchGestureRecognizer;
    exports.BCSRotationGestureRecognizer = BCSRotationGestureRecognizer;
    exports.BCSSwipeGestureRecognizer = BCSSwipeGestureRecognizer;
    exports.BCSTapGestureRecognizer = BCSTapGestureRecognizer;

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
                        // 阻止safari双击放大
                        // document.addEventListener('touchstart',function (event) {
                        //     if (event.touches.length > 1) {
                        //         event.preventDefault()
                        //     }
                        // })

                        document.addEventListener('touchmove', function (event) {
                            if (event.scale !== 1) {
                                event.preventDefault();
                            }
                        }, false);
                        var lastTouchEnd = 0;
                        document.addEventListener('touchend', function (event) {
                            var now = new Date().getTime();
                            if (now - lastTouchEnd <= 300) {
                                event.preventDefault();
                            }
                            lastTouchEnd = now;
                        }, false);
                        // 阻止safari双指放大
                        document.addEventListener('gesturestart', function (event) {
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
        var propertiesMap = {
            childViewControllers: [],
            parent: null,
            presentedViewController: null,
            presentingViewController: null
        };
        this.enablePrivateProperty(propertiesMap);
        if (typeof element === "string") {
            this.view = BCSView.findViewById(element);
        } else {
            this.view = new BCSView({ width: '100%', height: '100%' }, element);
        }
        this.view.getLayer().setAttribute('controller', this.getClass());
    }
    var prototype = BCSViewController.prototype;
    prototype.getChildViewControllers = function () {
        return this.getPrivate('childViewControllers');
    };
    prototype.getParent = function () {
        return this.getPrivate('parent');
    };
    prototype.getPresentedViewController = function () {
        return this.getPrivate('presentedViewController');
    };
    prototype.getPresentingViewController = function () {
        return this.getPrivate('presentingViewController');
    };
    // 构造函数会在document.onload事件触发时调用，viewDidLoad则在window.onload事件中调用
    prototype.viewDidLoad = function () {};
    prototype.layoutSubViews = function () {};

    prototype.viewWillAppear = function (animated) {};
    prototype.viewDidAppear = function (animated) {};
    prototype.viewWillDisappear = function (animated) {};
    prototype.viewDidDisappear = function (animated) {};
    prototype.viewWillUnload = function () {};
    prototype.viewDidUnload = function () {};
    prototype.addChildViewController = function (viewController) {};

    prototype.insertChildViewController = function (viewControllerIndex) {};
    prototype.removeFromParentViewController = function () {};

    prototype.removeChildViewController = function (index) {};
    /**
     *
     * @param dataURL json数据的URL
     * @param errorCallback
     * @param method
     * @param data  Post所需的data，应该没用
     * @returns {*}
     */
    prototype.loadPageInfo = function (dataURL, errorCallback, method, data) {
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
                /* 可能发生异常情况，导致pageinfo没有被使用就载入新页面 */
                if (pageinfo.url !== location.href && pageinfo.pathname !== location.pathname) {
                    pageinfo = undefined;
                }
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
     * @param pageInfo 含有表示跳转页面完整路径或者相对根路径的url
     *        例如 pageInfo = {
     *              url:'https://www.cc.com/dd' //优先完整路径
     *              pathName:''/abc.html''
     *        }
     * @param windowName "_blank" "_self".(_parent，_top，自定义name的情况未测试，暂时无用。)
     * @param newWindow 在异步代码调用本方法时，需要先在同步代码段中打开空的window，否则浏览器会进行拦截。
     */
    prototype.openWindow = function (pageInfo, windowName, newWindow) {
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
                url = location.hostname + pageInfo.pathname;
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

            Object.prototype.deinit = function (observedObject) {
                if ('delegate' in this) {
                    this.delegate = undefined;
                }
                if ('dataSource' in this) {
                    this.dataSource = undefined;
                }
                NotificationCenter["default"].removeObserver(this);
                if (observedObject) {
                    observedObject.removeObserver(this);
                }
            };

            Object.prototype.isMemberOf = function (Class) {
                if (typeof Class === 'function') {
                    if (this.__proto__) {
                        // jshint ignore:line
                        return this.__proto__ === Class.prototype; // jshint ignore:line
                    }
                    return this.constructor === Class;
                } else {
                    throw new TypeError('Class ' + Class + '\'s value is not valid Class');
                }
            };

            Object.prototype.isKindOf = function (Class) {
                if (typeof Class === 'function') {
                    Function.requireArgumentNumber(arguments, 1);
                    return this instanceof Class;
                } else {
                    throw new TypeError('Class ' + Class + '\'s value is not valid Class');
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

            /**
             * 不能向对象添加额外的私有属性，故不能使用KVC添加额外的属性。如果有添加属性需要，可以使用对象自身的扩展功能。
             *  @param Class 类对象
             * @param propertiesMap
             */
            Object.prototype.enablePrivateProperty = function (Class, propertiesMap) {
                var superGetPrivate, superSetPrivate, superInitProperties;
                for (var key in propertiesMap) {
                    if (this.hasOwnProperty(key)) {
                        throw new Error('Duplicate key ' + key + '.');
                    }
                }
                if ('setPrivate' in this) {
                    superGetPrivate = this.getPrivate;
                    superSetPrivate = this.setPrivate;
                    superInitProperties = this.superInitProperties;
                }
                this.setPrivate = function (key, value) {
                    if (propertiesMap.hasOwnProperty(key) && Class === this.constructor) {
                        propertiesMap[key] = value;
                    } else if (typeof superSetPrivate === 'function') {
                        superSetPrivate(key, value);
                    } else {
                        throw new Error('Class ' + this.getClass() + ' doesn\'t have a property ' + key + '.');
                    }
                };
                this.getPrivate = function (key) {
                    if (propertiesMap.hasOwnProperty(key) && Class === this.constructor) {
                        return propertiesMap[key];
                    } else if (typeof superSetPrivate === 'function') {
                        return superGetPrivate(key);
                    } else {
                        throw new Error('Class ' + this.getClass() + ' doesn\'t have a property ' + key + '.');
                    }
                };
                this.initProperties = function (map) {
                    if (Class === this.constructor) {
                        for (var key in map) {
                            if (map.hasOwnProperty(key)) {
                                if (propertiesMap.hasOwnProperty(key)) {
                                    throw new Error('Class ' + this.getClass() + ' has already had a private property named \'' + key + '\'.');
                                } else {
                                    propertiesMap[key] = map[key];
                                }
                            }
                        }
                    } else if (typeof superInitProperties === 'function') {
                        superInitProperties(map);
                    } else {
                        throw new Error('Class ' + Class + ' and  constructor' + this.constructor + ' mismatch.');
                    }
                };
            };

            Object.prototype.setValueForKey = function (key, value) {
                if (this.hasOwnProperty(key)) {
                    this[key] = value;
                    return;
                }
                if (this.setPrivate) {
                    this.setPrivate(key, value);
                } else {
                    throw new Error('Class ' + this.getClass() + ' doesn\'t have a property ' + key + '.');
                }
            };

            Object.prototype.setValuesForKeys = function (keyValueMap) {
                for (var key in keyValueMap) {
                    if (keyValueMap.hasOwnProperty(key)) {
                        this.setValueForKey(key, keyValueMap[key]);
                    }
                }
            };
            Object.prototype.valueForKey = function (key) {
                if (this.hasOwnProperty(key)) {
                    return this[key];
                }
                if (this.get) {
                    return this.get(key);
                }
                throw new Error('Class ' + this.getClass() + ' doesn\'t have a property ' + key + '.');
            };
            function resolveKeyPath(object, keyPath) {
                var keys = keyPath.split('.');
                for (var i = 0; i < keys.length - 1; i++) {
                    object = object.valueForKey(keys[i]);
                    if ((typeof object === "undefined" ? "undefined" : _typeof(object)) !== "object") {
                        throw new Error('KeyPath ' + keyPath + ' is invalid for class ' + this.getClass() + '.');
                    }
                }
                return {
                    object: object,
                    key: keys[keys.length - 1]
                };
            }
            Object.prototype.setValueForKeyPath = function (keyPath, value) {
                var result = resolveKeyPath(this, keyPath);
                result.object.setValueForKey(result.key, value);
            };
            Object.prototype.valueForKeyPath = function (keyPath) {
                var result = resolveKeyPath(this, keyPath);
                return result.object.valueForKey(result.key);
            };
            window.NSKeyValueObservingOptions = {
                "new": 0,
                old: 1,
                initial: 4,
                prior: 8

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
             * 在构造方法中使用，observerListMap为私有属性,用于存放被监视的属性值。
             * observerListMap的每一个List的第0个元素为key对应当前值。故Observer从List第1个元素开始
             * swift允许重复添加observer，即多次添加时会多次触发。每次删除只删除一次添加。
             * 与swift不同的是这里是先添加先触发，swift是后添加先触发
             * @param privatePropertiesMap
             * @param observerListMap
             */
            Object.prototype.enableKVO = function (privatePropertiesMap, observerListMap) {
                Function.requireArgumentNumber(arguments, 1);
                if (observerListMap.isKindOf(window.ListMap)) {
                    this.addObserver = function (observer, keyPath, options, context) {
                        Function.requireArgumentNumber(arguments, 2);
                        function setter(newValue) {
                            var observerList = observerListMap.getAll(keyPath);
                            var oldValue = observerList[0];
                            observerList[0] = newValue;
                            for (var i = 1; i < observerList.length; i++) {
                                if (typeof observerList[i].observer.observeValue === 'function') {
                                    observerList[i].observer.observeValue(this, keyPath, this, {
                                        old: oldValue,
                                        "new": newValue
                                    }, context);
                                }
                            }
                        }
                        function getter(key) {
                            return observerListMap.get(key)[0];
                        }
                        if (!(observer instanceof Object)) {
                            throw new TypeError('Observer must be object type.');
                        } else if (!keyPath || typeof keyPath !== 'string') {
                            throw new TypeError('Key must be string type.');
                        }
                        if (!observerListMap.has(keyPath)) {
                            /* 得到上一层的对象以及最后一层的key */
                            var result = resolveKeyPath(this, keyPath),
                                object = this;
                            /* 该属性可能是私有属性的直接属性，会被resolveKeyPath漏掉 */
                            if (result.object === this && privatePropertiesMap.hasOwnProperty(result.key)) {
                                object = privatePropertiesMap;
                            }
                            /* 保存原有的值到observerListMap[keyPath][0]*/
                            observerListMap.append(keyPath, object[keyPath]);
                            /* 此时已经应用ES5补丁 */
                            if (Object.defineProperty) {
                                Object.defineProperty(object, keyPath, {
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
                        observerListMap.append(keyPath, {
                            observer: observer,
                            context: context
                        });
                    };
                    this.removeObserver = function (observer, keyPath, context) {
                        //todo 是否在移除最后一个观察者后将值还原回去
                        if (keyPath) {
                            /* 删除指定属性的指定观察者 */
                            var observerList = observerListMap.getAll(keyPath);
                            remove(observerListMap, keyPath, observerList, observer);
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
        }

        function extendFunction() {
            /**
             * 用于寄生组合继承,方法名不能为extends，会在IE下报错！
             * @param publicObject  公共方法（如果含有属性不报错）
             * @param superClFunction.prototype.extendass 父类构造函数
             * @param staticObject 静态属性和方法
             */
            Function.prototype.extend = function (superClass) {
                Function.requireArgumentType(superClass, 'function');
                Function.requireArgumentType(this, 'function');
                var Super = function Super() {};
                Super.prototype = superClass.prototype;
                this.prototype = new Super();
                this.prototype.constructor = this;
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

        function transformValue(value) {
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
    };
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

    ;

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
    var prototype = BCSBarButtonItem.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSButton.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;
    ;

    function BCSButton(style) {
        BCSControl.call(this, style);
        var titleLabel = new BCSLabel();
        var imageView = new BCSImageView();
        this.setPrivate('titleLabel', titleLabel);
        this.setPrivate('imageView', imageView);
        this.addSubView(titleLabel);
        this.addSubView(imageView);
    }

    BCSButton.extend(BCSControl);
    var prototype = BCSButton.prototype;
    prototype.getTitleLabel = function () {
        return this.getPrivate('titleLabel');
    };
    prototype.getImageView = function () {
        return this.getPrivate('imageView');
    };
    // Source: src/main/frontend/js/bcs/view/BCSCollectionView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;

    function BCSCollectionView(element) {
        BCSView.call(this, element);
    }
    BCSCollectionView.extend(BCSView);
    var prototype = BCSCollectionView.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSCollectionViewCell.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;

    function BCSCollectionViewCell(element) {
        BCSView.call(this, element);
    }
    BCSCollectionViewCell.extend(BCSView);
    var prototype = BCSCollectionViewCell.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSControl.js


    var BCSControlContentVerticalAlignmentEnum = exports.BCSControlContentVerticalAlignmentEnum = {
        center: 0,
        top: 1,
        bottom: 2,
        fill: 3
    };

    var BCSControlContentHorizontalAlignmentEnum = exports.BCSControlContentHorizontalAlignmentEnum = {
        center: 1,
        left: 2,
        right: 3,
        fill: 4,
        leading: 5,
        trailing: 6
    };

    var BCSControlState = exports.BCSControlState = {
        normal: 1,
        // used when UIControl isHighlighted is set
        highlighted: 2,
        disabled: 3,
        // flag usable by app (see below)
        selected: 4,
        // Applicable only when the screen supports focus
        focused: 5,
        // additional flags available for application use
        application: 6,
        // flags reserved for internal framework use
        reserved: 7
    };

    var BCSControlEvent = exports.BCSControlEvent = {
        touchDown: 1,
        touchDownRepeat: 2,
        touchDragInside: 3,
        touchDragOutside: 4,
        touchDragEnter: 5,
        touchDragExit: 6,
        touchUpInside: 7,
        touchUpOutside: 8,
        touchCancel: 9,
        valueChanged: 10,
        primaryActionTriggered: 11,
        editingDidBegin: 12,
        editingChanged: 13,
        editingDidEnd: 14,
        editingDidEndOnExit: 15,
        allTouchEvents: 16,
        allEditingEvents: 17,
        applicationReserved: 18,
        systemReserved: 19,
        allEvents: 20
    };

    function BCSControl(style, element) {
        BCSView.call(this, style, element);
        // if NO, ignores touch events and subclasses may draw differently
        this.isEnabled = true;
        // may be used by some subclasses or by application
        this.isSelected = false;
        // this gets set/cleared automatically when touch enters/exits during tracking and cleared on up
        this.isHighlighted = false;
        // how to position content vertically inside control. default is center
        this.ontentVerticalAlignment = BCSControlContentVerticalAlignmentEnum.center;
        // how to position content horizontally inside control. default is center
        this.contentHorizontalAlignment = BCSControlContentHorizontalAlignmentEnum.center;
        this.initProperties({
            state: BCSControlState.normal
        });
    }
    BCSControl.extend(BCSView);
    var prototype = BCSControl.prototype;
    // how to position content horizontally inside control, guaranteed to return 'left' or 'right' for any 'leading' or 'trailing'
    prototype.getEffectiveContentHorizontalAlignment = function () {
        return this.getPrivate('effectiveContentHorizontalAlignment');
    };
    // could be more than one state (e.g. disabled|selected). synthesized from other flags.
    prototype.getState = function () {
        return this.getPrivate('state');
    };
    prototype.getIsTracking = function () {
        return this.getPrivate('isTracking');
    };
    // valid during tracking only
    prototype.getIsTouchInside = function () {
        return this.getPrivate('isTouchInside');
    };
    // get info about target & actions. this makes it possible to enumerate all target/actions by checking for each event kind
    prototype.getAllTargets = function () {
        return this.getPrivate('allTargets');
    };
    // list of all events that have at least one action
    prototype.getAllControlEvents = function () {
        return this.getPrivate('allControlEvents');
    };
    prototype.get = function () {
        return this.getPrivate('');
    };

    prototype.beginTracking = function (touch, event) {};

    prototype.continueTracking = function (touch, event) {};
    // touch is sometimes nil if cancelTracking calls through to this.
    prototype.endTracking = function (touch, event) {};
    // event may be nil if cancelled for non-event reasons, e.g. removed from window
    prototype.cancelTracking = function (event) {};

    // add target/action for particular event. you can call this multiple times and you can specify multiple target/actions for a particular event.
    // passing in nil as the target goes up the responder chain. The action may optionally include the sender and the event in that order
    // the action cannot be NULL. Note that the target is not retained.
    prototype.addTarget = function (target, action, controlEvents) {};

    // remove the target/action for a set of events. pass in NULL for the action to remove all actions for that target
    prototype.removeTarget = function (target, action, controlEvents) {};
    // set may include NSNull to indicate at least one nil target
    // list of all events that have at least one action
    // single event. returns NSArray of NSString selector names. returns nil if none
    prototype.actions = function (target, controlEvent) {};

    // send the action. the first method is called for the event and is a point at which you can observe or override behavior. it is called repeately by the second.
    prototype.sendAction = function (action, target, event) {};
    // send all actions associated with events
    prototype.sendActions = function (controlEvents) {};
    // Source: src/main/frontend/js/bcs/view/BCSDatePicker.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;

    function BCSDatePicker(element) {
        BCSView.call(this, element);
    }
    BCSDatePicker.extend(BCSView);
    var prototype = BCSDatePicker.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSImageView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSImageView(style, imageSrc) {
        BCSView1.call(this, style, 'img');
        if (imageSrc) {
            this.getLayer().src = imageSrc;
        }
        this.isUserInteractionEnabled = false;
        this.highlightedImage = null;
        this.isHighlighted = false;
        this.animationImages = [];
        this.highlightedAnimationImages = [];
        // for one cycle of images. default is number of images * 1/30th of a second (i.e. 30 fps)
        this.animationDuration = 0;
        // 0 means infinite (default is 0)
        this.animationRepeatCount = 0;
        this.tintColor = 0;
        this.isAnimating = false;
    }

    BCSImageView.extend(BCSView);
    var prototype = BCSImageView.prototype;
    prototype.startAnimating = function () {};
    prototype.stopAnimating = function () {};
    // Source: src/main/frontend/js/bcs/view/BCSLabel.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSLabel(style) {
        BCSView1.call(this, style, 'label');
    }

    BCSLabel.extend(BCSView);
    var prototype = BCSLabel.prototype;
    prototype.setText = function (text) {
        var element = this.getLayer();
        if ('innerText' in element) {
            element.innerText = text;
        } else {
            element.textContent = text;
        }
    };
    // Source: src/main/frontend/js/bcs/view/BCSNavigationBar.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;

    function BCSBarButton() {}
    BCSBarButton.extend(BCSButton);
    var prototype1 = BCSBarButton.prototype;

    function BCSNavigationBar() {
        BCSView1.call(this, BCSNavigationBar.style);
        this.isTranslucent = false;
        this.delegate = null;
    }

    BCSNavigationBar.extend(BCSView);
    BCSNavigationBar.style = {
        width: '100%',
        height: '44px',
        // borderBottom:'solid 1px #333',
        backgroundColor: 'rgba(255,255,255,0.8)'
    };
    var prototype2 = BCSNavigationBar.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSNavigationItem.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;

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
    BCSNavigationItem.extend(BCSView);
    var prototype = BCSNavigationItem.prototype;
    prototype.setHidesBackButton = function (hidesBackButton, animated) {};

    prototype.setLeftBarButtonItems = function (hidesBackButton, animated) {};
    prototype.setRightBarButtonItems = function (hidesBackButton, animated) {};
    // Source: src/main/frontend/js/bcs/view/BCSPageControl.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;

    function BCSPageControl(element) {
        BCSView.call(this, element);
    }
    BCSPageControl.extend(BCSView);
    var prototype = BCSPageControl.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSPickerView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;

    function BCSPickerView(element) {
        BCSView.call(this, element);
    }
    BCSPickerView.extend(BCSView);
    var prototype = BCSPickerView.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSPoint.js
    /**
     * Created by kenhuang on 2019/3/14.
     */

    function BCSPoint(x, y) {
        this.x = Number(x) || 0.0;
        this.y = Number(y) || 0.0;
    }

    {
        BCSPoint.prototype.equalTo = function (point) {
            return this.x === point.x && this.y === point.y;
        };
        BCSPoint.prototype.distanceFrom = function (point) {
            return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));
        };
        BCSPoint.zero = new BCSPoint();
    }

    function BCSSize(width, height) {
        this.width = Number(width) || 0.0;
        this.height = Number(height) || 0.0;
    }
    BCSSize.zero = new BCSPoint();

    function BCSVector(dx, dy) {
        this.dx = Number(dx) || 0.0;
        this.dy = Number(dy) || 0.0;
    }

    function BCSVector1(point1, point2) {
        return new BCSVector(Number(point2.x - point1.x), Number(point2.y - point1.y));
    }

    {
        BCSVector.prototype.equalTo = function (vector) {
            return this.dx === vector.dx && this.dy === vector.dy;
        };
        BCSVector.prototype.getLength = function () {
            return Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
        };
        BCSVector.prototype.intersectionAngleWith = function (vector) {
            var signValue = vector.dx * this.dy - this.dx * vector.dy;
            if (signValue === 0) {
                return 0;
            } else {
                return Math.acos((this.dx * vector.dx + this.dy * vector.dy) / (this.getLength() * vector.getLength())) * signValue / Math.abs(signValue);
            }
        };
    }

    function BCSRect(origin, size) {
        this.origin = origin || new BCSPoint();
        this.size = size || new BCSSize();
    }

    function BCSRect1(x, y, width, height) {
        var origin = new BCSPoint(x, y);
        var size = new BCSSize(width, height);
        return new BCSRect(origin, size);
    }

    function BCSEdgeInsets(top, left, bottom, right) {
        this.top = top || 0.0;
        this.left = left || 0.0;
        this.bottom = bottom || 0.0;
        this.right = right || 0.0;
    }
    BCSEdgeInsets.zero = new BCSEdgeInsets();
    // Source: src/main/frontend/js/bcs/view/BCSProgressView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;

    function BCSProgressView(element) {
        BCSView.call(this, element);
    }
    BCSProgressView.extend(BCSView);
    var prototype = BCSProgressView.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSRefreshControl.js

    ;

    function BCSRefreshControl(style) {
        BCSControl.call(this, style);
    }
    BCSRefreshControl.extend(BCSControl);
    var prototype = BCSRefreshControl.prototype;
    prototype.getIsRefreshing = function () {};
    // May be used to indicate to the refreshControl that an external event has initiated the refresh action
    prototype.beginRefreshing = function () {};
    // Must be explicitly called when the refreshing has completed
    prototype.endRefreshing = function () {};
    // Source: src/main/frontend/js/bcs/view/BCSScrollView.js
    /**
     * Created by kenhuang on 2019/1/25.
     */

    ;
    ;

    var BCSScrollViewIndicatorStyleEnum = exports.BCSScrollViewIndicatorStyleEnum = {
        Default: 0,
        black: 1,
        white: 2
    };

    var BCSScrollViewKeyboardDismissModeEnum = exports.BCSScrollViewKeyboardDismissModeEnum = {
        none: 0,
        // dismisses the keyboard when a drag begins
        onDrag: 1,
        // the keyboard follows the dragging touch off screen, and may be pulled upward again to cancel the dismiss
        interactive: 2
    };

    var BCSScrollViewIndexDisplayModeEnum = exports.BCSScrollViewIndexDisplayModeEnum = {
        // the index will show or hide automatically as needed
        automatic: 0,
        // the index will never be displayed
        alwaysHidden: 1
    };

    var BCSScrollViewContentInsetAdjustmentBehaviorEnum = exports.BCSScrollViewContentInsetAdjustmentBehaviorEnum = {
        // Similar to .scrollableAxes, but for backward compatibility will also adjust the top & bottom contentInset when the scroll view is owned by a view controller with automaticallyAdjustsScrollViewInsets = YES inside a navigation controller, regardless of whether the scroll view is scrollable
        automatic: 0,
        // Edges for scrollable axes are adjusted (i.e., contentSize.width/height > frame.size.width/height or alwaysBounceHorizontal/Vertical = YES)
        scrollableAxes: 1,
        // contentInset is not adjusted
        never: 2,
        // contentInset is always adjusted by the scroll view's safeAreaInsets
        always: 3
    };

    function BCSScrollView(style, element) {
        BCSView.call(this, style, element);
        this.initProperties({
            /* When contentInsetAdjustmentBehavior allows, UIScrollView may incorporate
             its safeAreaInsets into the adjustedContentInset.
            */
            adjustedContentInset: BCSEdgeInsets.zero,
            /* contentLayoutGuide anchors (e.g., contentLayoutGuide.centerXAnchor, etc.) refer to
             the untranslated content area of the scroll view.
            */
            // contentLayoutGuide: UILayoutGuide,
            /* frameLayoutGuide anchors (e.g., frameLayoutGuide.centerXAnchor) refer to
             the untransformed frame of the scroll view.
             */
            // frameLayoutGuide:UILayoutGuide,
            /*
             Scrolling with no scroll bars is a bit complex. on touch down, we don't know if the user will want to scroll or track a subview like a control.
             on touch down, we start a timer and also look at any movement. if the time elapses without sufficient change in position, we start sending events to
             the hit view in the content subview. if the user then drags far enough, we switch back to dragging and cancel any tracking in the subview.
             the methods below are called by the scroll view and give subclasses override points to add in custom behaviour.
             you can remove the delay in delivery of touchesBegan:withEvent: to subviews by setting delaysContentTouches to NO.
             */
            // returns YES if user has touched. may not yet have started dragging
            isTracking: false,
            // returns YES if user has started scrolling. this may require some time and or distance to move to initiate dragging
            isDragging: false,
            // returns YES if user isn't dragging (touch up) but scroll view is still moving
            isDecelerating: false

        });

        this.contentOffset = BCSPoint.zero;
        this.contentSize = BCSSize.zero;
        this.contentInset = BCSEdgeInsets.zero;
        /* Configure the behavior of adjustedContentInset.
         Default is UIScrollViewContentInsetAdjustmentAutomatic.
         */
        this.contentInsetAdjustmentBehavior = null; // UIScrollView.ContentInsetAdjustmentBehavior
        this.delegate = null; // UIScrollViewDelegate
        // if YES, try to lock vertical or horizontal scrolling while dragging
        this.isDirectionalLockEnabled = false;
        // if YES, bounces past edge of content and back again
        this.bounces = true;
        // if YES and bounces is YES, even if content is smaller than bounds, allow drag vertically
        this.alwaysBounceVertical = false;
        // default NO. if YES and bounces is YES, even if content is smaller than bounds, allow drag horizontally
        this.alwaysBounceHorizontal = false;
        // default NO. if YES, stop on multiples of view bounds
        this.isPagingEnabled = false;
        // default YES. turn off any dragging temporarily
        this.isScrollEnabled = true;
        // default YES. show indicator while we are tracking. fades out after tracking
        this.showsHorizontalScrollIndicator = true;
        // default YES. show indicator while we are tracking. fades out after tracking
        this.showsVerticalScrollIndicator = true;
        // default is UIEdgeInsetsZero. adjust indicators inside of insets
        this.scrollIndicatorInsets = BCSEdgeInsets.zero;
        // default is UIScrollViewIndicatorStyleDefault
        this.indicatorStyle = BCSScrollViewIndicatorStyleEnum.Default;
        this.decelerationRate = BCSScrollViewDecelerationRate.normal;
        this.indexDisplayMode = BCSScrollViewIndexDisplayModeEnum.automatic;
        //if NO, we immediately call -touchesShouldBegin:withEvent:inContentView:. this has no effect on presses
        this.delaysContentTouches = true;
        //if NO, then once we start tracking, we don't try to drag if the touch moves. this has no effect on presses
        this.canCancelContentTouches = true;
        /*
         the following properties and methods are for zooming. as the user tracks with two fingers, we adjust the offset and the scale of the content. When the gesture ends, you should update the content
         as necessary. Note that the gesture can end and a finger could still be down. While the gesture is in progress, we do not send any tracking calls to the subview.
         the delegate must implement both viewForZoomingInScrollView: and scrollViewDidEndZooming:withView:atScale: in order for zooming to work and the max/min zoom scale must be different
         note that we are not scaling the actual scroll view but the 'content view' returned by the delegate. the delegate must return a subview, not the scroll view itself, from viewForZoomingInScrollview:
         */
        this.minimumZoomScale = 1.0;
        // must be > minimum zoom scale to enable zooming
        this.maximumZoomScale = 1.0;
        this.zoomScale = 1.0;
        // default is YES. if set, user can go past min/max zoom while gesturing and the zoom will animate to the min/max value at gesture end
        this.bouncesZoom = true;
        // When the user taps the status bar, the scroll view beneath the touch which is closest to the status bar will be scrolled to top, but only if its `scrollsToTop` property is YES, its delegate does not return NO from `-scrollViewShouldScrollToTop:`, and it is not already at the top.
        // On iPhone, we execute this gesture only if there's one on-screen scroll view with `scrollsToTop` == YES. If more than one is found, none will be scrolled.
        this.scrollsToTop = true;
        // Use these accessors to configure the scroll view's built-in gesture recognizers.
        // Do not change the gestures' delegates or override the getters for these properties.
        this.keyboardDismissMode = BCSScrollViewKeyboardDismissModeEnum.none;
        // this.refreshControl = new BCSRefreshControl()
    }
    BCSScrollView.extend(BCSView);
    var prototype = BCSScrollView.prototype;
    prototype.getContentLayoutGuide = function () {
        return this.getPrivate('contentLayoutGuide');
    };
    prototype.getFrameLayoutGuide = function () {
        return this.getPrivate('frameLayoutGuide');
    };
    prototype.getIsTracking = function () {
        return this.getPrivate('isTracking');
    };
    prototype.getIsDragging = function () {
        return this.getPrivate('isDragging');
    };
    prototype.getIsDecelerating = function () {
        return this.getPrivate('isDecelerating');
    };
    // returns YES if user in zoom gesture
    prototype.getIsZooming = function () {
        return this.getPrivate('isZooming');
    };
    // returns YES if we are in the middle of zooming back to the min/max value
    prototype.getIsZoomBouncing = function () {
        return this.getPrivate('isZoomBouncing');
    };
    // Change `panGestureRecognizer.allowedTouchTypes` to limit scrolling to a particular set of touch types.
    prototype.getPanGestureRecognizer = function () {
        return this.getPrivate('panGestureRecognizer');
    };
    // `pinchGestureRecognizer` will return nil when zooming is disabled.
    prototype.getPinchGestureRecognizer = function () {
        return this.getPrivate('pinchGestureRecognizer');
    };
    // `directionalPressGestureRecognizer` is disabled by default, but can be enabled to perform scrolling in response to up / down / left / right arrow button presses directly, instead of scrolling indirectly in response to focus updates.
    prototype.getDirectionalPressGestureRecognizer = function () {
        return this.getPrivate('directionalPressGestureRecognizer');
    };

    prototype.adjustedContentInsetDidChange = function () {};
    // animate at constant velocity to new offset
    prototype.setContentOffset = function (contentOffset, animated) {};

    //         //如果容器位置大于等于0时，则在拖动时就启用橡皮筋，否则进行滑屏直到屏幕底部
    //         //防止误点击
    //         // 速度残留，需要在touchstart将速度设置为0
    //         // 1/2跳转
    //         //防抖动
    //         //横竖方向都适用
    //         //即点即停

    // scroll so rect is just visible (nearest edges). nothing if rect completely visible
    prototype.scrollRectToVisible = function (rect, animated) {};
    // displays the scroll indicators for a short time. This should be done whenever you bring the scroll view to front.
    prototype.flashScrollIndicators = function (rect, animated) {};
    // override points for subclasses to control delivery of touch events to subviews of the scroll view
    // called before touches are delivered to a subview of the scroll view. if it returns NO the touches will not be delivered to the subview
    // this has no effect on presses
    // default returns YES
    prototype.touchesShouldBegin = function (touches, event, view) {};
    // called before scrolling begins if touches have already been delivered to a subview of the scroll view. if it returns NO the touches will continue to be delivered to the subview and scrolling will not occur
    // not called if canCancelContentTouches is NO. default returns YES if view isn't a UIControl
    // this has no effect on presses
    prototype.touchesShouldCancel = function (view) {};
    prototype.setZoomScale = function (scale, animated) {};
    prototype.zoom = function (rect, animated) {};

    function BCSScrollViewDecelerationRate(rawValue) {}
    BCSScrollViewDecelerationRate.normal = new BCSScrollViewDecelerationRate();
    BCSScrollViewDecelerationRate.fast = new BCSScrollViewDecelerationRate()

    //
    // public protocol UIScrollViewDelegate : NSObjectProtocol {
    //
    //
    // @available(iOS 2.0, *)
    //     optional public func scrollViewDidScroll(_ scrollView: UIScrollView) // any offset changes
    //
    // @available(iOS 3.2, *)
    //     optional public func scrollViewDidZoom(_ scrollView: UIScrollView) // any zoom scale changes
    //
    //
    //     // called on start of dragging (may require some time and or distance to move)
    // @available(iOS 2.0, *)
    //     optional public func scrollViewWillBeginDragging(_ scrollView: UIScrollView)
    //
    //     // called on finger up if the user dragged. velocity is in points/millisecond. targetContentOffset may be changed to adjust where the scroll view comes to rest
    // @available(iOS 5.0, *)
    //     optional public func scrollViewWillEndDragging(_ scrollView: UIScrollView, withVelocity velocity: CGPoint, targetContentOffset: UnsafeMutablePointer<CGPoint>)
    //
    //     // called on finger up if the user dragged. decelerate is true if it will continue moving afterwards
    // @available(iOS 2.0, *)
    //     optional public func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool)
    //
    //
    // @available(iOS 2.0, *)
    //     optional public func scrollViewWillBeginDecelerating(_ scrollView: UIScrollView) // called on finger up as we are moving
    //
    // @available(iOS 2.0, *)
    //     optional public func scrollViewDidEndDecelerating(_ scrollView: UIScrollView) // called when scroll view grinds to a halt
    //
    //
    // @available(iOS 2.0, *)
    //     optional public func scrollViewDidEndScrollingAnimation(_ scrollView: UIScrollView) // called when setContentOffset/scrollRectVisible:animated: finishes. not called if not animating
    //
    //
    // @available(iOS 2.0, *)
    //     optional public func viewForZooming(in scrollView: UIScrollView) -> UIView? // return a view that will be scaled. if delegate returns nil, nothing happens
    //
    //         @available(iOS 3.2, *)
    //     optional public func scrollViewWillBeginZooming(_ scrollView: UIScrollView, with view: UIView?) // called before the scroll view begins zooming its content
    //
    // @available(iOS 2.0, *)
    //     optional public func scrollViewDidEndZooming(_ scrollView: UIScrollView, with view: UIView?, atScale scale: CGFloat) // scale between minimum and maximum. called after any 'bounce' animations
    //
    //
    // @available(iOS 2.0, *)
    //     optional public func scrollViewShouldScrollToTop(_ scrollView: UIScrollView) -> Bool // return a yes if you want to scroll to the top. if not defined, assumes YES
    //
    // @available(iOS 2.0, *)
    //     optional public func scrollViewDidScrollToTop(_ scrollView: UIScrollView) // called when scrolling animation finished. may be called immediately if already at top
    //
    //
    //     /* Also see -[UIScrollView adjustedContentInsetDidChange]
    //      */
    // @available(iOS 11.0, *)
    //     optional public func scrollViewDidChangeAdjustedContentInset(_ scrollView: UIScrollView)
    // }


    ;
    // Source: src/main/frontend/js/bcs/view/BCSSlider.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;

    function BCSSlider(element) {
        BCSView.call(this, element);
    }
    BCSSlider.extend(BCSView);
    var prototype = BCSSlider.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSSwitch.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;

    function BCSSwitch(element) {
        BCSView.call(this, element);
    }
    BCSSwitch.extend(BCSView);
    var prototype = BCSSwitch.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSTabBar.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;

    function BCSTabBar() {
        BCSView1.call(this, {
            bottom: '0px',
            width: '100%'
        });
    }
    BCSTabBar.extend(BCSView);
    var prototype = BCSTabBar.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSTabBarItem.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;

    function BCSTabBarItem(element) {
        BCSView.call(this, element);
    }
    BCSTabBarItem.extend(BCSView);
    var prototype = BCSTabBarItem.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSTableView.js
    /**
     * Created by kenhuang on 2019/1/26.
     */

    var BCSTableViewStyleEnum = {
        plain: 1,
        grouped: 2
    };

    var BCSTableViewScrollPositionEnum = {
        none: 1,
        top: 2,
        middle: 3,
        bottom: 4
    };

    var BCSTableViewRowAnimationEnum = {
        fade: 1,
        // slide in from right (or out to right)
        right: 2,
        left: 3,
        top: 4,
        bottom: 5,
        none: 6,
        // attempts to keep cell centered in the space it will/did occupy
        middle: 7,
        // chooses an appropriate animation style for you
        automatic: 8
    };
    var BCSTableViewSeparatorInsetReferenceEnum = {
        fromCellEdges: 1,
        fromAutomaticInsets: 2
    };
    var BCSTableViewRowActionStyle = {
        Default: 1,
        normal: 2
    };

    function BCSTableViewRowAction() {}

    var indexSearch = '';
    var automaticDimension = 10.0;
    var selectionDidChangeNotification = '';
    function BCSTableView() {}
    BCSTableView.extend(BCSScrollView);
    var prototype = BCSTableView.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSTableViewCell.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    var BCSTableViewCellStyleEnum = {
        Default: 1,
        value1: 2,
        value2: 3,
        subtitle: 4
    };

    var BCSTableViewCellSelectionStyleEnum = {
        none: 1,
        blue: 2,
        gray: 3,
        Default: 4
    };
    var BCSTableViewCellFocusStyleEnum = {
        Default: 1,
        custom: 2
    };

    var BCSTableViewCellEditingStyleEnum = {
        none: 1,
        "delete": 2,
        insert: 3
    };

    var BCSTableViewCellAccessoryTypeEnum = {
        none: 1,
        disclosureIndicator: 2,
        detailDisclosureButton: 3,
        checkmark: 4,
        detailButton: 5
    };

    var BCSTableViewCellDragStateEnum = {
        none: 1,
        lifting: 2,
        dragging: 3
    };

    function BCSTableViewCell(style, element) {
        BCSView.call(this, style, element);
        // this.setPrivate('imageView',)
        // this.setPrivate('textLabel',)
        // this.setPrivate('detailTextLabel',)
        // this.setPrivate('contentView',)
        // this.setPrivate('reuseIdentifier',)
        // // default is UITableViewCellEditingStyleNone. This is set by UITableView using the delegate's value for cells who customize their appearance accordingly.
        // this.setPrivate('editingStyle',)
        // this.setPrivate('showingDeleteConfirmation',)
        var propertiesMap = {};
        this.initProperties(propertiesMap);
        this.backgroundView = null;
        this.selectedBackgroundView = null;
        this.multipleSelectionBackgroundView = null;
        this.selectionStyle = BCSTableViewCellSelectionStyleEnum.Default;
        this.isSelected = false;
        this.isHighlighted = false;
        this.showsReorderControl = false;
        this.shouldIndentWhileEditing = true;
        this.accessoryType = BCSTableViewCellAccessoryTypeEnum.none;
        this.accessoryView = null;
        this.editingAccessoryType = BCSTableViewCellEditingStyleEnum.none;
        this.editingAccessoryView = null;
        this.indentationLevel = 0;
        this.indentationWidth = 10.0;
        this.separatorInset = null;
        this.isEditing = false;
        this.focusStyle = BCSTableViewCellFocusStyleEnum.Default;
        this.userInteractionEnabledWhileDragging = false;
    }

    BCSTableViewCell.extend(BCSView);
    var prototype = BCSTableViewCell.prototype;
    prototype.getImageView = function () {
        return this.getPrivate('imageView');
    };
    prototype.getTextLabel = function () {
        return this.getPrivate('textLabel');
    };
    prototype.getDetailTextLabel = function () {
        return this.getPrivate('detailTextLabel');
    };
    prototype.getContentView = function () {
        return this.getPrivate('contentView');
    };
    prototype.getReuseIdentifier = function () {
        return this.getPrivate('reuseIdentifier');
    };
    prototype.getEditingStyle = function () {
        return this.getPrivate('editingStyle');
    };
    prototype.getShowingDeleteConfirmation = function () {
        return this.getPrivate('showingDeleteConfirmation');
    };
    prototype.prepareForReuse = function () {};
    prototype.setSelected = function (selected, animated) {};
    prototype.setHighlighted = function (highlighted, animated) {};
    prototype.setEditing = function (editing, animated) {};

    prototype.willTransition = function (state) {};
    prototype.didTransition = function (state) {};

    prototype.dragStateDidChange = function (dragState) {};
    // Source: src/main/frontend/js/bcs/view/BCSTextField.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;

    function BCSTextField(element) {
        BCSView.call(this, element);
    }
    BCSTextField.extend(BCSView);
    var prototype = BCSTextField.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSTextView.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    function BCSTextView(element) {
        BCSView.call(this, element, 'textarea');
    }
    BCSTextView.extend(BCSView);
    // Source: src/main/frontend/js/bcs/view/BCSToolbar.js
    /**
     * Created by kenhuang on 2019/2/16.
     */

    ;
    var style = {
        width: '100%',
        height: '44px',
        bottom: '0px',
        backgroundColor: 'red'
    };
    function BCSToolbar() {
        BCSView1.call(this, style);
    }
    BCSToolbar.extend(BCSView);
    var prototype = BCSToolbar.prototype;
    // Source: src/main/frontend/js/bcs/view/BCSView.js
    /**
     * Created by kenhuang on 2019/1/10.
     */

    var componentName = 'view';
    function BCSView(style, element) {
        if (!element) {
            element = document.createElement('div');
        }
        var propertiesMap = {
            layer: element,
            subViews: generateSubViews(element),
            gestureRecognizers: []
        };
        this.enablePrivateProperty(propertiesMap);
        if ((typeof style === "undefined" ? "undefined" : _typeof(style)) === 'object') {
            if (!style.hasOwnProperty('position')) {
                style.position = 'absolute';
            }
        } else {
            style = { position: 'absolute' };
        }
        this.setStyle(style);
        /* 方便调试 */
        element.setAttribute(componentName, this.getClass());
    }

    var prototype = BCSView.prototype;
    prototype.getLayer = function () {
        return this.getPrivate('layer');
    };
    prototype.getSubViews = function () {
        return this.getPrivate('subViews');
    };

    prototype.getGestureRecognizers = function () {
        return this.getPrivate('gestureRecognizers');
    };

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
                    touches = [];
                    delegate = recognizer.delegate;
                    if (event.type === EventTypeEnum.TOUCH_START) {
                        if (delegate && delegate.shouldReceiveTouch) {
                            for (j = 0; j < event.changedTouches.length; j++) {
                                if (delegate.shouldReceiveTouch(recognizer, event.changedTouches[j])) {
                                    touches.push(event.changedTouches[j]);
                                }
                            }
                        } else {
                            for (j = 0; j < event.changedTouches.length; j++) {
                                touches.push(event.changedTouches[j]);
                            }
                        }
                    } else if (recognizer.state >= BCSGestureRecognizerStateEnum.ENDED) {
                        continue;
                    } else {
                        for (j = 0; j < event.changedTouches.length; j++) {
                            if (recognizer.hasAvailableTouch(event.changedTouches[j])) {
                                touches.push(event.changedTouches[j]);
                            }
                        }
                        if (touches.length === 0) {
                            continue;
                        }
                    }
                    switch (event.type) {
                        case EventTypeEnum.TOUCH_START:
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

    prototype.addGestureRecognizer = function (gestureRecognizer) {
        this.removeGestureRecognizer(gestureRecognizer);
        gestureRecognizer.setPrivate('view', this);
        this.getGestureRecognizers().push(gestureRecognizer);
        //todo
        if (!this.get('isListenersAdded')) {
            addListeners(this);
            this.set('isListenersAdded', true);
        }
    };

    prototype.removeGestureRecognizer = function (gestureRecognizer) {
        var gestureRecognizerList = this.getGestureRecognizers();
        gestureRecognizer.setPrivate('view', null);
        for (var i = 0; i < gestureRecognizerList.length; i++) {
            if (gestureRecognizerList[i] === gestureRecognizer) {
                gestureRecognizerList.splice(i, 1);
                // break 防止有更多的同一个gestureRecognizer
            }
        }
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
        var element = document.getElementById(id);
        if (element) {
            /* 已经自行使用component='xxx'指定类型 */
            var Class = window[element.getAttribute(componentName)];
            if (!Class) {
                /*根据标签名创建相应类型的View*/
                Class = window['BCS' + element.tagName.toFirstUpperCase()];
            }
            if (Class) {
                return new Class(null, element);
            } else {
                if (element.tagName !== 'div') {
                    console.log(id + ' is initialized as BCSView.');
                }
                return new BCSView(null, element);
            }
        } else {
            return null;
        }
    };
    /**
     * 手势识别器已经识别出手势，执行状态已经改变的手势识别器进行识别。
     * @param stateChangedRecognizers
     */
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
    //BCSView恰好是BCS.js最后一个类,在此手动将module.exports复制到window上以便外部代码访问
    Object.prototype.shallowCopy.call(window, module.exports);
    // Source: src/main/frontend/js/bcs/view/recognizer/BCSGestureRecognizer.js
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
        /*确定为缩放的最小移动距离*/
        pinchMinOffset: 8,
        /*确定为缩放的最小移动距离*/
        rotationMinAngle: 0.1,
        /*确定为平移的最小移动距离*/
        panMinOffset: 10

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
        var propertiesMap = {
            actionMap: new Map(),
            view: null,
            /*手势识别器本次识别应该考虑的touch (identifier:touch),按照identifier排序*/
            availableTouches: {},
            dependentSet: new Set()
        };
        this.enablePrivateProperty(propertiesMap);
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

    var prototype = BCSGestureRecognizer.prototype;
    prototype.reset = function () {
        this.setPrivate('availableTouches', {});
        this.setPrivate('dependentSet', new Set());
    };
    //本识别器失败后，dependent才能继续识别
    prototype.addDependent = function (dependent) {
        this.getPrivate('dependentSet').add(dependent);
    };
    prototype.hasDependent = function (dependent) {
        return this.getPrivate('dependentSet').has(dependent);
    };

    prototype.ignoreAvailableTouches = function () {
        var availableTouches = this.getPrivate('availableTouches'),
            event = this.getPrivate('event');
        for (var identifier in availableTouches) {
            if (availableTouches.hasOwnProperty(identifier)) {
                this.ignore(availableTouches[identifier], event);
            }
        }
    };

    prototype.ignore = function (touch, event) {
        delete this.getPrivate('availableTouches')[touch.identifier];
    };

    /* number of touches involved for which locations can be queried */
    prototype.getNumberOfTouches = function () {
        return Object.keys(this.getPrivate('availableTouches')).length;
    };

    prototype.hasAvailableTouch = function (touch) {
        return this.getPrivate('availableTouches').hasOwnProperty(touch.identifier);
    };

    prototype.removeAvailableTouches = function (touches) {
        var availableTouches = this.getPrivate('availableTouches');
        if (touches) {
            for (var i = 0; i < touches.length; i++) {
                delete availableTouches[touches[i].identifier];
            }
        } else {
            this.setPrivate('availableTouches', {});
        }
    };

    /**
     * 手势在view中的大概位置，通常是中心点
     * @param view
     * @returns {{}}
     */
    prototype.locate = function (view) {
        var touches = this.getPrivate('availableTouches'),
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
        var touches = this.getPrivate('availableTouches');
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
        var actionMap = this.getPrivate('availableTouches');
        if (target && action) {
            Function.requireArgumentType(target, 'object');
            Function.requireArgumentType(action, 'function');
            actionMap.set(action, target);
        }
    };

    prototype.removeTarget = function (target, action) {
        var actionMap = this.getPrivate('availableTouches');
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
        return this.getPrivate('view');
    };

    prototype.executeActions = function () {
        var actionMap = this.getPrivate('availableTouches');
        actionMap.forEach(function (target, action) {
            action.call(target, this);
        }.bind(this));
    };

    function refreshAvailableTouches(self, touches, isStrict) {
        var availableTouches = this.getPrivate('availableTouches');
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
    // Source: src/main/frontend/js/bcs/view/recognizer/BCSLongPressGestureRecognizer.js
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
        var propertiesMap = {
            numberOfContinualTaps: 0,
            /*第一次点击时的位置即基准位置，或者长按的基准位置。两个位置可以不同*/
            initTapStartLocation: new BCSPoint(),
            currentTouchBeganTimeStamp: 0,
            numberOfOffTouches: 0,
            isAvailableTouchesRemovable: false,
            timer: undefined
        };
        this.initProperties(propertiesMap);
    }

    BCSLongPressGestureRecognizer.extend(BCSGestureRecognizer);
    var prototype = BCSLongPressGestureRecognizer.prototype;
    prototype.getNumberOfTouches = function () {
        return BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired && this.getPrivate('numberOfContinualTaps') === this.numberOfTapsRequired ? this.numberOfTouchesRequired : 0;
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
        this.setPrivate('numberOfContinualTaps', 0);
        this.setPrivate('initTapStartLocation', new BCSPoint());
        this.setPrivate('currentTouchBeganTimeStamp', 0);
        this.setPrivate('numberOfOffTouches', 0);
        this.setPrivate('isAvailableTouchesRemovable', false);
        clearTimeout(this.getPrivate('timer'));
        this.setPrivate('timer', undefined);
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

    function startTimer(self, interval) {
        self.setPrivate('timer', setTimeout(function () {
            if (self.state !== BCSGestureRecognizerStateEnum.FAILED) {
                self.state = BCSGestureRecognizerStateEnum.FAILED;
                self.ignoreAvailableTouches();
                self.reset();
            }
            console.log('reset');
        }, interval));
    }
    /**
     * touches不一定同时进来
     * @param touches
     * @param event
     */
    prototype.touchesBegan = function (touches, event) {
        if (this.state !== BCSGestureRecognizerStateEnum.BEGAN && this.state !== BCSGestureRecognizerStateEnum.CHANGED) {
            if (touches.length + BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) <= this.numberOfTouchesRequired) {
                if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === 0) {
                    /*停止连续敲击倒计时并开始新一轮敲击计时*/
                    this.setPrivate('timer', clearTimeout(this.setPrivate('timer')));
                    this.setPrivate('currentTouchBeganTimeStamp', event.timeStamp);
                    this.setPrivate('isAvailableTouchesRemovable', false);
                    this.state = BCSGestureRecognizerStateEnum.POSSIBLE;
                    if (this.getPrivate('numberOfContinualTaps') < this.numberOfTapsRequired) {
                        startTimer(this, defaults.onInterval);
                    }
                }
                BCSGestureRecognizer.prototype.touchesBegan.call(this, touches, event);
                if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired) {
                    if (this.getPrivate('numberOfContinualTaps') < this.numberOfTapsRequired) {
                        if (this.getPrivate('numberOfContinualTaps') === 0) {
                            this.setPrivate('initTapStartLocation', BCSGestureRecognizer.prototype.locate.call(this, this.getView().window));
                        } else {
                            /* 检查本次触点和第一次触点距离是否过大*/
                            if (this.getPrivate('initTapStartLocation').distanceFrom(BCSGestureRecognizer.prototype.locate.call(this, this.getView().window)) > defaults.offsetThreshold) {
                                this.setPrivate('timer', clearTimeout(this.setPrivate('timer')));
                                this.state = BCSGestureRecognizerStateEnum.FAILED;
                                return;
                            }
                        }
                        this.setPrivate('timer', clearTimeout(this.setPrivate('timer')));
                        startTimer(this, defaults.onInterval * 2 - event.timeStamp + this.getPrivate('currentTouchBeganTimeStamp'));
                    } else {
                        /*开始长按*/
                        this.setPrivate('currentTouchBeganTimeStamp', event.timeStamp);
                        this.setPrivate('initTapStartLocation', BCSGestureRecognizer.prototype.locate.call(this, this.getView().window));
                        this.setPrivate('timer', setTimeout(function () {
                            this.state = BCSGestureRecognizerStateEnum.BEGAN;
                            this.getView().executeStateChangedRecognizers([this]);
                        }.bind(this), this.minimumPressDuration * 1000));
                    }
                }
            } else {
                this.setPrivate('timer', clearTimeout(this.setPrivate('timer')));
                this.state = BCSGestureRecognizerStateEnum.FAILED;
            }
        } else {
            for (var i = 0; i < touches.length; i++) {
                this.ignore(touches[i], event);
            }
        }
    };

    prototype.touchesMoved = function (touches, event) {
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired) {
            if (this.getPrivate('numberOfContinualTaps') < this.numberOfTapsRequired) {
                if (event.targetTouches.length < this.numberOfTouchesRequired || this.getPrivate('initTapStartLocation').distanceFrom(BCSGestureRecognizer.prototype.locate.call(this, this.getView().window)) > defaults.offsetThreshold) {
                    this.setPrivate('timer', clearTimeout(this.setPrivate('timer')));
                    this.state = BCSGestureRecognizerStateEnum.FAILED;
                }
            } else {
                /*长按移动*/
                if (BCSGestureRecognizer.prototype.locate.call(this, this.getView().window).distanceFrom(this.getPrivate('initTapStartLocation')) > this.allowableMovement) {
                    this.setPrivate('timer', clearTimeout(this.setPrivate('timer')));
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
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired) {
            if (this.getPrivate('numberOfContinualTaps') === this.numberOfTapsRequired) {
                /*长按未完成，则报错*/
                if (this.state !== BCSGestureRecognizerStateEnum.BEGAN && this.state !== BCSGestureRecognizerStateEnum.CHANGED || this.delegate && this.delegate.shouldBegin && !this.delegate.shouldBegin()) {
                    this.setPrivate('timer', clearTimeout(this.setPrivate('timer')));
                    this.state = BCSGestureRecognizerStateEnum.FAILED;
                } else {
                    this.state = BCSGestureRecognizerStateEnum.ENDED;
                }
            } else {
                /* 手指可能先后离开屏幕,从而触发多次touchesEnded */
                for (var i = 0; i < touches.length; i++) {
                    if (this.hasAvailableTouch(touches[i])) {
                        if (this.getPrivate('numberOfOffTouches') + 1 === this.numberOfTouchesRequired) {
                            /*本轮结束，停止计时*/
                            this.setPrivate('timer', clearTimeout(this.setPrivate('timer')));
                            this.setPrivate('numberOfContinualTaps', this.getPrivate('numberOfContinualTaps') + 1);
                            /*连续敲击倒计时*/
                            startTimer(this, defaults.offInterval);
                            this.setPrivate('isAvailableTouchesRemovable', true);
                        } else {
                            this.setPrivate('numberOfOffTouches', this.getPrivate('numberOfOffTouches') + 1);
                        }
                    }
                }
            }
        } else {
            this.setPrivate('timer', clearTimeout(this.setPrivate('timer')));
            this.state = BCSGestureRecognizerStateEnum.FAILED;
        }
    };

    prototype.removeAvailableTouches = function (touches) {
        if (this.getPrivate('isAvailableTouchesRemovable')) {
            this.setPrivate('numberOfOffTouches', 0);
            BCSGestureRecognizer.prototype.removeAvailableTouches.call(this);
        }
    };
    // Source: src/main/frontend/js/bcs/view/recognizer/BCSPanGestureRecognizer.js
    /**
     * Created by kenhuang on 2019/3/12.
     */

    // Begins:  when at least minimumNumberOfTouches have moved enough to be considered a pan
    // Changes: when a finger moves while at least minimumNumberOfTouches are down
    // Ends:    when all fingers have lifted
    function BCSPanGestureRecognizer(target, action) {
        BCSGestureRecognizer.call(this, target, action);
        this.minimumNumberOfTouches = 1;
        this.maximumNumberOfTouches = Number.MAX_SAFE_INTEGER;
        var propertiesMap = {
            initLocation: null,
            panLocation: null,
            lastTimestamp: 0,
            translation: new BCSPoint(0, 0),
            velocity: new BCSPoint(0, 0)
        };
        this.initProperties(propertiesMap);
    }

    BCSPanGestureRecognizer.extend(BCSGestureRecognizer);
    var prototype = BCSPanGestureRecognizer.prototype;

    prototype.getNumberOfTouches = function () {
        var number = BCSGestureRecognizer.prototype.getNumberOfTouches.call(this);
        return number <= this.maximumNumberOfTouches ? number : this.maximumNumberOfTouches;
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
        this.setPrivate('initLocation', null);
        this.setPrivate('panLocation', null);
        this.setPrivate('lastTimestamp', 0);
        this.setPrivate('translation', new BCSPoint(0, 0));
        this.setPrivate('velocity', new BCSPoint(0, 0));
    };

    prototype.shouldRequireFailureOf = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSPanGestureRecognizer) && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSPanGestureRecognizer) && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    prototype.touchesBegan = function (touches, event) {
        if (this.state === BCSGestureRecognizerStateEnum.BEGAN || this.state === BCSGestureRecognizerStateEnum.CHANGED) {
            var touchesNeeded = [],
                i,
                numberNeeded = this.maximumNumberOfTouches - BCSGestureRecognizer.prototype.getNumberOfTouches.call(this);
            for (i = 0; i < numberNeeded && i < touches.length; i++) {
                touchesNeeded.push(touches[i]);
            }
            BCSGestureRecognizer.prototype.touchesBegan.call(this, touchesNeeded, event);
        } else {
            this.state = BCSGestureRecognizerStateEnum.POSSIBLE;
            BCSGestureRecognizer.prototype.touchesBegan.call(this, touches, event);
            var number = BCSGestureRecognizer.prototype.getNumberOfTouches.call(this);
            if (number > this.maximumNumberOfTouches) {
                this.state = BCSGestureRecognizerStateEnum.FAILED;
            } else if (number >= this.minimumNumberOfTouches) {
                this.setPrivate('initLocation', BCSGestureRecognizer.prototype.locate.call(this, this.getView().window));
                this.setPrivate('lastTimestamp', event.timeStamp);
            }
        }
    };

    function setTranslation(self, event, location) {
        var duration = (event.timeStamp - self.getPrivate('lastTimestamp')) / 1000,
            deltaX = location.x - self.getPrivate('panLocation').x,
            deltaY = location.y - self.getPrivate('panLocation').y,
            translation = self.getPrivate('translation');
        self.setPrivate('translation', new BCSPoint(translation.x + deltaX, translation.y + deltaY));
        self.setPrivate('velocity', new BCSPoint(deltaX / duration, deltaY / duration));
        self.setPrivate('panLocation', location);
        self.setPrivate('lastTimestamp', event.timeStamp);
    }

    prototype.touchesMoved = function (touches, event) {
        BCSGestureRecognizer.prototype.touchesMoved.call(this, touches, event);
        var location = BCSGestureRecognizer.prototype.locate.call(this, this.getView().window),
            delta = 0;
        switch (this.state) {
            case BCSGestureRecognizerStateEnum.POSSIBLE:
                if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) >= this.minimumNumberOfTouches) {
                    delta = location.x - this.getPrivate('initLocation').x;
                    if (Math.abs(delta) >= defaults.panMinOffset) {
                        if (delta < 0) {
                            this.setPrivate('panLocation', new BCSPoint(this.getPrivate('initLocation').x - defaults.panMinOffset, location.y));
                        } else {
                            this.setPrivate('panLocation', new BCSPoint(this.getPrivate('initLocation').x + defaults.panMinOffset, location.y));
                        }
                        this.state = BCSGestureRecognizerStateEnum.BEGAN;
                        setTranslation();
                    }
                    delta = location.y - this.getPrivate('initLocation').y;
                    if (Math.abs(delta) >= defaults.panMinOffset) {
                        if (delta < 0) {
                            this.setPrivate('panLocation', new BCSPoint(location.x, this.getPrivate('initLocation').y - defaults.panMinOffset));
                        } else {
                            this.setPrivate('panLocation', new BCSPoint(location.x, this.getPrivate('initLocation').y + defaults.panMinOffset));
                        }
                        this.state = BCSGestureRecognizerStateEnum.BEGAN;
                        setTranslation();
                    }
                }
                break;
            case BCSGestureRecognizerStateEnum.BEGAN:
                this.state = BCSGestureRecognizerStateEnum.CHANGED;
                setTranslation();
                break;
            case BCSGestureRecognizerStateEnum.CHANGED:
                setTranslation();
                break;
            default:

        }
    };

    prototype.touchesEnded = function (touches, event) {
        BCSGestureRecognizer.prototype.touchesEnded.call(this, touches, event);
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === touches.length) {
            if (this.state === BCSGestureRecognizerStateEnum.BEGAN || this.state === BCSGestureRecognizerStateEnum.CHANGED) {
                this.state = BCSGestureRecognizerStateEnum.ENDED;
            } else {
                this.state = BCSGestureRecognizerStateEnum.FAILED;
            }
        } else {
            setTimeout(function () {
                BCSGestureRecognizer.prototype.removeAvailableTouches.call(this, touches);
            }.bind(this));
        }
    };

    prototype.translation = function (view) {
        return this.getPrivate('translation');
    };

    prototype.setTranslation = function (translation, view) {
        this.setPrivate('translation', translation);
    };

    prototype.velocity = function (view) {
        return this.getPrivate('velocity');
    };
    // Source: src/main/frontend/js/bcs/view/recognizer/BCSPinchGestureRecognizer.js
    /**
     * Created by kenhuang on 2019/3/12.
     */

    var NUMBER_OF_TOUCHES_REQUIRED = 2;

    // Begins:  when two touches have moved enough to be considered a pinch
    // Changes: when a finger moves while two fingers remain down
    // Ends:    when both fingers have lifted

    function BCSPinchGestureRecognizer(target, action) {
        BCSGestureRecognizer.call(this, target, action);
        var propertiesMap = {
            scale: 1,
            /*放大为正，缩小为负*/
            velocity: 0,
            initDistance: 0,
            scaleDistance: 0,
            lastTimestamp: 0
        };
        this.initProperties(propertiesMap);
    }

    var pinchGestureRecognizerMap = {};
    BCSPinchGestureRecognizer.extend(BCSGestureRecognizer);
    var prototype = BCSPinchGestureRecognizer.prototype;
    prototype.getNumberOfTouches = function () {
        return BCSGestureRecognizer.prototype.getNumberOfTouches.call(this);
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
        this.setPrivate('scale', 1);
        this.setPrivate('velocity', 0);
        this.setPrivate('initDistance', 0);
        this.setPrivate('scaleDistance', 0);
        this.setPrivate('lastTimestamp', 0);
    };

    prototype.getScale = function () {
        return pinchGestureRecognizerMap[this.getKey()].scale;
    };
    prototype.getVelocity = function () {
        return pinchGestureRecognizerMap[this.getKey()].velocity;
    };
    prototype.shouldRequireFailureOf = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSPinchGestureRecognizer) && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSPinchGestureRecognizer) && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    prototype.touchesBegan = function (touches, event) {
        this.state = BCSGestureRecognizerStateEnum.POSSIBLE;
        var touchesNeeded = [],
            i = 0,
            numberNeeded = NUMBER_OF_TOUCHES_REQUIRED - BCSGestureRecognizer.prototype.getNumberOfTouches.call(this);
        for (i = 0; i < numberNeeded && i < touches.length; i++) {
            touchesNeeded.push(touches[i]);
        }
        BCSGestureRecognizer.prototype.touchesBegan.call(this, touchesNeeded, event);
        if (this.getPrivate('lastTimestamp') === 0 && BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === NUMBER_OF_TOUCHES_REQUIRED) {
            this.setPrivate('initDistance', BCSGestureRecognizer.prototype.locateTouch.call(this, 0, this.getView().window).distanceFrom(BCSGestureRecognizer.prototype.locateTouch.call(this, 1, this.getView().window)));
            this.setPrivate('lastTimestamp', event.timeStamp);
        }
        if (this.state !== BCSGestureRecognizerStateEnum.BEGAN && this.state !== BCSGestureRecognizerStateEnum.CHANGED) {
            this.state = BCSGestureRecognizerStateEnum.POSSIBLE;
        }
        for (; i < touches.length; i++) {
            this.ignore(touches[i], event);
        }
    };
    function calculateScaleVelocity(self) {
        var distanceAfterUpdate = 0;
        var scale = distanceAfterUpdate / self.getPrivate('scaleDistance');
        var duration = event.timeStamp - self.getPrivate('lastTimestamp');
        if (duration !== 0) {
            //todo 不知道为何会出现duration = 0
            self.setPrivate('velocity', (scale - self.getPrivate('scale')) / duration * 1000);
        }
        self.setPrivate('lastTimestamp', event.timeStamp);
        self.setPrivate('scale', scale);
    }
    //抬起后scale和velocity保持不变，可以抬起一根手指后重新按下与另一根手指重新形成新手势
    prototype.touchesMoved = function (touches, event) {
        var distanceAfterUpdate = 0;
        BCSGestureRecognizer.prototype.touchesMoved.call(this, touches, event);
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === NUMBER_OF_TOUCHES_REQUIRED) {
            distanceAfterUpdate = BCSGestureRecognizer.prototype.locateTouch.call(this, 0, this.getView().window).distanceFrom(BCSGestureRecognizer.prototype.locateTouch.call(this, 1, this.getView().window));
            switch (this.state) {
                case BCSGestureRecognizerStateEnum.POSSIBLE:
                    var delta = distanceAfterUpdate - this.getPrivate('initDistance');
                    if (Math.abs(delta) >= defaults.pinchMinOffset) {
                        this.setPrivate('scaleDistance', this.getPrivate('initDistance') + delta / Math.abs(delta) * defaults.pinchMinOffset);
                        this.state = BCSGestureRecognizerStateEnum.BEGAN;
                        calculateScaleVelocity(this);
                    }
                    break;
                case BCSGestureRecognizerStateEnum.BEGAN:
                    this.state = BCSGestureRecognizerStateEnum.CHANGED;
                    calculateScaleVelocity(this);
                    break;
                case BCSGestureRecognizerStateEnum.CHANGED:
                    calculateScaleVelocity(this);
                    break;
                default:
            }
        }
    };

    prototype.touchesEnded = function (touches, event) {
        BCSGestureRecognizer.prototype.touchesEnded.call(this, touches, event);
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === touches.length) {
            if (this.state === BCSGestureRecognizerStateEnum.BEGAN || this.state === BCSGestureRecognizerStateEnum.CHANGED) {
                this.state = BCSGestureRecognizerStateEnum.ENDED;
            } else {
                this.state = BCSGestureRecognizerStateEnum.FAILED;
            }
        } else {
            setTimeout(function () {
                BCSGestureRecognizer.prototype.removeAvailableTouches.call(this, touches);
            }.bind(this));
        }
    };
    // Source: src/main/frontend/js/bcs/view/recognizer/BCSRotationGestureRecognizer.js
    /**
     * Created by kenhuang on 2019/3/12.
     */

    var NUMBER_OF_TOUCHES_REQUIRED = 2;

    // Begins:  when two touches have moved enough to be considered a rotation
    // Changes: when a finger moves while two fingers are down
    // Ends:    when both fingers have lifted

    function BCSRotationGestureRecognizer(target, action) {
        BCSGestureRecognizer.call(this, target, action);
        var propertiesMap = {
            rotation: 0,
            /*顺时针为正，逆时针为负*/
            velocity: 0,
            initVector: null,
            lastVector: 0,
            lastTimestamp: 0
        };
        this.initProperties(propertiesMap);
    }

    var rotationGestureRecognizerMap = {};
    BCSRotationGestureRecognizer.extend(BCSGestureRecognizer);
    var prototype = BCSRotationGestureRecognizer.prototype;
    prototype.getNumberOfTouches = function () {
        return BCSGestureRecognizer.prototype.getNumberOfTouches.call(this);
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
        this.setPrivate('rotation', 0);
        this.setPrivate('velocity', 0);
        this.setPrivate('initVector', null);
        this.setPrivate('rotateAngle', 0);
        this.setPrivate('lastTimestamp', 0);
    };

    prototype.getRotation = function () {
        return rotationGestureRecognizerMap[this.getKey()].rotation;
    };
    prototype.getVelocity = function () {
        return rotationGestureRecognizerMap[this.getKey()].velocity;
    };
    prototype.shouldRequireFailureOf = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSRotationGestureRecognizer) && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
        if (otherGestureRecognizer.isKindOf(BCSRotationGestureRecognizer) && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
            return true;
        }
        return false;
    };

    prototype.touchesBegan = function (touches, event) {
        var touchesNeeded = [],
            i = 0,
            numberNeeded = NUMBER_OF_TOUCHES_REQUIRED - BCSGestureRecognizer.prototype.getNumberOfTouches.call(this);
        for (i = 0; i < numberNeeded && i < touches.length; i++) {
            touchesNeeded.push(touches[i]);
        }
        BCSGestureRecognizer.prototype.touchesBegan.call(this, touchesNeeded, event);
        if (!this.getPrivate('initVector') && BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === NUMBER_OF_TOUCHES_REQUIRED) {
            this.setPrivate('initVector', new BCSVector1(BCSGestureRecognizer.prototype.locateTouch.call(this, 0, this.getView().window), BCSGestureRecognizer.prototype.locateTouch.call(this, 1, this.getView().window)));
            this.setPrivate('lastTimestamp', event.timeStamp);
        }
        if (this.state !== BCSGestureRecognizerStateEnum.BEGAN && this.state !== BCSGestureRecognizerStateEnum.CHANGED) {
            this.state = BCSGestureRecognizerStateEnum.POSSIBLE;
        }
        for (; i < touches.length; i++) {
            this.ignore(touches[i], event);
        }
    };
    function calculateRotationVelocity(self) {
        var vectorAfterUpdate = self.getPrivate('lastVector');
        var delta = vectorAfterUpdate.intersectionAngleWith(self.getPrivate('lastVector'));
        self.setPrivate('rotation', self.getPrivate('rotation') + delta);
        var duration = event.timeStamp - self.getPrivate('lastTimestamp');
        if (duration > 0) {
            //todo 不知道为何会出现duration = 0
            self.setPrivate('velocity', delta / duration * 1000);
        }
        self.setPrivate('lastTimestamp', event.timeStamp);
        self.setPrivate('lastVector', vectorAfterUpdate);
    }
    //抬起后rotation和velocity保持不变，可以抬起一根手指后重新按下与另一根手指重新形成新手势
    prototype.touchesMoved = function (touches, event) {
        var vectorAfterUpdate, delta, duration;
        BCSGestureRecognizer.prototype.touchesMoved.call(this, touches, event);
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === NUMBER_OF_TOUCHES_REQUIRED) {
            vectorAfterUpdate = new BCSVector1(BCSGestureRecognizer.prototype.locateTouch.call(this, 0, this.getView().window), BCSGestureRecognizer.prototype.locateTouch.call(this, 1, this.getView().window));
            switch (this.state) {
                case BCSGestureRecognizerStateEnum.POSSIBLE:
                    delta = vectorAfterUpdate.intersectionAngleWith(this.getPrivate('initVector'));
                    if (Math.abs(delta) >= defaults.rotationMinAngle) {
                        this.state = BCSGestureRecognizerStateEnum.BEGAN;
                        if (delta < 0) {
                            this.setPrivate('rotation', delta + defaults.rotationMinAngle);
                        } else {
                            this.setPrivate('rotation', delta - defaults.rotationMinAngle);
                        }
                        duration = event.timeStamp - this.getPrivate('lastTimestamp');
                        if (duration !== 0) {
                            this.setPrivate('velocity', this.getPrivate('rotation') / duration * 1000);
                        }
                        this.setPrivate('lastTimestamp', event.timeStamp);
                        this.setPrivate('lastVector', vectorAfterUpdate);
                    }
                    break;
                case BCSGestureRecognizerStateEnum.BEGAN:
                    this.state = BCSGestureRecognizerStateEnum.CHANGED;
                    calculateRotationVelocity();
                    break;
                case BCSGestureRecognizerStateEnum.CHANGED:
                    calculateRotationVelocity();
                    break;
                default:
            }
        }
    };

    prototype.touchesEnded = function (touches, event) {
        BCSGestureRecognizer.prototype.touchesEnded.call(this, touches, event);
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === touches.length) {
            if (this.state === BCSGestureRecognizerStateEnum.BEGAN || this.state === BCSGestureRecognizerStateEnum.CHANGED) {
                this.state = BCSGestureRecognizerStateEnum.ENDED;
            } else {
                this.state = BCSGestureRecognizerStateEnum.FAILED;
            }
        } else {
            setTimeout(function () {
                BCSGestureRecognizer.prototype.removeAvailableTouches.call(this, touches);
            }.bind(this));
        }
    };
    // Source: src/main/frontend/js/bcs/view/recognizer/BCSSwipeGestureRecognizer.js
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
        var propertiesMap = {
            swipeStartPoint: null,
            swipeStartTimeStamp: 0,
            swipeNumberOfTouches: 0,
            newTotalX: 0,
            newTotalY: 0,
            /*满足开始触发swipe条件时touch成员*/
            previousTouches: {}
        };
        this.initProperties(propertiesMap);
    }

    var swipeGestureRecognizerMap = {};
    BCSSwipeGestureRecognizer.extend(BCSGestureRecognizer);
    var prototype = BCSSwipeGestureRecognizer.prototype;
    prototype.reset = function () {
        BCSGestureRecognizer.prototype.reset.call(this);
        this.setPrivate('swipeStartPoint', null);
        this.setPrivate('swipeStartTimeStamp', 0);
        /*满足开始触发swipe条件时touch成员*/
        this.setPrivate('swipeNumberOfTouches', 0);
        this.setPrivate('previousTouches', {});
        this.setPrivate('newTotalX', 0);
        this.setPrivate('newTotalY', 0);
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
        this.state = BCSGestureRecognizerStateEnum.POSSIBLE;
        if (numberOfAllTouches <= this.numberOfTouchesRequired) {
            for (var i = 0; i < touches.length; i++) {
                this.getPrivate('previousTouches')[touches[i].identifier] = touches[i];
            }
            this.setPrivate('swipeStartTimeStamp', event.timeStamp);
            this.setPrivate('swipeStartPoint', BCSGestureRecognizer.prototype.locate.call(this, this.getView().window));
            this.setPrivate('swipeNumberOfTouches', this.getPrivate('swipeNumberOfTouches') + touches.length);
        }
    };

    function refreshStatus(self, touch) {
        var newTotalX = self.getPrivate('newTotalX'),
            newTotalY = self.getPrivate('newTotalY');
        newTotalX += touch.pageX - self.getPrivate('previousTouches')[touch.identifier].pageX;
        newTotalY += touch.pageY - self.getPrivate('previousTouches')[touch.identifier].pageY;
        self.setPrivate('newTotalX', newTotalX);
        self.setPrivate('newTotalY', newTotalY);
        self.getPrivate('previousTouches')[touch.identifier] = touch;
    }

    prototype.touchesMoved = function (touches, event) {
        var i,
            numberOfTouches = this.getNumberOfTouches();
        /* 1.如果同时放入超过指定数量的手指，移动时并不会报错，直到手指抬起为止，可以往任意方向移动,从触摸到屏幕开始计算，不会超时
         * 2.可能还计算移动速率，觉得复杂，没有实现
         */
        if (touches.length <= this.getNumberOfTouches()) {
            if (event.timeStamp - this.getPrivate('swipeStartTimeStamp') <= defaults.swipeMaxDuration) {
                var touch, previousTouch;
                switch (this.direction) {
                    case BCSSwipeGestureRecognizerDirectionEnum.RIGHT:
                        for (i = 0; i < touches.length; i++) {
                            touch = touches[i];
                            previousTouch = this.getPrivate('previousTouches')[touch.identifier];
                            if (previousTouch) {
                                if (touch.pageX - previousTouch.pageX <= 0) {
                                    this.state = BCSGestureRecognizerStateEnum.FAILED;
                                    return;
                                } else {
                                    refreshStatus(this, touch);
                                }
                            }
                        }
                        break;
                    case BCSSwipeGestureRecognizerDirectionEnum.LEFT:
                        for (i = 0; i < touches.length; i++) {
                            touch = touches[i];
                            previousTouch = this.getPrivate('previousTouches')[touch.identifier];
                            if (previousTouch) {
                                if (touch.pageX - previousTouch.pageX >= 0) {
                                    this.state = BCSGestureRecognizerStateEnum.FAILED;
                                    return;
                                } else {
                                    refreshStatus(this, touch);
                                }
                            }
                        }
                        break;
                    case BCSSwipeGestureRecognizerDirectionEnum.UP:
                        for (i = 0; i < touches.length; i++) {
                            touch = touches[i];
                            previousTouch = this.getPrivate('previousTouches')[touch.identifier];
                            if (previousTouch) {
                                if (touch.pageY - previousTouch.pageY >= 0) {
                                    this.state = BCSGestureRecognizerStateEnum.FAILED;
                                    return;
                                } else {
                                    refreshStatus(this, touch);
                                }
                            }
                        }
                        break;
                    case BCSSwipeGestureRecognizerDirectionEnum.DOWN:
                        for (i = 0; i < touches.length; i++) {
                            touch = touches[i];
                            previousTouch = this.getPrivate('previousTouches')[touch.identifier];
                            if (previousTouch) {
                                if (touch.pageY - previousTouch.pageY <= 0) {
                                    this.state = BCSGestureRecognizerStateEnum.FAILED;
                                    return;
                                } else {
                                    refreshStatus(this, touch);
                                }
                            }
                        }
                        break;
                    default:
                }
                if (this.getNumberOfTouches() === this.numberOfTouchesRequired && this.getPrivate('swipeStartPoint').distanceFrom(new BCSPoint(this.getPrivate('newTotalX') / numberOfTouches, this.getPrivate('newTotalY') / numberOfTouches)) >= defaults.swipeOffsetThreshold) {
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
    // Source: src/main/frontend/js/bcs/view/recognizer/BCSTapGestureRecognizer.js
    /**
     * Created by kenhuang on 2019/3/12.
     */

    // Recognizes: when numberOfTouchesRequired have tapped numberOfTapsRequired times

    // Touch Location Behaviors:
    //     locationInView:         location of the tap, from the first tap in the sequence if numberOfTapsRequired > 1. this is the centroid if numberOfTouchesRequired > 1
    //     locationOfTouch:inView: location of a particular touch, from the first tap in the sequence if numberOfTapsRequired > 1

    function BCSTapGestureRecognizer(target, action) {
        BCSGestureRecognizer.call(this, target, action);
        var propertiesMap = {
            numberOfContinualTaps: 0,
            /*第一次点击时的位置即基准位置，此时numberOfTouchesRequired条件已满足*/
            initTapStartLocation: new BCSPoint(),
            currentTouchBeganTimeStamp: 0,
            numberOfOffTouches: 0,
            isAvailableTouchesRemovable: false,
            timer: undefined
        };
        this.initProperties(propertiesMap);
        this.numberOfTapsRequired = 1;
        this.numberOfTouchesRequired = 1;
    }

    BCSTapGestureRecognizer.extend(BCSGestureRecognizer);
    var prototype = BCSTapGestureRecognizer.prototype;
    prototype.getNumberOfTouches = function () {
        return BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired ? this.numberOfTouchesRequired : 0;
    };

    prototype.locate = function (view) {
        var location = this.getPrivate('initTapStartLocation');
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
        this.setPrivate('numberOfContinualTaps', 0);
        this.setPrivate('initTapStartLocation', new BCSPoint());
        this.setPrivate('currentTouchBeganTimeStamp', 0);
        this.setPrivate('numberOfOffTouches', 0);
        clearTimeout(this.getPrivate('timer'));
        this.setPrivate('timer', undefined);
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

    function startTimer(self, interval) {
        self.setPrivate('timer', setTimeout(function () {
            if (self.state !== BCSGestureRecognizerStateEnum.FAILED) {
                self.state = BCSGestureRecognizerStateEnum.FAILED;
                self.ignoreAvailableTouches();
                self.reset();
            }
            console.log('reset');
        }, interval));
    }

    /**
     * touches不一定同时进来
     * @param touches
     * @param event
     */
    prototype.touchesBegan = function (touches, event) {
        if (touches.length + BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) <= this.numberOfTouchesRequired) {
            if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === 0) {
                /*停止连续敲击倒计时并开始新一轮敲击计时*/
                clearTimeout(this.getPrivate('timer'));
                this.setPrivate('timer', undefined);
                this.setPrivate('currentTouchBeganTimeStamp', event.timeStamp);
                this.setPrivate('isAvailableTouchesRemovable', false);
                startTimer(this, defaults.onInterval);
                this.state = BCSGestureRecognizerStateEnum.POSSIBLE;
            }
            BCSGestureRecognizer.prototype.touchesBegan.call(this, touches, event);
            if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired) {
                if (this.getPrivate('numberOfContinualTaps') === 0) {
                    this.setPrivate('initTapStartLocation', BCSGestureRecognizer.prototype.locate.call(this, this.getView().window));
                } else {
                    /* 检查本次触点和第一次触点距离是否过大*/
                    if (this.getPrivate('initTapStartLocation').distanceFrom(BCSGestureRecognizer.prototype.locate.call(this, this.getView().window)) > defaults.offsetThreshold) {
                        this.setPrivate('timer', clearTimeout(this.getPrivate('timer')));
                        this.state = BCSGestureRecognizerStateEnum.FAILED;
                        return;
                    }
                }
                this.setPrivate('timer', clearTimeout(this.getPrivate('timer')));
                startTimer(this, defaults.onInterval * 2 - event.timeStamp + this.getPrivate('currentTouchBeganTimeStamp'));
            }
        } else {
            this.setPrivate('timer', clearTimeout(this.getPrivate('timer')));
            this.state = BCSGestureRecognizerStateEnum.FAILED;
        }
    };

    prototype.touchesMoved = function (touches, event) {
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired && (event.targetTouches.length < this.numberOfTouchesRequired || this.getPrivate('initTapStartLocation').distanceFrom(BCSGestureRecognizer.prototype.locate.call(this, this.getView().window))) > defaults.offsetThreshold) {
            this.setPrivate('timer', clearTimeout(this.getPrivate('timer')));
            this.state = BCSGestureRecognizerStateEnum.FAILED;
        }
    };

    prototype.touchesEnded = function (touches, event) {
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired) {
            /* 手指可能先后离开屏幕,从而触发多次touchesEnded */
            for (var i = 0; i < touches.length; i++) {
                if (this.hasAvailableTouch(touches[i])) {
                    if (this.getPrivate('numberOfOffTouches') + 1 === this.numberOfTouchesRequired) {
                        /*本轮结束，停止计时*/
                        this.setPrivate('timer', clearTimeout(this.getPrivate('timer')));
                        var numberOfContinualTaps = this.getPrivate('numberOfContinualTaps');
                        this.setPrivate('numberOfContinualTaps', ++numberOfContinualTaps);
                        if (numberOfContinualTaps === this.numberOfTapsRequired) {
                            if (this.delegate && this.delegate.shouldBegin && !this.delegate.shouldBegin()) {
                                this.state = BCSGestureRecognizerStateEnum.FAILED;
                            } else {
                                this.state = BCSGestureRecognizerStateEnum.ENDED;
                            }
                        } else {
                            /*连续敲击倒计时*/
                            startTimer(this, defaults.offInterval);
                            this.getPrivate('isAvailableTouchesRemovable', true);
                        }
                    } else {
                        var numberOfOffTouches = this.getPrivate('numberOfOffTouches');
                        this.setPrivate('numberOfOffTouches', ++numberOfOffTouches);
                    }
                }
            }
        } else {
            this.setPrivate('timer', clearTimeout(this.getPrivate('timer')));
            this.state = BCSGestureRecognizerStateEnum.FAILED;
        }
    };

    prototype.removeAvailableTouches = function (touches) {
        if (this.getPrivate('isAvailableTouchesRemovable')) {
            this.setPrivate('numberOfOffTouches', 0);
            BCSGestureRecognizer.prototype.removeAvailableTouches.call(this);
        }
    };
});
