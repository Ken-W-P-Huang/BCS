//
//  WKWebViewController.swift
//  H5
//
//  Created by kenhuang on 2019/1/26.
//  Copyright © 2019年 kenhuang. All rights reserved.
//

import UIKit
import JavaScriptCore
import WebKit
//class WKWebViewController: UIViewController,WKScriptMessageHandler {
//    
//    override func viewDidLoad() {
//        super.viewDidLoad()
//        let configuration = WKWebViewConfiguration()
//        configuration.preferences = WKPreferences()
//        configuration.allowsInlineMediaPlayback = true
//        configuration.selectionGranularity = WKSelectionGranularity.dynamic
//        configuration.userContentController.add(self, name: "nativeBridge")
//        //JS注入 向网页中添加自己的JS方法
//        
//        let wkWebView = NativeWKWebView(frame: self.view.bounds,configuration:configuration)
//        wkWebView.load(htmlName: "Test", extensionName: "html")
//        wkWebView.navigationDelegate = self
//        wkWebView.uiDelegate = self
//        self.view.addSubview(wkWebView)
//        // Do any additional setup after loading the view, typically from a nib.
//    }
//    
//    override func didReceiveMemoryWarning() {
//        super.didReceiveMemoryWarning()
//        // Dispose of any resources that can be recreated.
//    }
//    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
//        print(message.body)
//        let sentData = message.body as! Dictionary
//        //判断是确认添加购物车操作
//        if(sentData["method"] == "addToCarCheck"){
//            //获取商品名称
//            let itemName = sentData["name"]!
//            let alertController = UIAlertController(title: "系统提示",message: "确定把\(itemName)添加到购物车吗？",preferredStyle: .alert)
//            let cancelAction = UIAlertAction(title: "取消", style: .cancel, handler: nil)
//            let okAction = UIAlertAction(title: "确定", style: .default, handler: {action inprint("点击了确定")
//                //调用页面里加入购物车js方法
//                self.theWebView!.evaluateJavaScript("addToCar('\(itemName)')",completionHandler: nil)
//            })
//            
//            alertController.addAction(cancelAction)
//            
//            alertController.addAction(okAction)
//            
//            self.present(alertController, animated: true, completion: nil)
//        
//     
//    }
//    
//}

