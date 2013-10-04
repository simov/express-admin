
var path = require('path');
	validate = require(path.resolve(__dirname, '../../lib/utils/validate'));


describe('validate', function () {
	it('should test admin password validation', function (done) {
		var test = {
			valid: [ 'aaAA11' ],
			invalid: [ 'aAA11', 'aaA11', 'aaAA1']
		};
		for (var i=0; i < test.valid.length; i++) {
			validate.adminPassword(test.valid[i]).should.equal(true);
		}
		for (var i=0; i < test.invalid.length; i++) {
			validate.adminPassword(test.invalid[i]).should.equal(false);
		}
		done();
	});
});
