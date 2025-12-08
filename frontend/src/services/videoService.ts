import api from './api';

export interface Video {
    _id: string;
    title: string;
    url: string;
    videoId: string;
    description?: string;
    class: number;
    subject: string;
    thumbnail?: string;
    createdAt: string;
    createdBy: string;
}

const videoService = {
    // Get all videos (filtered by query params like class, subject)
    getVideos: async (params?: any) => {
        try {
            const response = await api.get('/videos', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching videos:', error);
            throw error;
        }
    },

    // Get a singe video by ID
    getVideo: async (id: string) => {
        try {
            const response = await api.get(`/videos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching video ${id}:`, error);
            throw error;
        }
    },

    // Create a new video (Teacher/Admin)
    createVideo: async (videoData: Partial<Video>) => {
        try {
            const response = await api.post('/videos', videoData);
            return response.data;
        } catch (error) {
            console.error('Error creating video:', error);
            throw error;
        }
    },

    // Update a video
    updateVideo: async (id: string, videoData: Partial<Video>) => {
        try {
            const response = await api.put(`/videos/${id}`, videoData);
            return response.data;
        } catch (error) {
            console.error(`Error updating video ${id}:`, error);
            throw error;
        }
    },

    // Delete a video
    deleteVideo: async (id: string) => {
        try {
            const response = await api.delete(`/videos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting video ${id}:`, error);
            throw error;
        }
    }
};

export default videoService;
