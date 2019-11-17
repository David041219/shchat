var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  
  
  res.render('index', { title: 'chat' });
  //아이디치고 방 들어가는부분이였지

});


router.post('/chatroom', function (req, res, next) {
  // res.render('index', { title: 'chat' });
  console.log(req.body.username);
  var temp_user = req.body.username;

  res.render('chatroom', {
    title: 'chat',
    show_user: temp_user
  });

});

router.get('/chatroom', function (req, res, next) {
  // res.render('index', { title: 'chat' });

  res.redirect('/');

});

module.exports = router;

