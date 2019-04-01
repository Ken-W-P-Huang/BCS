/**
 * Created by kenhuang on 2019/3/14.
 */

export function BCSPoint(x,y) {
    this.x = Number(x) || 0.0
    this.y = Number(y) || 0.0
}

{
    BCSPoint.prototype.equalTo = function (point2) {
        return this.x === point2.x && this.y === point2.y
    }
    BCSPoint.prototype.distanceFrom = function (point2) {
        return Math.sqrt(Math.pow(point2.x-this.x,2) + Math.pow(point2.y-this.y,2) )
    }
}

export function BCSSize(width,height) {
    this.width = Number(width) || 0.0
    this.height = Number(height) || 0.0
}

export function BCSVector(dx,dy) {
    this.dx = Number(dx) || 0.0
    this.dy = Number(dx) || 0.0
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