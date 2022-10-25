const mongoose = require("mongoose");

const Schema = mongoose.Schema;


const wishlistSchema = new Schema({
    _id: {
      type: mongoose.ObjectId
    },
    name: {
        type: String,
        required: true,
        unique: false
    },
    fields: {
        type: [String],
        default: undefined
    },
    user: String
})

function modifyWishlistSchema(fields){
    console.log('modifyWishlistSchema' + JSON.stringify(fields))
    const content = new Schema({})
    if(fields.length > 0) {
        let fieldsObj = {}
        fields.forEach((element => {
            fieldsObj[element] = 'string'
        }))
        content.add(fieldsObj)
        wishlistSchema.add({content: [content]})
        console.log(JSON.stringify(wishlistSchema))
    }
}

const Wishlist = mongoose.model("wishlist", wishlistSchema)

module.exports = Wishlist;
module.exports.modifyWishlistSchema = modifyWishlistSchema