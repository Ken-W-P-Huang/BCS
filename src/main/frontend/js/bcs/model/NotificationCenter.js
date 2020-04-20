/**
 * Created by kenhuang on 2019/1/25.
 */
/**
 * 按照队列的顺序进行响应。可以重复添加，多次响应。
 * @constructor
 */
var singleton = new NotificationCenter()
export function NotificationCenter() {
    if(singleton){
        throw new TypeError(this.getClass() + ' could be instantiated only once!')
    }
    var observerList = []
    /**
     *
     * @param observer 观察者
     * @param selector 观察者响应方法
     * @param name     消息, null表示接收任意的消息
     * @param object   发送者，null表示接收所有发送者发送的消息
     */
    this.addObserver = function (observer, selector,name,object) {
        Function.requireArgumentNumber(arguments,3)
        name = name || null
        object = object || null
        if(typeof observer !== "object" || typeof selector !== "function" ||
            (typeof name !== "string" && name !== null) ||
            (typeof object !== "object" && object !== null) ){
            throw new TypeError('Invalid parameters.')
        }
        observerList.push({
            observer:observer,
            selectors:selector,
            name:name,
            object:object
        })
    }

    this.post = function (name,object,userInfo) {
        Function.requireArgumentNumber(arguments,1)
        object = object || null
        if(typeof name === 'string'){
            if(observerList){
                for(var i = 0;i < observerList.length;i++){
                    if((observerList[i].name === name || observerList[i].name === null) &&
                        (observerList[i].object === object || observerList[i].object === null)){
                        try{
                            observerList[i].selectors({
                                name:name,
                                object:object,
                                userInfo:userInfo
                            })
                        }catch (e){
                            e.printStackTrace()
                        }
                    }

                }
            }
        }else{
            throw new TypeError('Variable \'name\' must be string type')
        }
    }

    this.removeObserver = function (observer,name,object) {
        Function.requireArgumentNumber(arguments,1)
        for(var i = observerList.length - 1; i >= 0 ; i--) {
           if((!name || name === observerList[i]) && (!object || object === observerList[i])){
               observerList.splice(i,1)
           }
        }
    }
}
NotificationCenter['default'] = singleton




