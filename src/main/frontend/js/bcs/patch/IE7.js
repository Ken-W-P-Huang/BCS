/**
 * Created by kenhuang on 2018/12/16.
 */
(function (window,document) {
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

    if(window.browser){
        window.browser.addPatches({'patchStorage':patchStorage})
    }
})(this,this.document)
