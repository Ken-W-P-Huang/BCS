/**
 * Created by kenhuang on 2019/1/10.
 */
import {BCSGestureRecognizerStateEnum,BCSGestureRecognizer,defaults} from './BCSGestureRecognizer'
import {EventTypeEnum,SetMap} from '../model/Extensions'
var componentName = 'view'
var ElementViewEnum = {
    'DIV':BCSView
}
var IgnoreTagEnum = {
    'HEAD':'head',
    'SCRIPT':'script'
}
BCSView.import = function (tagName,viewConstructor) {
    ElementViewEnum[tagName] = viewConstructor
}
export function BCSView(style) {
    var propertiesMap = {
        layer : document.createElement('div'),
        subViews : [],
        gestureRecognizers:[],
        isListenersAdded:false
    }
    this.enableProtectedProperty(propertiesMap)
    var element = this.getProtected('layer')
    if(style && typeof style === 'object'){
        if(!style.hasOwnProperty('position')){
            style.position = 'absolute'
        }
    }else{
        style = {position:'absolute'}
    }
    this.setStyle(style)
    /* 方便调试 */
    element.setAttribute(componentName,this.getClass())
}



var prototype = BCSView.prototype
prototype.getLayer = function () {
    return this.getProtected('layer')
}

prototype.setAttribute = function (name,value) {
     this.getProtected('layer').setAttribute(name,value)
}

prototype.getSubViews = function () {
    return this.getProtected('subViews')
}

prototype.getGestureRecognizers = function () {
    return this.getProtected('gestureRecognizers')
}

/**
 * 1.这里假设调用者倾向于在同一个view添加不同的手势识别器，而非添加多个相同手势识别器
 * 2.和iOS不同，event和event.touches对象每次都不同,靠touch.identifier进行区分
 * 3.没有必要在这里使用定时器，例如可能出现两个tap手势识别器，它们要求的tap次数不同，如a.numberOfTouchesRequired = 1,
 * b.numberOfTouchesRequired = 2,当用户想使用a时，此时需要两个定时器，一个750ms，一个1500ms。
 * @param view
 */
function addListeners(view) {
    var delegate,
        touches,
        recognizer,
        stateChangedRecognizers,
        i,j,
        gestureRecognizers
    var handleEvent = function handleEvent(event) {
        gestureRecognizers = view.getGestureRecognizers()
        stateChangedRecognizers = []
        /*使用手势识别器识别event*/
        for(i = 0; i <gestureRecognizers.length ; i++) {
            recognizer = gestureRecognizers[i]
            if ( recognizer.isEnabled ) {
                touches = []
                delegate = recognizer.delegate
                if (event.type ===  EventTypeEnum.TOUCH_START) {
                    if(delegate && delegate.shouldReceiveTouch ){
                        for(j = 0; j < event.changedTouches.length; j++) {
                            if (delegate.shouldReceiveTouch(recognizer,event.changedTouches[j]) ) {
                                touches.push(event.changedTouches[j])
                            }
                        }
                    }else{
                        for(j = 0; j < event.changedTouches.length; j++) {
                            touches.push(event.changedTouches[j])
                        }
                    }
                }else if (recognizer.state >= BCSGestureRecognizerStateEnum.ENDED) {
                    continue
                }else{
                    for(j = 0; j < event.changedTouches.length; j++) {
                        if (recognizer.hasAvailableTouch(event.changedTouches[j]) ) {
                            touches.push(event.changedTouches[j])
                        }
                    }
                    if (touches.length === 0 ) {
                        continue
                    }
                }
                switch(event.type){
                    case EventTypeEnum.TOUCH_START:
                        recognizer.touchesBegan(touches,event)
                        for( j = i+1 ; j < gestureRecognizers.length ; j++) {
                            if (recognizer.shouldRequireFailureOf(gestureRecognizers[j]) ) {
                                gestureRecognizers[j].addDependent(recognizer)
                            }else if(delegate && delegate.shouldRequireFailureOf
                                && delegate.shouldRequireFailureOf(recognizer,gestureRecognizers[j])){
                                gestureRecognizers[j].addDependent(recognizer)
                            }else if(recognizer.shouldBeRequiredToFailBy(gestureRecognizers[j])){
                                recognizer.addDependent(gestureRecognizers[j])
                            }else if (delegate && delegate.shouldBeRequiredToFailBy
                                && delegate.shouldBeRequiredToFailBy(recognizer,gestureRecognizers[j])) {
                                recognizer.addDependent(gestureRecognizers[j])
                            }
                        }
                        break
                    case EventTypeEnum.TOUCH_MOVE:
                        recognizer.touchesMoved(touches,event)
                        break
                    case EventTypeEnum.TOUCH_END:
                        recognizer.touchesEnded(touches,event)
                        if (recognizer.state === BCSGestureRecognizerStateEnum.POSSIBLE) {
                            recognizer.removeAvailableTouches(touches)
                        }
                        break
                    case EventTypeEnum.TOUCH_CANCEL:
                        recognizer.touchesCancelled(touches,event)
                        break
                    default:
                    //pc或其他
                }
                console.log(new Date(),new Date().getMilliseconds(),
                    event.type,recognizer.name,
                    "state:",recognizer.state,
                    recognizer.getNumberOfTouches(),
                    event.touches,event.targetTouches,
                    event.changedTouches)
                if (recognizer.state >= BCSGestureRecognizerStateEnum.BEGAN) {
                    stateChangedRecognizers.push(recognizer)
                }
            }
        }
        view.executeStateChangedRecognizers(stateChangedRecognizers)

    }
    EventTypeEnum.values.forEach(function (eventName) {
        view.getLayer().addEventListener(eventName,handleEvent)
    })
}
prototype.addSubView = function (view) {
    var subViews = this.getProtected('subViews')
    this.removeSubView(view)
    this.getLayer().appendChild(view.getLayer())
    subViews.push(view)
}



prototype.addGestureRecognizer = function (gestureRecognizer) {
    this.removeGestureRecognizer(gestureRecognizer)
    gestureRecognizer.setProtected('view',this)
    this.getGestureRecognizers().push(gestureRecognizer)
    //todo 判断监听器是否已添加
    if (!this.getProtected('isListenersAdded')) {
        addListeners(this)
        this.setProtected('isListenersAdded',true)
    }
}

prototype.removeGestureRecognizer = function (gestureRecognizer) {
    var  gestureRecognizerList = this.getGestureRecognizers()
    gestureRecognizer.setProtected('view',null)
    for (var i = 0;i < gestureRecognizerList.length ; i++){
        if (gestureRecognizerList[i] === gestureRecognizer ) {
            gestureRecognizerList.splice(i,1)
            // break 防止有更多的同一个gestureRecognizer
        }
    }
}

prototype.gestureRecognizerShouldBegin = function (gestureRecognizer) {
    return true
}

prototype.removeSubView = function (subView) {
    var subViews = this.getProtected('subViews')
    for(var i = 0 ;i < subViews.length; i++){
        if(subViews[i] === subView){
            subViews.splice(i,1)
            this.getLayer().removeChild(subView.getLayer())
            return
        }
    }
}

prototype.setStyle = function (cssObject) {
    var attribute,
        background,
        backgroundAttributes,
        cssText = '',
        element = this.getLayer()
    if(window.cssSandpaper){
        ['transform','opacity','boxShadow','textShadow'].forEach(function (attributeName) {
            if (cssObject.hasOwnProperty(attributeName)) {
                attribute = cssObject[attributeName]
                delete cssObject[attributeName]
                window.cssSandpaper['set'+attributeName.toFirstUpperCase()](element, attribute)
            }
        }.bind(this))
        background = cssObject.backgroundImage || cssObject.background
        if (background) {
            ['rgba','hsla'].forEach(function (name) {
                backgroundAttributes = new RegExp(name+'\\s*?\\((.*?)\\)').exec(background)
                if (backgroundAttributes ) {
                    window.cssSandpaper['set'+name.toUpperCase()+'Background'](
                        this.getLayer(),backgroundAttributes[1])
                }
            }.bind(this))
            backgroundAttributes = /(-(webkit|o|moz)-)?(repeating-radial|repeating-linear|radial|linear)-gradient\s*?\((.*)\)/
                .exec(background)
            if (backgroundAttributes) {
                window.cssSandpaper.setGradient(element,
                    "-sand-gradient("+backgroundAttributes[3]+","+backgroundAttributes[4]+")")
            }
        }

        if (cssObject.hasOwnProperty('color')) {
            var arr =  /hsl\((.*?)\)/.exec(cssObject.color)
            if (arr) {
                window.cssSandpaper.setHSLColor(element,'color',arr[1])
            }
        }
    }

    if (window.PIE && (cssObject.borderRadius || cssObject.borderImage || cssObject.backgroundAttachment
        || (cssObject.background && cssObject.background.indexOf('url') !== -1) || cssObject.backgroundSize
        || cssObject.backgroundRepeat|| cssObject.backgroundOrigin || cssObject.backgroundClip
        || element.nodeName === 'IMG')) {
        window.PIE.attach(element)
    }

    for(var name in cssObject){
        if(cssObject.hasOwnProperty(name)){
            cssText += name.replace(/([A-Z])/g,function(match){
                    return '-'+match.toLowerCase()
                }) + ":" + cssObject[name] + ';'
        }
    }

    if( typeof(element.style.cssText ) !== 'undefined' ) {
        element.style.cssText += ';' + cssText
    } else {
        element.setAttribute('style',cssText);
    }
}
//todo  100%的情况
prototype.getStyle = function (propertyName) {
    if (typeof propertyName === 'string' ) {
        return Number(window.getComputedStyle(this.getLayer())[propertyName].replace('px',''))
    }
    return window.getComputedStyle(this.getLayer())
}

prototype.setHTML = function (htmlText) {
    var element = this.getLayer()
    if (htmlText === undefined) {
        element.innerHTML = ''
    } else if (typeof htmlText === "string") {
        element.innerHTML = htmlText
    }
}

BCSView.findViewById = function (id) {
    var element = document.getElementById(id)
    return element.view
}
/**
 * 手势识别器已经识别出手势，执行状态已经改变的手势识别器。
 * @param stateChangedRecognizers
 */
prototype.executeStateChangedRecognizers = function (stateChangedRecognizers) {
    var gestureRecognizers = this.getGestureRecognizers()
    if (stateChangedRecognizers.length > 0 ) {
        /* 判断识别器是否进行识别 */
        for(var i = 0; i < stateChangedRecognizers.length ; i++) {
            switch(gestureRecognizers[i].state){
                case BCSGestureRecognizerStateEnum.CHANGED:
                case BCSGestureRecognizerStateEnum.BEGAN:
                case BCSGestureRecognizerStateEnum.ENDED:
                    for(var j = 0; j < gestureRecognizers.length; j++) {
                        if (stateChangedRecognizers[j].state !== BCSGestureRecognizerStateEnum.FAILED
                            &&stateChangedRecognizers[i] !== stateChangedRecognizers[j]
                            &&stateChangedRecognizers[j].state !== BCSGestureRecognizerStateEnum.CANCELLED) {
                            if (stateChangedRecognizers[i].hasDependent(gestureRecognizers[j]) ) {
                                stateChangedRecognizers[j].state = BCSGestureRecognizerStateEnum.FAILED
                                stateChangedRecognizers.push(stateChangedRecognizers[j])
                                console.log(stateChangedRecognizers[j].name + "is ")
                                continue
                            }
                            if (!stateChangedRecognizers[i].canPrevent(gestureRecognizers[j])
                                || !gestureRecognizers[j].canBePrevented(stateChangedRecognizers[i]) ) {
                                continue
                            }
                            if (!(stateChangedRecognizers[i].delegate
                                &&  stateChangedRecognizers[i].delegate.shouldRecognizeSimultaneouslyWith
                                && stateChangedRecognizers[i].delegate.shouldRecognizeSimultaneouslyWith(
                                    stateChangedRecognizers[i],gestureRecognizers[j]))
                                &&!(gestureRecognizers[j].delegate
                                && gestureRecognizers[j].delegate.shouldRecognizeSimultaneouslyWith
                                && gestureRecognizers[j].delegate.shouldRecognizeSimultaneouslyWith(
                                    gestureRecognizers[j],stateChangedRecognizers[i]))) {
                                gestureRecognizers[j].state = BCSGestureRecognizerStateEnum.FAILED
                                console.log(stateChangedRecognizers[j].name + "is ")
                                stateChangedRecognizers.push(stateChangedRecognizers[j])
                            }
                        }
                    }
                    break
                default:
            }
        }
        /*执行或者ignore touches*/
        stateChangedRecognizers.forEach(function (recognizer) {
            switch(recognizer.state){
                case BCSGestureRecognizerStateEnum.BEGAN:
                case BCSGestureRecognizerStateEnum.CHANGED:
                    recognizer.executeActions()
                    break
                case BCSGestureRecognizerStateEnum.ENDED:
                    recognizer.executeActions()
                    recognizer.ignoreAvailableTouches()
                    recognizer.reset()
                    break
                case BCSGestureRecognizerStateEnum.FAILED:
                case BCSGestureRecognizerStateEnum.CANCELLED:
                    recognizer.ignoreAvailableTouches()
                    recognizer.reset()
                    break
                default:
            }
        })

        // stateChangedRecognizers.forEach(function (recognizer) {
        //     if (recognizer.state >= BCSGestureRecognizerStateEnum.ENDED) {
        //         recognizer.reset()
        //     }
        // })
    }
}
//BCSView恰好是BCS.js最后一个类,在此手动将module.exports复制到window上以便外部代码访问
Object.prototype.shallowCopy.call(window,module.exports)


