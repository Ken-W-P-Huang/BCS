/**
 * Created by kenhuang on 2019/1/29.
 */
// https://github.com/shinnn/location-origin.js
(function (window,document) {
    function patchLocationOrigin(window) {
(function() {
  'use strict';
  var loc, value;

  loc = window.location;

  if (loc.origin) {
    return;
  }

  value = loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : '');

  try {
    Object.defineProperty(loc, 'origin', {
      value: value,
      enumerable: true
    });
  } catch (_error) {
    loc.origin = value;
  }

}).call(this);

    }
    if(window.browser){
        window.browser.addPatches({'patchLocationOrigin':patchLocationOrigin})
    }
    if(window.browser.isIE && window.browser.version  === 10){
        window.navigator.language = window.navigator.language ||(window.navigator.userLanguage && window.navigator
                .userLanguage.replace(/-[a-z]{2}$/, String.prototype.toUpperCase)) || 'en-US'
    }
})(this,this.document)