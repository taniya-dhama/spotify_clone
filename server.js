const express = require('express');
const app = express()
const cors=require("cors");
const session=require("express-session");
const port=3000
const db=require("./db")

app.use(cors({
    origin:"http://127.0.0.1:3000",
    credentials:true

}));

app.use(express.json());

app.use(session({
    secret:"put some random string here",
    resave:false,
    saveUninitialized:false
}));

app.get('/', (req, res) => {
  res.send('Server is running................')
})

app.listen(port, () => {
  console.log(`Server running on ${port}`)
})




















