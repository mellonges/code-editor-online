const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require("fs")
const port = process.env.PORT || 3000;
let userCounter = 0;
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  userCounter += 1
  console.log(userCounter)
  io.emit("change online", userCounter)
  const rawdata = fs.readFileSync('lastMessage.json');
  const message = JSON.parse(rawdata);
  socket.emit("chat message", message.lastMessage)
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
    let data = JSON.stringify({"lastMessage": msg});
    fs.writeFileSync('lastMessage.json', data);
  });
  socket.on('disconnect', _ => {
    userCounter -= 1
    console.log(userCounter)
    io.emit("change online", userCounter)
    console.log(`user disconnected. All users: ${userCounter}`);
  });
});


http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
