const mongoose = require('mongoose')

const electionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, default: 'election' },
    status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    candidates: [{
        name: { type: String, required: true },
        party: { type: String, default: '' },
        voteCount: { type: Number, default: 0 }
    }],
    allowedVoters: [{
        email: { type: String, required: true, lowercase: true, trim: true },
        hasVoted: { type: Boolean, default: false }
    }],
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    faceVerificationRequired: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('ElectionModel', electionSchema)