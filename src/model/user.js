const mongoose = require("mongoose")
const findOrCreate = require("mongoose-findorcreate")

const Schema = mongoose.Schema

const userSchema = new Schema({
    _id: {
        type: mongoose.ObjectId
    },
    email : {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    friend_ids : {
        type: [String]
    },
    googleId: {
        type: String,
        default: undefined
    },
    facebook: {
        type: String,
        default: undefined
    }
})

userSchema.plugin(findOrCreate)
const User = mongoose.model("user", userSchema)

module.exports = User;