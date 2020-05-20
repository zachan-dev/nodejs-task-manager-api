const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

//File upload middleware
// const multer = require('multer');
// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000 // 500 MulterError: File too large
//     },
//     fileFilter(req, file, cb) {
//         // regex \.(doc|docx)$
//         if (!file.originalname.match(/\.(doc|docx)$/)) {
//             return cb(new Error('Please upload a Word document'));
//         }

//         // if (!file.originalname.endsWith('.pdf')) {
//         //     return cb(new Error('Please upload a PDF'));
//         // }

//         cb(undefined, true);

//         // cb(new Error('File must be a PDF')); // M1
//         // cb(undefined, true); // M2
//         // cb(undefined, false); // never used
//     }
// });
// const errorMiddleware = (req, res, next) => {
//     throw new Error('From my middleware');
// };
// //upload.single('upload')
// app.post('/upload', upload.single('upload'), (req, res) => { // form-data, key has to equal to "upload"
//     res.send();
// }, (error, req, res, next) => { //4-arg function to handle errors, parse to json
//     res.status(400).send({ error: error.message });
// });

//Express Middleware for disabling all GET requests
// app.use((req, res, next) => {
//     // console.log(req.method, req.path); //e.g. POST /user/login
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled');
//     }
//     else {
//         next();
//     }
// });

//Express Middleware for enabling Maintenance Mode
// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down. Check back soon!'); // 503: Service unavailable
// });


app.use(express.json());
app.use(userRouter); // register the router in the app
app.use(taskRouter);

app.listen(port, () => console.log(`Web server is up on ${port}`));

//relationship between task and user, ref and virtual in both models
// const Task = require('./models/task');
// const User = require('./models/user');

// const main = async () => {
//     // const task = await Task.findById('5ec2a77850a3854d3491786d');
//     // await task.populate('owner').execPopulate(); // owner ObjectId has a ref to the user
//     // console.log(task.owner); // get back the owner object

//     const user = await User.findById('5ec2a610fa6a3ba0cc76ab55');
//     await user.populate('tasks').execPopulate();
//     console.log(user.tasks);
// };

// main();


//override toJSON method
// const pet = {
//     name: 'Hal'
// };

// pet.toJSON = function() {
//     return {};
// }

// console.log(JSON.stringify(pet));



//authentication
// const jwt = require('jsonwebtoken');

// const myFunction = async () => {
//     const token = jwt.sign({ _id: 'abc123' }, process.env.JWT_SECRET, { expiresIn: '1 minute' });
//     console.log(token);

//     const data = jwt.verify(token, process.env.JWT_SECRET); 
//     //if secret not match, UnhandledPromiseRejectionWarning: JsonWebTokenError: invalid signature
//     //if token expired, TokenExpiredError: jwt expired
//     console.log(data);
// };

// myFunction();



//password hashing
// const bcrypt = require('bcryptjs');

// const myFunction = async () => {
//     const password = "control_123";
//     const hashedPassword = await bcrypt.hash(password, 8); // 8 nice balance for security and speed

//     console.log(password);
//     console.log(hashedPassword);

//     const isMatch = await bcrypt.compare('control_123', hashedPassword);
//     console.log(isMatch);
// };

// myFunction();