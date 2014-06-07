
var should = require('should');
var data = require('../../lib/editview/data'),
    editview = require('../../lib/editview/index'),
    db = require('../../lib/db/database');


describe('data (editview)', function () {
    before(function (done) {
        var options = {
            mysql: {
                database: 'express-admin-simple',
                user: 'liolio',
                password: 'karamba'
            }
        };
        db.connect(options, function (err) {
            if (err) return done(err);
            done();
        });
    });

    // _removeHidden
    it('remove all columns configured to be excluded from the editview', function (done) {
        var columns = [
            {name: 'pk', editview: {show: false}},
            {name: 'fk', editview: {show: false}},
            {name: 'name', editview: {show: true}}
        ];
        var result = editview._removeHidden(columns);
        columns.length.should.equal(3);
        result.length.should.equal(1);
        result[0].name.should.equal('name');
        done();
    });

    // _getRef - get the referenced table data (oneToMany || manyToMany)
    it('return the referenced table\'s data', function (done) {
        var ref = {table: 'item', pk: 'id', columns: ['name']};
        data.otm._getRef({db: db}, ref, function (err, rows) {
            if (err) return done(err);
            should.deepEqual(rows, [
                { __pk: '4', __text: 'cherries' },
                { __pk: '5', __text: 'chocolate' },
                { __pk: '1', __text: 'coffee' },
                { __pk: '3', __text: 'energy' },
                { __pk: '2', __text: 'tea' }
            ]);
            done();
        });
    });

    // getOneToMany - populates each column's value with its referenced table data
    it('populate column\'s value configured through oneToMany key', function (done) {
        var args = {
            db: db,
            config: {
                columns: [
                    {
                        control: {select: true},
                        oneToMany: {table: 'item', pk: 'id', columns: ['name']}
                    }
                ]
            }
        };
        data.otm.get(args, function (err) {
            if (err) return done(err);
            should.deepEqual(args.config.columns[0].value, [
                { __pk: '4', __text: 'cherries' },
                { __pk: '5', __text: 'chocolate' },
                { __pk: '1', __text: 'coffee' },
                { __pk: '3', __text: 'energy' },
                { __pk: '2', __text: 'tea' }
            ]);
            done();
        });
    });

    it('populate column\'s value configured through manyToMany\'s ref key', function (done) {
        var args = {
            db: db,
            config: {
                columns: [
                    {
                        control: {select: true, multiple: true},
                        manyToMany: {
                            ref: {
                                table: 'recipe_type', pk: 'id', columns: ['name']
                            }
                        }
                    }
                ]
            }
        };
        data.otm.get(args, function (err) {
            if (err) return done(err);
            should.deepEqual(args.config.columns[0].value, [
                { __pk: '1', __text: 'type1' },
                { __pk: '2', __text: 'type2' },
                { __pk: '3', __text: 'type3' },
                { __pk: '4', __text: 'type4' },
                { __pk: '5', __text: 'type5' }
            ]);
            done();
        });
    });

    it('skip columns without control type set to select', function (done) {
        var args = {
            db: db,
            config: {
                columns: [
                    {
                        control: {text: true},
                        oneToMany: {table: 'item', pk: 'id', columns: ['name']}
                    }
                ]
            }
        };
        data.otm.get(args, function (err) {
            if (err) return done(err);
            should.strictEqual(args.config.columns[0].value, undefined);
            done();
        });
    });

    // _getSql - creates a sql select query for getting a record from table
    it('prepend table\'s __pk to the list of columns to be selected', function (done) {
        var args = {
            id: 5,
            fk: null,
            config: {
                table: {name: 'recipe', pk: 'id'},
                columns: [
                    {name: 'column1'}
                ]
            }
        };
        data.tbl._getSql(args).should.match(/.*`recipe`.`id` AS __pk.*/);
        done();
    });

    it('exclude manyToMany columns from the list of columns to select', function (done) {
        var args = {
            id: 5,
            fk: null,
            config: {
                table: {name: 'recipe', pk: 'id'},
                columns: [
                    {name: 'column1'},
                    {name: 'column2', manyToMany: {}}
                ]
            }
        };
        data.tbl._getSql(args)
            .should.match(/^SELECT `recipe`.`id` AS __pk,`recipe`.`column1` FROM.*/);
        done();
    });

    it('create a query for a regular table using its pk', function (done) {
        var args = {
            id: 5,
            fk: null,
            config: {
                table: {name: 'recipe', pk: 'id'},
                columns: [
                    {name: 'column1'}
                ]
            }
        };
        data.tbl._getSql(args).should.match(/.*WHERE `recipe`.`id` = 5 ;$/);
        done();
    });

    it('create a query for a referenced table using its fk', function (done) {
        var args = {
            id: 5,
            fk: 'recipe_id',
            config: {
                table: {name: 'recipe', pk: 'id'},
                columns: [
                    {name: 'column1'}
                ]
            }
        };
        data.tbl._getSql(args).should.match(/.*WHERE `recipe`.`recipe_id` = 5 ;$/);
        done();
    });

    // getRecords - get record/s for a table
    it('return table\'s record/s from a database', function (done) {
        var args = {
            db: db,
            post: null,
            id: 5,
            fk: null,
            config: {
                table: {name: 'item', pk: 'id'},
                columns: [{name: 'name'}, {name: 'notes'}]
            }
        };
        data.tbl.get(args, function (err, rows) {
            if (err) return done(err);
            should.deepEqual(rows, [{columns: {__pk: '5', name: 'chocolate', notes: ''}}]);
            done();
        });
    });

    it('return table\'s record/s from a post request', function (done) {
        var args = {
            db: db,
            post: {
                item: {
                    records: [{pk: 5, columns: {name: 'chocolate', notes: 'milka'}}]
                }
            },
            id: 5,
            fk: null,
            config: {
                table: {name: 'item', pk: 'id'}
            }
        };
        data.tbl.get(args, function (err, rows) {
            if (err) return done(err);
            should.deepEqual(rows, [{pk: 5, columns:{name: 'chocolate', notes: 'milka'}}]);
            done();
        });
    });

    // getIds - get manyToMany's link table child primary keys
    it('store manyToMany\'s link table child primary keys in column itself after database select', function (done) {
        var args = {
            db: db,
            config: {
                columns: [
                    {
                        name: 'recipeTypes',
                        manyToMany: {
                            link: {
                                table: 'recipe_ref',
                                parentPk: 'recipe_id',
                                childPk: 'recipe_type_id'
                            }
                        }
                    }
                ]
            }
        };
        var rows = [{columns: {__pk: 1}}];
        data.mtm.get(args, rows, function (err) {
            if (err) return done(err);
            should.deepEqual(rows[0].columns.recipeTypes, ['2', '4', '5']);
            done();
        });
    });

    it('store manyToMany\'s link table child primary keys in the record\'s ids key after post request', function (done) {
        var args = {
            db: db,
            post: true,
            config: {
                columns: [
                    {
                        name: 'recipeTypes',
                        manyToMany: {
                            link: {
                                table: 'recipe_ref',
                                parentPk: 'recipe_id',
                                childPk: 'recipe_type_id'
                            }
                        }
                    }
                ]
            }
        };
        var rows = [{columns: {__pk: 1}}];
        data.mtm.get(args, rows, function (err) {
            if (err) return done(err);
            should.deepEqual(rows[0].ids.recipeTypes, ['2', '4', '5']);
            done();
        });
    });
});
