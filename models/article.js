const mongoose = require("mongoose")
const slugify = require('slugify')

const articleSchema = new mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    description: {
        type: String
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true
    }
})

articleSchema.pre('validate', function(next) {
    if(this.title) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true
        })
    }
    next()
})

module.exports = mongoose.model('Article', articleSchema)