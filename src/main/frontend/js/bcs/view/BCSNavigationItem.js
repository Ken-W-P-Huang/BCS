/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import {BCSBarButtonItem} from './BCSBarButtonItem'
import {BCSSearchController} from '../controller/BCSSearchController'
import {BCSNavigationBar} from "./BCSNavigationBar";

export var LargeTitleDisplayModeEnum = {
    automatic:1,
    always:2,
    never:3

}

export function BCSNavigationItem(element) {
    BCSView.call(this,element)
    this.title = ''
    this.titleView = new BCSView()
    this.prompt = ''
    this.backBarButtonItem = new BCSBarButtonItem()
    this.hidesBackButton = false
    this.largeTitleDisplayMode = LargeTitleDisplayModeEnum.automatic
    this.hidesSearchBarWhenScrolling = false
    this.searchController = new BCSSearchController()
    var leftBarButtonItems = []
    var rightBarButtonItems = []
    this.getLeftBarButtonItems = function () {
        return leftBarButtonItems
    }
    this.getRightBarButtonItems = function () {
        return rightBarButtonItems
    }

}
BCSNavigationItem.extend(BCSView)
var prototype = BCSNavigationItem.prototype
prototype.setHidesBackButton = function (hidesBackButton,animated) {

}

prototype.setLeftBarButtonItems = function (hidesBackButton,animated) {

}
prototype.setRightBarButtonItems = function (hidesBackButton,animated) {

}