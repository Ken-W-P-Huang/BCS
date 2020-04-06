/**
 * Created by kenhuang on 2019/3/14.
 */

export function BCSPoint(x,y) {
    this.x = Number(x) || 0.0
    this.y = Number(y) || 0.0
}

{
    BCSPoint.prototype.equalTo = function (point) {
        return this.x === point.x && this.y === point.y
    }
    BCSPoint.prototype.distanceFrom = function (point) {
        return Math.sqrt(Math.pow(point.x-this.x,2) + Math.pow(point.y-this.y,2) )
    }
    BCSPoint.zero = new BCSPoint()
}

export function BCSSize(width,height) {
    this.width = Number(width) || 0.0
    this.height = Number(height) || 0.0
}
BCSSize.zero = new BCSPoint()

export function BCSVector(dx,dy) {
    this.dx = Number(dx) || 0.0
    this.dy = Number(dy) || 0.0
}

export function BCSVector1(point1,point2) {
    return new BCSVector(Number(point2.x - point1.x), Number(point2.y - point1.y))
}

{
    BCSVector.prototype.equalTo = function (vector) {
        return this.dx === vector.dx && this.dy === vector.dy
    }
    BCSVector.prototype.getLength = function () {
        return Math.sqrt(Math.pow(this.dx,2) + Math.pow(this.dy,2) )
    }
    BCSVector.prototype.intersectionAngleWith = function (vector) {
        var signValue = vector.dx * this.dy - this.dx * vector.dy
       if (signValue === 0 ) {
           return 0
       }else{
           return Math.acos((this.dx * vector.dx + this.dy * vector.dy) /(this.getLength() * vector.getLength()))*
               signValue/Math.abs(signValue)
       }

    }
}

export function BCSRect(origin, size) {
    this.origin = origin || new BCSPoint()
    this.size = size || new BCSSize()
}

export function BCSRect1(x, y, width, height) {
    var origin = new BCSPoint(x,y)
    var size = new BCSSize(width,height)
    return new BCSRect(origin, size)
}


export function BCSEdgeInsets(top,left,bottom,right) {
    this.top = top || 0.0
    this.left = left || 0.0
    this.bottom = bottom || 0.0
    this.right = right|| 0.0
}
BCSEdgeInsets.zero = new BCSEdgeInsets()