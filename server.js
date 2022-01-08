const mongoose = require('mongoose');
const Msg = require('./models/messages');
const mongoDB = 'mongodb+srv://messageserver:admin@cluster0.yfebr.mongodb.net/message-database?retryWrites=true&w=majority';
mongoose.connect(mongoDB).then(()=>{
    console.log('Connected')
}).catch(err => console.log(err))

const io = require('socket.io')(3000,{
    cors:{origin: "*",},
})
const users = {}

io.on('connection', socket => {
    Msg.find().then((result)=>{
        socket.emit('chat-message',result)
    })
    socket.on('new-user', name => {
        users[socket.id] = name
        socket.broadcast.emit('user-connected', name)
    })
    socket.on ('send-chat-message', message => {
        const msg = new Msg({msg:message,name: users[socket.id]})
        msg.save().then(()=>{
            socket.broadcast.emit('chat-message', {message: message, name: users[socket.id] })         

        })

        
    })
    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id])
        delete users[socket.id] 
    })
})