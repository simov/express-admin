##Relationships

###Many to One

![Many to One][1]

In `settings.json` find the table you are searching for and under its `editview` key add a `manyToOne` key.

```js
"manyToOne": {
    "repair": "car_id",
    "driver": "car_id"
}
```

- **manyToOne** - contains information about the tables that are referencing this one
    - **table:fk** - Inside there is a list of key-value pairs where the `key` is the name of the table that is referencing this one and the `value` is its foreign key

  [1]: images/many-to-one.png