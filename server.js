import { Server } from 'socket.io'
import { socketEvents } from './src/utils/constants.js'

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
  //When a user connected
  console.log(`A user connected.`)
  console.log({ socketId: socket.id })
  io.emit(
    'welcome',
    'Hello, welcome to use socket.io and your id: ' + socket.id
  )

  //Take userId and socketId from user
  socket.on(socketEvents.ADD_NEW_USER, (userId) => {
    console.log(`Hello user with id: ${userId} ${socket.id}`)
    addUser(userId, socket.id)
    console.log({ usersOnline: users })
  })

  //Send and get messages
  socket.on(socketEvents.SEND_MESSAGE, ({ senderId, receiverId, message }) => {
    console.log({ senderId, receiverId, message })
    console.log({ users: users })
    const user = getUser(receiverId)
    if (user) {
      console.log(`CHECK RECEIVER: ${user.userId} ${user.socketId}`)
      io.to(user.socketId).emit(socketEvents.GET_MESSAGE, {
        message,
      })
    }
  })

  socket.on(socketEvents.CREATE_CONVER, ({ conversation, receiverId }) => {
    const user = getUser(receiverId)
    console.log({ conversation })
    console.log({ user })
    if (user) {
      io.to(user.socketId).emit(socketEvents.GET_CONVER, {
        arrivalConver: conversation,
      })
    }
  })

  //When an user disconnected
  socket.on('disconnect', () => {
    console.log(`A user disconnected: ${socket.id}`)
    removeUser(socket.id)
  })
})
