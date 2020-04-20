/**
 * Created by kenhuang on 2019/1/26.
 */
import {BCSScrollView} from './BCSScrollView'
import {BCSTabBarItem} from "./BCSTabBarItem"
var BCSTableViewStyleEnum = {
    plain:1,
    grouped:2
}

var BCSTableViewScrollPositionEnum = {
    none:1,
    top:2,
    middle:3,
    bottom:4
}

var BCSTableViewRowAnimationEnum = {
    fade:1,
// slide in from right (or out to right)
    right:2,
    left:3,
    top:4,
    bottom:5,
    none:6,
    // attempts to keep cell centered in the space it will/did occupy
    middle:7,
    // chooses an appropriate animation style for you
    automatic:8
}
var BCSTableViewSeparatorInsetReferenceEnum = {
    fromCellEdges:1,
    fromAutomaticInsets:2
}
var BCSTableViewRowActionStyle = {
    Default:1,
    normal:2
}

export function BCSTableViewRowAction() {
    
}

var indexSearch = ''
var automaticDimension = 10.0
var selectionDidChangeNotification = ''
export function BCSTableView() {
    
}
BCSTableView.extend(BCSScrollView)
var prototype = BCSTableView.prototype
