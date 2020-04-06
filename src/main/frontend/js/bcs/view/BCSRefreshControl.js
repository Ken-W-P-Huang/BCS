import {BCSControl} from "./BCSControl";

export function BCSRefreshControl(style) {
    BCSControl.call(this,style)
}
BCSRefreshControl.extend(BCSControl)
var prototype = BCSRefreshControl.prototype
prototype.getIsRefreshing = function() {

}
// May be used to indicate to the refreshControl that an external event has initiated the refresh action
prototype.beginRefreshing = function () {

}
// Must be explicitly called when the refreshing has completed
prototype.endRefreshing = function () {

}