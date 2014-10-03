/**
 * scrollpsy
 * version 1.0
 * copyright (c) 2013 http://simov.github.io
 * licensed under MIT
 */
;(function($) {
    'use strict';

    $.fn.scrollpsy = function (options) {
    
    // public
    var properties = $.extend({
        target: 'name',
        offset: 0
    }, options || {});

    // public
    var api = {
        // cache element offsets
        refresh: function () {
            self.offsets = [];
            self.each(function (index) {
                var anchor = $(this).attr('href').replace('#',''),
                    target = $('['+self.target+'='+anchor+']');
                if (target.length) {
                    self.offsets.push(target.offset().top);
                }
            });
            win.trigger('scroll');
        }
    };

    // this alias
    var self = $.extend(this, properties, api);
    // cache element offsets
    self.offsets = [];

    // private fields
    var win = $(window);

    // events
    win.on('scroll', function (e) {
        self.removeClass('active');
        var top = win.scrollTop()+self.offset;

        if (top <= self.offsets[0]) {
            self.eq(0).addClass('active');
        } else if (top >= self.offsets[self.offsets.length-1]) {
            self.eq(self.offsets.length-1).addClass('active');
        }
        else {
            for (var i=0; i < self.offsets.length; i++) {
                if (top >= self.offsets[i] && top <= self.offsets[i+1]) {
                    self.eq(i).addClass('active');
                    break;
                }
            }
        }
    });
    
    // init
    self.refresh();
    
    // extended this
    return self;
    };
})(jQuery);
