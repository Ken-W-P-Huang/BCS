//
//  AppDelegate.swift
//  abc
//
//  Created by kenhuang on 2019/3/8.
//  Copyright © 2019年 kenhuang. All rights reserved.
//

import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    var controller:UINavigationController!

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch
        var viewcontroller = ViewController()
       var controller = UINavigationController(rootViewController: viewcontroller)
        self.window?.rootViewController = controller
//        controller = UINavigationController()
//        var button  = UIButton(frame: CGRect(x: 100, y: 100, width: 40, height: 40))
//        button.backgroundColor = UIColor.red
//        button.addTarget(self, action: #selector(AppDelegate.up), for: UIControlEvents.touchUpInside)
//        controller.view.addSubview(button)
//        self.window?.rootViewController = controller
//        var _controller = UIViewController()
//        _controller.view.backgroundColor = UIColor.green
//        var view = UIView(frame:  _controller.view.bounds)
//        view.backgroundColor = UIColor.yellow
//        _controller.view.addSubview(view)
//        controller.pushViewController(_controller, animated: true)
        return true
    }
    @objc func up()  {
        print("up")
        controller.popViewController(animated: true)
    }
    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }


}

