const mongoose = require('mongoose'); // built based on mongodb
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = mongoose.Schema({ // collection name: automatically lowercased and pluralized => users
    name: {
        type: String,
        required: true, // data validation
        trim: true // data sanitization
    },
    email: {
        type: String,
        required: true,
        unique: true, // ensure not repeatable
        trim: true,
        lowercase: true,
        validate(value) { // custom validator
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid!');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) { // custom validator
            if (value < 0) {
                throw new Error('Age must be a positive number!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) { // custom validator
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain the word "password"!');
            }
        }
    },
    tokens: [{
        token : {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer // other validation is handled by multer
    }
}, {
    timestamps: true // enable createdAt and updatedAt
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

//overrided this special function that will be called each time as express is calling JSON.stringify() each time
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

//define own function for specific user, instance
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat( { token } );
    await user.save();

    return token;
};

//define own function for User collection, global
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login!');
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
        throw new Error('Unable to login!');
    }

    return user;
};

// Hash the plain text password before saving
userSchema.pre('save', async function (next) { // Middleware, cannot use arrow function to use this
    // bypassed in the second time if not restructured
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next(); // call next() when we are done
});

// Delete user's tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this;
    
    await Task.deleteMany({ owner: user._id });

    next();
});

//create a model, with a Schema
const User = mongoose.model('User', userSchema);

module.exports = User;