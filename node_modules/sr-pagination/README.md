sr-pagination
=======

Simple pagination generator.

> The **sr** prefix stands for *simpler*, which is comparative of *sim·ple* (Adjective)<br />
> 1. Easily understood or done; presenting no difficulty.<br />
> 2. Plain, basic, or uncomplicated in form, nature, or design; without much decoration or ornamentation.


##Install
- [bower][1]: sr-pagination
- [component][2]: simov/sr-pagination
- [npm][3]: sr-pagination

##Usage
Note that you can use this module with commonjs (nodejs), amdjs or as a global object in the browser.

```js
var result = pagination({page:1, links: 5, rows: 5, total: 50});
```

##Options
- **page**: current page
- **links**: visible page links
- **rows**: rows per page
- **total**: total number of all items

##Tests
Make sure you check out the [test][4] page.


  [1]: http://sindresorhus.com/bower-components/
  [2]: http://component.io/
  [3]: https://npmjs.org/
  [4]: http://simov.github.io/sr-pagination/test/