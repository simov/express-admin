
var path = require('path');
    program = require(path.resolve(__dirname, '../../../lib/utils/program'));


program.promptForData(function (err, result) {
    if (err) console.log(JSON.stringify({ err: err.message }));
    console.log(JSON.stringify(result));
});
