
var scrollpsy;

$(function () {
    $('#code').detach().prependTo('#gw-nav');
});

$(window).on('load', function (e) {
    if ($('#gw-nav ul a:eq(0)').attr('href').indexOf('.html') != -1) {
        var file = location.pathname.replace(/.*\/(.*\.html)$/, '$1');
        $('#gw-nav ul a[href="'+file+'"]').addClass('active');
    }
    else {
        scrollpsy = $('#gw-nav ul a').scrollpsy({
            target:'id',
            offset: 5
        });
        window.setTimeout(function () {
            scrollpsy.refresh();
        }, 1000);
    }
});
