
var sql = require('../../lib/sql/sql');


describe('sql (sql)', function () {
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
        sql.cast('table', ['firstname', 'lastname'])
            .should.equal('CAST(`table`.`firstname` AS CHAR),'+
                            'CAST(`table`.`lastname` AS CHAR)');
        done();
    });

    it('concat', function (done) {
        sql.castConcat('table', ['firstname', 'lastname'], 'name')
            .should.equal("CONCAT_WS(' ',CAST(`table`.`firstname` AS CHAR),"+
                            "CAST(`table`.`lastname` AS CHAR)) AS `name`");
        done();
    });
    
    it('group', function (done) {
        sql.group('table', ['firstname', 'lastname'], 'name')
            .should.equal("GROUP_CONCAT(DISTINCT CONCAT_WS(' ',CAST(`table`.`firstname` AS CHAR),"+
                            "CAST(`table`.`lastname` AS CHAR))) AS `name`");
        done();
    });

    it('groupby', function (done) {
        sql.groupby('table', 'column')
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
});
