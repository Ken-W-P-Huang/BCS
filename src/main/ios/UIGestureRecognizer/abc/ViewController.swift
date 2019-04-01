//
//  ViewController.swift
//  abc
//
//  Created by kenhuang on 2019/3/8.
//  Copyright © 2019年 kenhuang. All rights reserved.
//

import UIKit
//app 提取地址~/Library/Group Containers/K36BKF7T3D.group.com.apple.configurator/Library/Caches/Assets/TemporaryItems/MobileApps/
class ViewController: UIViewController {
//    @IBOutlet weak var button: UIButton!
    var button: UIView!
    var aButton:UIButton!
    var gestureRecognizer:GestureRecognizer!
    var gestureRecognizer1:UITapGestureRecognizer!
    var gestureRecognizer2:UITapGestureRecognizer!
    var gestureRecognizer3:UITapGestureRecognizer!
    var gestureRecognizer4:UITapGestureRecognizer!
    var pinchgestureRecognizer5:UIPinchGestureRecognizer!
    var SwipegestureRecognizer6:UISwipeGestureRecognizer!
    var LongPressgestureRecognizer7:UILongPressGestureRecognizer!
    var pangestureRecognizer8:UIPanGestureRecognizer!
    override func viewDidLoad() {
        super.viewDidLoad()
        gestureRecognizer = GestureRecognizer(target: self, action: #selector(ViewController.sayHello))
        gestureRecognizer1 = TapGestureRecognizer(target: self, action: #selector(ViewController.sayHello1))
        gestureRecognizer2 = TapGestureRecognizer(target: self, action: #selector(ViewController.sayHello2))
        gestureRecognizer3 = TapGestureRecognizer(target: self, action: #selector(ViewController.sayHello3))
        gestureRecognizer4 = TapGestureRecognizer(target: self, action: #selector(ViewController.sayHello4))
        pinchgestureRecognizer5 = PinchGestureRecognizer(target: self, action: #selector(ViewController.pinch))
        SwipegestureRecognizer6 = SwipeGestureRecognizer(target: self, action: #selector(ViewController.swipe))
        LongPressgestureRecognizer7 = LongPressGestureRecognizer(target: self, action: #selector(ViewController.longPress))
        pangestureRecognizer8 = PanGestureRecognizer(target: self, action: #selector(ViewController.pan))
        gestureRecognizer.name = "gestureRecognizer"
        gestureRecognizer1.name = "gestureRecognizer1"
        gestureRecognizer2.name = "gestureRecognizer2"
        gestureRecognizer3.name = "gestureRecognizer3"
        gestureRecognizer4.name = "gestureRecognizer4"
        pinchgestureRecognizer5.name = "Pinch"
        SwipegestureRecognizer6.name = "Swipe"
        LongPressgestureRecognizer7.name = "LongPress"
        pangestureRecognizer8.name = "pan"
        gestureRecognizer.location(in: gestureRecognizer.view)
        
//        let gestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(ViewController.sayHello))
//        self.button.addGestureRecognizer(gestureRecognizer)
        // Do any additional setup after loading the view, typically from a nib.
//         print(self.parent)
//        self.view
//        UINavigationController
//         var a = UIButton(type: UIButtonType)
//        self.view
        button = UIView(frame:CGRect(x: 50, y: 50, width: 300, height: 300) ) //UIScreen.main.bounds
        button.backgroundColor = UIColor.red
        self.view.addSubview(button)
        gestureRecognizer1.numberOfTapsRequired = 1
        gestureRecognizer3.numberOfTapsRequired = 1
//        gestureRecognizer4.numberOfTouchesRequired = 3
       // gestureRecognizer.addTarget(self, action: #selector(ViewController.sayHello1))
       
//        gestureRecognizer.addTarget(button, action: #selector(UIButton.setImage(_:for:)))
//        gestureRecognizer.removeTarget(self, action:  nil)
        
          
//        button.addGestureRecognizer(gestureRecognizer)
        gestureRecognizer.delegate = self
//        button.addGestureRecognizer(gestureRecognizer1)
         gestureRecognizer2.numberOfTapsRequired = 1
//        button.addGestureRecognizer(gestureRecognizer2)

        gestureRecognizer3.delegate = self
        //        button.addGestureRecognizer(gestureRecognizer3)
//        gestureRecognizer4.delegate = self
        gestureRecognizer4.numberOfTapsRequired = 2
        gestureRecognizer4.numberOfTouchesRequired = 2
//        button.addGestureRecognizer(gestureRecognizer4)

        button.addGestureRecognizer(pinchgestureRecognizer5)
        SwipegestureRecognizer6.numberOfTouchesRequired = 2
//        SwipegestureRecognizer6.direction = UISwipeGestureRecognizerDirection.up
        SwipegestureRecognizer6.delegate = self
     
//        button.addGestureRecognizer(SwipegestureRecognizer6)
        LongPressgestureRecognizer7.numberOfTapsRequired = 1
        LongPressgestureRecognizer7.numberOfTouchesRequired = 2
          LongPressgestureRecognizer7.delegate = self
//        button.addGestureRecognizer(LongPressgestureRecognizer7)
        LongPressgestureRecognizer7.allowableMovement = 200
//        pangestureRecognizer8.delegate = self
//        button.addGestureRecognizer(pangestureRecognizer8)
//        gestureRecognizer.delegate = self
//        gestureRecognizer1.delegate = self
//        gestureRecognizer2.delegate = self


//        gestureRecognizer6.delegate = self
      
        aButton = UIButton(frame: CGRect(x: 0, y: 200, width: 40, height: 40))
        aButton.backgroundColor = UIColor.green
        self.view.addSubview(aButton)
        aButton.addTarget(self, action: #selector(ViewController.click), for: UIControlEvents.touchUpInside)
        
    }
    override func viewWillAppear(_ animated: Bool) {
        
    }
    override func viewWillDisappear(_ animated: Bool) {
        
    }
    override func viewDidDisappear(_ animated: Bool) {
        
    }
    @objc func click()  {
        var controller = ViewController1()
        controller.view.backgroundColor = UIColor.yellow
//        UIView.transition(from: self.view , to: controller.view, duration: 1, options: UIViewAnimationOptions.transitionFlipFromTop) { (finished) in
//            self.navigationController?.pushViewController(controller, animated: true)
//        }
        
        UIView.transition(with: self.navigationController!.view, duration: 1, options: UIViewAnimationOptions.transitionFlipFromTop, animations: {
            self.navigationController?.pushViewController(controller, animated: false)
        }) { (finished) in
            
        }
        
        
    }
    func printResult()  {
        var a = DateFormatter()
        a.dateFormat = ("yyyyMMdd HHmmss:SSS")
        print("_____________________________________________________\(a.string(from: Date()))")
        print(gestureRecognizer.state.rawValue)
        print(gestureRecognizer1.state.rawValue)
        print(gestureRecognizer2.state.rawValue)
        print(gestureRecognizer3.state.rawValue)
        print(gestureRecognizer4.state.rawValue)
        print("pinch:\(pinchgestureRecognizer5.state.rawValue):\(pinchgestureRecognizer5.scale):\(pinchgestureRecognizer5.velocity)")
        print("Swipe:\(SwipegestureRecognizer6.state.rawValue)")
        print("longPress:\(LongPressgestureRecognizer7.state.rawValue)")
          print("pan:\(pangestureRecognizer8.state.rawValue)")
        print("_____________________________________________________")
    }
    @objc func sayHello(a:UIGestureRecognizer)  {
        print("UIGestureRecognizer:\(a.numberOfTouches)")
        printResult()
    }
    @objc func sayHello1(a:UIGestureRecognizer)  {
        print("UITapGestureRecognizer tap1:\(a.numberOfTouches)")
        printResult()
    }
    @objc func sayHello2(a:UIGestureRecognizer)  {
        print("UITapGestureRecognizer tap2 :\(a.numberOfTouches)")
        printResult()
    }
    @objc func sayHello3(a:UIGestureRecognizer)  {
        print("UITapGestureRecognizer tap3:\(a.numberOfTouches)")
        print("hello3:\(a.numberOfTouches)")
        printResult()
    }
    @objc func sayHello4(a:UIGestureRecognizer)  {
        print("UITapGestureRecognizer tap4 touch4:\(a.numberOfTouches)")
        printResult()
    }
    
    @objc func longPress(a:UIGestureRecognizer)  {
        print("UITapGestureRecognizer:\(a.numberOfTouches)")
        printResult()
        
    }
    @objc func pinch(a:UIGestureRecognizer)  {
        print("pinch:\(a.numberOfTouches)")
        printResult()
    }
    
    @objc func swipe(a:UIGestureRecognizer)  {
        print("swipe:\(a.numberOfTouches)")
        printResult()
    }
    
    @objc func pan(a:UIGestureRecognizer)  {
        print("pan:\(a.numberOfTouches)")
        printResult()
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}
extension ViewController:UIGestureRecognizerDelegate {
    // called when a gesture recognizer attempts to transition out of UIGestureRecognizerStatePossible. returning NO causes it to transition to UIGestureRecognizerStateFailed
    @available(iOS 3.2, *)
     public func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool{
        print("viewController gestureRecognizerShouldBegin:\(gestureRecognizer.name)")
        return true
    }
    
    
    // called when the recognition of one of gestureRecognizer or otherGestureRecognizer would be blocked by the other
    // return YES to allow both to recognize simultaneously. the default implementation returns NO (by default no two gestures can be recognized simultaneously)
    //
    // note: returning YES is guaranteed to allow simultaneous recognition. returning NO is not guaranteed to prevent simultaneous recognition, as the other gesture's delegate may return YES
    @available(iOS 3.2, *)
     public func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool{
        print("viewController shouldRecognizeSimultaneouslyWith:\(gestureRecognizer.name):\(otherGestureRecognizer.name)")
//        if gestureRecognizer == gestureRecognizer3 {
//            return false
//        }
        return false
//        return true
    }
    
    
    // called once per attempt to recognize, so failure requirements can be determined lazily and may be set up between recognizers across view hierarchies
    // return YES to set up a dynamic failure requirement between gestureRecognizer and otherGestureRecognizer
    //
    // note: returning YES is guaranteed to set up the failure requirement. returning NO does not guarantee that there will not be a failure requirement as the other gesture's counterpart delegate or subclass methods may return YES
    @available(iOS 7.0, *)
     public func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRequireFailureOf otherGestureRecognizer: UIGestureRecognizer) -> Bool{
        print("viewController shouldRequireFailureOf:\(gestureRecognizer.name):\(otherGestureRecognizer.name)")
        return false
    }
    
//    @available(iOS 7.0, *)
     public func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldBeRequiredToFailBy otherGestureRecognizer: UIGestureRecognizer) -> Bool{
        print("viewController shouldBeRequiredToFailBy:\(gestureRecognizer.name):\(otherGestureRecognizer.name)")
        return false
    }
    
    
    // called before touchesBegan:withEvent: is called on the gesture recognizer for a new touch. return NO to prevent the gesture recognizer from seeing this touch
    @available(iOS 3.2, *)
    public func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool{
        print("viewController shouldReceivetouch:\(gestureRecognizer.name)")
        return true
    }
    
    
    // called before pressesBegan:withEvent: is called on the gesture recognizer for a new press. return NO to prevent the gesture recognizer from seeing this press
    @available(iOS 9.0, *)
    public func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive press: UIPress) -> Bool{
        print("viewController shouldReceive press:\(gestureRecognizer.name)")
        return false
    }
}

