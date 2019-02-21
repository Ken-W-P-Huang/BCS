/**
 * Created by kenhuang on 2019/1/28.
 */
(function (window) {
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
    function patchFetch() {
        if(!window.Promise){
            patchPromise()
        }
        // import 'fetch.js'
    }
    function patchES6() {
        // import 'es6-shim.js'
    }
    function patchES6Collections() {
        if(available){// jshint ignore:line
            // import 'es6-collections.js'
        }
    }
    function patchBeacon() {

    }
    function patchHTML5() {
        // import 'html5shiv-printshiv.js'
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
                    Function.ensureArgs(arguments, 1)
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
                        Function.ensureArgs(arguments, 2)
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
                        Function.ensureArgs(arguments, 1)
                        name = String(name)
                        return map[name] ? normalizeValue(map[name][0]) : null
                    }

                    this.getAll = function (name) {
                        Function.ensureArgs(arguments, 1)
                        return (map[String(name)] || []).map(normalizeValue)
                    }

                    this.has = function (name) {
                        Function.ensureArgs(arguments, 1)
                        return map.hasOwnProperty(String(name))
                    }

                    this.set = function (name, value,filename) {
                        Function.ensureArgs(arguments, 2)
                        var parms = normalizeArgs.apply(null, arguments)
                        name = parms[0]
                        value = parms[1]
                        filename = parms.length === 3 ?parms[2]:undefined
                        map[name] = [[value, filename]]
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
                if(window.XMLHttpRequest){
                    var send = window.XMLHttpRequest.prototype.send
                    window.XMLHttpRequest.prototype.send = function(data) {
                        if (data instanceof FormData) {
                            var blob = data.blob()
                            this.setRequestHeader('Content-Type', blob.type)
                            send.call(this, blob)
                        } else {
                            send.call(this, data)
                        }
                    }
                }
            })()
        }

    }
    if(window.browser){
        window.browser.addPatches({
            'patchPromise':patchPromise,
            'patchFetch':patchFetch,
            'patchES6':patchES6,
            'patchHTML5':patchHTML5,
            'patchFormData':patchFormData,
            'patchBeacon':patchBeacon})
    }
    patchES6Collections()
    patchFormData()
})(this)