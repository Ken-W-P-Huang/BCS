/**
 * Created by kenhuang on 2018/12/16.
 */
(function(window,document) {
    'use strict'
    function ConsolePatch() {
        /**
         * 直接禁用console相关功能。可以在IE6安装companionjs启用
         */
        var prop, method
        var dummy = function() {}
        var properties = ['memory']
        var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
        'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
        'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',')
        if(typeof ConsolePatch.prototype.patch !== "function"){
            ConsolePatch.prototype.patch = function (window) {
                if (window  && !window.console) {
                    var console
                    window.console = {}
                    console = window.console
                    while (prop = properties.pop()) if (!console[prop]) console[prop] = {}
                    while (method = methods.pop()) if (!console[method]) console[method] = dummy
                }
            }
        }
    }

    function StoragePatch() {
        var RC4={
            decode:function(key,cipherText){
                return this.encode(key,cipherText)
            },
            encode:function(key,data){
                var keyLength=key.length,
                    dataLength=data.length,
                    cipherText=[],
                    seq=[],j=0,r=0,q=0,temp,i
                for(i=0;i<256;++i){
                    seq[i]=i
                }
                for(i=0;i<256;++i){
                    j=(j+(temp=seq[i])+key.charCodeAt(i%keyLength))%256;
                    seq[i]=seq[j];
                    seq[j]=temp
                }
                for(j=0;r<dataLength;++r){
                    i=r%256;
                    j=(j+(temp=seq[i]))%256;
                    keyLength=seq[i]=seq[j];
                    seq[j]=temp;
                    cipherText[q++]=String.fromCharCode (data.charCodeAt(r)^seq[(keyLength+temp)%256])
                }
                return cipherText.join("")
            },
            key:function(length){
                for(var i=0,keys=[];i<length;++i){
                    keys[i]=String.fromCharCode(1+((Math.random()*255)<<0))
                }
                return keys.join("")
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
            if (typeof this.setItem !== 'function') {
                LocalStorage.prototype.getLength = function () {
                    return this.getItem(metaKey).split(separator).length
                }
                LocalStorage.prototype.key = function (i) {
                    var keys = this.getItem(metaKey)
                    keys = keys.split(separator)
                    if(keys.length > i ){
                        return keys[i]
                    }else{
                        return null
                    }
                }
                LocalStorage.prototype.setItem = function (key, value) {
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
                LocalStorage.prototype.getItem = function (key) {
                    dataElement.load(domainName)
                    return dataElement.getAttribute(key)
                }
                LocalStorage.prototype.removeItem = function (key) {
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
                LocalStorage.prototype.clear = function () {
                    var pastDate = new Date()
                    pastDate.setDate(pastDate.getDate() -1)
                    dataElement.expires = pastDate.toUTCString()
                    dataElement.save(domainName)
                }
            }
        }


        /**
         * 必须应用ES5和JSON才能使用SessionStorage
         * @constructor
         */
        function SessionStorage(window) {
            if (typeof this.setItem !== 'function') {
                SessionStorage.prototype.getLength = function () {
                    var obj =window.name ? JSON.parse(window.name):{}
                    return Object.keys(obj).length
                }
                SessionStorage.prototype.key = function (i) {
                    var obj =window.name ? JSON.parse(window.name):{}
                    var keys = Object.keys(obj)
                    return keys.length > i?keys[i]:null
                }
                SessionStorage.prototype.setItem = function (key, value) {
                    var obj =window.name ? JSON.parse(window.name):{}
                    obj[key]=value.toString()
                    window.name = JSON.stringify(obj)
                }
                SessionStorage.prototype.getItem = function (key) {
                    var obj =window.name ? JSON.parse(window.name):{}
                    return  obj[key] || null
                }
                SessionStorage.prototype.removeItem = function (key) {
                    var obj =window.name ? JSON.parse(window.name):{}
                    delete obj[key] && (window.name = JSON.stringify(obj))
                }
                SessionStorage.prototype.clear = function () {
                    window.name = ''
                }
            }
        }
        if(typeof StoragePatch.prototype.patch !== "function") {
            StoragePatch.prototype.patch = function (window) {
                if (!window.localStorage) window.localStorage = new LocalStorage(window)
                if (!window.sessionStorage) window.sessionStorage = new SessionStorage(window)
            }
        }
    }
    function Html5PrintShivPatch() {
        if(typeof Html5PrintShivPatch.prototype.patch !== "function") {
            Html5PrintShivPatch.prototype.patch = function (window) {

            }
        }
    }
    function ES5Patch() {
        if(typeof ES5Patch.prototype.patch !== "function") {
            ES5Patch.prototype.patch = function (window) {

            }
        }
    }
    function ES6Patch() {
        if(typeof ES6Patch.prototype.patch !== "function") {
            ES6Patch.prototype.patch = function (window) {

            }
        }
    }

    function JSONPatch(window) {
        if(typeof JSONPatch.prototype.patch !== "function") {
            JSONPatch.prototype.patch = function (window) {

            }
        }
    }
    window.StoragePatch = StoragePatch
    new ConsolePatch().patch(window)
    new StoragePatch().patch(window)
})(typeof window === 'undefined' ? this : window,document)