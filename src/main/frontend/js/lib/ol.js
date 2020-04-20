//a polyfill for the ordered-list reversed attribute
// http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#the-ol-element
// http://www.whatwg.org/specs/web-apps/current-work/multipage/grouping-content.html#dom-li-value

//uses these awesomeness:
// Array.prototype.forEach
// Element.prototype.children
//if you want support for older browsers *cough*IE8-*cough*, then use the other
// file provided
(function () {
"use strict";

	if ( 'reversed' in document.createElement('ol') ) {
		return;
	}

	[].forEach.call( document.getElementsByTagName('ol'), function ( list ) {
		if ( list.getAttribute( 'reversed' ) !== null ) {
			reverseList( list );
		}
	});

	function reverseList ( list ) {
		var children = list.children, count = list.getAttribute('start');

		//check to see if a start attribute is provided
		if ( count !== null ) {
			count = Number( count );

			if ( isNaN(count) ) {
				count = null;
			}
		}

		//no, this isn't duplication - start will be set to null
		// in the previous if statement if an invalid start attribute
		// is provided
		if ( count === null ) {
			count = children.length;
		}

		[].forEach.call( children, function ( child ) {
			child.value = count--;
		});
	}
}());