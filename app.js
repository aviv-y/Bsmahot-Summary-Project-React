const express = require('express')
const app = express()
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const routerApi = require('./routers/api')
const jwt = require('jsonwebtoken')
var multer = require('multer');
// const router = require('express').Router()
const cors = require('cors');


app.use(cors())

dotenv.config()

setInterval(
  () => {
    console.log("hi!");
  },86400000
);

//התחברות למונגו
const connectionParams = {           //הגדרות ההתחברות
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}

//פונ' ההתחברות
mongoose.connect(process.env.DB_CONNECT,connectionParams)
    .then(() => {
        console.log("connected!!")
    })
    .catch((err) => {
        console.log(`error connecting${err}`);
})



// חילוץ הטוקן בכל בקשת גישה
// app.use('/', (req, res, next) => {
//     if (!req.path.startsWith('/login') && !req.path.startsWith('/add')) {
//         jwt.verify(req.headers['authorization'], process.env.SECRET).then(() => { next(); })
//             .catch((err) => { console.log(`the user didn't find!: ${err}`); })
//     }
//     else
//         next();
// })

//מניעת שגיאת קורס
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authoriztion");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', routerApi);
// app.post('/resetPass/:token', (req, res)=> {
    
// })
// app.use("/api/v1", routerApi);
app.use((error, req, res, next) => {
  res.status(500).json({ error: error.message });
});
 

var server=app.listen(process.env.PORT, () => { console.log('connect!!!'); })

/**מניעת שגיאות קורס */
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-        With, Content-Type, Accept, Authoriztion");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});


// העלאת קבצים באמצעות הספריה מולטר לתקיית 'העלאות' בשרת
 
 
// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
// });
 
// var upload = multer({ storage: storage });
// const express = require("express");
// const app = express();
const socket = require("socket.io");
const color = require("colors");
// const cors = require("cors");
const { get_Current_User, user_Disconnect, join_User } = require("./controllers/PrivetUser.controller");


const io = socket(server);

//initializing the socket io connection 
io.on("connection", (socket) => {
  //for a new user joining the room
  socket.on("joinRoom", ({ username, roomname }) => {
    //* create user
    const p_user = join_User(socket.id, username, roomname);
    console.log(socket.id, "=id");
    socket.join(p_user.room);

    //display a welcome message to the user who have joined a room
    socket.emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: `Welcome ${p_user.username}`,
    });

    //displays a joined room message to all other room users except that particular user
    socket.broadcast.to(p_user.room).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: `${p_user.username} has joined the chat`,
    });
  });

  //user sending message
  socket.on("chat", (text) => {
    //gets the room user and the message sent
    const p_user = get_Current_User(socket.id);

    io.to(p_user.room).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: text,
    });
  });

  
    
  //when the user exits the room
  // socket.on("disconnect", () => {
  //   //the user is deleted from array of users and a left room message displayed
  //   const p_user = user_Disconnect(socket.id);

  //   if (p_user) {
  //     io.to(p_user.room).emit("message", {
  //       userId: p_user.id,
  //       username: p_user.username,
  //       text: `${p_user.username} has left the room`,
  //     });
  //   }
  // });
});