##Compound Primary Key
![Compound Primary Key][1]

In `settings.json` each table can be configured to have multiple primary keys through its `pk` field (this is set automatically on project's first run)

```js
"table": {
    "name": "tbl",
    "pk": [
        "id1",
        "id2"
    ],
    "verbose": "tbl"
}
```

###Compound One to Many
![Compound One to Many][2]

In case One to Many table relationship is referenced by multiple foreign keys, the regular [One to Many][5] setting can't be used, as it expects to be put inside an existing column in `settings.json`
Therefore the following _fake_ column entry must be added to the `columns` array (similar to how [Many to Many][6] relationship is configured)
The `fk` key specifies the foreign keys in this table that references the other one

```js
{
    "verbose": "otm",
    "name": "otm",
    "control": {
        "select": true
    },
    "type": "varchar(45)",
    "allowNull": false,
    "listview": {
        "show": true
    },
    "editview": {
        "show": true
    },
    "fk": [
        "otm_id1",
        "otm_id2"
    ],
    "oneToMany": {
        "table": "otm",
        "pk": [
            "id1",
            "id2"
        ],
        "columns": [
            "name"
        ]
    }
}
```

###Compound Many to Many
![Compound Many to Many][3]

In case tables with multiple primary keys are part of a Many to Many table relationship, the regular [Many to Many][6] setting is used, but additionally the `parentPk`, `childPk` and the `pk` field inside `ref` can be set to array of keys to accommodate that design

```js
{
    "verbose": "mtm",
    "name": "mtm",
    "control": {
        "select": true,
        "multiple": true
    },
    "type": "varchar(45)",
    "allowNull": false,
    "listview": {
        "show": true
    },
    "editview": {
        "show": true
    },
    "manyToMany": {
        "link": {
            "table": "tbl_has_mtm",
            "parentPk": [
                "tbl_id1",
                "tbl_id2"
            ],
            "childPk": [
                "mtm_id1",
                "mtm_id2"
            ]
        },
        "ref": {
            "table": "mtm",
            "pk": [
                "id1",
                "id2"
            ],
            "columns": [
                "name"
            ]
        }
    }
}
```

###Compound Many to One
![Compound Many to One][4]

Same as the regular [Many to One][7] setting, plus it can contain multiple foreign keys that references this table

```js
"manyToOne": {
    "mto": [
        "tbl_id1",
        "tbl_id2"
    ]
}
```

###Compound One to One

Same as the regular [One to One][8] setting, plus it can contain multiple foreign keys that references this table

```js
"oneToOne": {
    "oto": [
        "tbl_id1",
        "tbl_id2"
    ]
}
```

  [1]: images/compound-primary-key.png
  [2]: images/compound-one-to-many.png
  [3]: images/compound-many-to-many.png
  [4]: images/compound-many-to-one.png
  [5]: #one-to-many
  [6]: #many-to-many
  [7]: #many-to-one
  [8]: #one-to-one
