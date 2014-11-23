
var scrollpsy;

$(function () {
    $('#code').detach().prependTo('#navigation');
});

$(window).on('load', function (e) {
    if ($('#navigation ul a:eq(0)').attr('href').indexOf('.html') != -1) {
        var file = location.pathname.replace(/.*\/(.*\.html)$/, '$1');
        $('#navigation ul a[href="'+file+'"]').addClass('active');
    }
    else {
        scrollpsy = $('#navigation ul a').scrollpsy({
            target:'id',
            offset: 5
        });
        window.setTimeout(function () {
            scrollpsy.refresh();
        }, 1000);
    }
});
