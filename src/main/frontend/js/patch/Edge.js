/**
 * Created by kenhuang on 2019/1/28.
 */
(function (window,document) {
    var available = false
    if(Object.defineProperty){
        try{
            Object.defineProperty({},'size',{})
            available = true
        }catch (e){

        }
    }

    function patchPromise() {
        // import 'bluebird.js'
    }

    function patchES6() {
        // import 'es6-shim.js'
    }

    function patchSendBeacon() {
        // import 'sendbeacon.es5.js'
    }

    function patchFormData() {
        if(available){ // jshint ignore:line
            // import 'FormData.es5.js'
        }else{
            (function () {
                if ('FormData' in window){
                    return
                }

                function normalizeArgs (name, value, filename) {
                    return value instanceof Blob
                        // normalize name and filename if adding an attachment
                        ? [String(name), value, filename !== undefined
                        ? filename + '' // Cast filename to string if 3th arg isn't undefined
                        : typeof value.name === 'string' // if name prop exist
                        ? value.name // Use File.name
                        : 'blob'] // otherwise fallback to Blob

                        // If no attachment, just cast the args to strings
                        : [String(name), String(value)]
                }

                function normalizeLineFeeds(value) {
                    return value.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')
                }

                function normalizeValue (array) {
                    Function.requireArgumentNumber(arguments, 1)
                    var value = array[0]
                    var filename
                    if(array.length === 2){
                        filename = array[1]
                    }
                    if (value instanceof Blob) {
                        // Should always returns a new File instance
                        // console.assert(fd.get(x) !== fd.get(x))
                        value = new File([value], filename, {
                            type: value.type,
                            lastModified: value.lastModified
                        })
                    }
                    return value
                }
                function each (arr, cb) {
                    for (var i = 0; i < arr.length; i++) {
                        cb(arr[i])
                    }
                }
                function FormData(form) {
                    var map = {}
                    var self = this
                    this.append = function (name, value,filename) {
                        if ('Blob' in window && value instanceof window.Blob){
                            throw TypeError("Blob not supported")
                        }
                        Function.requireArgumentNumber(arguments, 2)
                        var parms= normalizeArgs.apply(null, arguments)
                        name = parms[0]
                        value = parms[1]
                        filename = parms.length === 3 ?parms[2]:undefined
                        var list = map[name]
                        if (!list) {
                            list = []
                            map[name] = list
                        }
                        list.push([value, filename])
                    }

                    this['delete'] = function (name) {
                        delete map[String(name)]
                    }

                    this.get = function (name) {
                        Function.requireArgumentNumber(arguments, 1)
                        name = String(name)
                        return map[name] ? normalizeValue(map[name][0]) : null
                    }

                    this.getAll = function (name) {
                        Function.requireArgumentNumber(arguments, 1)
                        return (map[String(name)] || []).map(normalizeValue)
                    }

                    this.has = function (name) {
                        Function.requireArgumentNumber(arguments, 1)
                        return map.hasOwnProperty(String(name))
                    }

                    this.set = function (name, value,filename) {
                        Function.requireArgumentNumber(arguments, 2)
                        var parms = normalizeArgs.apply(null, arguments)
                        name = parms[0]
                        value = parms[1]
                        filename = parms.length === 3 ?parms[2]:undefined
                        map[name] = [[value, filename]]
                    }
                    this.forEach = function (callback, thisArg) {
                        Function.requireArgumentNumber(arguments, 1)
                        for (var name in map) {
                            if (map.hasOwnProperty(name)) {
                                map[name].forEach(function (value) { // jshint ignore:line
                                    callback.call(thisArg, value, name, this)
                                }, this)
                            }
                        }
                    }
                    if (!form) {
                        return
                    }
                    each(form.elements, function (element) {
                        if (!element.name || element.disabled || element.type === 'submit' || element.type === 'button'){
                            return
                        }
                        if (element.type === 'file') {
                            each(element.files || [], function (file) {
                                self.append(element.name, file)
                            })
                        } else if (element.type === 'select-multiple' || element.type === 'select-one') {
                            each(element.options,function (options) {
                                !options.disabled && options.selected && self.append(element.name, options.value)
                            })
                        } else if (element.type === 'checkbox' || element.type === 'radio') {
                            if (element.checked) {
                                self.append(element.name, element.value)
                            }
                        } else {
                            var value = element.type === 'textarea' ? normalizeLineFeeds(element.value) : element.value
                            self.append(element.name, value)
                        }
                    })
                }
                {
                    FormData.prototype.keys = function () {
                        var items = []
                        this.forEach(function (value, name) {
                            items.push(name)
                        })
                        return new window.Iterator(items)
                    }

                    FormData.prototype.values = function () {
                        var items = []
                        this.forEach(function (value) {
                            items.push(value)
                        })
                        return new window.Iterator(items)
                    }

                    FormData.prototype.entries = function () {
                        var items = []
                        this.forEach(function (value, name) {
                            items.push([name, normalizeValue(value)])
                        })
                        return new window.Iterator(items)
                    }
                    FormData.prototype.toString = function() {
                        return '[object FormData]'
                    }
                    FormData.prototype.blob = function () {
                        var boundary = '----formdata-polyfill-' + Math.random()
                        var chunks = []
                        this.forEach(function (value,name) {
                            chunks.push('--'+boundary+'\r\n')
                            if (value instanceof Blob) {
                                chunks.push(
                                    'Content-Disposition: form-data; name="'+name+'"; filename="'+value.name+'"\r\n',
                                    'Content-Type: '+(value.type || 'application/octet-stream')+'\r\n\r\n',
                                    value,
                                    '\r\n'
                                )
                            } else {
                                chunks.push(
                                    'Content-Disposition: form-data; name="'+name+'"\r\n\r\n'+value+'\r\n'
                                )
                            }
                        })
                        chunks.push('--'+boundary+'--')
                        return new Blob(chunks, {
                            type: 'multipart/form-data; boundary=' + boundary
                        })
                    }
                }
                window.FormData = FormData
            })()
        }
    }

    function patchIndexedDB() {
        // import 'localforage.js'
    }

    function patchDetails() {
        // import "Element.details.js"
    }



    function patchMeter() {
        // import "meter-polyfill.js"
    }

    function patchOlReverse() {
        // import "ol.js"
    }

    function patchFileSaver() {
        // import 'FileSaver.js'
    }

    function patchMathML() {
        // import 'MathJax.js'
    }

    function patchARIAAccessibility() {
        // import 'accessifyhtml5.js'
        window.AccessifyHTML5 = AccessifyHTML5  // jshint ignore:line
    }

    function patchPicture() {
        // import 'picturefill.js'
    }

    function patchImgSrcset() {
        // import 'respimage.js'
    }

    function patchDom4() {
        // import 'dom4.js'
    }

    function patchEventSource() {
        // import 'eventsource.js'
    }

    function patchFullScreen() {
        // import 'screenfull.js'
    }

    function patchViewportUnits() {
        // import 'viewport-units-buggyfill.js'
        window.viewportUnitsBuggyfill.init()
    }

    function patchCssEscape() {
        // import 'css.escape.js'
    }

    function patchCSSObjectFit() {
        // import 'ofi.js'
    }

    function patchFontFace() {
        // import 'fontfaceobserver.standalone.js'
    }


    // function patchCssRegion() {
    //     // import 'css-regions-polyfill.js'
    // }
    //
    // function patchCssGrid() {
    //     // import 'css-polyfills.js'
    // }

    function patchAPNG() {
        // import 'png.js'
        // import 'zlib.js'
    }

    function patchDatalist() {
        // import 'datalist-polyfill.js'
    }

    function patchSetImmediate() {
        if(!window.setImmediate){
            (function(global){
                var index = 0
                var handles = new Map()
                if(!global.Promise){
                    global.browser.patch(window.PatchEnum.PROMISE)
                }
                global.setImmediate = function(fn){
                    index++
                    var args = Array.from(arguments)
                    args.shift()
                    var p = Promise.resolve(index)
                    handles.set(index,args)
                    p.then(function(id){
                        var args = handles.get(id)
                        if(args){
                            fn.apply(global,args)
                            global.clearImmediate(id)
                        }
                    })
                    return index
                }
                global.clearImmediate=function(id){
                    handles['delete'](id)
                }
            })(window)
        }
    }


    if(window.browser){
        var patches = {
            'patchPromise':patchPromise,
            'patchFetch':patchFetch,
            'patchES6':patchES6,
            'patchFormData':patchFormData,
            'patchIndexedDB':patchIndexedDB,
            'patchSendBeacon':patchSendBeacon,
            'patchMeter':patchMeter,
            'patchOlReverse':patchOlReverse,
            'patchFileSaver':patchFileSaver,
            'patchMathML':patchMathML,
            'patchARIAAccessibility':patchARIAAccessibility,
            'patchPicture':patchPicture,
            'patchImgSrcset':patchImgSrcset,
            'patchEventSource':patchEventSource,
            'patchFullScreen':patchFullScreen,
            'patchFontFace':patchFontFace,
            // 'patchCssRegion':patchCssRegion,
            // 'patchCssGrid':patchCssGrid,
            'patchAPNG':patchAPNG,
            'patchDatalist':patchDatalist,
            'patchSetImmediate':patchSetImmediate
        }
        if(window.browser.isIE && window.browser.version >= 9){
            patches.patchDetails  = patchDetails
            patches.patchViewportUnits = patchViewportUnits
            patches.patchCSSObjectFit = patchCSSObjectFit
        }
        window.browser.addPatches(patches)
    }
    if (window.browser.isIE && window.browser.version >= 8) {
        patchDom4()
    }
    patchFormData()
    patchCssEscape()
    // https://www.w3cschool.cn/fetch_api/fetch_api-6ls42k12.html
    // https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch
    // https://segmentfault.com/a/1190000004322487
    function patchFetch() {
        /* jshint ignore:start */
        if(!window.Promise){
            patchPromise()
        }
        if(typeof  window.fetch === "function"){
            return
        }
        /**
         *
         *  URLSearchParams的key和value均为区分大小写的字符串，按照append的先后顺序存储，key和value可重复，故不使用Map/ListMap
         *  foreach使用fori进行循环，删除时可能会不正确
         *
         */
        function URLSearchParams(init) {
            var list = []
            var i,pairs,key,value,index
            this.append = function (name, value) {
                Function.requireArgumentNumber(arguments, 2)
                list.push([String(name),String(value)])
            }

            this['delete'] = function (name) {
                Function.requireArgumentNumber(arguments, 1)
                for(var i = 0;i<list.length;i++){
                    if(list[i][0] === name){
                        list.splice(i,1)
                        i--
                    }
                }
            }

            this.get = function (name) {
                Function.requireArgumentNumber(arguments, 1)
                for(var i = 0;i<list.length;i++){
                    if(list[i][0] === name){
                        return list[i][1]
                    }
                }
                return null
            }

            this.getAll = function (name) {
                Function.requireArgumentNumber(arguments, 1)
                var allList = []
                for(var i = 0;i < list.length;i++){
                    if(list[i][0] === name){
                        allList.push(list[i][1])
                    }
                }
                return allList
            }

            this.has = function (name) {
                Function.requireArgumentNumber(arguments, 1)
                if(this.get(name)){
                    return true
                }
                return false
            }

            this.set = function (name, value) {
                Function.requireArgumentNumber(arguments, 2)
                var has = false
                for(var i = 0;i < list.length;i++){
                    if(list[i][0] === name){
                        if(has){
                            list.splice(i,1)
                        }else{
                            list[i][1] = String(value)
                            has = true
                        }
                    }
                }
                if(!has){
                    this.append(name,value)
                }
            }

            this.forEach = function (callback,thisArg) {
                for(var i = 0;i < list.length;i++){
                    callback.call(thisArg,list[i][1],list[i][0])
                }
            }

            if (init) {
                if(Array.isArray(init) && init.length > 0){
                    throw new TypeError('Failed to construct \'URLSearchParams\': ' +
                        'The provided value cannot be converted to a sequence.')
                }else if(init instanceof Object){
                    for (key in init) {
                        if(init.hasOwnProperty(key)){
                            this.append(key,init[key])
                        }
                    }
                }else if (typeof init === 'string') {
                    if (init.charAt(0) === '?') {
                        init = init.slice(1)
                    }
                    pairs = init.split('&')
                    for (i = 0 ; i < pairs.length; i++) {
                        value = pairs[i]
                        index = value.indexOf('=')
                        if (-1 < index) {
                            this.append(decode(value.slice(0, index)), decode(value.slice(index + 1)))
                        } else if (value.length){
                            this.append(decode(value))
                        }
                    }
                }else{
                    this.append(init,'')
                }
            }
        }
        {
            var find = /[!'\(\)~]|%20|%00/g, plus = /\+/g,
                replace = {
                    '!': '%21',
                    "'": '%27',
                    '(': '%28',
                    ')': '%29',
                    '~': '%7E',
                    '%20': '+',
                    '%00': '\x00'
                }
            function decode(str) {
                return decodeURIComponent(str.replace(plus, ' '))
            }
            URLSearchParams.prototype.keys = function () {
                var items = []
                this.forEach(function (value, name) {
                    items.push(name)
                })
                return new Iterator(items)
            }

            URLSearchParams.prototype.values = function () {
                var items = []
                this.forEach(function (value) {
                    items.push(value)
                })
                return new Iterator(items)
            }

            URLSearchParams.prototype.entries = function () {
                var items = []
                this.forEach(function (value, name) {
                    items.push([name, value])
                })
                return new Iterator(items)
            }
            URLSearchParams.prototype.toString = function toString() {
                var query = [],encodedKey,encodedValue
                this.forEach(function (value,key) {
                    encodedKey = encodeURIComponent(key).replace(find, function (match) {
                        return replace[match]
                    })
                    encodedValue = encodeURIComponent(value).replace(find, function (match) {
                        return replace[match]
                    })
                    query.push(encodedKey + '=' + encodedValue)
                })
                return query.join('&')
            }
        }

        // import 'URI.js'
        //todo test and verify
        function URL(url,base) {
            URI.call(this,url,base)
            this.searchParams = new URLSearchParams()
        }

        /**
         * Headers的key是小写字符串类型，value是字符串类型。默认按key排序，故使用Object而不是Map
         * @param init
         * @constructor
         */
        function Headers(init) {
            var map = {}
            this.append = function (name, value) {
                Function.requireArgumentNumber(arguments, 2)
                name = normalizeName(name)
                value = normalizeValue(Array.isArray(value) ? value.join(',') : value)
                var list = map[name]
                if (!list) {
                    list = []
                    map[name] = list
                }
                list.push(value)
            }

            this['delete'] = function (name) {
                Function.requireArgumentNumber(arguments, 1)
                delete map[normalizeName(name)]
            }

            this.get = function (name) {
                Function.requireArgumentNumber(arguments, 1)
                var values = map[normalizeName(name)]
                return values ? values[0] : null
            }

            this.getAll = function (name) {
                Function.requireArgumentNumber(arguments, 1)
                return map[normalizeName(name)] || []
            }

            this.has = function (name) {
                Function.requireArgumentNumber(arguments, 1)
                return map.hasOwnProperty(normalizeName(name))
            }

            this.set = function (name, value) {
                Function.requireArgumentNumber(arguments, 2)
                map[normalizeName(name)] = [normalizeValue(Array.isArray(value)?value.join(',') : value)]
            }
            this.forEach = function (callback, thisArg) {
                Function.requireArgumentNumber(arguments, 1)
                for (var name in map) {
                    if (map.hasOwnProperty(name)) {
                        map[name].forEach(function (value) { // jshint ignore:line
                            callback.call(thisArg, value, name, this)
                        }, this)
                    }
                }
            }
            if (init !== undefined ) {
                if (init instanceof Headers) {
                    init.forEach(function (value, name) {
                        this.append(name, value)
                    }, this)
                } else if (init instanceof Object) {
                    for (var name in init) {
                        if (init.hasOwnProperty(name)) {
                            this.append(name, init[name])
                        }
                    }
                }else{
                    throw new TypeError('Failed to construct \''+this.getClass()+'\': The provided value is not of type \'' +
                        '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)\'')
                }
            }
        }
        {
            if ('Symbol' in window && 'iterator' in window) {
                Headers.prototype[Symbol.iterator] = Headers.prototype.entries
            }
            function normalizeValue(value) {
                if (typeof value !== 'string') {
                    value = String(value)
                }
                return value
            }
            function normalizeName(name) {
                Function.requireArgumentNumber(arguments, 1)
                name = normalizeValue(name)
                if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
                    throw new TypeError('Invalid character in header field name')
                }
                return name.toLowerCase()
            }
            function headers(xhr) {
                Function.requireArgumentNumber(arguments, 1)
                var headers = new Headers()
                if (xhr.getAllResponseHeaders) {
                    var headerStr = xhr.getAllResponseHeaders() || ''
                    if (/\S/.test(headerStr)) {
                        //http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
                        var headerPairs = headerStr.split('\u000d\u000a')
                        for (var i = 0; i < headerPairs.length; i++) {
                            var headerPair = headerPairs[i]
                            // Can't use split() here because it does the wrong thing
                            // if the header value has the string ": " in it.
                            var index = headerPair.indexOf('\u003a\u0020')
                            if (index > 0) {
                                var key = headerPair.substring(0, index).trim()
                                var value = headerPair.substring(index + 2).trim()
                                headers.append(key, value)
                            }
                        }
                    }
                }
                return headers
            }
            Headers.prototype.keys = function () {
                var items = []
                this.forEach(function (value, name) {
                    items.push(name)
                })
                return new Iterator(items)
            }

            Headers.prototype.values = function () {
                var items = []
                this.forEach(function (value) {
                    items.push(value)
                })
                return new Iterator(items)
            }

            Headers.prototype.entries = function () {
                var items = []
                this.forEach(function (value, name) {
                    items.push([name, value])
                })
                return new Iterator(items)
            }
        }

        function Body(body) {
            var bodyType
            var bodyUsed = false
            var self = this
            if(body){
                if (typeof body === 'string') {
                    bodyType = BodyType.TEXT
                } else if (body && typeof body === 'object') {
                    bodyType = BodyType.JSON
                } else if (window.URLSearchParams && (body instanceof window.URLSearchParams)) {
                    bodyType = BodyType.SEARCH_PARAMS
                } else if (window.Blob && (body instanceof Blob)) {
                    bodyType = BodyType.BLOB
                } else if (window.FormData && (body instanceof FormData)) {
                    bodyType = BodyType.FORM_DATA
                } else if (window.ArrayBuffer && (body instanceof ArrayBuffer)) {
                    bodyType = BodyType.ARRAY_BUFFER
                }else{
                    throw new TypeError('unsupported BodyInit type')
                }
            }
            ['arrayBuffer','blob','formData','json','text'].forEach(function (method) {
                self[method] = function () {
                    var promise
                    if(bodyUsed){
                        //todo Already read
                        promise = Promise.reject(new TypeError('Failed to execute \''+ method +'\' on \''+this.getClass()+
                            '\': body stream is locked'))
                    }else{
                        if(!(this instanceof Request) || (this.getMethod() !== HttpMethodEnum.GET &&
                            this.getMethod() !== HttpMethodEnum.HEAD )){
                            bodyUsed = true
                        }
                        promise = Promise.resolve(body)
                    }
                    return promise.then(function (body) {
                        var from = bodyType
                        var to = method
                        if (body === null || body === void 0 || !from || from === to) {
                            return Promise.resolve(body)
                        } else if (Body.map[method] && Body.map[to][from]) {
                            return Body.map[method][from](body)
                        } else {
                            return Promise.reject(new Error('Conversion from ' + from + ' to ' + to + ' is not supported'))
                        }
                    })
                }
            })
            this.getBody = function () {
                return body
            }
            this.getBodyType = function () {
                return bodyType
            }
            this.getBodyUsed = function () {
                return bodyUsed
            }
        }
        {
            var BodyType = {
                'TEXT':'text',
                'BLOB':'blob',
                'FORM_DATA':'formData',
                'SEARCH_PARAMS':'searchParams',
                'JSON':'json',
                'ARRAY_BUFFER':'arrayBuffer'
            }
            Body.map = {
                blob2text:function (blob) {
                    var reader = new FileReader()
                    reader.readAsText(blob)
                    return this.reader2Promise(reader)
                },
                reader2Promise:function (reader) {
                    return new Promise(function (resolve, reject) {
                        reader.onload = function () {
                            resolve(reader.result)
                        }
                        reader.onerror = function () {
                            reject(reader.error)
                        }
                    })
                },
                text: {
                    json: function (body) {//json --> text
                        return Promise.resolve(JSON.stringify(body))
                    },
                    blob: function (body) {//blob --> text
                        return this.blob2text(body)
                    },
                    searchParams: function (body) {//searchParams --> text
                        return Promise.resolve(body.toString())
                    }
                },
                json: {
                    text: function (body) {//text --> json
                        if(!body){
                            throw new SyntaxError('Unexpected end of input')
                        }
                        return Promise.resolve(JSON.parse(body))
                    },
                    blob: function (body) {//blob --> json
                        if(!body){
                            throw new SyntaxError('Unexpected end of input')
                        }
                        return this.blob2text(body).then(JSON.parse)
                    }
                },
                formData: {
                    text: function (body) {//text --> formData
                        /*
                         readAsBinaryString(File|Blob)
                         readAsText(File|Blob [, encoding])
                         readAsDataURL(File|Blob)
                         readAsArrayBuffer(File|Blob)
                         */
                        var form = new FormData()
                        if(body){
                            body.trim().split('&').forEach(function (bytes) {
                                if (bytes) {
                                    var split = bytes.split('=')
                                    var name = split.shift().replace(/\+/g, ' ')
                                    var value = split.join('=').replace(/\+/g, ' ')
                                    form.append(decodeURIComponent(name), decodeURIComponent(value))
                                }
                            })
                        }else{
                            throw new TypeError('Invalid MIME type')
                        }
                        return Promise.resolve(form)
                    }
                },
                blob: {
                    text: function (body) {//text --> blob
                        return Promise.resolve(new Blob([body]))
                    },
                    json: function (body) {//json --> blob
                        return Promise.resolve(new Blob([JSON.stringify(body)]))
                    }
                },
                arrayBuffer: {
                    blob: function (body) {//arrayBuffer --> blob
                        var reader = new FileReader()
                        reader.readAsArrayBuffer(body)
                        return this.reader2Promise(reader)
                    }
                }
            }

        }
        /**
         * input可以是Request或者url，requestInitDict的值会覆盖input的内容
         * @param input
         * @param requestInitDict
         * @constructor
         */
        var initAttributeNames = ['method','mode','credentials','cache','redirect','referrer','integrity']
        var attributeNames =['cache','context','credentials','headers','integrity','keepalive'
            ,'method','mode','redirect','referrer','referrerPolicy','url']
        function Request(input, requestInitDict) {
            if(arguments.length === 0){
                throw new TypeError('Failed to construct \'Request\': 1 argument required, but only 0 present.')
            }
            var body = '',self = this,temp,checker,headers
            var internal = {
                cache: RequestCacheEnum.DEFAULT,
//            context:null,  //已经从标准中删除
                credentials: RequestCredentialsEnum.SAME_ORIGIN,
                integrity: "",
                keepalive: false,
                method: HttpMethodEnum.GET,
                mode: RequestModeEnum.CORS,
                redirect: RequestRedirectEnum.FOLLOW,
                referrerPolicy: ReferrerPolicyEnum.DEFAULT
            }

            if (input instanceof Request) {
                if (input.getBodyUsed()) {
                    throw new TypeError('Failed to construct \'Request\': ' +
                        'Cannot construct a Request with a Request object that has already been used.')
                }
                attributeNames.forEach(function (attributeName) {
                    internal[attributeName] = input['get'+ attributeName.toFirstUpperCase()]()
                })
                body = input.text()
                internal.headers = new Headers(internal.headers)
            } else {
                /* input是url地址 */
                internal.url = resolveUrl(String(input))
                internal.headers = new Headers()
            }

            if (requestInitDict) {
                if ( requestInitDict instanceof Object) {
                    initAttributeNames.forEach(function (initAttributeName) {
                        if (requestInitDict.hasOwnProperty(initAttributeName) ) {
                            internal[initAttributeName] = requestInitDict[initAttributeName]
                        }
                    })
                    if (requestInitDict.hasOwnProperty('body') ) {
                        body = requestInitDict.body
                    }
                    if (requestInitDict.hasOwnProperty('headers') ) {
                        internal.headers = new Headers(requestInitDict.headers)
                    }
                }else{
                    throw new TypeError('Failed to construct \'Request\': parameter 2 (\'requestInitDict\') is not an object.')

                }
            }
            Body.call(this,body)
            if (!internal.headers.get('content-type')) {
                var bodyType = this.getBodyType()
                switch (bodyType) {
                    case BodyType.TEXT:
                        internal.headers.set('content-type', 'text/plain;charset=UTF-8')
                        break
                    case BodyType.JSON:
                        internal.headers.set('content-type', 'application/json')
                        break
                    case BodyType.FORM_DATA:
                        internal.headers.set('content-type', 'multipart/form-data')
                        break
                    case BodyType.ARRAY_BUFFER:
                        break
                    case BodyType.BLOB:
                        if (body && body.type) {
                            internal.headers.set('content-type', body.type)
                        }
                        break
                    case BodyType.SEARCH_PARAMS:
                        internal.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
                        break
                    default:
                        break
                }
            }

            /* 检查internal属性是否合法 */
            for(var name in requestCheckList){
                if (requestCheckList.hasOwnProperty(name) && internal.hasOwnProperty(name)) {
                    checker = requestCheckList[name]
                    if(typeof checker === "function"){
                        /* 将值转为String或Boolean */
                        internal[name] = new checker(internal[name])
                    }else{
                        /* 检查取值是否合法 */
                        temp = internal[name].replace(/-/g,'_').toUpperCase()
                        if(! (temp in checker['enum'])){
                            throw new TypeError('Failed to construct \'Request\': The provided value \''+temp +
                                '\' is not a valid enum value of type '+ checker.name)
                        }
                    }
                }
            }

            if(internal.method === HttpMethodEnum.TRACE){
                throw new TypeError('Failed to construct \'Request\': \'trace\' HTTP method is unsupported.')
            }else if ((internal.method === HttpMethodEnum.GET || internal.method === HttpMethodEnum.HEAD) && body) {
                throw new TypeError('Failed to construct \'Request\': Request with GET/HEAD method cannot have body.')
            }
            delete  this.getBody
            /* 定义get方法 */
            attributeNames.forEach(function (name) {
                self['get'+name.toFirstUpperCase()] = function () {
                    return internal[name]
                }
            })
        }
        {
            var RequestCacheEnum = {
                'DEFAULT':'default',
                'NO_STORE':'no-store',
                'RELOAD':'reload',
                'NO_CACHE':'no-cache',
                'FORCE_CACHE':'force-cache',
                'ONLY_IF_CACHED':'only-if-cached'
            }
            var RequestCredentialsEnum = {
                'OMIT':'omit',
                'SAME_ORIGIN':'same-origin',
                'INCLUDE':'include'
            }
            var RequestModeEnum = {
                'SAME_ORIGIN':'same-origin',
                'NO_CORS':'no-cors',
                'CORS':'cors',
                'NAVIGATE':'navigate'
            }
            var RequestRedirectEnum = {
                FOLLOW:'follow',
                ERROR:'error',
                MANUAL:'manual'
            }
            var ReferrerPolicyEnum = {
                'NO_REFERRER':'no-referrer',
                'NO_REFERRER_WHEN_DOWNGRADE':'no-referrer-when-downgrade',
                'ORIGIN':'origin',
                'ORIGIN_WHEN_CROSS_ORIGIN':'origin-when-cross-origin',
                'SAME_ORIGIN':'same-origin',
                'STRICT_ORIGIN':'strict-origin',
                'STRICT_ORIGIN_WHEN_CROSS_ORIGIN':'strict-origin-when-cross-origin',
                'UNSAFE_URL':'unsafe-url',
                'DEFAULT':''
            }
            var requestCheckList = {
                cache:{name:'RequestCache','enum':RequestCacheEnum} ,
                credentials:{name:'RequestCredentials','enum':RequestCredentialsEnum} ,
                integrity: String,
                keepalive: Boolean,
                method: {name:'HttpMethod','enum':HttpMethodEnum} ,
                mode: {name:'RequestMode','enum':RequestModeEnum},
                redirect: {name:'RequestRedirect','enum':RequestRedirectEnum},
                referrer: String
            }
            Request.prototype.clone = function () {
                return new Request(this)
            }
            function resolveUrl(url) {
                var hostUrl = location.href
                if(url){
                    var urlLowerCase = url.toLowerCase()
                    if(urlLowerCase.startsWith('http')|| urlLowerCase.startsWith('https')){
                        urlLowerCase = urlLowerCase.replace(/\\/g,'//')
                        return urlLowerCase
                    }else{
                        return hostUrl.replace(new RegExp(hostUrl.substring(hostUrl.lastIndexOf('/'))+'$'),'/'+ url)
                    }
                }else{
                    return hostUrl
                }
            }
            function resolveReferrer(referrer) {
                var hostUrl = window.location.href
                var defaultValue = "about:client"
                if(referrer){
                    var referrerLowerCase = referrer.toLowerCase()
                    if(referrerLowerCase.startsWith('http')|| referrerLowerCase.startsWith('https')){
                        return defaultValue
                    }else{
                        var index = hostUrl.lastIndexOf('/')
                        return hostUrl.substring(0,index) + '/'+ referrer
                    }
                }else{
                    return defaultValue
                }
            }
        }
        /**
         *
         * @param body Blob/BufferSource/FormData/ReadableStream/URLSearchParams/USVString
         * @param inits  tatus: The status code for the reponse, e.g., 200.
         *               statusText: The status message associated with the status code, e.g., OK.
         *               headers: Any headers you want to add to your response, contained within a Headers object or object literal of ByteString key/value pairs (see HTTP headers for a reference).
         * @constructor
         */

        function Response(body, init) {
            init = init||{}
            Body.call(this,body)
            var type = init.type || ResponseTypeEnum.DEFAULT
            var status = init.status || 0
            if (1223 === status) {
                status = 204
            }
            var ok = status >= 200 && status < 300
            var statusText = init.statusText
            var headers = init.headers instanceof Headers ? init.headers : new Headers(init.headers)
            var url = init.url || ''
            var redirected = init.redirected || false
            this.getType = function () {
                return type
            }
            this.getStatus = function () {
                return status
            }
            this.getOk = function () {
                return ok
            }
            this.getStatusText = function () {
                return statusText
            }
            this.getHeaders = function () {
                return headers
            }
            this.getUrl = function () {
                return url
            }
            this.getRedirected = function () {
                return redirected
            }
        }
        {
            var ResponseTypeEnum = {
                'DEFAULT':'default',
                'BASIC':'basic',
                'CORS':'cors',
                'ERROR':'error',
                'OPAQUE':'opaque'
            }
            var redirectStatuseCodes = [301, 302, 303, 307, 308]
            var responseCheckList = {
                ok:Boolean,
                redirected:Boolean,
                status:Number,
                statusText:String,
                type:ResponseTypeEnum,
                url:String
            }
            Response.prototype.clone = function () {
                return new Response(this.getBody(), {
                    type:this.getType(),
                    status: this.getStatus(),
                    statusText: this.getStatusText(),
                    headers: new Headers(this.getHeaders()),
                    url: this.getUrl(),
                    redirected:this.getRedirected()
                })
            }
            Response.error = function () {
                return new Response(null, {status: 0, statusText: '',type:ResponseTypeEnum.ERROR})
            }

            Response.redirect = function (url, status) {
                if (redirectStatuseCodes.indexOf(status) === -1) {
                    throw new RangeError('Invalid status code')
                }
                return new Response(null, {status: status, headers: {location: url}})
            }
        }

        function fetch(input, init) {
            return new Promise(function (resolve,reject) {
                var request,xmlHttpRequest,timer,async = init? init.async :false
                function responseURL(xhr) {
                    if ('responseURL' in xhr) {
                        return xhr.responseURL
                    }
                    // Avoid security warnings on getResponseHeader when not allowed by CORS
                    if (('getResponseHeader' in xhr) && /^X-Request-URL:/m.test(xhr.getAllResponseHeaders()) ) {
                        return xhr.getResponseHeader('X-Request-URL')
                    }
                    return null
                }
                if (input && (input instanceof Request)) {
                    request = input
                } else {
                    request = new Request(input, init)
                }
                if(!request.getHeaders().get('x-requested-with')){
                    request.getHeaders().set('X-Requested-With', 'XMLHttpRequest')
                }
                //已经应用补丁将window.ActiveXObject('Microsoft.XMLHTTP')转为XMLHttpRequest
                xmlHttpRequest = new XMLHttpRequest()
                if (init instanceof Object && init.credentials === 'include') {
                    if ("withCredentials" in xmlHttpRequest) {
                        xmlHttpRequest.withCredentials = true
                    }else if (typeof window.XDomainRequest !== "undefined") {
                        // 检测是否XDomainRequest可用
                        xmlHttpRequest = new window.XDomainRequest()
                    } else {
                        //IE6，7 CORS不被支持
                        throw new TypeError('CORS is not supported by this browser.Please use easyXDM')
                    }
                }
                if('onerror' in xmlHttpRequest){
                    xmlHttpRequest.onerror = function (error) {
                        clearInterval(timer)
                        xmlHttpRequest.abort()
                        reject(error)
                    }
                }
                var loadData = function () {
                    /*Chrome只要有应答都返回resolve*/
                    if (xmlHttpRequest.readyState === 4) {
                        var body = 'response' in xmlHttpRequest ? xmlHttpRequest.response : xmlHttpRequest.responseText
                        var response = new Response(body, {
                            status: xmlHttpRequest.status,
                            statusText: xmlHttpRequest.statusText,
                            headers: headers(xmlHttpRequest),
                            url: responseURL(xmlHttpRequest)
                        })
                        clearInterval(timer)
                        xmlHttpRequest.abort()
                        if(response.getOk()){
                            resolve(response)
                        }else{
                            reject(new TypeError('Network request failed'))
                        }
                    }
                }

                /* IE6不能连写*/
                if ('onload' in xmlHttpRequest ) {
                    xmlHttpRequest.onload = loadData
                }else if ('onreadystatechange' in xmlHttpRequest  ) {
                    xmlHttpRequest.onreadystatechange = loadData
                }
                xmlHttpRequest.open(request.getMethod(), request.getUrl(), async)
                request.getHeaders().forEach(function (value, name) {
                    xmlHttpRequest.setRequestHeader(name, value)
                })
                request.json().then(function (data) {
                    xmlHttpRequest.send(data)
                })
            })
        }

        var patch = {
            URL:URL,
            URLSearchParams:URLSearchParams,
            Headers : Headers,
            Request : Request,
            Response : Response,
            fetch:fetch
        }
        for(var f in patch){
            if(patch.hasOwnProperty(f) && !window[f]){
                window[f] = patch[f]
            }
        }
        /* jshint ignore:end */
    }
})(this,this.document)
