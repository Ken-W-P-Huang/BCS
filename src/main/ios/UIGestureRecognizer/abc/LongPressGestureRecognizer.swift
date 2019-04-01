//
//  TapGestureRecognizer.swift
//  abc
//
//  Created by kenhuang on 2019/3/15.
//  Copyright © 2019 kenhuang. All rights reserved.
//

import UIKit
class LongPressGestureRecognizer:UILongPressGestureRecognizer{
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent) {
        super.touchesMoved(touches, with: event)
        printTouch("touchesMoved",touches,event)
    }
    func printTouch(_ name:String,_ touches: Set<UITouch>,_  event: UIEvent)  {
        var a = DateFormatter()
        a.dateFormat = ("yyyyMMdd HHmmss:SSS")
        print("\(a.string(from: Date()))____________________________________")
        print("\(name):\(self.location(in: self.view)):\(self.name):\(self.state.rawValue):\(self.numberOfTouches)")
        print("touches:\(touches)")
        print("allTouches:\(event.allTouches)")
        for i in 0 ..< self.numberOfTouches  {
            print("touches self.location:\(self.location(ofTouch: i, in: self.view))")
        }
        print("self.location:\(self.location(in: self.view))")
        print("____________________________________")
    }
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent) {
        super.touchesBegan(touches, with: event)
        printTouch("touchesBegan",touches,event)
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent) {
        super.touchesEnded(touches, with: event)
        printTouch("touchesEnded",touches,event)
    }
    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent) {
        super.touchesCancelled(touches, with: event)
        printTouch("touchesCancelled",touches,event)
    }
    override func shouldRequireFailure(of otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        print("shouldRequireFailureof\(self.name):\(otherGestureRecognizer.name)")
        //        self.reset()
        return false
    }
    override func shouldBeRequiredToFail(by otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        print("shouldBeRequiredToFailby\(self.name):\(otherGestureRecognizer.name)")
        return false
    }
    override func ignore(_ touch: UITouch, for event: UIEvent) {
        super.ignore(touch, for: event)
        if self.numberOfTouches > 0 {
            var number = 0
            var i = 0
            for i in 0..<event.allTouches!.capacity {
                if Array(event.allTouches!)[i] === touch{
                    number = i
                    break
                }
            }
            print("\(self.location(ofTouch: number, in: self.view)):touch ignored:\(self.location(in: self.view)):\(self.name):\(touch):\(self.numberOfTouches)")
            
        }else{
            print("touch ignored:\(self.location(in: self.view)):\(self.name):\(touch):\(self.numberOfTouches)")
        }
        
        
    }
    override func ignore(_ button: UIPress, for event: UIPressesEvent) {
        super.ignore(button, for: event)
        print("button:\(button)")
    }
    override func canPrevent(_ preventedGestureRecognizer: UIGestureRecognizer) -> Bool {
        print("canPrevent\(self.name):\(preventedGestureRecognizer.name)")
        return true
    }
    override func canBePrevented(by preventingGestureRecognizer: UIGestureRecognizer) -> Bool {
        print("canBePrevented\(self.name):\(preventingGestureRecognizer.name)")
        
        return true
    }
    override func reset() {
        super.reset()
        var a = DateFormatter()
        a.dateFormat = ("yyyyMMdd HHmmss:SSS")
        
        print("reset:\(self.name):\(self.numberOfTouches):\(a.string(from: Date()))")
    }
}



