const express= require('express');
const bodyParser= require("body-parser");
require('./database/database');
const Task= require('./database/Schema');
var urlencodedParser = bodyParser.urlencoded({ extended:false });
const router=express();
router.set('view engine','ejs');
router.get('/Home',async(req,res)=>
{
    try
    {
    const r=await Task.find({});
    res.render('login',{login:"Home Page",records:r});
    }
    catch(e)
    {
        res.status(400).send(e);
    }
}
)
router.post('/HOME',urlencodedParser,async(req,res)=>
{
    const time=req.body.Duration;
    const today = new Date();
    const r=today.getFullYear()+"-"+today.getMonth()+"-"+today.getDay();
    const m=today.getHours()+":"+today.getMinutes()+":"+today.getSeconds();
    const Creation=r+' '+m;
    try{
    const add= await new Task({
        task_name:req.body.name,
        task_description:req.body.Desc,
        creator:req.body.Creator,
        duration:req.body.Duration,
        createdAt:Creation
    })
    const r=await add.save();
    const _id=r._id;
    setInterval(()=>
    {
       var run=async()=>
       {
           try
           {
             await Task.findByIdAndDelete({_id});
           }
           catch(o)
           {
               console.log(o);
              res.status(401).send(o);
           }
       }
       run();
    },time*60*1000)

    var Find= await Task.find({});
    await res.render('login',{records:Find});
   }
catch(e)
{
    res.status(400).send(e);
}
})
router.listen(8000,()=>
{
    console.log("server running on port no 8000");
})
