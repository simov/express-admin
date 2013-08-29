##Editors

###Multiple

####Install

You should either download CKEditor and TinyMCE from their official sites [ckedtor.com][1] and [tinymce.com][2] or use them directly from [cdnjs.com][3].


####settings.json

In `settings.json` add additional `editor` property to the column's `control` type key specifiyng the class name for each editor instance.

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


####custom.json

In `custom.json` add a unique key for your custom stuff.

```js
"unique-key-here": {
    "public": {
        "path": "/absolute/path/to/custom/files/location",
        "js": [
            "//cdnjs.cloudflare.com/ajax/libs/ckeditor/4.2/ckeditor.js",
            "/relative/to/above/path/tinymce/jscripts/tiny_mce/tiny_mce.js",
            "/relative/to/above/path/tinymce/jscripts/tiny_mce/jquery.tinymce.min.js",
            "/relative/to/above/path/my-custom.js"
        ]
    }
}
```

- **public** - static files configuration
    - **path** - absolute path to the static files location
    - **css** - list of stylesheet files to be included
    - **js** - list of javascript files to be included


####my-custom.js

Your custom editors are initialized here. It's just plain javascript/jquery and you can write whatever you want to. However there are a few requirements.

```js
$(function () {
    if (typeof CKEDITOR !== 'undefined') {
        CKEDITOR.replaceAll(function (textarea, config) {
            // exclude textareas that are inside hidden inline rows
            if ($(textarea).parents('tr').hasClass('blank')) return false;
            // textareas with this class name will get the default configuration
            if (textarea.className === 'ck-full') return true;
            // textareas with this class name will have custom configuration
            if (textarea.className === 'ck-compact')
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
            if (textarea.className === 'ck-full') return CKEDITOR.replace(textarea);
            // textareas with this class name will have custom configuration
            if (textarea.className === 'ck-compact')
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

Here based on the specific `class-name` specified in `settings.json` each textarea is initialized accordingly.

The `CKEDITOR.replaceAll` loop throgh all textareas on the page and filter out only those that need to be initialized as ckeditors. The most important bit is that you should always exclude the textareas that are inside the hidden row for an inline record. That's easy because all of them have class `blank` on their containing row.

The `tr:not(.blank) .tinymce` selector filter only to those textareas that have the `class-name` specified in `settings.json` but not contained inside hidden rows. You should always exclude the textareas that are inside the hidden row for an inline record. That's easy because all of them have class `blank` on their containing row.

The hidden textareas are initialized when they are appended to the document body. The `onAddInline` is an event like global function that is called each time an inline record is appended to the list of records. The `rows` parameters contain all table rows that's been added. Again we initialize all textareas according to their specific `class-name` specified in `settings.json`.


  [1]: http://ckeditor.com
  [2]: http://www.tinymce.com
  [3]: http://cdnjs.com