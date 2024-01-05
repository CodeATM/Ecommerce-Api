const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    review: {
        type: String,
        required: [true, 'Rating is required']
    },
    rating: {
        type: Number,
        maxLength: [5, "Rating cannot be more than 5"],
        required: [true, 'Rating is required']
    }

})

module.exports = mongoose.model('Review',  reviewSchema)