/**
 * Created by kenhuang on 2019/1/26.
 */
import BCSViewController from './BCSViewController'
export function BCSNavigationController(element) {
    BCSViewController.call(this,element)
    this.viewControllers = []
}
BCSNavigationController.extend(BCSViewController,{
    pushViewController:function (viewController,animated) {
        this.viewControllers.push(viewController)
        var self = this
        viewController.appear(function () {
            self.view.addSubView(viewController.view)
        })
    },
    popViewController:function (animated) {
        var controller = this.viewControllers.pop()
        if(controller){
            var self = this
            controller.disappear(function () {
                self.view.removeSubView(controller.view)
            })
            if(this.viewControllers.length >= 1){
                controller = this.viewControllers[this.viewControllers.length -1]
                controller.appear(function () {
                    self.view.addSubView(controller.view)
                })
            }
        }
    }
})
