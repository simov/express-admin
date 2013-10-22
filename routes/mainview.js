
exports.get = function (req, res, next) {
	var settings = res.locals._admin.settings,
		custom = res.locals._admin.custom;

	var tables = [];
	for (var key in settings) {
		if (!settings[key].mainview.show || !settings[key].table.pk) continue;
		tables.push({slug: settings[key].slug, name: settings[key].table.verbose});
	}
	var views = [], have = false;
	for (var key in custom) {
		if (!custom[key].mainview || !custom[key].mainview.show) continue;
		views.push({slug: custom[key].slug, name: custom[key].verbose});
		have = true;
	}

	res.locals.tables = tables;
	res.locals.views = views;
	res.locals.have = have;
	
	res.locals.partials = {
		content:  'mainview'
	};
	
	next();
}
