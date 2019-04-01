//
//  UIWebViewController.swift
//  H5
//
//  Created by kenhuang on 2019/1/26.
//  Copyright © 2019年 kenhuang. All rights reserved.
//

import UIKit
import JavaScriptCore
class UIWebViewController: UIViewController, UIWebViewDelegate {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        let webView = NativeWebView(frame: self.view.bounds)
        webView.delegate = self
        self.view.addSubview(webView)
        webView.loadRequest()
        // Do any additional setup after loading the view, typically from a nib.
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    func webViewDidFinishLoad(_ webView: UIWebView) {
        let view = webView as! NativeWebView
        let nativeBridge = NativeBridge()
        view.inject(nativeBridge: nativeBridge)
        nativeBridge.invokeJS =  {
            (name,methodName,withArguments,isNew) in
            return view.invokeJS(name:name, methodName: methodName, withArguments: withArguments, isNew: isNew)
        }
        view.context.exceptionHandler = { (context, exception) in
            print("exception：", exception as Any)
        }
        
    }
    
}


