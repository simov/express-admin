
var fs = require('fs'),
    path = require('path'),
    mysql = require('mysql');


var fpath = path.resolve(__dirname, 'fixtures/simple/dump.sql');
fs.readFile(fpath, 'utf8', function (err, simple) {
    if (err) throw err;
    fpath = path.resolve(__dirname, 'fixtures/stress/dump.sql');
    fs.readFile(fpath, 'utf8', function (err, stress) {
        if (err) throw err;

        var connection = mysql.createConnection({
            user: 'liolio',
            password: 'karamba',
            multipleStatements: true
        });

        connection.query('USE `express-admin-simple`;', function (err) {
            if (err) throw err;
            connection.query(simple, function (err) {
                if (err) throw err;
                
                connection.query('USE `express-admin-stress`;', function (err) {
                    if (err) throw err;
                    connection.query(stress, function (err) {
                        if (err) throw err;
                        process.exit();
                    });
                });
            });
        });
    });
});
