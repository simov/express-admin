##Relationships

###One to One

![One to One][1]

In `settings.json` find the table you are searching for and under its `editview` key add a `oneToOne` key.

```js
"oneToOne": {
    "address": "user_id",
    "phone": "user_id"
}
```

- **oneToOne** - contains information about the tables that are referencing this one
    - **table:fk** - Inside there is a list of key-value pairs where the `key` is the name of the table that is referencing this one and the `value` is its foreign key

  [1]: images/one-to-one.png