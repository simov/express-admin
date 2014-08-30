##Relationships

###One to One

![One to One][1]

1. Inside the `settings.json` file, find the table you are looking for
2. Inside that table's `editview` key add a `oneToOne` key

```js
"oneToOne": {
    "address": "user_id",
    "phone": "user_id"
}
```

- **oneToOne** - contains information about the tables that are referencing this one
    - **table:fk** - list of key-value pairs where the `key` is the name of the table that is referencing this one, and the `value` is its foreign key<br />
    (`value` can be array as well, see [compound primary key][2] documentation)


  [1]: images/one-to-one.png
  [2]: #compound-one-to-one
