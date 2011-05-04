/**
 * config of timeago plugin for arabic
 */

(function() {

    function numpf(hash) {
        var infinity = hash['infinity'];
        return function(value){
            for (var boundaryСonditions in hash) {
                var borders = boundaryСonditions.match(/(\d+)/g);
                if (borders && borders.length > 0) {
                    var lborder = parseInt(borders[0]);
                    var rborder = (borders.length > 1) ? parseInt(borders[1]) : lborder;
                    if (lborder <= value && value <= rborder){ return hash[boundaryСonditions]; }
                } 
            }
            return infinity;
        }
    }

    //  there are reversed templates because javascript changes string direction when you replace characters with numbers  
    //  go to http://www.w3.org/International/tutorials/bidi-xhtml/#Slide0270

    jQuery.timeago.settings.strings = {
        direction: 'rtl',
        showNormalDateAfter: '7 days',
        prefixAgo: null, 
        suffixAgo: null,
        seconds: 'منذ أقل من دقيقة',
        minute: 'منذ دقيقة ',
        minutes: numpf({
            '2'             : 'منذ دقيقتين',
            'from 3 to 10'  : 'منذ %d دقائق',
            'infinity'      : 'منذ %d دقيقة'
        }),
        hour: 'منذ ساعة',
        hours: numpf({
            '2'             : 'منذ ساعتين',
            'from 3 to 10'  : 'منذ %d ساعات',
            'infinity'      : 'منذ %d ساعة'
        }),
        day: 'امس',
        days: numpf({
            '2'             : 'منذ يومين',
            'from 3 to 7'   : 'منذ %d أيام',
            'infinity'      : 'more then a week'
        })
    };

})();
