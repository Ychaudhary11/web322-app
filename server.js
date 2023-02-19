/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name:  Yashan Chaudhary    Student ID:  161691217   Date:  18th Feb,2023
*
*  Cyclic Web App URL: https://busy-rose-chiton-kit.cyclic.app/
*
*  GitHub Repository URL: ___https://github.com/ashnoorjit-singh/web322-app ______
*
********************************************************************************/ 

const express = require("express");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const path = require("path");
const { initialize, getAllPosts, getPublishedPosts, getCategories, addPost, getPostById, getPostsByCategory, getPostsByMinDate } = require("./blog-service.js");

const app = express();

app.use(express.static('public')); 

cloudinary.config({
  cloud_name: 'diuwbbi6q',
  api_key: '473366729458571',
  api_secret: 'BZBnRtR2xKFzjDuJ1UEUe30SFiM',
  secure: true
 });

const upload = multer(); 

const HTTP_PORT = process.env.PORT || 8080;

app.get("/", (req,res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "about.html"));
})

app.get("/blog", (req, res) => {
  getPublishedPosts()
  .then((data) => {
    res.send(data)
  })
  .catch((err) => {
    res.send(err);
  })
});

app.get("/posts", (req, res) => {
  getAllPosts()
  if (req.query.category) {
    getPostsByCategory(req.query.category)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
  }

  else if (req.query.minDate) {
    getPostsByMinDate(req.query.minDate)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
  }

  else {
    getAllPosts()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
  }
});

app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "addPost.html"));
})

app.post("/posts/add", upload.single("featureImage"), function (req, res) {


  if(req.file){
    let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
    (error, result) => {
    if (result) {
    resolve(result);
    } else {
    reject(error);
    }
    }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    };
    async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
    }
    upload(req).then((uploaded)=>{
    processPost(uploaded.url);
    });
   }else{
    processPost("");
   }
   function processPost(imageUrl){
    req.body.featureImage = imageUrl;}
    let postObject = {};
  
      
      postObject.body = req.body.body;
      postObject.title = req.body.title;
      postObject.postDate = Date.now();
      postObject.category = req.body.category;
      postObject.featureImage = req.body.featureImage;
      postObject.published = req.body.published;
      
  
      if (postObject.title) {
        addPost(postObject);
      }
      res.redirect("/posts");
    });
    
    
   

app.get("/categories", (req, res) => {
  getCategories()
  .then((data) => {
    res.send(data)
  })
  .catch((err) => {
    res.send(err);
  })
})

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "notFoundPage.html"));
})

initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log("Express http server listening on: " + HTTP_PORT);
  });
})