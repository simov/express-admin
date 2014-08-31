
## Editors

### Multiple

#### Install

You should either download CKEditor and TinyMCE from their official site [ckedtor.com][1] and [tinymce.com][2] or use them directly from [cdnjs.com][3]


#### settings.json

Inside the `settings.json` file, find the columns you are looking for, and add an additional `editor` property to each column's `control` type key, specifying the class name to use for this instance.

```js
"control": {
    "textarea": true,
    "editor": "ck-full"
}
```
```js
"control": {
    "textarea": true,
    "editor": "ck-compact"
}
```
```js
"control": {
    "textarea": true,
    "editor": "tinymce"
}
```


#### custom.json

Inside the `custom.json` file add a unique key for your custom stuff.

```js
"unique-key-here": {
    "public": {
        "external": {
            "js": [
                "//cdnjs.cloudflare.com/ajax/libs/ckeditor/4.4.1/ckeditor.js"
            ]
        },
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

Your custom editors are initialized here. It's just plain javascript/jquery code, and you can write whatever you want to. However there are a few requirements.

```js
$(function () {
    if (typeof CKEDITOR !== 'undefined') {
        CKEDITOR.replaceAll(function (textarea, config) {
            // exclude textareas that are inside hidden inline rows
            if ($(textarea).parents('tr').hasClass('blank')) return false;
            // textareas with this class name will get the default configuration
            if (textarea.className.indexOf('ck-full') != -1) return true;
            // textareas with this class name will have custom configuration
            if (textarea.className.indexOf('ck-compact') != -1)
                return setCustomConfig(config);
            // all other textareas won't be initialized as ckeditors
            return false;
        });
    }
    
    if (typeof tinyMCE !== 'undefined') {
        // it's important to initialize only the visible textareas
        $('tr:not(.blank) .tinymce').tinymce({});
    }
});

// ckeditor only
function setCustomConfig (config) {
    config = config || {};
    // toolbar
    config.toolbarGroups = [
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
        '/',
        { name: 'styles' },
        { name: 'colors' }
    ];
    config.removeButtons = 'Smiley,SpecialChar,PageBreak,Iframe,CreateDiv';
    return config;
}

// executed each time an inline is added
function onAddInline (rows) {
    if (typeof CKEDITOR !== 'undefined') {
        // for each of the new rows containing textareas
        $('textarea', rows).each(function (index) {
            // get the DOM instance
            var textarea = $(this)[0];
            // textareas with this class name will get the default configuration
            if (textarea.className.indexOf('ck-full') != -1) return CKEDITOR.replace(textarea);
            // textareas with this class name will have custom configuration
            if (textarea.className.indexOf('ck-compact') != -1)
                return CKEDITOR.replace(textarea, setCustomConfig());
            // all other textareas won't be initialized as ckeditors
            return false;
        });
    }

    if (typeof tinyMCE !== 'undefined') {
        // init tinymce editors
        $('.tinymce', rows).tinymce({});
    }
}
```

Here based on a specific `class-name` specified for each column inside the `settings.json` file, the corresponding textarea is initialized accordingly.

The `CKEDITOR.replaceAll` method loops throgh all textareas on the page and filter out only to those that needs to be initialized as ckeditors. The most important bit is that you should always exclude the textareas that are contained inside the hidden row for an inline record. That's easy because all of them have a `blank` class on their containing row.

The `tr:not(.blank) .tinymce` selector filters out only to those textareas that have the `class-name` we specified in `settings.json`, but not contained inside a hidden row. The most important bit is that you should always exclude the textareas that are contained inside the hidden row for an inline record. That's easy because all of them have a `blank` class on their containing row.

The hidden textareas are initialized when they are appended to the document body. The `onAddInline` is an event like global function that is called each time an inline record is appended to the list of records. The `rows` parameters contain all table rows that's been added. Again we loop through all of them and initialize only those textareas that have the class we specified in `settings.json`


  [1]: http://ckeditor.com
  [2]: http://www.tinymce.com
  [3]: http://cdnjs.com