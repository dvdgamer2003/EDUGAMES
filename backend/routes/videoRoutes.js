const express = require('express');
const {
    getVideos,
    getVideo,
    createVideo,
    updateVideo,
    deleteVideo
} = require('../controllers/videoController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getVideos)
    .post(authorize('teacher', 'admin'), createVideo);

router
    .route('/:id')
    .get(getVideo)
    .put(authorize('teacher', 'admin'), updateVideo)
    .delete(authorize('teacher', 'admin'), deleteVideo);

module.exports = router;
