const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a video title']
    },
    url: {
        type: String,
        required: [true, 'Please add a YouTube URL']
    },
    videoId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    class: {
        type: Number,
        required: [true, 'Please specify a class']
    },
    subject: {
        type: String,
        required: [true, 'Please specify a subject']
    },
    thumbnail: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Video', VideoSchema);
