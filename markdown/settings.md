
## Configuration

### settings.json

All settings related to the default Express Admin views are set inside the `settings.json` file, which is automatically generated with default values at first start up.

```js
"table_name": {
    "slug": "unique-slug",
    "table": {
        "name": "table_name",
        "pk": "pk_name",
        "verbose": "Verbose Name"
        // "schema": "name" // pg: set specific schema for this table only
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
        "page": 25,
        "filter": ["column_name1", "column_name2" ...]
    },
    "editview": {
        "readonly": false,
        // "manyToOne": { ... }, // see 'Many to One' documentation
        // "oneToOne": { ... } // see 'One to One' documentation
    }
}
```

The `settings.json` file contains a list of objects representing the database's tables. Each `table` object have:

- **slug** - unique slug among all other tables
- **table** - contains table's settings
    - **name** - table's database name _(typically you won't change this)_
    - **pk** - table's primary key _(it will be set automatically)_
    - **verbose** - table's name used inside the admin's user interface
- **columns** - array of all table's columns _(see below)_. To reorder the columns appearance cut the entire column object and paste it on the desired position in this array
- **mainview** - table's settings for the admin's editview _(admin's root page)_
    - **show** - toggle table visibility inside the mainview's table list. Typically you want to hide tables that will be edited as [inlines][1] of other tables, or tables that are used as links for [many to many][2] relationships
- **listview** - table's settings for the admin's listview _(where all the table's records are listed)_
    - **order** - list of columns by which to sort and their respective order direction
    - **page** - how many records to show per page
    - **filter** - list of column names to enable for filtering
- **editview** - table's settings for the admin's editview _(where the record is being edited)_
    - **readonly** - this will omit the save and delete buttons at the bottom of the editview effectively making the table's records non editable
    - **manyToOne** - see [many to one][1] documentation
    - **oneToOne** - see [one to one][3] documentation


#### Column

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

- **verbose** - column's name inside the admin's user interface
- **name** - column's database name _(typically you won't change this)_
- **control** - one of these

    ```js
    {"text": true} // input type="text"
    {"textarea": true} // textarea
    {"textarea": true, "editor": "some-class"} // html editor (see the docs)
    {"number": true} // input type="number"
    {"date": true} // datepicker
    {"time": true} // timepicker
    {"datetime": true} // datetimepicker
    {"year": true} // yearpicker
    {"file": true} // input type="file" (uploads to file system)
    {"file": true, "binary": true} // input type="file" (uploads to blob|bytea fields)
    {"radio": true, "options": ["True","False"]} // input type="radio"
    {"select": true} // select (used for one-to-many relationships)
    {"select": true, "multiple": true} // select multiple (used for many-to-many relationships)
    {"select": true, "options": ["value&text",{"value":"text"}]} // select with static options
    ```

- **type** - column's data type _(typically you won't change this)_
- **allowNull** - allowed to be null inside the database
- **defaultValue** - currently not used
- **listview** - columns's settings for the admin's listview _(where all the table's records are listed)_
    - **show** - column's visibility inside the listview. Typically you want to see only colums that contain short and meaningful data describing the whole record clearly. Primary key columns and columns that contain large amount of text typically should be hidden in this view
- **editview** - columns's settings for the admin's editview _(where the record is being edited)_
    - **show** - column's visibility inside the editview<br />
    **`All auto increment columns should be hidden!`**<br />
    **`Foreign keys for inline tables should be hidden!`**<br />
    Columns that are not allowed to be `null` inside the database, can't be hidden here as this will result in a database error when trying to insert or update the record
- **oneToMany** - see [one to many][4] documentation


  [1]: #many-to-one
  [2]: #many-to-many
  [3]: #one-to-one
  [4]: #one-to-many
