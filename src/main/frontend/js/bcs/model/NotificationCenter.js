/**
 * Created by kenhuang on 2019/1/25.
 */
/**
 * 无需暴露
 * @constructor
 */
function NotificationCenter() {
    var observerListMap = {}
    /**
     *
     * @param observer 观察者
     * @param selector 观察者响应方法
     * @param name     消息, null表示接收任意的消息
     * @param object   发送者，null表示接收所有发送者发送的消息
     */
    this.addObserver = function (observer, selector,name,object) {
        name = name || null
        object = object || null
        if(typeof observer !== "object" || typeof selector !== "function" ||
            (typeof name !== "string" && name !== null) ||
            (typeof object !== "object" && object !== null) ){
            throw new Error('Invalid parameters.')
        }
        if(!observerListMap[name]){
            observerListMap[name] = []
        }
        /* 防止重复添加 */
        for(var o in this.observerListMap[name] ){
            if(o.observer === observer  && o.object === object){
                for(var s in o.selectors){
                    if(s === selector){
                        return
                    }
                }
                o.selectors.push(selector)
                return
            }
        }
        observerListMap[name].push({
            observer:observer,
            selectors:[selector],
            object:object})
    }
    this.post = function (name,object,userInfo) {
        function send(observerList,notification) {
            if(observerList){
                for(var i = 0;i<observerList.length;i++){
                    if(observerList[i].object === object || observerList[i].object === null){
                        try{
                            observerList[i].selectors(notification)
                        }catch (e){

                        }
                    }

                }
            }
        }
        object = object || null
        if(typeof name === 'string'){
            var notification = {
                name:name,
                object:object,
                userInfo:userInfo
            }
            send(observerListMap[name],notification)
            send(observerListMap[null],notification)
        }
    }
    this.removeObserver = function (observer,name,object) {
        function remove(observerList,observer,object) {
            for(var i = 0; i < observerList.length; i++) {
                if(observerList[i].observer === observer && observerList[i].object === object) {
                    if(i === 0) {
                        observerList.shift()
                        return
                    } else if(i === length-1) {
                        observerList.pop()
                        return
                    } else {
                        observerList.splice(i,1)
                        return
                    }
                }
            }
        }
        var observerList
        object = object || null
        if(name){
            /* 删除指定属性的指定观察者 */
            observerList =  observerListMap[name]
            if(observerList){
                remove(observerList,observer,object)
            }
        }else{
            /* 删除所有属性的指定观察者 */
            for(observerList in this.observerListMap){
                if(this.observerListMap.hasOwnProperty(observerList)){
                    remove(observerList,observer,object)
                }

            }
        }
    }
}