
Date.prototype.toJSONLocal = function() {
	var local = new Date(this);
	local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
	return local.toJSON().slice(0, 10); // toJSON is not supported in <IE8
};


(function(init, $) {
	$(function () {
		$(window).on('load', function (e) {
			init.inlines();

			init.read();
			init.layout();
			init.theme();
			init.lang();
			
			init.chosen();
			init.datepicker();
		});
	});
}(
(function init ($) {
	var chzn = {
		allow_single_deselect: true,
		no_results_text: 'No results matched!<br /> <a href="#">Click to add</a> '
	};
	function getControl (self) {
		if ($('.hero-unit > input', self).length)
			return $('.hero-unit > input', self);
		if ($('.controls > input', self).length)
			return $('.controls > input', self);
		if ($('.controls > select', self).length)
			return $('.controls > select', self);
		if ($('.controls > textarea', self).length)
			return $('.controls > textarea', self);
	}
	return {
		inlines: function () {
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
					var control = getControl(this),
						name = control.attr('name') || '';
					control.attr('name', 
						name.replace('blank', 'records').replace('index', index));
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
				if ($('.chzn-select').length)
					$('.chzn-select', $rows).chosen(chzn);
				if ($('.datepicker').length)
					$('.datepicker', $rows).datepicker({
						dateFormat: 'yy-mm-dd'
					});
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
					var control = $('.hero-unit input', this),
						name = control.attr('name'),
						idx = name.match(/.*(\[\d+\]).*/)[1];
					control.attr('name', name.replace(idx, '['+index+']'));

					$(this).nextUntil('tr.head').each(function () {

						var control = getControl(this),
							name = control.attr('name');
						control.attr('name', name.replace(idx, '['+index+']'));
					});
				});
				
				// one
				if ($table.parents('#one').length) {
					$('tfoot', $table).removeClass('hidden');
				}
				return false;
			});
		},
		layout: function () {
			$('#layout a').on('click', function (e) {
				$('body').removeClass();
				var layout = this.hash.slice(1);
				layout == 'fixed'
					? $('body').addClass('container')
					: $('body').addClass('container-fluid');
				$('#layout li').removeClass('active');
				$(this).parent().addClass('active');
				localStorage.setItem('layout', layout);
				return false;
			});
		},
		theme: function () {
			var bootstrap = $('#bootstrap');
			$('#theme a').on('click', function (e) {
				var theme = this.hash.slice(1),
					url = '/bootswatch/'+theme+'/bootstrap.min.css';
				bootstrap.attr('href', url);
				$('#theme li').removeClass('active');
				$(this).parent().addClass('active');
				localStorage.setItem('theme', theme);
				return false;
			});
		},
		lang: function () {
			$('#language a').on('click', function (e) {
				var lang = this.hash.slice(1);
				document.cookie = 'lang='+lang;
				window.location.reload(true);
				return false;
			});
		},
		read: function () {
			var layout   = localStorage.getItem('layout')   || 'fluid',
				theme    = localStorage.getItem('theme')    || 'default',
				language = document.cookie.replace('lang=', '');

			$('#layout li').removeClass('active');
			$('#layout [href$="'+layout+'"]').parent().addClass('active');

			$('#theme li').removeClass('active');
			$('#theme [href$="'+theme+'"]').parent().addClass('active');

			$('#language li').removeClass('active');
			$('#language [href$="'+language+'"]').parent().addClass('active');
		},
		chosen: function () {
			if ($('.chzn-select').length)
				$('tr:not(.blank) .chzn-select').chosen(chzn);
		},
		datepicker: function () {
			if ($('.datepicker').length)
				$('tr:not(.blank) .datepicker').datepicker({
					dateFormat: 'yy-mm-dd'
				});
			$('body').on('click', 'tr .controls .btn-today', function (e) {
				$(this).prev().val(new Date().toJSONLocal());
				return false;
			});
		}
	};
}(jQuery)), jQuery));
