
exports.preSave = function (req, res, args, next) {
    args.preSave = true;
    next();
}

exports.postSave = function (req, res, args, next) {
    args.postSave = true;
    next();
}
