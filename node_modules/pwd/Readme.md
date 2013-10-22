
# pwd

  Hash and compare passwords with the crypto's pbkdf2.
  
# Installation

```bash
$ npm install pwd
```

# Example

On signup generate a salt / password hash, and save it somewhere:

```js
var pass = require('pwd');
pass.hash('my password', function(err, salt, hash){
  user.salt = salt;
  user.hash = hash;
})
```

To authenticate load and compare:

```js
var pass = require('pwd');
pass.hash('submitted password', user.salt, function(err, hash){
  if (user.hash == hash) {
    // yay
  }
})
```

Too fast? slow it down:

```js
pass.iterations(20000);
```

## License 

(The MIT License)

Copyright (c) 2012 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.