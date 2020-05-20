const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

const router = new express.Router();

router.get('/users/test', (req, res) => {
    res.send('This is from a new file');
});

/* Users */

//Create Users, Public
router.post('/users', async (req, res) => { //async: express does not care what w return in the function
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name); // no need to await send email to finish
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }

    // user.save().then(() => {
    //     res.status(201).send(user);
    // }).catch((e) => {
    //     res.status(400).send(e);
    // });
});

//Login User, Public
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});

//Logout User, Private
router.post('/users/logout', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// Logout all sessions for the User, Private
router.post('/users/logoutAll', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});


//Read the curently authenticated user, Private
router.get('/users/me', authMiddleware, async (req, res) => {
    res.send(req.user);
    //for all users
    // try {
    //     const users = await User.find({});
    //     res.send(users);
    // } catch (e) {
    //     res.status(500).send();
    // }

    // User.find({}).then((users) => {
    //     res.send(users);
    // }).catch((e) => {
    //     res.status(500).send(); //server down
    // });
});

//Read user by id, Public, Banned
// router.get('/users/:id', async (req, res) => { //route params: ':id'
//     //res.send(req.params); // for route params
//     const _id = req.params.id;

//     try {
//         const user = await User.findById(_id);
//         if (!user) {
//             return res.status(404).send(); //not found if user is undefined
//         }
//         res.send(user);
//     } catch (e) {
//         res.status(500).send();
//     }

//     // User.findById(_id).then((user) => {
//     //     if (!user) {
//     //         return res.status(404).send(); //not found if user is undefined
//     //     }
//     //     res.send(user);
//     // }).catch((e) => {
//     //     res.status(500).send(); //server down or invalid id
//     // });
// });

//Update user by id, Private
router.patch('/users/me', authMiddleware, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' });
    }

    try {
        //allow Middleware
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
});

//Delete current user, Private
router.delete('/users/me', authMiddleware, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

const upload = multer({
    //dest: 'avatar', // to fileSystem
    limits: {
        fileSize: 1024 * 1024 // 1MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image.'))
        }
        cb(undefined, true);
    }
});

//Upload new profile pic for the current user, Private
router.post('/users/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    //req.file.buffer; // provided only when dest is not provided
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer(); //use sharp to resize, convert to png
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

//Remove the profile pic of the current user, Private
router.delete('/users/me/avatar', authMiddleware, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

//Fetching the profile pic of the current user, Public
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/jpg'); // set header
        res.send(user.avatar);

    } catch (e) {
        res.status(404).send();
    }
});

module.exports = router;