// https://www.w3cschool.cn/fetch_api/fetch_api-6ls42k12.html
// https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch
// https://segmentfault.com/a/1190000004322487
(function(window,undefined) {
    if(typeof  window.fetch === "function"){
        return
    }
    function ArrayMap() {
        var map

    }

    function URLSearchParams(init) {
        var index, key, value, pairs, i, length,map ={}
        this.append = function append(name, value) {
            appendTo(map, name, value)
        }

        this.delete = function del(name) {
            delete map[name]
        };

        this.get = function get(name) {
            return name in map ? map[name][0] : null
        };

        this.getAll = function getAll(name) {
            return name in map ? map[name].slice(0) : []
        };

        this.has = function has(name) {
            return name in map
        };

        this.set = function set(name, value) {
            map[name] = ['' + value]
        };

        this.forEach = function forEach(callback, thisArg) {
            Object.getOwnPropertyNames(map).forEach(function(name) {
                dict[name].forEach(function(value) {
                    callback.call(thisArg, value, name, this)
                }, this)
            }, this);
        };

        /*
         this.toBody = function() {
         return new Blob(
         [this.toString()],
         {type: 'application/x-www-form-urlencoded'}
         );
         };
         this.toJSON = function toJSON() {
         return {}
         };
         */



        this.toString = function toString() {
            var query = [], i, key, name, value;
            for (key in map) {
                if(map.hasOwnProperty(key)){
                    name = encode(key);
                    for (i = 0,value = map[key]; i < value.length; i++) {
                        query.push(name + '=' + encode(value[i]))
                    }
                }
            }
            return query.join('&')
        }

        if (!init) {
            return
        }
        if (typeof init === 'string') {
            if (init.charAt(0) === '?') {
                init = init.slice(1)
            }
            for (pairs = init.split('&'), i = 0, length = pairs.length; i < length; i++) {
                value = pairs[i];
                index = value.indexOf('=');
                if (-1 < index) {
                    appendTo(map, decode(value.slice(0, index)), decode(value.slice(index + 1)))
                } else if (value.length){
                    appendTo(map, decode(value), '')
                }
            }
        } else {
            if (Array.isArray(init)) {
                for (i = 0, length = init.length; i < length; i++) {
                    value = init[i]
                    appendTo(map, value[0], value[1])
                }
            } else if (init.forEach) {
                init.forEach(function (value, key) {
                    appendTo(this, key, value)
                }, map)
            } else {
                for (key in init) {
                    if(init.hasOwnProperty(key)){
                        appendTo(map, key, init[key])
                    }
                }
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
            },
            replacer = function (match) {
                return replace[match];
            },
            secret = '__URLSearchParams__:' + Math.random()
        function appendTo(map, name, value) {
            var res = Array.isArray(value) ? value.join(',') : value;
            if (name in map)
                map[name].push(res)
            else
                map[name] = [res]
        }

        function decode(str) {
            return decodeURIComponent(str.replace(plus, ' '))
        }

        function encode(str) {
            return encodeURIComponent(str).replace(find, replacer)
        }


    }
    function Headers(init) {
        var map = {}
        this.append = function (name, value) {
            Function.ensureArgs(arguments, 2)
            name = Headers.normalizeName(name)
            value = Headers.normalizeValue(value)
            var list = map[name]
            if (!list) {
                list = []
                map[name] = list
            }
            list.push(value)
        }

        this['delete'] = function (name) {
            Function.ensureArgs(arguments, 1)
            delete map[Headers.normalizeName(name)]
        }

        this.get = function (name) {
            Function.ensureArgs(arguments, 1)
            var values = map[Headers.normalizeName(name)]
            return values ? values[0] : null
        }

        this.getAll = function (name) {
            Function.ensureArgs(arguments, 1)
            return map[Headers.normalizeName(name)] || []
        }

        this.has = function (name) {
            Function.ensureArgs(arguments, 1)
            return map.hasOwnProperty(Headers.normalizeName(name))
        }

        this.set = function (name, value) {
            Function.ensureArgs(arguments, 2)
            map[Headers.normalizeName(name)] = [Headers.normalizeValue(value)]
        }
        this.forEach = function (callback, thisArg) {
            Function.ensureArgs(arguments, 1)
            for (var name in map) {
                if (map.hasOwnProperty(name)) {
                    map[name].forEach(function (value) { // jshint ignore:line
                        callback.call(thisArg, value, name, this)
                    }, this)
                }
            }
        }

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
    {
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

        Headers.prototype.toString = function() {
            return '[object Headers]'
        }

        if ('Symbol' in window && 'iterator' in window) {
            Headers.prototype[Symbol.iterator] = Headers.prototype.entries
        }
        Headers.normalizeValue = function(value) {
            if (typeof value !== 'string') {
                value = String(value)
            }
            return value
        }
        Headers.normalizeName = function (name) {
            Function.ensureArgs(arguments, 1)
            name = Headers.normalizeValue(name)
            if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
                throw new TypeError('Invalid character in header field name')
            }
            return name.toLowerCase()
        }
        Headers.headers = function (xhr) {
            Function.ensureArgs(arguments, 1)
            var headers = new Headers()
            if (xhr.getAllResponseHeaders) {
                var headerStr = xhr.getAllResponseHeaders() || ''
                if (/\S/.test(headerStr)) {
                    //http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
                    var headerPairs = headerStr.split('\u000d\u000a');
                    for (var i = 0; i < headerPairs.length; i++) {
                        var headerPair = headerPairs[i];
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
    }

    var BodyType = {
        'TEXT':'text',
        'BLOB':'blob',
        'FORM_DATA':'formData',
        'SEARCH_PARAMS':'searchParams',
        'JSON':'json',
        'ARRAY_BUFFER':'arrayBuffer'
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

        'arrayBuffer,blob,formData,json,text'.replace(/\w+/g, function (method) {
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
        'UNSAFE_URL':'unsafe-url'
    }
    var requestCheckList = {
        cache:{name:'RequestCache','enum':RequestCacheEnum} ,
        credentials:{name:'RequestCredentials','enum':RequestCredentialsEnum} ,
        integrity: String,
        keepalive: Boolean,
        method: {name:'HttpMethod','enum':HttpMethodEnum} ,
        mode: {name:'RequestMode','enum':RequestModeEnum},
        redirect: {name:'RequestRedirect','enum':RequestRedirectEnum},
        referrer: String,
        referrerPolicy: ReferrerPolicyEnum
    }
    function Request(input, requestInitDict) {
        if(arguments.length === 0){
            throw new TypeError('Failed to construct \'Request\': 1 argument required, but only 0 present.')
        }
        var body = '',self = this,internalValuePool = [],temp,checker,headers = '',temp1,url,referrer
        var internal = {
            cache: RequestCacheEnum['default'],
//            context:null,  //已经从标准中删除
            credentials: RequestCredentialsEnum.SAME_ORIGIN,
            integrity: "",
            keepalive: false,
            method: HttpMethodEnum.GET,
            mode: RequestModeEnum.CORS,
            redirect: RequestRedirectEnum.FOLLOW,
            referrerPolicy: ""
        }
        if(requestInitDict){
            if(requestInitDict instanceof Object){
                internalValuePool.push(requestInitDict)
                body = requestInitDict.body
                headers = requestInitDict.headers
                referrer = Request.resolveReferrer(requestInitDict.referrer)
            }else{
                throw new TypeError('Failed to construct \'Request\': parameter 2 (\'requestInitDict\') is not an object.')
            }
        }

        if (input instanceof Request) {
            if (input.getBodyUsed()) {
                throw new TypeError('Failed to construct \'Request\': ' +
                    'Cannot construct a Request with a Request object that has already been used.')
            }
            internalValuePool.push(input)
            if (!body) {
                body = input.json()
            }
            if(!headers){
                headers = input.headers
            }
            if(!referrer){
                referrer = input.referrer
            }
            url = Request.resolveUrl(input.url)
        } else {
            /* input是url地址 */
            internalValuePool.push({url:input})
            url = Request.resolveUrl(input.url)
        }

        /* internalValuePool含有requestInitDict input {input}。这些对象的属性是internal属性的可能取值。
         遍历这些属性，并对internal的属性进行赋值。requestInitDict属性优先。 */
        for(var name in internal){
            if(internal.hasOwnProperty(name)){
                for(var i=0;i<internalValuePool.length;i++){
                    temp = internalValuePool[i][name]
                    if(temp){
                        checker = requestCheckList[name]
                        if(checker){
                            if(typeof checker === "function"){
                                /* 将值转为String或Boolean */
                                temp = new checker(temp)
                            }else{
                                /* 检查取值是否合法 */
                                temp1 = temp.replace(/-/g,'_').toUpperCase()
                                if( temp1 in checker['enum']){
                                    temp = checker['enum'][temp1]
                                }else{
                                    throw new TypeError('Failed to construct \'Request\': The provided value \''+temp +
                                        '\' is not a valid enum value of type '+ checker.name)
                                }
                            }
                        }
                        internal[name] = temp
                        break
                    }
                }
            }
        }

        Body.call(this,body)
        internal.url = url
        internal.headers = new Headers(headers)
        internal.referrer = referrer
        if(!internal.headers.get('x-requested-with')){
            internal.headers.set('X-Requested-With', 'XMLHttpRequest')
        }
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
        if(internal.method === HttpMethodEnum.TRACE){
            throw new TypeError('Failed to construct \'Request\': \'trace\' HTTP method is unsupported.')
        }else if ((internal.method === HttpMethodEnum.GET || internal.method === HttpMethodEnum.HEAD) && body) {
            throw new TypeError('Failed to construct \'Request\': Request with GET/HEAD method cannot have body.')
        }
        delete  this.getBody
        /* 定义get方法 */
        'cache,context,credentials,headers,integrity,keepalive,method,mode,redirect,referrer,referrerPolicy,url'.
        replace(/\w+/g,function (name) {
            self['get'+name.toFirstUpperCase()] = function () {
                return internal[name]
            }
        })
    }
    {
        Request.prototype.clone = function () {
            return new Request(this)
        }
        Request.resolveUrl = function (url) {
            var hostUrl = window.location.href
            if(url){
                var urlLowerCase = url.toLowerCase()
                if(urlLowerCase.startsWith('http')|| urlLowerCase.startsWith('https')){
                    urlLowerCase = urlLowerCase.replace(/\\/g,'//')
                    return urlLowerCase
                }else{
                    var index = hostUrl.lastIndexOf('/')
                    return hostUrl.substring(0,index) + '/'+ url
                }
            }else{
                return hostUrl
            }
        }
        Request.resolveReferrer = function (referrer) {
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
        Request.prototype.toString = function() {
            return '[object Request]'
        }
        Request.extend(Body)
    }

    var ResponseTypeEnum = {
        'DEFAULT':'default',
        'BASIC':'basic',
        'CORS':'cors',
        'ERROR':'error',
        'OPAQUE':'opaque'
    }

    var responseCheckList = {
        ok:Boolean,
        redirected:Boolean,
        status:Number,
        statusText:String,
        type:ResponseTypeEnum,
        url:String
    }
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
        Response.extend(Body)
        Response.prototype.toString = function() {
            return '[object Response]'
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
        var redirectStatuses = [301, 302, 303, 307, 308]
        Response.redirect = function (url, status) {
            if (redirectStatuses.indexOf(status) === -1) {
                throw new RangeError('Invalid status code')
            }
            return new Response(null, {status: status, headers: {location: url}})
        }
    }

        window.Headers = Headers
        window.Request = Request
        window.Response = Response
        window.fetch = function (input, init) {
            return new Promise(function (resolve,reject) {
                var request,xmlHttpRequest,timer
                function responseURL(xhr) {
                    if ('responseURL' in xhr) {
                        return xhr.responseURL
                    }
                    // Avoid security warnings on getResponseHeader when not allowed by CORS
                    if (xhr.getResponseHeader && /^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
                        return xhr.getResponseHeader('X-Request-URL')
                    }
                    return null
                }
                if (!input && (input instanceof Request)) {
                    request = input
                } else {
                    request = new Request(input, init)
                }
                if (window.XMLHttpRequest) {
                    xmlHttpRequest = new XMLHttpRequest()
                    if (init instanceof Object && init.credentials === 'include') {
                        xmlHttpRequest.withCredentials = true
                    }
                    xmlHttpRequest.onerror = function (error) {
                        clearInterval(timer)
                        xmlHttpRequest.abort()
                        reject(error)
                    }
                } else {
                    xmlHttpRequest = new window.ActiveXObject('Microsoft.XMLHTTP')
                }
                xmlHttpRequest.onload = xmlHttpRequest.onreadystatechange = function () {
                    /*Chrome只要有应答都返回resolve*/
                    if (xmlHttpRequest.readyState === 4) {
                        var body = 'response' in xmlHttpRequest ? xmlHttpRequest.response : xmlHttpRequest.responseText
                        var response = new Response(body, {
                            status: xmlHttpRequest.status,
                            statusText: xmlHttpRequest.statusText,
                            headers: Headers.headers(xmlHttpRequest),
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

                xmlHttpRequest.open(request.getMethod(), request.url, true)
                request.getHeaders().forEach(function (value, name) {
                    xmlHttpRequest.setRequestHeader(name, value)
                })
                request.json().then(function (data) {
                    // timer = setTimeout(function () {
                    //     xmlHttpRequest.abort()
                    //     reject(new TypeError('Network request timeout'))
                    // }, timeout)
                    xmlHttpRequest.send(data)
                })
            })
        }
})(this)





