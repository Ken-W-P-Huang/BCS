/**
 * Created by kenhuang on 2019/3/5.
 */

function NavigationController() {
    BCSNavigationController.call(this)
    var controller = new ViewController()
    this.pushViewController(controller)
}
NavigationController.extend(BCSNavigationController)

function ViewController(){
    BCSViewController.call(this)
    this.view.setStyle({
        backgroundColor:'green'
    })
    var button = new BCSButton({
        top:'50px',
        width:'100px',
        height:'20px',
        left:'100px',
        backgroundColor:'yellow'
    })
    this.view.addSubView(button)
    var label = new BCSLabel({
        top:'100px',
        width:'100px',
        height:'20px',
        left:'100px',
        backgroundColor:'gray'
    })
    label.setText('hello')
    this.view.addSubView(label)
    button.getLayer().addEventListener('click',function () {
       if(this.navigationController){
           var red  = new ViewController1()
           this.navigationController.pushViewController(red,true)
       }
    }.bind(this))

    var label1 = new BCSLabel({
        top:'0px',
        width:'375px',
        height:'500px',
        left:'0px',
        color:'white',
        backgroundColor:'blue'
    })
    this.view.addSubView(label1)
    // fetch('http://localhost:8080/person/data').then(function (response) {
    //     return response.text()
    // }).then(function (text) {
    //     label1.setText(text)
    // })['catch'](function (error) {
    //     console.log(error)
    // })
    this.tap1 = function () {
        console.log('tap1')
    }
    this.tap2 = function () {
        console.log('tap2')
    }
    this.tap3 = function () {
        console.log('tap3')
    }

    this.long = function () {
        console.log('longxx')
    }
    this.swipe = function () {
        console.log('swipe')
    }
    this.pinch = function (gestureRecognizer) {
        console.log('pinch:'+gestureRecognizer.getScale()+":"+gestureRecognizer.getVelocity())
    }
    this.rotate = function (gestureRecognizer) {
        console.log('rotate:'+gestureRecognizer.getRotation()+":"+gestureRecognizer.getVelocity())
    }
    this.pan = function (gestureRecognizer) {
        console.log('pan:'+JSON.stringify(gestureRecognizer.translation())+":"+JSON.stringify(gestureRecognizer.velocity()))
    }
    var gestureRecognizer1 = new BCSTapGestureRecognizer(this,this.tap1)
    gestureRecognizer1.numberOfTapsRequired = 1
    gestureRecognizer1.name = 'tap1'
    var gestureRecognizer2 = new BCSTapGestureRecognizer(this,this.tap2)
    gestureRecognizer2.numberOfTapsRequired = 1
    gestureRecognizer2.name = 'tap2'
    var gestureRecognizer3 = new BCSTapGestureRecognizer(this,this.tap3)
    gestureRecognizer3.numberOfTapsRequired = 2
    gestureRecognizer3.numberOfTouchesRequired = 2
    gestureRecognizer3.name = 'tap3'
    // var longGestureRecognizer = new BCSLongPressGestureRecognizer(this,this.long)
    // longGestureRecognizer.numberOfTapsRequired = 2
    // longGestureRecognizer.numberOfTouchesRequired = 2
    // label1.addGestureRecognizer(gestureRecognizer1)
    // label1.addGestureRecognizer(gestureRecognizer2)
    // label1.addGestureRecognizer(gestureRecognizer3)
    // var swipeGestureRecognizer = new BCSSwipeGestureRecognizer(this,this.swipe)
    // swipeGestureRecognizer.numberOfTouchesRequired = 2
    // swipeGestureRecognizer.direction = BCSSwipeGestureRecognizerDirectionEnum.UP
    // label1.addGestureRecognizer(swipeGestureRecognizer)
    // var pinchGestureRecognizer = new BCSPinchGestureRecognizer(this,this.pinch)
    // label1.addGestureRecognizer(pinchGestureRecognizer)
    // var rotateGestureRecognizer = new BCSRotationGestureRecognizer(this,this.rotate)
    // label1.addGestureRecognizer(rotateGestureRecognizer)
    var panGestureRecognizer = new BCSPanGestureRecognizer(this,this.pan)
    panGestureRecognizer.minimumNumberOfTouches = 2
    label1.addGestureRecognizer(panGestureRecognizer)
}
ViewController.extend(BCSViewController)

function ViewController1(){
    BCSViewController.call(this)
    this.view.setStyle({
        backgroundColor:'red'
    })
    var button = new BCSButton({
        top:'50px',
        width:'100px',
        height:'20px',
        left:'100px',
        backgroundColor:'yellow'
    })
    this.view.addSubView(button)
    button.getLayer().addEventListener('click',function () {
        if(this.navigationController){
            var red  = new ViewController1()
            this.navigationController.popViewController(true)
        }
    }.bind(this))

    var button1 = new BCSButton({
        top:'100px',
        width:'100px',
        height:'20px',
        left:'100px',
        backgroundColor:'gray'
    })
    this.view.addSubView(button1)
    button1.getLayer().addEventListener('click',function () {
        if(this.navigationController){
            var blue  = new ViewController2()
            this.navigationController.pushViewController(blue,true)
        }
    }.bind(this))
}
ViewController1.extend(BCSViewController)

function ViewController2(){
    BCSViewController.call(this)
    this.view.setStyle({
        backgroundColor:'blue'
    })
    var button = new BCSButton({
        top:'50px',
        width:'100px',
        height:'20px',
        left:'100px',
        backgroundColor:'yellow'
    })
    this.view.addSubView(button)
    button.getLayer().addEventListener('click',function () {
        if(this.navigationController){
            var red  = new ViewController1()
            this.navigationController.popViewController(true)
        }
    }.bind(this))
}
ViewController2.extend(BCSViewController)

function Person() {
    this.name ='a'
    var b = 'b'
    var map = new ListMap()
    this.enableKVO(map)
    this.getB = function () {
        return b
    }
    this.setB = function (newB) {
        b = newB
    }
}

function Observer() {
    this.observeValueForKey = function(object, key, oldValue, newValue){
        console.log(key,oldValue, newValue)
    }
}

var p = new Person()
var o = new Observer()
p.addObserver(o,'name')
p.name = 'hello'
p.removeObserver(o,'name')
browser.runWith(NavigationController)
