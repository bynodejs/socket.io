'use strict';

// require modules
const express = require('express'),
    http = require('http'),
    app = express();

const server = http.createServer(app), // express http 서버 생성
    io = require('socket.io')(server); //생성된 서버를 socket.io에 바인딩

app.use(express.static(__dirname + '/public'));

/**
 * @url BASE_URL/
 * @type GET
 * @description sendFile socket-io.html
 */
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/socket-io.html');
});

io.sockets.on('connection', function (socket) {

    /* 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌 */
    socket.on('newUser', function (name) {
        console.log(name + ' 님이 접속하였습니다.');

        /* 소켓에 이름 저장해두기 */
        socket.name = name;

        /* 모든 소켓에게 전송 */
        io.sockets.emit('update', { type: 'connect', message: `${socket.name}님이 들어왔습니다.` });
    });

    /* 전송한 메시지 받기 */
    socket.on('message', function (data) {
        /* 받은 데이터에 누가 보냈는지 이름을 추가 */
        data.name = socket.name;

        console.log("message : ", data);

        /* 보낸 사람을 제외한 나머지 유저에게 메시지 전송 */
        socket.broadcast.emit('update', data);
    });

    /* 접속 종료 */
    socket.on('disconnect', function () {
        console.log(socket.name + '님이 나가셨습니다.');

        /* 나가는 사람을 제외한 나머지 유저에게 메시지 전송 */
        socket.broadcast.emit('update', { type: 'disconnect', message: `${socket.name}님이 나갔습니다.` });
    });
});

// server on port 3000
server.listen(3000, function () {
    console.log("socket io server listening on port 3000");
});
