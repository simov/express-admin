
/**
 * Module dependencies.
 */

var express = require('./')
  , app = express();

app.get('/user/:id?', function(req, res){
  console.log(req.header);
  console.log(res.header);
});

app.listen(3000)