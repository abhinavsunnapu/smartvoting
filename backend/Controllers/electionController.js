const electionModel = require('../Models/ElectionModel')
const BallotModel = require('../Models/BallotModel')
const { sendElectionNotification } = require('../utils/emailUtils')


const createElection = async (req, res) => {
    const { title, description, type, status, startDate, endDate, candidates, allowedVoters, faceVerificationRequired } = req.body
    try {
        if (!title || !startDate || !endDate) {
            return res.status(400).json({ message: "Title,StartDate and EndDate are required" })
        }
        const election = await electionModel.create({
            title,
            description,
            type: type || 'election',
            status: status || 'draft',
            startDate,
            endDate,
            candidates: candidates || [],
            allowedVoters: allowedVoters || [],
            adminId: req.user.id,
            faceVerificationRequired: faceVerificationRequired !== undefined ? faceVerificationRequired : false
        })

        // Trigger emails in background if created as active
        if (election.status === 'active') {
            if (election.allowedVoters && election.allowedVoters.length > 0) {
                const voterEmails = election.allowedVoters.map(v => v.email);
                console.log(`🚀 Starting background email dispatch for ${voterEmails.length} voters...`);
                console.log(`Target emails: ${voterEmails.join(', ')}`);
                
                (async () => {
                    const results = await Promise.allSettled(
                        voterEmails.map(async (email) => {
                            const success = await sendElectionNotification(email, election);
                            if (success) {
                                console.log(`✅ Mail delivered to ${email}`);
                            } else {
                                console.log(`❌ Mail FAILED for ${email}`);
                            }
                            return success;
                        })
                    );
                    
                    const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
                    const failed = results.length - successful;
                    console.log(`📢 Email Dispatch Summary: ${successful} sent, ${failed} failed.`);
                })();
            } else {
                console.log("ℹ️ No voters were found for this active election. Skipping email dispatch.");
            }
        }

        res.status(201).json(election)
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

const getElections = async (req, res) => {
    try {
        const elections = await electionModel.find({ adminId: req.user.id }).sort({ createdAt: -1 })
        
        const now = new Date();
        const processedElections = await Promise.all(
            elections.map(async (election) => {
                if (election.status === 'active' && now > new Date(election.endDate)) {
                    election.status = 'closed';
                    await election.save();
                }
                return election;
            })
        );

        res.status(200).json(processedElections);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message })
    }
}

const getElectionById = async (req, res) => {
    try {
        const election = await electionModel.findOne({ _id: req.params.id, adminId: req.user.id });
        if (!election) return res.status(404).json({ message: 'Election Not Found' });
        
        const now = new Date();
        if (election.status === 'active' && now > new Date(election.endDate)) {
            election.status = 'closed';
            await election.save();
        }
        
        res.status(200).json(election);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const deleteElection = async (req, res) => {
    try {
        const election = await electionModel.findOneAndDelete({ _id: req.params.id, adminId: req.user.id })
        if (!election) return res.status(404).json({ message: 'Election Not Found' })
        res.status(200).json({ message: 'Election Deleted' })
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message })
    }
}



const getVoterElections = async (req, res) => {
    try {
        const userEmail = req.user.email;
        let elections = await electionModel.find({ 
            'allowedVoters.email': userEmail,
            status: { $ne: 'draft' } 
        }).sort({ endDate: 1 });

        const now = new Date();
        const processedElections = await Promise.all(
            elections.map(async (election) => {
                if (election.status === 'active' && now > new Date(election.endDate)) {
                    election.status = 'closed';
                    await election.save();
                }
                // Strip sensitive data before sending
                const safeElection = election.toObject();
                const voterData = safeElection.allowedVoters.find(v => v.email === userEmail);
                safeElection.userHasVoted = voterData ? voterData.hasVoted : false;
                delete safeElection.allowedVoters; // hide other voters
                
                return safeElection;
            })
        );
        res.status(200).json(processedElections);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const getVoterElectionById = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const election = await electionModel.findOne({ 
            _id: req.params.id,
            'allowedVoters.email': userEmail,
            status: { $ne: 'draft' }
        });
        
        if (!election) return res.status(404).json({ message: 'Election Not Found or Unauthorized' });
        
        const now = new Date();
        if (election.status === 'active' && now > new Date(election.endDate)) {
            election.status = 'closed';
            await election.save();
        }

        const safeElection = election.toObject();
        const voterData = safeElection.allowedVoters.find(v => v.email === userEmail);
        safeElection.userHasVoted = voterData ? voterData.hasVoted : false;
        
        // Hide total vote counts if election is active to prevent bias
        if (safeElection.status === 'active') {
            safeElection.candidates.forEach(c => delete c.voteCount);
        }
        
        delete safeElection.allowedVoters; // hide other voters
        
        res.status(200).json(safeElection);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const castVote = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { candidateId } = req.body;
        
        const election = await electionModel.findOne({ 
            _id: req.params.id,
            'allowedVoters.email': userEmail,
        });

        if (!election) return res.status(404).json({ message: 'Election Not Found or Unauthorized' });
        if (election.status !== 'active') return res.status(400).json({ message: 'Election is closed or not active' });
        
        const now = new Date();
        if (now < new Date(election.startDate)) {
            return res.status(400).json({ message: 'Voting has not started yet. Please wait until the start date.' });
        }
        if (now > new Date(election.endDate)) {
            election.status = 'closed';
            await election.save();
            return res.status(400).json({ message: 'Voting period has officially ended.' });
        }

        const voterObj = election.allowedVoters.find(v => v.email === userEmail);
        if (voterObj.hasVoted) return res.status(400).json({ message: 'You have already cast a ballot in this election.' });

        const candidate = election.candidates.find(c => c._id.toString() === candidateId);
        if (!candidate) return res.status(400).json({ message: 'Invalid candidate selection.' });

        const result = await electionModel.updateOne(
            { _id: req.params.id },
            { 
                $inc: { 'candidates.$[cand].voteCount': 1 },
                $set: { 'allowedVoters.$[voter].hasVoted': true }
            },
            {
                arrayFilters: [
                    { 'cand._id': candidateId },
                    { 'voter.email': userEmail }
                ]
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json({ message: 'Failed to record vote securely or vote was already cast.' });
        }

        // Secure Audit Log creation (Decoupled Anonymity)
        await BallotModel.create({
            electionId: election._id,
            candidateId: candidate._id,
            candidateName: candidate.name,
            timestamp: new Date()
        });

        res.status(200).json({ message: 'Vote securely recorded!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}
const activateElection = async (req, res) => {
    try {
        const election = await electionModel.findOne({ _id: req.params.id, adminId: req.user.id });
        if (!election) return res.status(404).json({ message: 'Election Not Found' });
        
        if (election.status !== 'draft') {
            return res.status(400).json({ message: 'Only draft elections can be activated' });
        }
        
        election.status = 'active';
        await election.save();

        // Trigger emails in background (don't await to keep response fast)
        if (election.allowedVoters && election.allowedVoters.length > 0) {
            const voterEmails = election.allowedVoters.map(v => v.email);
            console.log(`🚀 Starting background email dispatch for ${voterEmails.length} voters...`);
            console.log(`Target emails: ${voterEmails.join(', ')}`);
            
            // Using a simple async block to prevent blocking the controller response
            (async () => {
                const results = await Promise.allSettled(
                    voterEmails.map(async (email) => {
                        const success = await sendElectionNotification(email, election);
                        if (success) {
                            console.log(`✅ Mail delivered to ${email}`);
                        } else {
                            console.log(`❌ Mail FAILED for ${email}`);
                        }
                        return success;
                    })
                );
                
                const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
                const failed = results.length - successful;
                console.log(`📢 Email Dispatch Summary: ${successful} sent, ${failed} failed.`);
            })();
        } else {
            console.log("ℹ️ No voters were found for this election. Skipping email dispatch.");
        }

        res.status(200).json({ message: 'Election Activated', election });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}
const editElection = async (req, res) => {
    const { title, description, type, startDate, endDate, candidates, allowedVoters, faceVerificationRequired } = req.body;
    try {
        const election = await electionModel.findOne({ _id: req.params.id, adminId: req.user.id });
        if (!election) return res.status(404).json({ message: 'Election Not Found' });
        
        if (election.status !== 'draft') {
            return res.status(400).json({ message: 'Only draft elections can be edited' });
        }
        
        if (title) election.title = title;
        if (description !== undefined) election.description = description;
        if (type) election.type = type;
        if (startDate) election.startDate = startDate;
        if (endDate) election.endDate = endDate;
        if (candidates) election.candidates = candidates;
        if (allowedVoters) election.allowedVoters = allowedVoters;
        if (faceVerificationRequired !== undefined) election.faceVerificationRequired = faceVerificationRequired;
        
        await election.save();
        res.status(200).json({ message: 'Election Updated', election });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}
const getElectionBallots = async (req, res) => {
    try {
        const election = await electionModel.findOne({ _id: req.params.id, adminId: req.user.id });
        if (!election) return res.status(404).json({ message: 'Election Not Found' });
        
        const ballots = await BallotModel.find({ electionId: req.params.id }).sort({ timestamp: -1 });
        res.status(200).json(ballots);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

module.exports = { createElection, deleteElection, getElections, getElectionById, getVoterElections, getVoterElectionById, castVote, activateElection, editElection, getElectionBallots }