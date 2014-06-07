
var should = require('should');
var validate = require('../../lib/editview/validate');


describe('validate (editview)', function () {
    
    // validate
    it('return an error if a column isn\'t allowed to be null', function (done) {
        var column = {name: 'price', allowNull: false, control: {}},
            message = 'Column '+column.name+' cannot be empty.';
        // text
        validate.value(column, '').message.should.equal(message);
        // select multiple
        validate.value(column, []).message.should.equal(message);
        // 
        validate.value(column, null).message.should.equal(message);
        done();
    });
    it('return null (no error) if the column is allowed to be null', function (done) {
        var column = {name: 'price', allowNull: true};
        should.equal(validate.value(column, null), null);
        done();
    });
});
