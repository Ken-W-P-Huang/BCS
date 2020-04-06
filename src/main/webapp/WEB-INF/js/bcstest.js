/**
 * Created by kenhuang on 2019/3/20.
 */
browser.applyPatches(PatchEnum.FETCH)
function Controller() {
    BCSViewController.call(this)
    var self = this

    var label = new BCSLabel({
        width:'100px',
        height:'50px',
        backgroundColor:'red'
    })
    this.view.addSubView(label)
    label.getLayer().name = 'aaa'
    label.getLayer().addEventListener('click',function (event) {
        //异步调用openWindow时，必须先在同步代码段打开空的window，再将json传递给openWindow，否则浏览器会拦截。同步调用可以忽略
        var newWindow = window.open('',WindowNameEnum.BLANK)
        fetch('http://192.168.18.230:8080/person/data').then(function (response) {1
            return response.json()
        }).then(function (json) {
            //json.url/json.pathname应由服务器返回的json对象提供，也可以随意更改
            json.url = 'http://192.168.18.230:8080/html/bcs1.html'
            self.openWindow(json,WindowNameEnum.BLANK,newWindow)
        })['catch'](function (error) {
            alert(error)
        })
    })

    // var div = document.createElement('div')
    // div.name = 'hello'
    // div.style.width = '200px'
    // div.style.height = '200px'
    // div.style.backgroundColor = 'yellow'
    // div.addEventListener('click',function () {
    //             alert('hello1')
    //     }
    // )
    // this.view.getLayer().appendChild(div)
    // window.onhashchange = function () {
    //     console.log('hello')
    // }
}
Controller.extend(BCSViewController)
browser.runWith(Controller)