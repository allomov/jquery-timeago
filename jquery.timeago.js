/*
 * timeago: a jQuery plugin, version: 0.9.3 (2011-01-21)
 * @requires jQuery v1.2.3 or later
 *
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2008-2011, Ryan McGeary (ryanonjavascript -[at]- mcgeary [*dot*] org)
 */
(function($) {
  $.timeago = function(timestamp) {
    if (timestamp instanceof Date) {
      return inWords(timestamp);
    } else if (typeof timestamp === "string") {
      return inWords($.timeago.parse(timestamp));
    } else {
      return inWords($.timeago.datetime(timestamp));
    }
  };
  var $t = $.timeago;

  $.extend($.timeago, {
    settings: {
      showNormalDateAfter: '7 days',    // default Infinity
      refreshInterval: 'minute',
      direction: 'ltr',
      allowFuture: false,
      strings: {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",
        suffixFromNow: "from now",
        seconds: "less than a minute",
        minute: "a minute",
        minutes: "%d minutes",
        hour: "an hour",
        hours: "%d hours",
        day: "a day",
        days: "%d days",
        month: "a month",
        months: "%d months",
        year: "a year",
        years: "%d years",
        numbers: []
      }
    },
    inWords: function(distanceMillis) {
      var $l = this.settings.strings;

      var seconds = distanceMillis / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;

      function substitute(timeUnits , number) {
        var prefix = $.isFunction($l.prefixAgo) ? $l.prefixAgo(timeUnits) : $l.prefixAgo;
        var suffix = $.isFunction($l.suffixAgo) ? $l.suffixAgo(timeUnits) : $l.suffixAgo;

        if ($t.settings.allowFuture) {
          if (distanceMillis < 0) {
            prefix = $l.prefixFromNow;
            suffix = $l.suffixFromNow;
          }
          distanceMillis = Math.abs(distanceMillis);
        }
        var localeStringOrFunc = $l[timeUnits];
        var string = $.isFunction(localeStringOrFunc) ? localeStringOrFunc(number, distanceMillis) : localeStringOrFunc;
        var value = ($l.numbers && $l.numbers[number]) || number;
        var words = string.replace(/%d/i, value);
        return $.trim(($t.settings.direction == 'ltr' ? [prefix, words, suffix] : [suffix, words, prefix]).join(" "));
      }

      return seconds < 45 && substitute('seconds', Math.round(seconds)) ||
        seconds < 90 && substitute('minute', 1) ||
        minutes < 45 && substitute('minutes', Math.round(minutes)) ||
        minutes < 90 && substitute('hour', 1) ||
        hours < 24 && substitute('hours', Math.round(hours)) ||
        hours < 48 && substitute('day', 1) ||
        days < 30 && substitute('days', Math.floor(days)) ||
        days < 60 && substitute('month', 1) ||
        days < 365 && substitute('months', Math.floor(days / 30)) ||
        years < 2 && substitute('year', 1) ||
        substitute('years', Math.floor(years));
    },
      
    parse: function(iso8601) {
      var s = $.trim(iso8601);
      s = s.replace(/\.\d\d\d+/,""); // remove milliseconds
      s = s.replace(/-/,"/").replace(/-/,"/");
      s = s.replace(/T/," ").replace(/Z/," UTC");
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
      return new Date(s);
    },
    datetime: function(elem) {
      // jQuery's `is()` doesn't play well with HTML5 in IE
      var isTime = $(elem).get(0).tagName.toLowerCase() === "time"; // $(elem).is("time");
      var iso8601 = isTime ? $(elem).attr("datetime") : $(elem).attr("title");
      return $t.parse(iso8601);
    }
  });

  $.fn.timeago = function() {

    var self = this;
    var $s = $t.settings;

    $s.showNormalDateAfter = getMillis($s.showNormalDateAfter);
    $s.refreshInterval = getMillis($s.refreshInterval);

    self.each(refresh);



    if ($s.refreshInterval > 0) {
      setInterval(function() { self.each(refresh); }, $s.refreshInterval);
    }

    return self;
  };

  function refresh() {
    var data = prepareData(this);
    if (!isNaN(data.datetime)){
      var dist = distance(data.datetime);
      $(this).text(dist < $t.settings.showNormalDateAfter ? distanceInWords(dist) : $(this).attr('title'));
    }
    return this;
  }

  var secondsCount = {second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2592000, year: 31536000}; // month has 30 days here
  function getMillis(stringOrMillis){
    switch (typeof(stringOrMillis)) {
      case 'string' :
        var millis = 0;
        for (var timeUnit in secondsCount) {
          var re = stringOrMillis.match(new RegExp('(\\d+\\s+)?' + timeUnit + 's?'));
          if (re) {
              var timeUnitsCount = parseInt(re[1]);
              millis += (isNaN(timeUnitsCount) ? 1 : timeUnitsCount) * secondsCount[timeUnit];
          }
        }
        return millis * 1000;
      case 'number' : return stringOrMillis;
      default : return 0;
    }
  }

  function prepareData(element) {
    element = $(element);
    if (!element.data("timeago")) {
      element.data("timeago", { datetime: $t.datetime(element) });
      var text = $.trim(element.text());
      if (text.length > 0) {
        element.attr("title", text);
      }
    }
    return element.data("timeago");
  }

  function inWords(date) {
    return distanceInWords(distance(date));
  }
  
  function distanceInWords(distance) {
    return $t.inWords(distance);
  }

  function distance(date) {
    return (new Date().getTime() - date.getTime());
  }

  // fix for IE6 suckage
  document.createElement("abbr");
  document.createElement("time");
}(jQuery));
