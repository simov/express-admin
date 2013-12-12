
$(function () {

    (function fixControlsLength () {
        $('.form-group').each(function (index) {
            $('.control-label', this)
                .addClass('col-xs-4').css({'text-align':'right'})
                .next().addClass('col-xs-5')
                .next().addClass('col-xs-3');
        });

        $('.control-label:contains(upload)')
            .next().removeClass('col-xs-5').addClass('col-xs-3')
            .next().removeClass('col-xs-3').addClass('col-xs-5').css({'overflow':'hidden'});

        $('.control-label:contains(textarea)')
            .removeClass('col-xs-4')
            .next().removeClass('col-xs-5');
    }());

    (function disableLinks () {
        $('.navbar-brand, .breadcrumb a, #controls .btn, footer .text-muted').on('click', function (e) {
            return false;
        });
    }());

    (function fixButtons () {
        $('#controls button').each(function (index) {
            $(this).attr('style', 'width: auto !important');
        });
    }());
    
});
