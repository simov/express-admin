##Configuration

###custom.json

All objects in this file are user created. The `public` key is related entirely to inclusion of custom *static files*. It's possible to have an object only with public key inside as well as object without public key at all.

```js
"unique-key-here": {
    "path"  : "/absolute/path/to/custom/app.js",
    "slug": "unique-slug",
    "verbose": "Verbose Name",
    "mainview": {
        "show": true
    },
    "public": {
        "path": "/absolute/path/to/public-dir",
        "css": [
            "/relative/to/above/global.css"
        ],
        "js": [
            "/relative/to/above/global.js"
        ]
    }
}
```

- **path** - absolute path to the custom view's `app.js` file
- **slug** - entry point for all routes of this custom app
- **verbose** - view's name inside the admin's UI
- **mainview** - settings related to the mainview
    - **show** - include/exclude from admin's list of custom views
- **public** - custom static files
    - **path** - absolute path to the static files location
    - **css** - list of stylesheet files to be included
    - **js** - list of javascript files to be included

See the custom view's documentation and the examples.
