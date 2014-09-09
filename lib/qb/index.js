
exports = module.exports = function (x) {
    return {
        lst: require('./lst')(x),
        tbl: require('./tbl')(x),
        otm: require('./otm')(x),
        mtm: require('./mtm')(x),
        partials: require('./partials')(x)
    };
}
