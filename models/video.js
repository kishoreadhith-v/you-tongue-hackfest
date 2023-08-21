const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    videoId : {
        type: String,
        required: true
    },
    title : {
        type: String,
        required: true
    },
    author : {
        type: String,
        required: true
    },
    length : {
        type: Number,
        required: true
    },
    tlExists : {
        type: Boolean,
        required: true
    },
    tl : {
        type: String,
        required: false
    },
    subExists : {
        type: Boolean,
        required: true
    },
    subtitles : {
        type: String,
        required: false
    },
}, { timestamps: true });

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;