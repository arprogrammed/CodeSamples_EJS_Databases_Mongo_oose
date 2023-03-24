// jshint esversion:6

const mongoose = require('mongoose');
mongoose.connect('mongodb://YOURLOCAL/pplDB');

const pplSchema = mongoose.Schema ({
    name: {
        type: String,
        required: [true, 'Must enter name.']
    },
    age: {
        type: Number,
        min: 18,
        max: 115
    }
});

const orderSchema = mongoose.Schema ({
    orderNum: {
        type: Number,
        required: [true, 'Must enter a order number.']
    },
    orderStreet: {
        type: String,
        required: false
    },
    orderCity: {
        type: String,
        required: true
    },
    orderPerson: pplSchema
});

const Ppl = mongoose.model('person', pplSchema);
const Ord = mongoose.model('order', orderSchema);

let myRecord = [{name: 'Jone', age: 23},{name: 'Nome', age: 32}];

let myOrders = [{orderNum: 2598, orderStreet: '123 Some Pl', orderCity: 'Somewhere', orderPerson: myRecord[1]},{orderNum: 3098, orderStreet: '1234 Some Pl', orderCity: 'Somewhere', orderPerson: myRecord[0]}];

// Inserting an array of person docs.
const pInsert = new Promise (function(resolve, reject) {Ppl.insertMany(myRecord, function (err){
    if (err) {
        console.log(err);
    } else {
        console.log('Successfully inserted ppl docs!');
        resolve(true);
    }
    });
});

// Inserting an array of order docs.
const oInsert = new Promise (function(resolve, reject) {pInsert.then(function() {
        Ord.insertMany(myOrders, function (err){
            if (err) {
                console.log(err);
            } else {
                console.log('Successfully inserted order docs!');
                resolve(true);
            }
        });
    });
});

oInsert.then(function() {
    Ord.find({}, function(err, docs){
        console.log(docs)
        if (err) {
            console.log('No ppl or database.');
        } else {
            docs.forEach(function(doc){
                console.log(doc.orderPerson.name);
            });
            mongoose.connection.close();
        }
    });
});

// Ppl.updateOne({name: 'Jone'}, {name: 'Jane'}, function(err){
//     if (err) {
//         console.log('Could not update.')
//     } else {
//         console.log('Document updated!')
//     }
// });


// Ppl.deleteOne({name: 'Jane'}, function(err){
//     if (err) {
//         console.log('Failed to delete document.');
//     } else {
//         console.log('Deleted Jane!')
//     }
// });


// Finding objects with the callback.
// Ppl.find(function(err, docs){
//     if (err) {
//         console.log('No ppl or database.');
//     } else {
//         mongoose.connection.close();
//         docs.forEach(function(doc){
//             console.log(doc.name);
//         });
//     }
// });