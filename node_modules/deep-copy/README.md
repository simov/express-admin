deep-copy
=======

Deep copy any object or array.

##Install
Note that you can use this module with commonjs (nodejs), amdjs or as a global object.

```shell
$ bower install deep-copy
```

or

```shell
$ npm install deep-copy
```

##Usage
Pass in some object.

```js
var copy = dcopy({a:{b:[{c:5}]}});
```

Or an array.

```js
var copy = dcopy([1,2,{a:{b:5}}]);
```

##Tests
[http://simov.github.io/deep-copy/test/][1]


  [1]: http://simov.github.io/deep-copy/test/