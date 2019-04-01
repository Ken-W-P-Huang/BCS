/**
 * Created by kenhuang on 2019/3/30.
 */
function BCSPoint(x,y) {
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

function getPoint(x,y,m,n) {
    return new BCSPoint((x+m)/2,(y+n)/2)
}

function getDistance(x,y,m,n,h,i,j,k) {
    var point1 = getPoint(x,y,m,n)
    console.log(point1)
    var point2 = getPoint(h,i,j,k)
    console.log(point2)
    return point1.distanceFrom(point2)
}



function getSpeed(x,y,m,n,a,h,i,j,k,b){
    var point1 = getPoint(x,y,m,n)
    console.log(point1)
    var point2 = getPoint(h,i,j,k)
    console.log(point2)
    console.log((b-a))
    return point2.distanceFrom(point1)/(b-a)
}

function getSpeed2(x,y,m,n){
    console.log(x -y)
    console.log(m -n)
    return (x -y)/(m -n)
}