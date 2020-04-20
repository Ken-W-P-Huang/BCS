/**
 * Created by kenhuang on 2018/12/16.
 */

(function (window,document) {
    function patchDom2() {
        if (document.querySelectorAll ) {
            return
        }
        // import "sizzle.js"
        /**
         * dom method that extend
         */
        var Sizzle = window.Sizzle
        var domExtension = {
            // selector realtive
            querySelector: function(selector) {
                return domExtension.querySelectorAll.call(this, selector)[0] || null
            },
            querySelectorAll: function(selector) {
                if (selector ) {
                    return extendElementsDomFunction(Sizzle(selector, this))
                }
            },
            getElementsByClassName: function(classNames) {
                return this.querySelectorAll("." + classNames.trim().replace(/\s+/, "."))
            },
            // addEventListener
            addEventListener: function(eventType, funcHandle, useCapture) {
                var element = this, eventStoreType = ''
                if (eventType === "input") {
                    eventType = "propertychange"
                }
                if (typeof funcHandle !== "function") {
                    return
                }
                // some compatibility deal
                var eventHandle = function(event) {
                    event = event || window.event || {}

                    if (!event.target) {
                        event.target = event.srcElement
                    }
                    if (!event.preventDefault) {
                        event.preventDefault = function() {
                            event.returnValue = false
                        }
                    }

                    if (eventType === "propertychange") {
                        if (event.propertyName !== "value" || element.r_oldvalue === element.value) {
                            return
                        }
                        element.r_oldvalue = element.value
                    }
                    return funcHandle.call(element, event || {})
                }
                eventHandle.initFuncHandle = funcHandle

                // event bind
                element.attachEvent("on" + eventType, eventHandle)

                // event store
                if (element["event" + eventType]) {
                    element["event" + eventType].push(eventHandle)
                } else {
                    element["event" + eventType] = [eventHandle]
                }
            },
            dispatchEvent: function(event) {
                var eventType = event && event.type
                var handlers = this["event" + eventType]
                if (eventType && this["event" + eventType]) {
                    event.target = this
                    for(var i = 0; i < handlers.length; i++) {
                        event.timeStamp = Date.now()
                        handlers[i].call(this, event)
                    }
                }
            },
            removeEventListener: function(eventType, funcHandle, useCapture) {
                var arrEventStore = this["event" + eventType]
                var self = this
                if (Array.isArray(arrEventStore)) {
                    this["event" + eventType] = arrEventStore.filter(function(eventHandle) {
                        if (eventHandle.initFuncHandle === funcHandle) {
                            self.detachEvent("on" + eventType, eventHandle)
                            return false
                        }
                        return true
                    })
                }
            }

        }

        var extendElementsDomFunction = function(collection) {
            // collection extend some dom method
            for(var i = 0; i < collection.length; i++) {
                for (var key in domExtension) {
                    if(domExtension.hasOwnProperty(key)){
                        collection[i][key] = domExtension[key].bind(collection[i])
                    }
                }
            }
            return collection
        }

        /*
         * document.querySelector, document.querySelectorAll
         */
        document.querySelector = function(selector) {
            return document.querySelectorAll(selector)[0] || null
        }
        document.querySelectorAll = function(selector) {
            var collection = Sizzle(selector)
            return extendElementsDomFunction(collection)
        }
        /*
         * getElementsByClassName
         */
        if (!document.getElementsByClassName) {
            document.getElementsByClassName = function(classNames) {
                return domExtension.getElementsByClassName.call(document, classNames)
            }
        }
        /*
         * addEventListener
         * include event of "input"
         */
        if (typeof document.addEventListener === "undefined") {
            var elements = [window, document]
            for (var i = 0;i < elements.length;i++){
                elements[i].addEventListener = function(eventType, funcHandle, useCapture) {
                    domExtension.addEventListener.call(elements[i], eventType, funcHandle, useCapture)
                }
                elements[i].dispatchEvent = function(event) {
                    domExtension.dispatchEvent.call(elements[i], event)
                }
                elements[i].removeEventListener = function(eventType, funcHandle, useCapture) {
                    domExtension.removeEventListener.call(elements[i], eventType, funcHandle, useCapture)
                }
            }
        }
        if (!document.createEvent) {
            document.createEvent = function(type) {
                var event = {}
                switch (type) {
                    case "Event": case "Events": case "HTMLEvents": {
                    event = {
                        initEvent: function(eventType, canBubble, cancelable) {
                            event.type = eventType
                            event.canBubble = canBubble || false
                            event.cancelable = cancelable || false
                            delete(event.initEvent)
                        },
                        bubbles: false,
                        cancelBubble: false,
                        cancelable: false,
                        clipboardData: undefined,
                        currentTarget: null,
                        defaultPrevented: false,
                        eventPhase: 0,
                        returnValue: true,
                        srcElement: null,
                        target: null,
                        timeStamp: Date.now(),
                        type: ""
                    }

                    break
                }
                    case "MouseEvents": {
                        event = {
                            initMouseEvent: function(eventType, canBubble, cancelable, view,
                                                     detail, screenX, screenY, clientX, clientY,
                                                     ctrlKey, altKey, shiftKey, metaKey,
                                                     button, relatedTarget
                            ) {
                                event.type = eventType
                                event.canBubble = canBubble || false
                                event.cancelable = cancelable || false
                                event.view = view || null
                                event.screenX = screenX || 0
                                event.screenY = screenY || 0
                                event.clientX = clientX || 0
                                event.clientY = clientY || 0
                                event.ctrlKey = ctrlKey || false
                                event.altKey = altKey || false
                                event.shiftKey = shiftKey || false
                                event.metaKey = metaKey || false
                                event.button = button || 0
                                event.relatedTarget = relatedTarget || null
                                delete(event.initMouseEvent)
                            },
                            altKey: false,
                            bubbles: false,
                            button: 0,
                            cancelBubble: false,
                            cancelable: false,
                            charCode: 0,
                            clientX: 0,
                            clientY: 0,
                            clipboardData: undefined,
                            ctrlKey: false,
                            currentTarget: null,
                            dataTransfer: null,
                            defaultPrevented: false,
                            detail: 0,
                            eventPhase: 0,
                            fromElement: null,
                            keyCode: 0,
                            layerX: 0,
                            layerY: 0,
                            metaKey: false,
                            offsetX: 0,
                            offsetY: 0,
                            pageX: 0,
                            pageY: 0,
                            relatedTarget: null,
                            returnValue: true,
                            screenX: 0,
                            screenY: 0,
                            shiftKey: false,
                            srcElement: null,
                            target: null,
                            timeStamp: Date.now(),
                            toElement: null,
                            type: "",
                            view: null,
                            webkitMovementX: 0,
                            webkitMovementY: 0,
                            which: 0,
                            x: 0,
                            y: 0
                        }

                        break
                    }

                    case "UIEvents": {
                        event = {
                            initUIEvent: function(eventType, canBubble, cancelable, view, detail) {
                                event.type = eventType
                                event.canBubble = canBubble || false
                                event.cancelable = cancelable || false
                                event.view = view || null
                                event.detail = detail || 0
                                delete(event.initUIEvent)
                            },
                            bubbles: false,
                            cancelBubble: false,
                            cancelable: false,
                            charCode: 0,
                            clipboardData: undefined,
                            currentTarget: null,
                            defaultPrevented: false,
                            detail: 0,
                            eventPhase: 0,
                            keyCode: 0,
                            layerX: 0,
                            layerY: 0,
                            pageX: 0,
                            pageY: 0,
                            returnValue: true,
                            srcElement: null,
                            target: null,
                            timeStamp: Date.now(),
                            type: "",
                            view: null,
                            which: 0
                        }
                        break
                    }
                    default: {
                        throw new TypeError("NotSupportedError: The implementation did not support the requested type of object or operation.")
                    }
                }
                return event
            }
        }

        /**
         * onhashchange
         */
        // exit if the browser implements that event
        if (!("addEventListener" in document.createElement("div"))) {
            var location = window.location,
                oldURL = location.href,
                oldHash = location.hash

            // check the location hash on a 100ms interval
            setInterval(function() {
                var newURL = location.href,
                    newHash = location.hash

                // if the hash has changed and a handler has been bound...
                if ( newHash !== oldHash && typeof window.onhashchange === "function" ) {
                    // execute the handler
                    window.onhashchange({
                        type: "hashchange",
                        oldURL: oldURL,
                        newURL: newURL
                    })

                    oldURL = newURL
                    oldHash = newHash
                }
            }, 100)

            document._createElement = document.createElement
            document.createElement = function (tagName,options) {
                var element =  document._createElement(tagName,options)
                extendElementsDomFunction([element])
                return element
            }
        }

        /**
         * getComputedStyle
         */
        if (typeof window.getComputedStyle !== "function") {
            window.getComputedStyle = function(el, pseudo) {
                var oStyle = {}
                var oCurrentStyle = el.currentStyle || {}
                for (var key in oCurrentStyle) {
                    if(oCurrentStyle.hasOwnProperty(key)){
                        oStyle[key] = oCurrentStyle[key]
                    }
                }

                oStyle.styleFloat = oStyle.cssFloat

                oStyle.getPropertyValue = function(prop) {
                    // return oCurrentStyle.getAttribute(prop) || null  // IE6 do not support "key-key" but "keyKey"
                    var re = /(\-([a-z]){1})/g
                    if (prop === 'float'){
                        prop = 'styleFloat'
                    }
                    if (re.test(prop)) {
                        prop = prop.replace(re, function () {
                            return arguments[2].toUpperCase()
                        })
                    }
                    return el.currentStyle[prop] ? el.currentStyle[prop] : null
                }
                return oStyle
            }
        }
    }
    /**
     * https://gist.github.com/remy/350433
     * window.name 存放2mb
     * cookies in IE7 and below are limited to 4,096 bytes
     * userdata：https://docs.microsoft.com/en-us/previous-versions/ms531424(v%3Dvs.85)
     * Storages limits https://github.com/marcuswestin/store.js#user-content-list-of-all-storages
     * @param window
     * @constructor
     */
    function LocalStorage(window) {
        var metaKey = '_LocalStorage_'
        var separator = ','
        var domainName = window.location.hostname ? window.location.hostname : 'localHost'
        var expireDate = new Date()
        var dataElement = window.document.createElement('noscript')
        dataElement.style.display = 'none'
        dataElement.addBehavior("#default#userData")
        window.document.getElementsByTagName("head")[0].appendChild(dataElement)
        expireDate.setDate(expireDate.getDate() + 365)
        dataElement.expires = expireDate.toUTCString()
        this.getLength = function () {
            return this.getItem(metaKey).split(separator).length
        }
        this.key = function (i) {
            var keys = this.getItem(metaKey)
            keys = keys.split(separator)
            if(keys.length > i ){
                return keys[i]
            }else{
                return null
            }
        }
        this.setItem = function (key, value) {
            if(key===metaKey){
                throw new Error('"'+metaKey +'" should not be a key!')
            }
            var keys = this.getItem(metaKey)
            if(keys && keys.indexOf(key) === -1){
                keys+=separator + key
                dataElement.setAttribute(metaKey, keys)
            }else if(!keys){
                keys+=key
                dataElement.setAttribute(metaKey, keys)
            }
            dataElement.setAttribute(key, value)
            dataElement.save(domainName)
        }
        this.getItem = function (key) {
            dataElement.load(domainName)
            return dataElement.getAttribute(key)
        }
        this.removeItem = function (key) {
            if(key===metaKey){
                throw new Error('"'+metaKey +'" should not be a key!')
            }
            var keys = this.getItem(metaKey)
            keys.replace(key+separator)
            keys.replace(key)
            dataElement.setAttribute(metaKey, keys)
            dataElement.removeAttribute(key)
            dataElement.save(domainName)
        }
        this.clear = function () {
            var pastDate = new Date()
            pastDate.setDate(pastDate.getDate() -1)
            dataElement.expires = pastDate.toUTCString()
            dataElement.save(domainName)
        }
    }
    function SessionStorage(window) {
        var data = window.name ? JSON.parse(window.name):{}
        SessionStorage.prototype.getLength = function () {
            return Object.keys(data).length
        }
        SessionStorage.prototype.key = function (i) {
            var keys = Object.keys(data)
            return keys.length > i?keys[i]:null
        }
        SessionStorage.prototype.setItem = function (key, value) {
            data[key]= value
            window.name = JSON.stringify(data)
        }
        SessionStorage.prototype.getItem = function (key) {
            return  data[key] || null
        }
        SessionStorage.prototype.removeItem = function (key) {
            delete data[key]
            window.name = JSON.stringify(data)
        }
        SessionStorage.prototype.clear = function () {
            data = {}
            window.name = ''
        }
    }

    function patchStorage(window) {
        if(!window.JSON){
            window.browser.applyPatches('JSON')
        }
        if (!window.localStorage) {
            window.localStorage = new LocalStorage(window)
        }
        if (!window.sessionStorage) {
            window.sessionStorage = new SessionStorage(window)
        }
    }

    function patchDetails() {
        // import "Element.details.ielt8.js"
    }

    // patchBackgroundBorder
    // function patchPNG() {
    //     // import "DD_belatedPNG_0.0.8a.js"
    // }

    if(window.browser){
        window.browser.addPatches({
            // 'patchPNG':patchPNG,
            'patchStorage':patchStorage,
            'patchDetails':patchDetails
        })
    }
    patchDom2()
})(this,this.document)
