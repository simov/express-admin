
function addAnother () {
	$('.add-another').trigger('click');
}

function removeInline (index) {
	$('tr:not(.blank) .remove').eq(index).trigger('click');
}
