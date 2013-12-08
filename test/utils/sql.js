
var sql = require('../../lib/utils/sql');


describe('sql', function () {
    before(function () {
        sql.client.mysql = true;
    });
    
    it('fullName', function (done) {
        sql.fullName('table', 'id')
            .should.equal('`table`.`id`');
        done();
    });

    it('fullNames', function (done) {
        var columns = ['id', 'name', 'notes'];
        sql.fullNames('table', columns).join()
            .should.equal('`table`.`id`,`table`.`name`,`table`.`notes`');
        done();
    });

    it('cast', function (done) {
        var columns = ['firstname', 'lastname'];
        columns = sql.fullNames('table', columns);

        sql.cast(columns).join()
            .should.equal('CAST(`table`.`firstname` AS CHAR),'+
                            'CAST(`table`.`lastname` AS CHAR)');
        done();
    });

    it('concat', function (done) {
        var columns = ['firstname', 'lastname'];
        columns = sql.fullNames('table', columns);
        columns = sql.cast(columns);

        sql.concat(columns, 'name')
            .should.equal("CONCAT_WS(' ',CAST(`table`.`firstname` AS CHAR),"+
                            "CAST(`table`.`lastname` AS CHAR)) AS `name`");
        done();
    });
    
    it('group', function (done) {
        var columns = ['firstname', 'lastname'];
        columns = sql.fullNames('table', columns);
        columns = sql.cast(columns);

        sql.group(columns, 'name')
            .should.equal("GROUP_CONCAT(DISTINCT CONCAT_WS(' ',CAST(`table`.`firstname` AS CHAR),"+
                            "CAST(`table`.`lastname` AS CHAR))) AS `name`");
        done();
    });

    it('groupby', function (done) {
        sql.groupby(sql.fullName('table', 'column'))
            .should.equal(' GROUP BY `table`.`column` ');
        done();
    });

    it('order', function (done) {
        sql.order('table', {column1: 'asc', column2: 'desc'}).join()
            .should.equal('`table`.`column1` asc,`table`.`column2` desc');
        done();
    });

    it('joins', function (done) {
        sql.joins('table', 'fk', 'refTable', 'pk')
            .should.equal(' LEFT JOIN `refTable` ON `table`.`fk` = `refTable`.`pk`');
        done();
    });

    it('pk', function (done) {
        sql.pk('table', 'pk')
            .should.equal('`table`.`pk` AS __pk');
        done();
    });
});
