##Relationships

###One to Many

![One to Many][1]

In `settings.json` find the table you are searching for and under its columns find the foreign key columnt by its name key. Inside the column's object insert `oneToMany` key. Also don't forget to change the column's control type to `select`.

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

- **oneToMany** - contains information about the table that this foreign key references
    - **table** - name of the table that you are referencing
    - **pk** - name of the referenced table's primary key column
    - **columns** - array of columns that you want to see for each record of the referenced table

  [1]: images/one-to-many.png