var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


//http모듈에서 익스프레스 서버를사용하고
var http = require('http').Server(app);
// io 모듈에서 http모듈을 사용할게
var io = require('socket.io')(http);


var member_list = [];
////////////io가 연결이 되었을경우 돌아가는 함수들 지정
io.on('connection', function (socket) {

  /////////////joinRoom은 함수명의 메시지가 왔을때 하는행위지정
  socket.on('joinRoom', function (roomname, id, msg) {
    console.log('방에 들어왔습니다. 메시지는:' + msg);
    const idx = member_list.indexOf(id);
    if (idx > -1) {
      //멤버가 중복됨
      console.log("중복");
    }
    else {

      //방을 만들어
      socket.join(roomname, function () {
        //방을 만들고나서 roomname 방 사람들에게 joinRoom함수로 메시지를 보내



        console.log("방맴버를보냄")


        var a = new Promise(function (resolve) {
          //멤버중복X
          member_list.push(id);

          console.log("총멤버 " + member_list);
          io.to(roomname).emit('joinRoom', roomname, id, id + "가 " + roomname + "방에 들어왔습니다.");
          resolve(1);
        }).then(function (resolve) {
          io.to(roomname).emit('add_member', roomname, member_list);

       
        });

      });

    }

  });

  socket.on('leaveRoom', function (roomname, id, msg) {
    console.log('방을 나갔습니다. 메시지는:' + msg);

    //방을 만들어
    socket.leave(roomname, function () {
      //방을 만들고나서 roomname 방 사람들에게 joinRoom함수로 메시지를 보내

      var a = new Promise(function (resolve) {
        const idx = member_list.indexOf(id);
        // console.log(idx);
        if (idx > -1)
          member_list.splice(idx, 1);
        console.log("총멤버 " + member_list);
        io.to(roomname).emit('leaveRoom', roomname, id, id + "가 " + roomname + "방을 나갔습니다.");
        resolve(1);
      }).then(function (resolve) {
        io.to(roomname).emit('add_member', roomname, member_list);
      
      });

    });

  });


  socket.on('sendmsg_backend', function (roomname, id, msg) {
    console.log(msg);
    io.to(roomname).emit('sendmsg_frontend', roomname, id, msg);
  });
  //////////////////////////////////////


  //msgbroadcast의 함수명으로 메시지가 왔을때 하는 행위지정
  socket.on('msgbroadcast', function (roomname, id, msg) {
    io.to(roomname).emit('joinRoom', roomname, id, roomname + "방 들어오기 성공");
  });
  //////////////////////////////////////

});

http.listen(8989, function () {
  console.log('listening on *:8989  socket.io용 포트');

});
/////////////////////////////////////

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;