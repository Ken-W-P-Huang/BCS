/**
 * Created by kenhuang on 2019/2/22.
 */
(function (window) {


    function parseSearch(s) {
        var result = []
        var k = 0
        var parts = s.slice(1).split('&');
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i]
            var key = part.split('=', 1)[0]
            if (key) {
                var value = part.slice(key.length + 1)
                result[k++] = [key, value]
            }
        }
        return result
    }

    function serializeParsed(array) {
        return array.map(function(pair) {
            return pair[1] !== '' ? pair.join('=') : pair[0]
        }).join('&')
    }

    function URL(url,base) {
        Function.ensureArgs(arguments,1)
        var anchorElement
        var doc = document.implementation.createHTMLDocument('')
        if (base) {
            var baseElement = doc.createElement('base')
            baseElement.href = base || window.lo
            doc.head.appendChild(baseElement)
        }
        var anchorElement = doc.createElement('a')
        anchorElement.href = url
        doc.body.appendChild(anchorElement)

        if (anchorElement.href === '')
            throw new TypeError('Invalid URL')
        Object.defineProperty(this, '_anchorElement', {value: anchorElement})

    }
    window.URL = URL
    window.URLSearchParams = URLSearchParams
})(window)