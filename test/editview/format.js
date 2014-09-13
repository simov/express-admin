
var should = require('should');
var format = require('../../lib/format');


describe('format (editview)', function () {
    
    // setActiveSingle
    it('set the active element for an oneToMany select control', function (done) {
        var column = {
            value: [
                { __pk: '4', __text: 'cherries' },
                { __pk: '5', __text: 'chocolate' },
                { __pk: '1', __text: 'coffee' },
                { __pk: '3', __text: 'energy' },
                { __pk: '2', __text: 'tea' }
            ]
        };
        format.form.setActiveSingle(column, 1);
        column.value[2].selected.should.equal(true);
        done();
    });

    // setActiveMultiple
    it('set the active element for a manyToMany select control', function (done) {
        var column = {
            value: [
                { __pk: '4', __text: 'cherries' },
                { __pk: '5', __text: 'chocolate' },
                { __pk: '1', __text: 'coffee' },
                { __pk: '3', __text: 'energy' },
                { __pk: '2', __text: 'tea' }
            ]
        };
        format.form.setActiveMultiple(column, [5,2]);
        column.value[1].selected.should.equal(true);
        column.value[4].selected.should.equal(true);
        done();
    });

    // value
    it('get column\'s default value', function (done) {
        var column = {control: {text: true}, defaultValue: 22.50};
        format.form.value(column, '').should.equal(22.50);
        done();
    });
    it('skip value formatting on empty string', function (done) {
        var column = {control: {text: true}};
        format.form.value(column, '').should.equal('');
        done();
    });
    it('return null on missing date value', function (done) {
        var column = {control: {date: true}};
        should.equal(format.form.value(column, null), null);
        done();
    });
    it('return the date values formatted as YYYY-MM-DD', function (done) {
        var column = {control: {date: true}};
        format.form.value(column, '2013-10-23 00:00:00').should.equal('2013-10-23');
        done();
    });
    it('set the active item for a oneToMany select control', function (done) {
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
        format.form.value(column, 1);
        column.value[2].selected.should.equal(true);
        done();
    });
    it('set the active items for a manyToMany select control', function (done) {
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
        format.form.value(column, [5,2]);
        column.value[1].selected.should.equal(true);
        column.value[4].selected.should.equal(true);
        done();
    });
});
