##Configuration

###custom.json

All objects in this file are user created. The `public` key is related entirely to inclusion of custom *static files*. It's possible to have an object only with public key inside as well as object with only `app` key in it.

```js
"unique-key-here": {
    "app": {
        "path": "/absolute/path/to/custom/app.js",
        "slug": "unique-slug",
        "verbose": "Verbose Name",
        "mainview": {
            "show": true
        }
    },
    "public": {
        "local": {
            "path": "/absolute/path/to/custom/public/dir",
            "css": [
                "/relative/to/above/global.css"
            ],
            "js": [
                "/relative/to/above/global.js"
            ]
        },
        "external": {
            "css": [
                "//absolute/url/external.css"
            ],
            "js": [
                "//absolute/url/external.js"
            ]
        }
    }
}
```

- **app** - expressjs application
    - **path** - absolute path to the custom view's `app.js` file
    - **slug** - entry point for all routes in this custom app
    - **verbose** - view's name inside the admin's UI
    - **mainview** - settings related to the mainview
        - **show** - include/exclude from admin's list of custom views
- **public** - custom static files
    - **local** - local files
        - **path** - absolute path to the static files location
        - **css** - list of stylesheet files to be included
        - **js** - list of javascript files to be included
    - **external** - external files
        - **css** - list of stylesheet urls to be included
        - **js** - list of javascript urls to be included

See the custom view's documentation and the examples.
