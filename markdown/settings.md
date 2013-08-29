##Configuration

###settings.json

All settings related to the default Express Admin views are in the `settings.json` file which is automatically generated with default values at first start up.

```js
"table_name": {
    "slug": "unique-slug",
    "table": {
        "name": "table_name",
        "pk": "pk_name",
        "verbose": "Verbose Name"
    },
    "columns": [
        {...}, // see column definition below
        // { "manyToMany" ... } // see 'Many to Many' documentation
    ],
    "mainview": {
        "show": true
    },
    "listview": {
        "order": {
            "column_name1": "asc",
            "column_name2": "desc"
        },
        "page": 25
    },
    "editview": {
        "readonly": false,
        // "manyToOne": { ... }, // see 'Many to Many' documentation
        // "oneToOne": { ... } // see 'One to One' documentation
    }
}
```

`settings.json` contains a list of objects representing the database's tables. Each `table` object contains:

- **slug** - unique slug among all other tables
- **table** - contains table's settings
    - **name** - table's database name (typically you won't change this)
    - **pk** - table's primary key (it will be set automatically)
    - **verbose** - table's name used inside the admin's user interface
- **columns** - array of all table's columns. To reorder the columns appearance cut the entire column object and paste it on the desired position in this array
- **mainview** - table's settings for admin's root page
    - **show** - toggle table visibility inside the mainview table's list. Typically you want to hide tables that will be edited as <a href="#many-to-one">inlines</a> of other tables, or tables that are used as links for <a href="#many-to-many">many-to-many</a> relationships
- **listview** - table's settings for the admin's listview
    - **order** - list of columns by which to sort and their respective order direction
    - **page** - how many records to show per page
- **editview** - settings specifically related to the page where the record is edited
    - **readonly** - this will omit the save and delete buttons at the bottom of the page effectively making the table's records readonly
    - **manyToOne** - see `Many to One` documentation
    - **oneToOne** - see `One to One` documentation


####Column

Each `table` object contains an array of colums. Each `column` object have:

```js
{
    "verbose": "Verbose Name",
    "name": "column_name",
    "control": {
        "text": true
    },
    "type": "varchar(45)",
    "allowNull": false,
    "defaultValue": null,
    "listview": {
        "show": true
    },
    "editview": {
        "show": true
    },
    // "oneToMany": { ... }, // see 'One to Many' documentation
}
```

- **verbose** - column's name inside the admin's UI
- **name** - column's database name (typically you won't change this)
- **control** - one of these

    ```js
    {"text": true} // input type="text"
    {"textarea": true} // textarea
    {"textarea": true, "editor": "some-class"} // html editor (see the docs)
    {"date": true} // datepicker
    {"select": true} // select (used for one-to-many relationships)
    {"select": true, "multiple": true} // select multiple (used for many-to-many relationships)
    ```

- **type** - column's data type (typically you won't change this)
- **allowNull** - allowed to be null inside the database
- **defaultValue** - currently not used
- **listview** - settings about how this column should behave in admin's listview
    - **show** - column's visibility inside the listview which is the page where all records from the table are listed. Typically you want to see only colums that have short and meaningful data describing the record clearly. Primary key columns and columns that contain large amount of text should be hidden in this view
- **editview** - settings about how this column should behave in admin's editview
    - **show** - column's visibility inside the listview which is the page where a record can be edited.<br />
    **All auto increment columns should be hidden!**<br />
    **Foreign keys for inline tables should be hidden!**<br />
    Columns that can't be `null` inside the database, can't be hidden here as this will result in a mysql error when insert/update the record
- **oneToMany** - see `One to Many` documentation
