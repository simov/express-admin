## Events

Currently the supported event hooks are:
- **preSave** - before a record is saved
- **postSave** - after a record is saved
- **preList** - before listview is shown


### custom.json
```js
"some-key": {
    "events": "/absolute/path/to/custom/events.js"
}
```

### events.js
Run the admin with the `--debug-brk` flag and use [node-inspector][3] to drill down into the event hook parameters
```js
exports.preSave = function (req, res, args, next) {
    if (args.debug) console.log('preSave');
    debugger;
    next();
}
exports.postSave = function (req, res, args, next) {
    if (args.debug) console.log('postSave');
    debugger;
    next();
}
```
Take a look at the event examples [here][1] and [here][2]


### preSave args
- **action** - `insert|update|remove`
- **name** - this table's name
- **slug** - this table's slug
- **data** - data submitted via POST request or select'ed from the database
    - **view** - this table's data (the one currently shown inside the _editview_)
    - **oneToOne | manyToOne** - inline tables data

        ```js
        "table's name": {
            "records": [
                "columns": {"column's name": "column's value", ...},
                "insert|update|remove": "true" // only for inline records
            ]
        }
        ```
- **upath** - absolute path to the upload folder location
- **upload** - list of files submitted via POST request
- **db** - database connection instance


#### examples

##### _created_at / updated_at_
- in this example our table will be called `user`
- the `created_at` and `update_at` columns in `user` table should be set to `show: false` for `editview` in `settings.json`
- use the code below to set the `created_at` and `updated_at` columns, before the record is saved

```js
var moment = require('moment');

exports.preSave = function (req, res, args, next) {
    if (args.name == 'user') {
        var now = moment(new Date()).format('YYYY-MM-DD hh:mm:ss'),
            record = args.data.view.user.records[0].columns;
        if (args.action == 'insert') {
            record.created_at = now;
            record.updated_at = now;
        }
        else if (args.action == 'update') {
            record.updated_at = now;
        }
    }
    next();
}
```


##### _generate hash id_
- in this example our table will be called `car` and will contain `manyToOne` inline tables
- the car's table primary key that needs to be generated (in this case it's called `id`) should be set to `show: false` for `editview` in `settings.json` (the same applies for any inline table that needs its primary key to be generated)
- use the code below to set the columns that needs to be generated, before the record is saved

```js
var shortid = require('shortid');

exports.preSave = function (req, res, args, next) {
    if (args.name == 'car') {
        if (args.action == 'insert') {
            var table = args.name,
                record = args.data.view[table].records[0].columns;
            record.id = shortid.generate();
        }
        for (var table in args.data.manyToOne) {
            var inline = args.data.manyToOne[table];
            if (!inline.records) continue;
            for (var i=0; i < inline.records.length; i++) {
                if (inline.records[i].insert != 'true') continue;
                inline.records[i].columns.id = shortid.generate();
            }
        }
    }
    next();
}
```


##### _soft delete records_
- in this example our table will be called `purchase` and will contain `manyToOne` inline tables
- the purchase's table `deleted` and `deleted_at` columns should be set to `show: false` for `editview` in `settings.json`
- use the code below to set the `deleted` and `deleted_at` columns, before the record is saved

```js
var moment = require('moment');

exports.preSave = function (req, res, args, next) {
    if (args.name == 'purchase') {
        var now = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
        // all inline oneToOne and manyToOne records should be marked as deleted
        for (var table in args.data.manyToOne) {
            var inline = args.data.manyToOne[table];
            if (!inline.records) continue;
            for (var i=0; i < inline.records.length; i++) {
                if (args.action != 'remove' && !inline.records[i].remove) continue;
                // instead of deleting the record
                delete inline.records[i].remove;
                // update it
                inline.records[i].columns.deleted = true;
                inline.records[i].columns.deleted_at = now;
            }
        }
        // parent record
        if (args.action == 'remove') {
            // instead of deleting the record
            args.action = 'update';
            // update it
            var record = args.data.view.purchase.records[0].columns;
            record.deleted = true;
            record.deleted_at = now;
        }
    }
    next();
}
```


### postSave args
- **action** - `insert|update|remove`
- **name** - this table's name
- **slug** - this table's slug
- **data** - data submitted via POST request or select'ed from the database
    - **view** - this table's data (the one currently shown inside the _editview_)
    - **oneToOne | manyToOne** - inline tables data

        ```js
        "table's name": {
            "records": [
                "columns": {"column's name": "column's value", ...},
                "insert|update|remove": "true" // only for inline records
            ]
        }
        ```
- **upath** - absolute path to the upload folder location
- **upload** - list of files submitted via POST request
- **db** - database connection instance


#### examples

##### _upload files to a third party server_
- in this example our table will be called `item`
- the item's table `image`'s column control type should be set to `file:true` in `settings.json`
- use the code below to upload the image, after the record is saved

```js
var cloudinary = require('cloudinary'),
    fs = require('fs'),
    path = require('path');
cloudinary.config({
    cloud_name: '',
    api_key: '',
    api_secret: ''
});
exports.postSave = function (req, res, args, next) {
    if (args.name == 'item') {
        // file upload control data
        var image = args.upload.view.item.records[0].columns.image;
        // in case file is chosen through the file input control
        if (image.name) {
            // file name of the image already uploaded to the upload folder
            var fname = args.data.view.item.records[0].columns.image;
            // upload
            var fpath = path.join(args.upath, fname);
            cloudinary.uploader.upload(fpath, function (result) {
                console.log(result);
                next();
            });
        }
        else next();
    }
    else next();
}
```


### preList args
- **name** - this table's name
- **slug** - this table's slug
- **filter** - filter data submitted via POST request
    - **columns** - list of columns (and their values) to filter by
    - **direction** - sort order direction
    - **order** - column names by which to order
    - **or** - `true|false` whether to use logical _or_ or not
- **statements** - sql query strings partials
    - **columns** - columns to select
    - **table** - table to select from
    - **join** - join statements
    - **where** - where statements
    - **group** - group by statements
    - **order** - order statements
    - **from** - limit from number
    - **to** - limit to number
- **db** - database connection instance

#### examples

##### _soft deleted records_
- check out the _preSave_ example about _soft deleted records_ above

```js
exports.preList = function (req, res, args, next) {
    if (args.name == 'purchase') {
        // check if we're using listview's filter
        // and actually want to see soft deleted records
        var filter = args.filter.columns;
        if (filter && (filter.deleted=='1' || filter.deleted_at && filter.deleted_at[0])) {
            return next();
        }
        // otherwise hide the soft deleted records by default
        var filter = 
            ' `purchase`.`deleted` IS NULL OR `purchase`.`deleted` = 0' +
            ' OR `purchase`.`deleted_at` IS NULL ';
        args.statements.where
            ? args.statements.where += ' AND ' + filter
            : args.statements.where = ' WHERE ' + filter
    }
    next();
}
```


  [1]: https://github.com/simov/express-admin-examples/blob/master/config/custom/events/events.js
  [2]: https://github.com/simov/express-admin-tests/blob/master/config/x-relationships-compound/custom/events.js
  [3]: https://github.com/node-inspector/node-inspector