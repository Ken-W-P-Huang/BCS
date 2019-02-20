/**
 * Created by kenhuang on 2019/1/26.
 */
import {BCSViewController}  from './BCSViewController'
export function BCSSplitViewController(element) {
    BCSViewController.call(this,element)
    this.viewControllers = []
}
BCSSplitViewController.extend(BCSViewController)