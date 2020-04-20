//: Playground - noun: a place where people can play

import UIKit

var str = "Hello, playground"

class Test{
    init(b:A){
        NotificationCenter.default.addObserver(self, selector: #selector(Test.test(notification:)), name: NSNotification.Name("test"), object: b)
    }
    init(b:A,c:A) {
//        NotificationCenter.default.addObserver(self, selector: #selector(Test.test(notification:)), name: NSNotification.Name("test"), object: b)
        NotificationCenter.default.addObserver(self, selector: #selector(Test.test2(notification:)), name: NSNotification.Name("test"), object: b)
        NotificationCenter.default.addObserver(self, selector: #selector(Test.test2(notification:)), name: NSNotification.Name("test"), object: c)
        
    }
    init() {
        NotificationCenter.default.addObserver(self, selector: #selector(Test.test2(notification:)), name: NSNotification.Name("test"), object: nil)
    }
    @objc func test(notification: Notification)  {
        print("test111111")
//        print("aa:"+notification.name.rawValue)
//        print(notification.description)
//        print(notification.object!)
 
    }
    @objc func test2(notification: Notification)  {
        print("test2")
        
        
    }
    
}
class A:NSObject{
    @objc dynamic public var test:String = "11"
    public var a = "hello"
    override init() {
        
    }
    @objc func sayHello()   {
        NotificationCenter.default.post(name: NSNotification.Name("test"), object: self, userInfo: ["a" : "hello"])
        
    }
    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
        print(a)
        print(keyPath ?? <#default value#>)
    }
}
var a = A()
var b = A()
var c = A()
c.a = "name"
var d = Test()
b.addObserver(a,forKeyPath: "test", context: nil)
b.addObserver(a,forKeyPath: "test", context: nil)
b.addObserver(a,forKeyPath: "test", context: nil)
b.addObserver(c,forKeyPath: "test", context: nil)
b.addObserver(a,forKeyPath: "test", context: nil)
b.test = "22"
NotificationCenter.default.addObserver(d, selector: #selector(Test.test(notification:)), name:nil , object: nil)
NotificationCenter.default.addObserver(d, selector: #selector(Test.test(notification:)), name:NSNotification.Name("test") , object: nil)
NotificationCenter.default.addObserver(d, selector: #selector(Test.test2(notification:)), name:NSNotification.Name("test") , object: nil)
a.sayHello()
NotificationCenter.default.removeObserver(d, name: NSNotification.Name("test"), object: nil)
print("----------")
a.sayHello()
//b.removeObserver(a, forKeyPath: "test")
//b.test = "33"

//var c = A()
////var a = Test(b:b,c:c)
////var a1 = Test(b: b)
//var a2 = Test()
//NotificationCenter.default.post(name: NSNotification.Name("test"), object: b, userInfo: ["a" : "hello"])
////b.sayHello()
////NotificationCenter.default.removeObserver(a, name: NSNotification.Name("test"), object: nil)
////print("=======")
////NotificationCenter.default.removeObserver(a, name: nil, object: nil)
////b.sayHello()
////c.sayHello()
//
//// NotificationCenter.default.post(name: NSNotification.Name("test"), object: b, userInfo: ["a" : "hello"])
//var controller = UIViewController()
//var view = UIView()
//var selector:Selector = #selector(b.sayHello)
//var view = UIView()
//UIViewController

