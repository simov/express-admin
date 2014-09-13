
var x = null,
    z = require('./partials')();


function select (args, ref) {
    var concat = z.concat(ref.columns,ref.table,undefined,' ');

    var pk = x.as(z.concat(ref.pk,ref.table,z.schema(ref),','),x.name('__pk')),
        text = x.as(concat,x.name('__text'));

    var str = [
        x.select([pk,text]),
        x.from(x.name(ref.table,z.schema(ref))),
        ';'
    ].join(' ');
    
    args.log && console.log('otm'.grey, str);
    return str;
}

exports = module.exports = function (instance) {
    if (instance) x = instance;
    return {
        select:select
    }
}
