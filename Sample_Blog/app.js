//jshint esversion:6

// Setup the requirements.
const express = require('express');
const make = require(__dirname + '/constructs.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();

// DB connections to the local host or cluster.
mongoose.connect('mongodb://YOURLOCAL/blogRollDB');

// Set app uses.
app.use(express.urlencoded({extended: true}));
app.use(express.static('static'));
app.set('view engine', 'ejs');

// Mongoose schema and model setup for posts.
const blgPost = mongoose.Schema ({
    _id: String,
    blgDate: String,
    blgTitle: String,
    blgTrunc: String,
    blgBody: String
});
const bPost = mongoose.model('post', blgPost);

// Home page gets the mongoDB collection for blog roll.
app.get('/', function (req, res){
    const blgListy = new Promise ((resolve, reject) => {
        bPost.find({}, function(err, foundList){
            if(!err){
                resolve(foundList);
            } else {
                console.log('Nothing to find here!');
            }
        });
    });

    // Utilizing the promises for the load of find.
    blgListy.then((list) => {
        res.render('broll', {broll: list});
    });
});

// Get the about view.
app.get('/about', function (req, res){
    res.render('about');
});

// Get the contact view.
app.get('/contact', function (req, res){
    res.render('contact');
});

// Get the compose view.
app.get('/compose', function (req, res){
    res.render('compose');
});

/* Post goes to async function for calling the
   constructor function that build a JObject of
   the post. Then passing the JObject to the newPost
   object for returning. */
app.post('/compose', function (req, res){
    async function posted() {
        let posted = new Promise((resolve, reject) => {
            let post = new make.Blogpost(req.body.title, req.body.body);
            resolve(post);
        });

        let myPost = await posted;

        // Uses obkect to make new DB doc.
        let newPost = new bPost({
            _id: myPost.key,
            blgDate: myPost.dte,
            blgTitle: myPost.tlt,
            blgTrunc: myPost.trn,
            blgBody: myPost.bdy
        });

        return newPost;
    }

    // Uses the returned object to save to DB and redirect.
    posted().then((newPost) => {
        newPost.save();
    }).then(() => {
        res.redirect('/');
    });
});

/* Get call with logic to locate the post in the
   parameters url and then pass that to a logic for
   finding the matching object in the DB. */
app.get('/post/:blog', function (req, res){
    const blgPicker = new Promise ((resolve, reject) => {
        bPost.find({}, function(err, foundList){
            if(!err){
                resolve(foundList);
            } else {
                console.log('Nothing to find here!');
            }
        });
    });

    /* Uses the Promise resolve of the found items to
       locate the matching object in DB and pass the 
       data needed into the EJS view. */
    blgPicker.then((list) => {
        list.forEach(blgList => {
            if (blgList._id === req.params.blog) {
                res.render('post', {blogtitle: blgList.blgTitle, blogbody: blgList.blgBody, blogdate: blgList.blgDate});
            } else {}
        });
    });

    // Originally used an array for testing pre-db.
    // for (i=0; i < blgList.length; i++){
    //     if (blgList[i].key === req.params.blog) {
    //         res.render('post', {blogtitle: blgList[i].tlt, blogbody: blgList[i].bdy, blogdate: blgList[i].dte});
    //     } else {}
    // }
});

// Confirm the app server spin up.
app.listen(3000, function (){
    console.log("Server started on Port 3000.")
});