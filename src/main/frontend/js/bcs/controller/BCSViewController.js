/**
 * Created by kenhuang on 2019/1/26.
 */
import {BCSView,BCSView1,BCSView2} from '../view/BCSView'
export function BCSViewController(element) {
    this.childViewControllers = []
    if(Object.isElement(element)) {
        this.view = new BCSView(element)
    }else if(typeof element ==="string" ){
        this.view = new BCSView1(element)
    }else{
        this.view = BCSView2()
    }
    this.view.setStyle({width:'100%',height:'100%'})
    this.parent = null;
}

{
    BCSViewController.prototype.loadView = function () {

    }
    BCSViewController.prototype.getReady = function () {

    }
    BCSViewController.prototype.viewDidLoad = function () {

    }
    BCSViewController.prototype.layoutSubViews = function () {

    }
    BCSViewController.prototype.viewWillAppear=function () {

    }
    BCSViewController.prototype.viewDidAppear = function () {

    }
    BCSViewController.prototype.viewWillDisappear = function () {

    }
    BCSViewController.prototype.viewDidDisappear = function () {

    }
    BCSViewController.prototype.viewWillUnload = function () {

    }
    BCSViewController.prototype.viewDidUnload = function () {

    }
    BCSViewController.prototype.appear = function (callback) {
        this.viewWillAppear()
        if(typeof callback === 'function'){
            callback()
        }
        this.viewDidAppear()
    }
    BCSViewController.prototype.disappear = function (callback) {
        this.viewWillDisappear()
        if(typeof callback === 'function'){
            callback()
        }
        this.viewDidDisappear()
    }
    BCSViewController.prototype.addChildViewController = function (viewController) {
    }
    BCSViewController.prototype.insertChildViewController = function (viewControllerindex) {

    }
    BCSViewController.prototype.removeFromParentViewController = function () {

    }
    BCSViewController.prototype.removeChildViewController = function (index) {

    }
}





