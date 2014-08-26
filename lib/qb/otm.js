
var x = require('../').x,
    z = require('./partials');


exports.select = function (args, ref) {
    var select = (function select (cols, table) {

        var concat = z.concat(cols,table,undefined,' ');

        return concat;
    }(ref.columns, ref.table));

    var pk = z.as(ref, ref.pk, '__pk',',');
    var text = x.as(select,x.name('__text'));

    var str = [x.select([pk,text].join()), x.from(x.name(ref.table,z.schema(ref))), ';']
        .join(' ');
    args.log && console.log('otm'.grey, str);

    return str;
}
