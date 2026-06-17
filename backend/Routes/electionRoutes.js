const express = require("express");
const {
  createElection,
  deleteElection,
  getElections,
  getElectionById,
  getVoterElections,
  getVoterElectionById,
  castVote,
  activateElection,
  editElection,
  getElectionBallots,
} = require("../Controllers/electionController");
const { protect } = require("../Middleware/AuthMiddleWare");
const { adminOnly } = require("../Middleware/roleMiddleware");
const {
  validateCreateElection,
  validateCastVote,
} = require("../Middleware/validationMiddleware");
const router = express.Router();

router.post("/", protect, adminOnly, validateCreateElection, createElection);
router.get("/", protect, getElections);
router.get("/voter", protect, getVoterElections);
router.get("/voter/:id", protect, getVoterElectionById);
router.get("/:id", protect, getElectionById);
router.get("/:id/ballots", protect, getElectionBallots);
router.post("/:id/vote", protect, validateCastVote, castVote);
router.put("/:id/activate", protect, adminOnly, activateElection);
router.put("/:id", protect, adminOnly, validateCreateElection, editElection);
router.delete("/:id", protect, adminOnly, deleteElection);

module.exports = router;
