
var path = require('path');
    program = require(path.resolve(__dirname, '../../../lib/utils/program'));


process.on('message', function (message) {
    console.log(message);
});

process.send({ path: program.getConfigPath() });
