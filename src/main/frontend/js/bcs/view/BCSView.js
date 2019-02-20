/**
 * Created by kenhuang on 2019/1/10.
 */

export function BCSView(element, style) {
    this.layer = element
    this.layer.style.position = 'absolute'
    if(typeof style === 'object'){
        this.setStyle(style)
    }
    this.subViews = []
}

export function BCSView1(elementId, style) {
    var element = document.getElementById(elementId)
    return new BCSView(element,style)
}

export function BCSView2(style,elementType) {
    elementType = elementType || 'div'
    var element = document.createElement(elementType)
    return new BCSView(element,style)
}

{
    BCSView.prototype.addSubView = function (view) {
        this.subViews.push(view)
        this.layer.appendChild(view.layer)
    }
    BCSView.prototype.removeSubView = function (subView) {
        this.layer.removeChild(subView.layer)
    }
    BCSView.prototype.setStyle = function (cssObject) {
        var cssText = ''
        for(var name in cssObject){
            if(cssObject.hasOwnProperty(name)){
                cssText += name.replace(/([A-Z])/g,function(match){
                        return '-'+match.toLowerCase()
                    }) + ":" + cssObject[name] + ';'
            }
        }
        if( typeof( this.layer.style.cssText ) !== 'undefined' ) {
            this.layer.style.cssText += ';' + cssText
        } else {
            this.layer.setAttribute('style',cssText);
        }
    }
}





