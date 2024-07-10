const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        jobNumber: {
            type: Number,
            required: true,
            unique: true,
        },
        jobId: {
            type: String,
            required: true,
            unique: true,
        },
        jobName: {
            type: String,
            required: true,
            unique: true,
        },
        jobCooldown: {
            type: Number,
            required: true,
            default: null,
        },
        jobPayments: {
            type: Object,
            required: true,
            default: {
                base: null,
                promotion_increase: null,
                bonus: null,
                max: null,
            },
        },
        jobExecute: {
            type: String,
            required: true,
            default: "",
        },
        jobRequirements: {
            type: Object,
            required: true,
            default: {
                workExperience: null,
                knowledgePoints: null,
                rating: null,
            },
        },
        jobData: { type: Object, required: true, default: {} },
        createdAt: {
            type: Number,
            default: Date.now(),
        },
    },
    { minimize: false }
);

const model = mongoose.model("Jobs", jobSchema);

module.exports = model;
