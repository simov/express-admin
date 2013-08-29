
$(function () {
    (function addExamples () {
        var files = [
            'one-to-many', 'many-to-many', 'many-to-one', 'one-to-one',
            'custom-views-apps', 'themes'
        ];
        for (var i=0; i < files.length; i++) {
            var src = 'examples/'+files[i]+'.html';
            var example = '<h3>Example</h3>'+
                    '<a href="#" class="btn-example">click to expand</a>'+
                    '<iframe class="example '+files[i]+'" data-src="'+src+'" src="about:blank"></iframe>';
            var file = $('[name='+files[i]+']').parents('.file');
            var line = $('hr', file);
            if (line.length) {
                $(example).insertBefore(line.prev());
            } else {
                file.append(example)
            }
        }
    }());

    $('.btn-example').on('click', function (e) {
        
        var iframe = $(this).next();
        if (iframe.attr('src') === 'about:blank') {
            iframe.attr('src', iframe.data('src'));
        }
        iframe.toggle();
        window.setTimeout(function () {
            refresh();
        }, 1000);
        
        $(this).text().indexOf('expand') != -1
            ? $(this).text('click to collapse')
            : $(this).text('click to expand');

        return false;
    });

    var refresh = (function scrollspy () {
        var links = $('#navigation a'), offset = [];
        
        function refresh () {
            offset = [];
            links.each(function (index) {
                var anchor = $(this).attr('href').replace('#','');
                if ($('a[name='+anchor+']').length) {
                    offset.push($('a[name='+anchor+']').offset().top);
                }
            });
        }
        
        var win = $(window);
        win.on('scroll', function (e) {
            links.removeClass('active');
            var top = win.scrollTop()+10;
            for (var i=0; i < offset.length; i++) {
                if (i < offset.length) {
                    if (top >= offset[i] && top <= offset[i+1]) {
                        links.eq(i).addClass('active');
                    }
                } else {
                    links.eq(offset.length-1).addClass('active');
                }		
            }
        });

        return refresh;
    }());
    refresh();
});
