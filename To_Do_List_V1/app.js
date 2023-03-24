//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

// Load this from a dot env instead.
const env_variable = '';

// Bringing in custom module and methods for dates.
const dayLong = require(__dirname + '/date.js');

// Objectify express.
const app = express();

// Initialize use and set cases for app.
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('static'));
app.set('view engine', 'ejs');

// Set Mongoose connection. Schema, model, and defaults for items.
// mongodb://127.0.0.1:27017/
mongoose.connect('mongodb+srv://YOURUSER:' + env_variable + '@YOURCLUSTER/todoDB');

const itemSchema = mongoose.Schema ({
    name: {
        type: String,
        required: [true, 'Must enter list item.']
    },
});

const item = mongoose.model('item', itemSchema);

const defaultItem1 = new item ({
    name: 'Welcome to the list!'
});
const defaultItem2 = new item ({
    name: 'Hit the plus sign to get started.'
});
const defaultArray = [defaultItem1, defaultItem2];

// Schema and model for lists creation.
const listSchema = mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const list = mongoose.model('list', listSchema);

/* App home routing. Designed to provide a homepage list
   that will deliver a different statement based on the day. 
   Also will find the DB array that contains the homepage list. */
app.get('/', function (req, res){
    if (dayLong.dayNumberToday() === 0 || dayLong.dayNumberToday() === 1) {
        item.find({}, function(err, founditems) {
            if(founditems.length === 0) {
                item.insertMany(defaultArray, function(err){
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Successfully inserted the default docs!');
                    }
                });
                res.redirect('/')
            } else {
                res.render('list', {listTitle: dayLong.dayToday(), state: "Your Chill List", newItem: founditems});
            }
        });
    } else {
        item.find({}, function(err, founditems) {
            if(founditems.length === 0) {
                item.insertMany(defaultArray, function(err){
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Successfully inserted the default docs!');
                    }
                });
                res.redirect('/')
            } else {
                res.render('list', {listTitle: dayLong.dayToday(), state: "Your To-Do List", newItem: founditems});
            }
        });
    }
});


/* Built in control flow logic to handle direction for more
   than one list and redirect accordingly. Toggling on the listName
   and checking for blank list items. */
app.post('/', function (req, res){
    const listName = req.body.list;
    const bulletVal = req.body.bp;
    const newBP = new item ({name: bulletVal});
    if (listName == dayLong.dayToday()) {
        if (bulletVal !== '') {
            newBP.save();
            res.redirect('/');
        } else {
            res.redirect('/');
        }
    } else {
        if (bulletVal !== '') {
            const Listy = new Promise((resolve, reject) => {
                list.findOne({name: listName}, function(err, foundList){
                foundList.items.push(newBP);
                foundList.save();
                resolve(true);
                })
            });
            Listy.then((d) => {
                res.redirect('/' + listName);
            });
        } else {
            res.redirect('/' + listName);
        }

    }
});

/* The delete route locates the item that has been checked
   for completion and deletes it from the DB collection. */
app.post('/delete', function (req, res){
    const comBP = {_id: req.body.selected};
    const comBPid = req.body.selected;
    const custName = req.body.list;
    if (custName == dayLong.dayToday()){
        item.deleteOne(comBP, function(err){
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    } else {
        list.findOneAndUpdate({name: custName},
        {$pull: {items:{_id: comBPid}}},
        function(err){
            if(err){
                console.log(err);
            } else {
                res.redirect('/' + custName);
            }
        });
    }
});

/* This get route is designed to take any word entered
   for a custom list and create the corresponding 
   resources need in the DB before rendering the view. */
app.get('/:list', function (req, res){
    const customList = _.capitalize(req.params.list);
    list.findOne({name: customList}, function(err, foundList) {
        if(!err) {
            if(!foundList){
                const listCustom = new list({
                    name: customList,
                    items: defaultArray
                });
                listCustom.save();
                res.redirect('/' + customList);
            } else {
                res.render('list', {listTitle: `${foundList.name} List`, state: "Your Custom List", newItem: foundList.items});
            }
        } else {
            res.redirect('/' + customList);
        }
    });
});

// This directs to the About page.
app.get('/about', function (req, res){
    res.render('about');
});

// App initializer with confirm message.
app.listen(3000, function (){
    console.log("Server started on Port 3000.")
});
