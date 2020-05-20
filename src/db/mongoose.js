const mongoose = require('mongoose'); // built based on mongodb
//const validator = require('validator');
//const User = require('../models/user');
//const Task = require('../models/task');

const connectionURL = process.env.MONGODB_URL; // use slash database name

mongoose.connect(connectionURL, { 
    useUnifiedTopology: true, 
    useNewUrlParser: true,
    useCreateIndex: true, // for mongoose
    useFindAndModify: false // for mongoose, find and update function
});

// const me = new User({
//     name: 'Zach',
//     age: 'Mike' // <-- error
// });

// me.save().then((me) => {
//     console.log(me);
//     // me.__v is the version of the document e.g. 0
// }).catch((error) => {
//     console.log('Error!', error._message);
//     // error: Validation object
//     // error._message returns error message
// });

// const user = new User({
//     name: 'XXX',
//     email: 'XXX@EXAMPLE.COM.HK    ',
//     password: 'PASSWORD'
// });

// user.save().then(() => {
//     console.log(user);
// }).catch((error) => {
//     for (var prop in error.errors) {
//         if (error.errors.hasOwnProperty(prop)) {
//             console.log('Error!', error.errors[prop].properties.message);
//         }
//     }
//     // if (error.errors.name) console.log('Error!', error.errors.name.properties.message);
//     // if (error.errors.email) console.log('Error!', error.errors.email.properties.message);
//     // if (error.errors.age) console.log('Error!', error.errors.age.properties.message);
//     // error.errors.{{prop}}.properties.message
// });


// const myTask = new Task({
//     description: 'Udemy C#'
// });

// myTask.save().then(() => {
//     console.log(myTask);
// }).catch((error) => {
//     for (var prop in error.errors) {
//         if (error.errors.hasOwnProperty(prop)) {
//             console.log('Error!', error.errors[prop].properties.message);
//         }
//     }
//     //console.log(`Error: ${error._message}`);
// });