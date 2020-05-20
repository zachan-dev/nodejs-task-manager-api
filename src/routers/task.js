const express = require('express');
const Task = require('../models/task');
const authMiddleware = require('../middleware/auth');

const router = new express.Router();

router.get('/tasks/test', (req, res) => {
    res.send('This is from a new file');
});

/* Tasks */

//Create Tasks, Private
router.post('/tasks', authMiddleware, async (req, res) => {
    const task = new Task({
        ...req.body, //ES6: (...) copy all properties to this object
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }

    // task.save().then(() => {
    //     res.status(201).send(task);
    // }).catch((e) => {
    //     res.status(400).send(e);
    // });
});

//Read all tasks, Private
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', authMiddleware, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) { // ?completed
        match.completed = req.query.completed == 'true';
    }

    if (req.query.sortBy) { // ?sortBy
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1: 1;
    }

    try {
        //const tasks = await Task.find({ owner: req.user._id }); //or
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }

    // Task.find({}).then((tasks) => {
    //     res.send(tasks);
    // }).catch((e) => {
    //     res.status(500).send();
    // });
});

//Read task by id, Private
router.get('/tasks/:id', authMiddleware, async (req, res) => {
    const _id = req.params.id;

    try {
        //const task = await Task.findById(_id);
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }

    // Task.findById(_id).then((task) => {
    //     if (!task) {
    //         return res.status(404).send();
    //     }
    //     res.send(task);
    // }).catch((e) => {
    //     res.status(500).send();
    // });
});

//Update task by id, Private
router.patch('/tasks/:id', authMiddleware, async (req, res) => {
    const _id = req.params.id;

    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' });
    }

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });

        // const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

//Delete task by id, Private
router.delete('/tasks/:id', authMiddleware, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
        //const task = await Task.findByIdAndDelete(_id);
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;