const Video = require('../models/Video');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all videos
// @route   GET /api/videos
// @access  Private
exports.getVideos = asyncHandler(async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Video.find(JSON.parse(queryStr)).sort('-createdAt');

    // Executing query
    const videos = await query;

    res.status(200).json({
        success: true,
        count: videos.length,
        data: videos
    });
});

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
exports.getVideo = asyncHandler(async (req, res, next) => {
    const video = await Video.findById(req.params.id);

    if (!video) {
        return next(new ErrorResponse(`Video not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: video
    });
});

// @desc    Create new video
// @route   POST /api/videos
// @access  Private (Teacher/Admin)
exports.createVideo = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Extract Video ID from URL if not provided
    if (!req.body.videoId && req.body.url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = req.body.url.match(regExp);
        if (match && match[2].length === 11) {
            req.body.videoId = match[2];
            // Auto-generate thumbnail if not provided
            if (!req.body.thumbnail) {
                req.body.thumbnail = `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
            }
        } else {
            return next(new ErrorResponse('Invalid YouTube URL', 400));
        }
    }

    const video = await Video.create(req.body);

    res.status(201).json({
        success: true,
        data: video
    });
});

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private (Teacher/Admin)
exports.updateVideo = asyncHandler(async (req, res, next) => {
    let video = await Video.findById(req.params.id);

    if (!video) {
        return next(new ErrorResponse(`Video not found with id of ${req.params.id}`, 404));
    }

    // specific permissions check if needed in future (e.g. only owner can update)

    video = await Video.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: video
    });
});

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private (Teacher/Admin)
exports.deleteVideo = asyncHandler(async (req, res, next) => {
    console.log(`Attempting to delete video with ID: ${req.params.id}`);

    const video = await Video.findByIdAndDelete(req.params.id);

    if (!video) {
        console.log(`Video not found with ID: ${req.params.id}`);
        return next(new ErrorResponse(`Video not found with id of ${req.params.id}`, 404));
    }

    console.log(`Video deleted successfully: ${req.params.id}`);

    res.status(200).json({
        success: true,
        data: {}
    });
});
