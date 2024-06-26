import { Types } from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user._id

    // Get total video views count
    const totalVideoViews = await Video.aggregate([
        {
            $match: {
                owner: new Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalVideoViews: {
                    $sum: "$views"
                }
            }
        }
    ]);

    // Get total subscribers
    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new Types.ObjectId(userId)
            }
        },
        {
            $count: "totalSubscribers"
        }
    ]);

    // Get total videos count
    const totalVideos = await Video.aggregate([
        {
            $match: {
                owner: new Types.ObjectId(userId)
            }
        },
        {
            $count: "totalVideos"
        }
    ]);

    // Get total likes count for videos and tweets
    const totalLikes = Like.aggregate([
        {
            $match: {
                owner: new Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalVideoLikes: {
                    $sum: {
                        $cond: [
                            { $ifNull: ["$video", false] },
                            1,
                            0
                        ]
                    }
                },
                totalTweetLikes: {
                    $sum: {
                        $cond: [
                            { $ifNull: ["$tweet", false] },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ])

    const stats = {
        totalVideoViews: totalVideoViews[0]?.totalVideoViews || 0,
        totalSubscribers: totalSubscribers[0]?.totalSubscribers || 0,
        totalVideos: totalVideos[0]?.totalVideos || 0,
        totalLikes: totalLikes[0]
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            { stats },
            "Channel stats fetched successfully"
        ))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const userId = req.user._id

    const videos = await Video.find({ owner: userId })

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        { videos },
        "Channel videos fetched successfully"
    ))

})

export {
    getChannelStats,
    getChannelVideos
}