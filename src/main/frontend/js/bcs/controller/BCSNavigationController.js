/**
 * Created by kenhuang on 2019/1/26.
 */
import BCSViewController from './BCSViewController'
import BCSToolbar from '../view/BCSToolbar'
import BCSView from '../view/BCSView'
import BCSNavigationBar from '../view/BCSNavigationBar'


export var UINavigationControllerOperationEnum = {
    none:'none',
    push:'push',
    pop:'pop'
}

export function BCSNavigationController(rootViewController,view) {
    BCSViewController.call(this,view)
    var toolbar = new BCSToolbar()
    this.isToolbarHidden = false
    this.toolbarItems = []
    var navigationBar = new BCSNavigationBar()
    this.isNavigationBarHidden = false
    this.hidesBarsOnTap = false
    this.hidesBarsOnSwipe = false
    this.hidesBarsWhenVerticallyCompact = false
    var viewControllers = []
    this.delegate = null
    var wrapperView = new BCSView({
        width:'100%',
        height:'100%'
    })
    wrapperView.setAttribute("comment","wrapperView")
    this.getNavigationBar = function () {
        return navigationBar
    }
    this.getToolbar = function () {
        return toolbar
    }
    this.getContainerView = function () {
        return wrapperView
    }
    this.getTopViewController = function () {
        var length = viewControllers.length
        if(length > 0){
            return viewControllers[viewControllers.length - 1]
        }
    }
    this.getVisibleViewController = function () {
        //todo 似乎一样
        return this.getTopViewController()
    }
    this.getViewControllers = function () {
        return viewControllers
    }

    this.view.addSubView(wrapperView)
    this.view.addSubView(navigationBar)
    this.view.addSubView(toolbar)
    if(rootViewController){
        this.pushViewController(rootViewController)
    }
}
function clearScene(navigationController,viewController,lastController,animated) {
    viewController.viewDidAppear(animated)
    viewController.view.getLayer().style.transition = ''
    if (lastController){
        lastController.view.getLayer().style.transition = ''
        lastController.viewWillDisappear(animated)
        navigationController.getContainerView().removeSubView(lastController.view)
        lastController.viewDidDisappear(animated)
    }
}
function clearSceneAfterTransition(layer,navigationController,viewController,lastController,animated) {
    if (layer.style.transition) {
        layer.addEventListener('transitionend',function handleTransitionend(event) {
            if (event.target === layer) {
                clearScene(navigationController,viewController,lastController,animated)
                layer.removeEventListener('transitionend',handleTransitionend)
            }
        })
        return true
    }
    return false
}

function switchScene(navigationController,viewController,viewControllerInitStyle,viewControllerFinalStyle,
                     lastController,lastControllerInitStyle,lastControllerFinalStyle,animated,isPoped) {
    animated = animated || false
    viewController.viewWillAppear(animated)
    navigationController.getContainerView().addSubView(viewController.view)
    if (animated) {
        if (isPoped ) {
            navigationController.getContainerView().addSubView(lastController.view)
        }
        viewController.view.setStyle(viewControllerInitStyle)
        if (lastController) {
            lastController.view.setStyle(lastControllerInitStyle)
        }
        setTimeout(function () {
            clearSceneAfterTransition(viewController.view.getLayer(),navigationController,viewController,lastController, animated)
            viewController.view.setStyle(viewControllerFinalStyle)
            if (lastController ) {
                lastController.view.setStyle(lastControllerFinalStyle)
            }
        },0)
    }else{
        /* 如果Controller上有过渡，则等待过渡完成再清空*/
        clearSceneAfterTransition(viewController.view.getLayer(),navigationController,viewController,lastController, animated) ||
        clearSceneAfterTransition(navigationController.view.getLayer(),navigationController,viewController,lastController,animated)  ||
        clearScene(navigationController,viewController,lastController,animated)
    }
}

{
    BCSNavigationController.extend(BCSViewController)
    BCSNavigationController.prototype.pushViewController = function (viewController,animated) {
        var self = this
        var viewControllers = this.getViewControllers()
        viewControllers.push(viewController)
        viewController.navigationController = this
        var lastController  = viewControllers[viewControllers.length - 2]
        switchScene(this,viewController,{
            left:'100%',
            transition: 'left 0.5s;'
        },{
            left:'0px'
        },lastController,{
            left:'0px',
            transition: 'left 0.5s;'
        },{
            left: '-33%'
        },animated)
    }

    /**
     * 不能pop rootViewController
     * @param animated
     */
    BCSNavigationController.prototype.popViewController = function (animated) {
        var viewControllers = this.getViewControllers()
        if (viewControllers.length > 1) {
            var self = this
            var lastController = viewControllers.pop()
            var viewController = viewControllers[viewControllers.length -1]
            switchScene(this,viewController,{
                transition: 'left 0.5s;'
            },{
                left:'0px'
            },lastController,{
                transition: 'left 0.5s;'
            },{
                left: '100%'
            },animated,true)
        }
    }

    BCSNavigationController.prototype.setToolbarItems = function (toolbarItems,animated) {


    }

    BCSNavigationController.prototype.popToRootViewController = function (animated) {
        var viewControllers = this.getViewControllers()
        if (viewControllers.length > 1) {
            viewControllers.splice(1,viewControllers.length - 2)
            this.popViewController(animated)
        }
    }
}

