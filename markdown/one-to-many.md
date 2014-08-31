
## Relationships

### One to Many

![One to Many][1]

1. Inside the `settings.json` file, find the table you are looking for
2. Inside that table's columns array find the foreign key column you want to use for the relation
3. Inside that column's object insert `oneToMany` key
4. Change the column's control type to `select`

```js
"control": {
    "select": true
},
"oneToMany": {
    "table": "user",
    "pk": "id",
    "columns": [
        "firstname",
        "lastname"
    ]
}
```
> The `oneToMany` key additionally can contain a `schema` key, specifying PostgreSQL schema name for the relation table

- **oneToMany** - contains information about the table that this foreign key references
    - **table** - name of the table that's being referenced
    - **pk** - name of the referenced table primary key column _(can be array as well, see [compound primary key][2] documentation)_
    - **columns** - array of columns to select from the referenced table


  [1]: images/one-to-many.png
  [2]: #compound-one-to-many
