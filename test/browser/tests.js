
var should = chai.should();
mocha.setup({
	ui: 'bdd',
	globals: ['']
});

var iframe = null, admin = null, fixtures = null;

$(function () {
	$('#admin').on('load', function (e) {
		var script = this.contentWindow.document.createElement('script');
		script.type = 'text/javascript';
		script.src = '/tests/iframe.js';
		this.contentWindow.document.body.appendChild(script);

		iframe = this;
		admin = $(this).contents();
		window.setTimeout(function () {
			mocha.run();
		},1);
	});
});


describe('admin', function () {
	before(function (done) {
		file.load('fixtures.json', function (err, data) {
			fixtures = JSON.parse(data);
			done();
		});
	});

	it('initial keys', function (done) {
		var keys = [];
		$('#many tbody tr', admin).each(function (index) {
			keys.push(getControl(this).attr('name'));
		});
		keys.should.deep.equal(fixtures.initial);
		done();
	});

	it('add one', function (done) {
		iframe.contentWindow.addAnother();
		var keys = [];
		$('#many tbody tr', admin).each(function (index) {
			keys.push(getControl(this).attr('name'));
		});
		keys.should.deep.equal(fixtures.initial.concat(fixtures.one));
		done();
	});

	it('add two', function (done) {
		iframe.contentWindow.addAnother();
		var keys = [];
		$('#many tbody tr', admin).each(function (index) {
			keys.push(getControl(this).attr('name'));
		});
		keys.should.deep.equal(fixtures.initial.concat(fixtures.one.concat(fixtures.two)));
		done();
	});

	it('remove first', function (done) {
		iframe.contentWindow.removeInline(0);
		var keys = [];
		$('#many tbody tr', admin).each(function (index) {
			keys.push(getControl(this).attr('name'));
		});
		keys.should.deep.equal(fixtures.initial.concat(fixtures.one));
		done();
	});
});

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
