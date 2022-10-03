const dotenv = require("dotenv");
dotenv.config()
const multer=require("multer");
const mongoose =require("mongoose");
const bcrypt=require("bcrypt");
const express=require("express");
const File = require("./models/file");
const app=express();
app.use(express.urlencoded({extended:true}))

app.set("view engine","ejs");
const upload=multer({dest:"uploads"});

//mongoose.connect(process.env.DATABASE_URL);
mongoose.connect("mongodb://localhost:27017/filesharing", {

  useNewUrlParser: "true",
  useUnifiedTopology: "true"

})


app.get("/",(req,res)=>{
    res.render("index");
})

app.post("/upload", upload.single("file"),async(req,res)=>
{
   const filedata={
    path:req.file.path,
    originalName:req.file.originalname,
   }
   if(req.body.password!=null && req.body.password!=="")
   filedata.password= await bcrypt.hash(req.body.password,10);

   const file=await File.create(filedata);
  res.render("index",{fileLink:`${req.headers.origin}/file/${file.id}`})
})
app.route("/file/:id").get(handledownload).post(handledownload)
 async function handledownload(req,res)
{
    const file= await File.findById(req.params.id)

if(file.password!=null)
{
    if(req.body.password==null)
    {
        res.render("password");
        return;
    }
    if(!await bcrypt.compare(req.body.password,file.password))
    {
        res.render("password",{error:true})
        return 
    }
}
file.downloadcount++
await file.save()
console.log(file.downloadcount)

res.download(file.path,file.originalName)
}
app.listen(3000);