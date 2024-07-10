const mongoose = require("mongoose");

const userworkSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        workStats: {
            type: Object,
            required: true,
            default: {
                work_success: 0,
                work_fail: 0,
                work_highstreak: 0,
            },
        },
        workCurrent: {
            type: Object,
            required: true,
            default: {
                jobNumber: null,
                reputation: null,
                work_cooldown: null,
                work_fail: null,
                work_success: null,
                work_promotions: null,
            },
        },
        workData: {
            type: Object,
            required: true,
            default: {
                rating: 100,
                workExperience: 0,
                knowledgePoints: 0,
            },
        },
        createdAt: {
            type: Number,
            default: Date.now(),
        },
    },
    { minimize: false }
);

const model = mongoose.model("Userworks", userworkSchema);

module.exports = model;
