
$(function () {
    $('.btn-info').on('click', function (e) {
        var info = $(this).parents('.box').find('.info');
        info.toggle();

        var iframe = info.find('iframe');
        if (iframe.attr('src') === 'about:blank') {
            iframe.attr('src', iframe.data('src'));
        }
        
        $(this).text() == 'expand' ? $(this).text('collapse') : $(this).text('expand');

        $('[data-spy="scroll"]').each(function () {
            var $spy = $(this).scrollspy('refresh');
        });

        return false;
    });
});
