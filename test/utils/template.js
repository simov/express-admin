
var should = require('should');
var template = require('../../lib/utils/template');


describe('template', function () {
    
    // setActiveSingle
    it('should set the active element for an oneToMany select control', function (done) {
        var column = {
            value: [
                { __pk: '4', __text: 'cherries' },
                { __pk: '5', __text: 'chocolate' },
                { __pk: '1', __text: 'coffee' },
                { __pk: '3', __text: 'energy' },
                { __pk: '2', __text: 'tea' }
            ]
        };
        template.test.setActiveSingle(column, 1);
        column.value[2].selected.should.equal(true);
        done();
    });

    // setActiveMultiple
    it('should set the active element for a manyToMany select control', function (done) {
        var column = {
            value: [
                { __pk: '4', __text: 'cherries' },
                { __pk: '5', __text: 'chocolate' },
                { __pk: '1', __text: 'coffee' },
                { __pk: '3', __text: 'energy' },
                { __pk: '2', __text: 'tea' }
            ]
        };
        template.test.setActiveMultiple(column, [5,2]);
        column.value[1].selected.should.equal(true);
        column.value[4].selected.should.equal(true);
        done();
    });

    // validate
    it('should return an error if a column isn\'t allowed to be null', function (done) {
        var column = {name: 'price', allowNull: false},
            message = 'Column '+column.name+' cannot be empty.';
        // text
        template.validate(column, '').message.should.equal(message);
        // select
        template.validate(column, 'NULL').message.should.equal(message);
        // select multiple
        template.validate(column, []).message.should.equal(message);
        // 
        template.validate(column, null).message.should.equal(message);
        done();
    });
    it('should return null (no error) if the column is allowed to be null', function (done) {
        var column = {name: 'price', allowNull: true};
        should.equal(template.validate(column, null), null);
        done();
    });

    // value
    it('should get column\'s default value', function (done) {
        var column = {control: {text: true}, defaultValue: 22.50};
        template.value(column, '').should.equal(22.50);
        done();
    });
    it('should skip value formatting on empty string', function (done) {
        var column = {control: {text: true}};
        template.value(column, '').should.equal('');
        done();
    });
    it('should return null on missing date value', function (done) {
        var column = {control: {date: true}};
        should.equal(template.value(column, null), null);
        done();
    });
    it('should return the date values formatted as YYYY-MM-DD', function (done) {
        var column = {control: {date: true}};
        template.value(column, '2013-10-23 00:00:00').should.equal('2013-10-23');
        done();
    });
    it('should set the active item for a oneToMany select control', function (done) {
        var column = {
            control: {select: true},
            value: [
                { __pk: '4', __text: 'cherries' },
                { __pk: '5', __text: 'chocolate' },
                { __pk: '1', __text: 'coffee' },
                { __pk: '3', __text: 'energy' },
                { __pk: '2', __text: 'tea' }
            ]
        };
        template.value(column, 1);
        column.value[2].selected.should.equal(true);
        done();
    });
    it('should set the active items for a manyToMany select control', function (done) {
        var column = {
            control: {select: true, multiple: true},
            value: [
                { __pk: '4', __text: 'cherries' },
                { __pk: '5', __text: 'chocolate' },
                { __pk: '1', __text: 'coffee' },
                { __pk: '3', __text: 'energy' },
                { __pk: '2', __text: 'tea' }
            ]
        };
        template.value(column, [5,2]);
        column.value[1].selected.should.equal(true);
        column.value[4].selected.should.equal(true);
        done();
    });
});
