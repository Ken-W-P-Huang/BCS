//
//  ViewController1.swift
//  abc
//
//  Created by kenhuang on 2019/3/12.
//  Copyright © 2019 kenhuang. All rights reserved.
//

import UIKit
class ViewController1: UIViewController {
    var button:UIButton!
    
    override func viewDidLoad() {
        button = UIButton(frame: CGRect(x: 100, y: 100, width: 40, height: 40))
        button.backgroundColor = UIColor.red
        var scrollView = UIScrollView(frame: CGRect(x: 100, y: 200, width: 100, height: 100))
        self.view.addSubview(scrollView)
        scrollView.backgroundColor = UIColor.gray
        scrollView.bounces = true
        scrollView.isScrollEnabled = true
    }
    override func viewWillAppear(_ animated: Bool) {
        
    }
    override func viewDidAppear(_ animated: Bool) {
        self.view.addSubview(button)
        
    }
    
}
