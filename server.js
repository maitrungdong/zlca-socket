import { Server } from 'socket.io'

const io = new Server(8888, {
  cors: {
    origin: 'http://localhost:3000',
  },
})

let users = []

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId })
}

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId)
}

const getUser = (userId) => {
  return users.find((user) => user.userId === userId)
}

io.on('connection', (socket) => {
  //When an user connected
  console.log(`An user connected.`)
  io.emit(
    'welcome',
    'Hello, welcome to use socket.io and your id: ' + socket.id
  )

  //Take userId and socketId from user
  socket.on('addUserEvent', (userId) => {
    console.log(`Hello user with id: ${userId} ${socket.id}`)
    addUser(userId, socket.id)
    console.log({ usersOnline: users })
  })

  //Send and get messages
  socket.on('sendMessageEvent', ({ senderId, receiverId, message }) => {
    console.log({ senderId, receiverId, message })
    console.log({ users: users })
    const user = getUser(receiverId)
    if (user) {
      console.log(`CHECK RECEVIER: ${user.userId} ${user.socketId}`)
      io.to(user.socketId).emit('getMessageEvent', {
        message,
      })
    }
  })

  //When an user disconnected
  socket.on('disconnect', () => {
    console.log(`An user disconnected: ${socket.id}`)
    removeUser(socket.id)
  })
})
