
exports.init = function (tables, custom) {
	regex.tables = getTableSlugs(tables);
	regex.custom = getTableSlugs(custom);
	return {
		editview: joinRegex('tables', 'edit', '$'),
		//listview: joinRegex('tables', 'list', '$'),
		filterview: joinRegex('tables', 'filter', '$'),
		custom:   joinRegex('custom', 'anything', '$'),
		mainview: regex.home,
	};
}

var regex = {
	login:  /^\/login/i,
	logout: /^\/logout/i,
	tables: null,
	custom: null,
	anything: /(?:\/.*)?/,
	//list:   /(?:\/\?p=\d+)?/i,
	//filter: /\/filter/i,
	filter: /(?:\/\?p=\d+)?/i,
	edit:   /\/(\d+|add)/i,
	home:   /^\/$/,
	$:      /\/?$/i
};

// regex helpers

function joinRegex () {
	var str = '';
	for (var i=0; i < arguments.length; i++) {
		str += regex[arguments[i]].source;
	}
	return new RegExp(str);
}

function getTableSlugs (config) {
	var slugs = [];
	for (var key in config) {
		if (!config[key].mainview || !config[key].mainview.show) continue;
		if (config[key].table && !config[key].table.pk) continue;
		slugs.push(config[key].slug);
	}
	return new RegExp(['^\\/(',slugs.join('|'),')'].join(''), 'i');
}
