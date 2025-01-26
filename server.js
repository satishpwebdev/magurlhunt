const express = require("express");
const app = express();
const cors = require('cors')
const {MagnetRouter, SeedrRouter} = require('./routes/route')
require("dotenv").config();

const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/magnet', MagnetRouter);
app.use('/seedr', SeedrRouter);

// app.use('/', Routes)

app.get('/',(req,res)=>{
   console.log(Routes)
   res.send("Radhe Radhe !!")
})


app.listen(port, () => {
   console.log(`Server is running on ${port}`);
});
