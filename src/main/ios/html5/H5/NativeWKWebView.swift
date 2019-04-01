//
//  NativeWKWebView.swift
//  H5
//
//  Created by kenhuang on 2019/1/26.
//  Copyright © 2019年 kenhuang. All rights reserved.
//

import Foundation
import WebKit
class NativeWKWebView: WKWebView {
    override init(frame: CGRect, configuration: WKWebViewConfiguration) {
        super.init(frame: frame, configuration: configuration)
        //禁用页面在最顶端时下拉拖动效果
        self.scrollView.bounces = false
        //添加此属性可触发侧滑返回上一网页与下一网页操作
        self.allowsBackForwardNavigationGestures = true
    }
    required init?(coder aDecoder: NSCoder) {
        super.init(coder:aDecoder)
    }
    
    func load(htmlName:String = "index", extensionName:String = "html",directory:String = "HTML5") {
        let path = Bundle.main.path(forResource: htmlName, ofType: extensionName, inDirectory: directory)
        if (path != nil) {
            let request = URLRequest(url: URL(fileURLWithPath: path!))
            self.load(request)
        }else{
            print("There is no \(htmlName).\(extensionName) in \(directory) of Bundle!")
        }
    }
}
