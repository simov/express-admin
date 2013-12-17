
var dcopy = require('deep-copy');
var settings = require('../../lib/utils/settings');


describe('settings', function () {
    var info = {
        type: {
            id: {
                type: 'int(11)',
                allowNull: false,
                key: 'pri',
                defaultValue: null,
                extra: 'auto_increment'
            },
            item_id: {
                type: 'int(11)',
                allowNull: false,
                key: 'mul',
                defaultValue: null,
                extra: ''
            },
            name: {
                type: 'varchar(45)',
                allowNull: false,
                key: 'uni',
                defaultValue: null,
                extra: ''
            }
        },
        user: {
            id: {
                type: 'int(11)',
                allowNull: false,
                key: 'pri',
                defaultValue: null,
                extra: 'auto_increment'
            },
            firstname: {
                type: 'varchar(45)',
                allowNull: true,
                key: '',
                defaultValue: null,
                extra: ''
            },
            lastname: {
                type: 'varchar(45)',
                allowNull: true,
                key: '',
                defaultValue: null,
                extra: ''
            }
        }
    };

    it.skip('should not add table without primary key', function (done) {
        var info2 = dcopy(info);
        info2.nopk = {
            id: {
                type: 'int(11)',
                allowNull: false,
                key: '',
                defaultValue: null,
                extra: 'auto_increment'
            }
        }
        settings.refresh({}, info2, function (config) {
            Object.keys(config).join().should.equal('type,user');
            done();
        });
    });

    it('should update settings with new table', function (done) {
        var info2 = dcopy(info);
        info2.item = {
            id: {
                type: 'int(11)',
                allowNull: false,
                key: 'pri',
                defaultValue: null,
                extra: 'auto_increment'
            }
        };
        settings.refresh({}, info, function (config) {
            settings.refresh(config, info2, function (config) {
                Object.keys(config).join().should.equal('type,user,item');
                done();
            });
        });
    });

    it('should update settings with new column', function (done) {
        var info2 = dcopy(info);
        info2.user.address = {
            type: 'varchar(45)',
            allowNull: true,
            key: '',
            defaultValue: null,
            extra: ''
        };
        settings.refresh({}, info, function (config) {
            settings.refresh(config, info2, function (config) {
                var names = [];
                for (var i=0; i < config.user.columns.length; i++) {
                    names.push(config.user.columns[i].name);
                }
                names.join().should.equal('id,firstname,lastname,address');
                done();
            });
        });
    });
});
