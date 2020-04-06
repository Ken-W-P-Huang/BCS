/**
 * Created by kenhuang on 2019/1/26.
 */
import {BCSViewController} from './BCSViewController'
export function BCSTabBarController(element) {
    BCSViewController.call(this,element)
    this.viewControllers = []
}
BCSTabBarController.extend(BCSViewController)