const mongoose=require("mongoose");
require("./database");
const Schema = new mongoose.Schema({
    task_name:
    {
        type:String,
        required:true
    },
    task_description:
    {
        type:String,
        required:true
    },
    creator:
    {
        type:String,
        required:true
    },
    duration:
    {
     type:Number,
     required:true
    },
    createdAt:
    {
        type:String,
        required:true
    }
})
const app =mongoose.model('Todo',Schema);
module.exports= app;
