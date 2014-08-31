
## Editors

### TinyMCE

#### Install

You should either download TinyMCE from [tinymce.com][1] or use it directly from [cdnjs.com][2] _//cdnjs.cloudflare.com/ajax/libs/tinymce/4.1.4/tinymce.min.js_


#### settings.json

Inside the `settings.json` file, find the column you are looking for, and add an additional `editor` property to its `control` type key, specifying the class name to use for this instance.

```js
"control": {
    "textarea": true,
    "editor": "class-name"
}
```


#### custom.json

Inside the `custom.json` file add a unique key for your custom stuff.

```js
"unique-key-here": {
    "public": {
        "local": {
            "path": "/absolute/path/to/custom/files/location",
            "js": [
                "/relative/to/above/path/tinymce/jscripts/tiny_mce/tiny_mce.js",
                "/relative/to/above/path/tinymce/jscripts/tiny_mce/jquery.tinymce.min.js",
                "/relative/to/above/path/my-custom.js"
            ]
        }
    }
}
```

- **public** - static files configuration
    - **path** - absolute path to the static files location
    - **css** - list of stylesheet files to be included
    - **js** - list of javascript files to be included


#### my-custom.js

Your custom editor is initialized here. It's just plain javascript/jquery code, and you can write whatever you want to. However there are a few requirements.

```js
$(function () {
    if (typeof tinyMCE !== 'undefined') {
        // it's important to initialize only the visible textareas
        $('tr:not(.blank) .class-name').tinymce({});
    }
});

// executed each time an inline is added
function onAddInline (rows) {
    if (typeof tinyMCE !== 'undefined') {
        // init tinymce editors
        $('.class-name', rows).tinymce({});
    }
}
```

Here `class-name` is the same class name you specified inside the `settings.json` file for this column.

The `tr:not(.blank) .tinymce` selector filters out only to those textareas that have the `class-name` we specified in `settings.json`, but not contained inside a hidden row. The most important bit is that you should always exclude the textareas that are contained inside the hidden row for an inline record. That's easy because all of them have a `blank` class on their containing row.

The hidden textareas are initialized when they are appended to the document body. The `onAddInline` is an event like global function that is called each time an inline record is appended to the list of records. The `rows` parameters contain all table rows that's been added. Again we loop through all of them and initialize only those textareas that have the class we specified in `settings.json`


  [1]: http://www.tinymce.com
  [2]: http://cdnjs.com
