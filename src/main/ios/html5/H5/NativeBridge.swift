//
//  Local.swift
//  H5
//
//  Created by kenhuang on 2019/1/26.
//  Copyright © 2019年 kenhuang. All rights reserved.
//

import Foundation
import JavaScriptCore
@objc protocol NativeBridgeDelegate:JSExport {
    func sayHello1(_ a:Int,_ b:String,_ c:AnyObject)->Int
    func sayHello(_ b:String)
}

@objc class NativeBridge:NSObject,NativeBridgeDelegate {
    var invokeJS:((String,String?,[Any],Bool)->JSValue?)!
    
    override init() {
        super.init()
    }
    init(closure:@escaping ((String,String?,[Any],Bool)->JSValue?)) {
        super.init()
        self.invokeJS = closure
    }
    /**
     *  如果不使用缺省参数名，则在JS调用时需要在方法名加上参数名！
     */
    func sayHello1(_ a:Int,_ b:String,_ c:AnyObject)->Int  {
        print("hello\(a)\(b)\(c)")
        return 10
    }
    func sayHello(_ b:String)  {
        print("hello\(b)")
        print(self.invokeJS("alert",nil,[1000],false))
        print(self.invokeJS("a","calledByMobile",["hello world"],false))
    }
}
