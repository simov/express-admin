##Relationships

###Many to One

![Many to One][1]

1. Inside the `settings.json` file, find the table you are looking for
2. Inside that table's `editview` key add a `manyToOne` key

```js
"manyToOne": {
    "repair": "car_id",
    "driver": "car_id"
}
```

- **manyToOne** - contains information about the tables that are referencing this one
    - **table:fk** - list of key-value pairs where the `key` is the name of the table that is referencing this one, and the `value` is its foreign key<br />
    (`value` can be array as well, see [compound primary key][2] documentation)


  [1]: images/many-to-one.png
  [2]: #compound-one-to-one
