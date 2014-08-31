
## Configuration

### custom.json

All objects in this file are user created. The `public` key is related entirely to inclusion of custom _static files_. It's possible to have an object containing only public key in it, as well as object containing an `app` key only, or both.

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
    },
    "events": "/absolute/path/to/custom/events.js"
}
```

- **app** - expressjs application
    - **path** - absolute path to the custom view's `app.js` file
    - **slug** - entry point for all routes in this custom app
    - **verbose** - view's name inside the admin's user interface
    - **mainview** - settings related to the admin's mainview
        - **show** - include/exclude from admin's list of custom views
- **public** - custom static files
    - **local** - local files
        - **path** - absolute path to the static files location
        - **css** - list of stylesheet files to be included
        - **js** - list of javascript files to be included
    - **external** - external files
        - **css** - list of stylesheet urls to be included
        - **js** - list of javascript urls to be included
- **events** - path to file containing event hooks

See the [custom views][1] documentation and the [examples][2]


  [1]: #custom-views-apps
  [2]: https://github.com/simov/express-admin-examples
