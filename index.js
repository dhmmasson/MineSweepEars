var express = require('express');
var app = express();


app.set('view engine', 'ejs');  
app.set('port', (process.env.PORT || 5001));
app.use(express.static(__dirname + '/public'));



app.get('/', function(request, response) {
  response.render('pages/landing.ejs', {})
});

app.get('/game', function(request, response) {
  response.render('pages/game.ejs', {})
});


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})