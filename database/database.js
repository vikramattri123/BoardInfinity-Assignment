const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/Users",{useNewUrlParser:true,useCreateIndex:true,useFindAndModify:false})
