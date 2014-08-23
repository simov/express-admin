
exports = module.exports = {
    select: {
        lst: require('./select/listview').query,
        tbl: require('./select/tbl').query,
        otm: require('./select/otm').query,
        mtm: require('./select/mtm').query
    },
    insert: {
        tbl: require('./insert/tbl').insert
    },
    update: {
        tbl: require('./insert/tbl').update
    },
    delete: {
        tbl: require('./insert/tbl').delete
    }
}
