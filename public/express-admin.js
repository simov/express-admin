
;(function($) {
'use strict';

var chosen = {
    allow_single_deselect: true,
    no_results_text: 'No results matched!<br /> <a href="#">Click to add</a> ',
    width: '100%'
};
function toJSONLocal (date) {
    var local = new Date(date);
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return local.toJSON().slice(0, 10); // toJSON is not supported in <IE8
}
function isMobile () {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/gi
        .test(navigator.userAgent);
}
function getControls (self) {
    return $([
        '.jumbotron > input',
        '.form-group .form-control',
        '.form-group .radio-inline input',
        '.form-group [type=file]'
        ].join(), self);
}
function initDatetimePickers (type, ctx) {
    var lang = cookie.getItem('lang');
    var options = {
        weekStart: 1, autoclose: 1, todayHighlight: 1,
        keyboardNavigation: 0, forceParse: 0, viewSelect: 'decade',
        language: lang == 'cn' ? 'zh-CN' : lang
    };
    var controls = [
        {format: 'yyyy-mm-dd',         formatViewType: 'date', startView: 2, minView: 2, maxView: 4},
        {format: 'hh:ii:ss',           formatViewType: 'time', startView: 1, minView: 0, maxView: 1},
        {format: 'yyyy-mm-dd hh:ii:ss',formatViewType: 'date', startView: 2, minView: 0, maxView: 4},
        {format: 'yyyy',               formatViewType: 'date', startView: 4, minView: 4, maxView: 4}
    ];
    var mobile = ['date', 'time', 'datetime', 'date'];

    var selectors = ['.date', '.time', '.datetime-', '.year'];
    for (var i=0; i < selectors.length; i++) {
        selectors[i] = (type == 'static')
            ? 'tr:not(.blank) ' + selectors[i] + 'picker,'
            + '.x-filter ' + selectors[i] + 'picker'
            : selectors[i] + 'picker';
    }

    var have = false;
    for (var i=0; i < selectors.length; i++) {
        if ($(selectors[i], ctx).length) {have = true; break;}
    }
    if (!have) return;

    if (isMobile()) {
        for (var i=0; i < selectors.length; i++) {
            $(selectors[i], ctx).each(function (index) {
                $(this).attr('type', mobile[i]);
            });
        }
    } else {
        for (var i=0; i < selectors.length; i++) {
            $(selectors[i], ctx).datetimepicker($.extend(options, controls[i]));
        }
    }
}

$(function () {
    // mainview table filter
    (function () {
        var $input = $('.x-mv.x-filter [name=table]');
        $input.on('change input', function (e) {
            var value = $(this).val();
            $('.x-table:eq(0) tbody tr').each(function (index) {
                var name = $('a:eq(0)', this).text();
                (name.indexOf(value) == -1) ? $(this).hide() : $(this).show();
                localStorage.setItem('mv-filter', value);
            });
        });
        $('.x-mv.x-filter [name=clear]').on('click', function (e) {
            localStorage.setItem('mv-filter', '');
            $input.val('');
            $input.trigger('change');
            $('.x-filter').hide();
        });
        var mvfilter = localStorage.getItem('mv-filter');
        if (mvfilter) {
            $input.val(mvfilter);
            $input.trigger('change');
            $('.x-mv.x-filter').show();
        }
    }());

    // inlines
    $('.add-another').on('click', function (e) {
        // table and current index
        var name = $(this).data('table'),
            $table = $('table[data-table="'+name+'"]');
        // get the last index
        var index = $('.head', $table).length-1;
        // clone and set classes
        var $rows = $('.blank', $table).clone();
        $rows.removeClass('blank hidden');

        // set the column keys
        $rows.each(function (idx) {
            var $controls = getControls(this);
            $controls.each(function (i) {
                var name = $(this).attr('name');
                $(this).attr('name', 
                    name.replace('blank', 'records').replace('index', index));
            });
        });
        // set keys for insert
        (function () {
            var name = $rows.eq(0).find('input').attr('name');
            $rows.eq(0).find('input').attr('name',
                name.replace('blank', 'records').replace('index', index));
        }());
        
        // append
        var tbody = $('tbody', $table);
        $rows.appendTo(tbody);

        // init controls
        if ($('.chosen-select').length) {
            if (isMobile()) $('.chosen-select').show();
            $('.chosen-select', $rows).chosen(chosen);
        }
        initDatetimePickers('dynamic', $rows);
        if (typeof onAddInline === 'function')
            onAddInline($rows);

        // one
        if ($table.parents('#one').length) {
            $('tfoot', $table).addClass('hidden');
        }
        return false;
    });
    $('table').on('click', '.remove', function (e) {
        var name = $(this).data('table'),
            $table = $('table[data-table="'+name+'"]');

        // remove
        var head = $(this).parents('.head'),
            rows = head.nextUntil('tr.head');
        head.remove();
        rows.remove();

        // re-set the indexes
        $('.head:not(.blank)', $table).each(function (index) {
            var idx = -1;
            
            $('.jumbotron input', this).each(function () {
                var name = $(this).attr('name');
                idx = name.match(/.*(\[\d+\]).*/)[1];
                $(this).attr('name', name.replace(idx, '['+index+']'));
            });

            $(this).nextUntil('tr.head').each(function () {

                var $controls = getControls(this);
                $controls.each(function (i) {
                    var name = $(this).attr('name');
                    $(this).attr('name', name.replace(idx, '['+index+']'));
                });
            });
        });
        
        // one
        if ($table.parents('#one').length) {
            $('tfoot', $table).removeClass('hidden');
        }
        return false;
    });

    // layout
    $('#x-layout a').on('click', function (e) {
        $('body, #navbar').removeClass();
        var layout = this.hash.slice(1);
        layout == 'fixed'
            ? $('body, #navbar').addClass('container')
            : $('body, #navbar').addClass('container container-fluid');
        $('#x-layout li').removeClass('active');
        $(this).parent().addClass('active');
        localStorage.setItem('layout', layout);
        return false;
    });

    // theme
    var bootstrap = $('#bootstrap');
    $('#x-theme a').on('click', function (e) {
        var theme = this.hash.slice(1),
            url = xAdmin.root+'/bootswatch/'+theme+'/bootstrap.min.css';
        bootstrap.attr('href', url);
        $('#x-theme li').removeClass('active');
        $(this).parent().addClass('active');
        localStorage.setItem('theme', theme);
        return false;
    });

    // lang
    $('#x-lang a').on('click', function (e) {
        cookie.setItem('lang', this.hash.slice(1));
        window.location.reload(true);
        return false;
    });

    $('body').on('click', 'td .form-group .btn-today', function (e) {
        $(this).parents('td').find('input').val(toJSONLocal(new Date()));
        return false;
    });

    // filter
    $('.glyphicon-filter').on('click', function (e) {
        $('.x-filter').toggle();
        return false;
    });

    // init
    var layout   = localStorage.getItem('layout') || 'fixed';
    $('#x-layout li').removeClass('active');
    $('#x-layout [href$="'+layout+'"]').parent().addClass('active');

    var theme = localStorage.getItem('theme') || 'default';
    $('#x-theme li').removeClass('active');
    $('#x-theme [href$="'+theme+'"]').parent().addClass('active');

    var lang = cookie.getItem('lang');
    $('#x-lang li').removeClass('active');
    $('#x-lang [href$="'+lang+'"]').parent().addClass('active');
    if (lang != 'en')
        $('head').append(
            '<script src="'+xAdmin.root+'/jslib/locales/bootstrap-datetimepicker.'+lang+'.js"'+
            ' type="text/javascript" charset="utf-8"></script>'
        );

    // chosen
    if ($('.chosen-select').length) {
        if (isMobile()) $('.chosen-select').show();
        $('tr:not(.blank) .chosen-select, .x-filter .chosen-select').chosen(chosen);
    }

    // datepicker
    initDatetimePickers('static', document);
});
})(jQuery);
