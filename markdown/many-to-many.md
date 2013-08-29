##Relationships

###Many to Many

![Many to Many][1]

In `settings.json` find the table you are searching for and insert this object inside its columns array.

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

- **verbose** - exactly as a regular column this is the name that's shown inside the admin UI for this column
- **name** - should be unique among all other columns in this table
- **control** - the control type (you won't change this)
- **type** - you won't change this
- **allowNull** - indicates whether you'll be able to save a record without selecting any item from the referenced table or not
- **editview** - 
    - **show** - include or exclude this column from the editview
- **manyToMany** - indicates that this is not a regular table column
    - **link** - linking table information
        - **table** - name of the link table
        - **parentPk** - name of the primary key for the parent table
        - **childPk** - name of the primary key for the child table
    - **ref** - information about the referenced table
        - **table** - name of the table that you are referencing
        - **pk** - name of the referenced table's primary key columns
        - **columns** - array of columns that you want to see for each record of the referenced table

  [1]: images/many-to-many.png