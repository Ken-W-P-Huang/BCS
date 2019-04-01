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
        
    }
    override func viewWillAppear(_ animated: Bool) {
        
    }
    override func viewDidAppear(_ animated: Bool) {
        self.view.addSubview(button)
        
    }
    
}
