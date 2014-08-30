##Relationships

###Many to Many

![Many to Many][1]

1. Inside the `settings.json` file, find the table you are looking for
2. Add the object from below inside that table's columns array

```js
{
    "verbose": "Recipe Types",
    "name": "recipe_type",
    "control": {
        "select": true,
        "multiple": true
    },
    "type": "int(11)",
    "allowNull": false,
    "listview": {
        "show": false
    },
    "editview": {
        "show": true
    },
    "manyToMany": {
        "link": {
            "table": "recipe_has_recipe_types",
            "parentPk": "recipe_id",
            "childPk": "recipe_type_id"
        },
        "ref": {
            "table": "recipe_type",
            "pk": "id",
            "columns": [
                "title"
            ]
        }
    }
}
```
> The `link` and the `ref` keys additionally can contain a `schema` key, specifying PostgreSQL schema name for the relation table

- **verbose** - exactly as a regular column, this is the column's name inside the admin's user interface
- **name** - should be unique name among all other columns in this table
- **control** - column's control type _(you won't change this)_
- **type** - column's data type _(you won't change this)_
- **allowNull** - indicates whether you'll be able to save a record without selecting any item from the referenced table or not
- **listview** - columns's settings for the admin's listview _(where all the table's records are listed)_
    - **show** - column's visibility inside the listview
- **editview** - columns's settings for the admin's editview _(where the record is being edited)_
    - **show** - column's visibility inside the editview
- **manyToMany** - indicates that this is not a regular table column
    - **link** - linking table configuration
        - **table** - name of the link table
        - **parentPk** - name of the primary key for the parent table _(can be array as well)_
        - **childPk** - name of the primary key for the child table _(can be array as well)_
    - **ref** - configuration about the referenced table
        - **table** - name of the table that is being referenced
        - **pk** - name of the referenced table primary key column _(can be array as well)_
        - **columns** - array of columns to select from the referenced table

> The `link` table's `parentPk` and `childPk` key can be array as well.<br />
> The `ref` table's `pk` key can be array as well.<br />
> See [compound primary key][2] documentation.


  [1]: images/many-to-many.png
  [2]: #compound-many-to-many
