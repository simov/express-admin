#MySql Validator

Validates web forms input against mysql database.

##Installation

    $ npm install mysql-validator

##API

```js
var validator = require('mysql-validator');

var err = validator.check('doh winning!', 'varchar(45)');
if (err) {
  console.log(err.message);
}
```

The first parameter is the posted input data and the second is the mysql data type of the field in your database.

##Obtaining data types

The best way to pass the corresponding data type for your input field is to query the database for it.

```sql
describe `table-name`;
```

All you need to look for is the `Type` column. This is the string that the validator expects to see as a second parameter.

This will give you an idea of what object is constructed after the data type string have been parsed. This object is used internally by the validator.

    $ mocha test/data-type.js

You can type in your data types manually without querying the database, just make sure you don't mess them up.

##Express 3.x example

Suppose you have a form like this.

```html
<form method="post" action="/save">
    <input type="text" name="name" />
    <input type="text" name="cache" />
    <input type="text" name="date" />
    <input type="submit" value="Save" />
</form>
```

Then your router may look like this.

```js
app.post('/save', function (req, res) {
  // we'll store all validation errors here
  var errors = [];
  // field-type mapping (this may be the result of 'describe table')
  var types = {
    name: 'varchar(10)',
    cache: 'decimal(6,2) unsigned',
    date: 'datetime'
  }
  // loop through the submitted fields and validate them
  for (var key in req.body) {
    var err = validator.check(req.body[key], types[key]);
    // store the error's message and the field name
    if (err) errors.push({ name: key, error: err.message });
  }
  if (errors.length) {
    // notify the user about the errors
    res.render('template', { err: errors, other: 'params...' });
  } else {
    // safely store the user's input into the database
  }
});
```

##Tests

Before you can run the tests you must create the test user and give him rights to the test database.

```sql
create user 'liolio'@'localhost' identified by 'karamba';
grant all on `mysql-validator`.* to 'liolio'@'localhost';
```

Then run this test.

    $ mocha test/mysql.js

If it pass then you're good to go.

There are a various tests for each data type.

    $ mocha test/index.js

The output is pretty verbose. The yellow column show what the test input is. The left column show what mysql store in it's database for this input. The right column show whether the validator think it should be valid or not.

![](http://i.imgur.com/rKYxW.jpg)
