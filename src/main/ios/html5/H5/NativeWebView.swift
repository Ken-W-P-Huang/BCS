//
//  LocalWebView.swift
//  FMS-355H
//
//  Created by kenhuang on 2019/1/26.
//  Copyright © 2019年 kenhuang. All rights reserved.
//

import Foundation
import JavaScriptCore
import UIKit
class NativeWebView:UIWebView {
    var context: JSContext!
    override init(frame: CGRect) {
        super.init(frame:frame)
        self.scalesPageToFit = true
    }
    required init?(coder aDecoder: NSCoder) {
        super.init(coder:aDecoder)
    }
    func inject(nativeBridge:Any)  {
        if self.request != nil {
            self.context = self.value(forKeyPath: "documentView.webView.mainFrame.javaScriptContext") as! JSContext
            self.context.setObject(nativeBridge, forKeyedSubscript: "nativeBridge" as NSCopying & NSObjectProtocol)
            self.context.evaluateScript(try? String(contentsOf: self.request!.url!, encoding: String.Encoding.utf8))
        }
    }
    func loadRequest(htmlName:String = "index", extensionName:String = "html",directory:String = "HTML5") {
        let path = Bundle.main.path(forResource: htmlName, ofType: extensionName, inDirectory: directory)
        if (path != nil) {
            let request = URLRequest(url: URL(fileURLWithPath: path!))
            self.loadRequest(request)
        }
    }
    func invokeJS(name:String,methodName:String?,withArguments:[Any],isNew:Bool = false) -> JSValue? {
        let object = self.context.objectForKeyedSubscript(name)
        if object != nil && object!.isObject {
            if methodName != nil{
                return object?.invokeMethod(methodName!, withArguments: withArguments)
            }else{
                if isNew{
                    return object?.construct(withArguments: withArguments)
                }else{
                    return (object?.call(withArguments: withArguments))
                }
            }
        }else{
            return nil
        }
    }
}
