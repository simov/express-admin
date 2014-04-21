
var should = require('should');
var settings = require('../../lib/app/settings');


describe('settings', function () {
    
    it.skip('should not add table without primary key', function (done) {
        done();
    });

    it('set table primary key', function (done) {
        var data = {
            table1: {
                id: {
                    type: 'int(11)',
                    allowNull: false,
                    key: 'pri',
                    defaultValue: null,
                    extra: 'auto_increment'
                },
                name: {
                    type: 'varchar(45)',
                    allowNull: false,
                    key: '',
                    defaultValue: null,
                    extra: ''
                }
            }
        }
        var result = settings.refresh({}, data);
        result.table1.table.pk.should.equal('id');
        done();
    });

    it('add new column', function (done) {
        var config = {
            table1: {
                columns:[{name:'id'}]
            }
        };
        var data = {
            table1: {
                id: {
                    type: 'int(11)',
                    allowNull: false,
                    key: 'pri',
                    defaultValue: null,
                    extra: 'auto_increment'
                },
                name: {
                    type: 'varchar(45)',
                    allowNull: false,
                    key: '',
                    defaultValue: null,
                    extra: ''
                }
            }
        }
        var result = settings.refresh(config, data);
        should.deepEqual(result.table1.columns[0], config.table1.columns[0]);
        result.table1.columns[1].name.should.equal('name');
        done();
    });

    it('add new table', function (done) {
        var config = {
            table1: {
                columns:[{name:'id'}]
            }
        };
        var data = {
            table2: {
                id: {
                    type: 'int(11)',
                    allowNull: false,
                    key: 'pri',
                    defaultValue: null,
                    extra: 'auto_increment'
                }
            }
        }
        var result = settings.refresh(config, data);
        should.deepEqual(result.table1, config.table1);
        should.exist(result.table2);
        done();
    });
});
