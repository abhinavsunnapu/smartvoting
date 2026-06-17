import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import API_ENDPOINTS from "../config/api";
import NavBar from "../components/NavBar";
import ProfileModal from "../components/ProfileModal";
import FaceVerificationModal from "../components/FaceVerificationModal";
import VoteConfirmationModal from "../components/VoteConfirmationModal";
import Footer from "../components/Footer";
import { SkeletonLoader, ButtonSpinner } from "../components/Spinners";

const VoterElectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { error, success } = useToast();

  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [voteConfirmationOpen, setVoteConfirmationOpen] = useState(false);
  const [faceVerificationOpen, setFaceVerificationOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchVoterElection = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.VOTER_ELECTIONS_GET_BY_ID(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch ballot");
        setElection(data);
      } catch (err) {
        error(err.message);
        navigate("/voter-dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchVoterElection();
  }, [id, token, error, navigate]);

  const handleCastVoteClick = (e) => {
    e.preventDefault();
    if (!selectedCandidate) {
      error("Please select a candidate before casting your vote.");
      return;
    }
    setVoteConfirmationOpen(true);
  };

  const handleConfirmVote = () => {
    setVoteConfirmationOpen(false);
    if (election.faceVerificationRequired) {
      setFaceVerificationOpen(true);
    } else {
      handleFaceVerificationSuccess();
    }
  };

  const handleFaceVerificationSuccess = async () => {
    setFaceVerificationOpen(false);
    setSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.VOTE_CAST(id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId: selectedCandidate }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit ballot");

      success("Your ballot has been securely locked and recorded!");
      setElection({ ...election, userHasVoted: true });
    } catch (err) {
      error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
        <NavBar onProfileClick={() => setProfileModalOpen(true)} />
        <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
          <SkeletonLoader count={3} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!election) return null;

  const isActive = election.status === "active";
  const hasVoted = election.userHasVoted;
  const isClosed = election.status === "closed";

  const now = new Date();
  const startDate = new Date(election.startDate);
  const isUpcoming = isActive && now < startDate;
  const canVote = isActive && !isUpcoming && !hasVoted;

  // Identify Winners if closed
  let winners = [];
  let isDraw = false;
  let candidatesSorted = [...election.candidates];
  if (isClosed) {
    candidatesSorted = candidatesSorted.sort(
      (a, b) => b.voteCount - a.voteCount,
    );
    if (candidatesSorted.length > 0 && candidatesSorted[0].voteCount > 0) {
      const maxVotes = candidatesSorted[0].voteCount;
      winners = candidatesSorted.filter((c) => c.voteCount === maxVotes);
      isDraw = winners.length > 1;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <NavBar onProfileClick={() => setProfileModalOpen(true)} />

      <main className="flex-1 px-4 sm:px-8 py-8 w-full max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/voter-dashboard")}
          className="text-gray-500 hover:text-[#00263A] transition font-medium text-sm mb-6 flex items-center gap-2"
        >
          ← Back to My Ballots
        </button>

        {/* Status Notice Block */}
        {isClosed && (
          <div className="mb-6 w-full p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-semibold flex items-center gap-3">
            <span className="text-xl">⏱️</span>
            The voting period for this election has officially ended.
          </div>
        )}
        {isActive && hasVoted && (
          <div className="mb-6 w-full p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 font-semibold flex items-center gap-3">
            <span className="text-xl">✅</span>
            Your ballot has been successfully received and securely validated.
          </div>
        )}
        {isUpcoming && (
          <div className="mb-6 w-full p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-semibold flex items-center gap-3">
            <span className="text-xl">⏳</span>
            This election will open for voting on {startDate.toLocaleString()}.
            Check back later!
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-10 mb-8">
          <h1 className="text-3xl font-bold text-[#00263A] mb-2">
            {election.title}
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed max-w-2xl">
            {election.description}
          </p>

          <div className="h-px bg-gray-100 w-full mb-8"></div>

          {/* Voting Logic (Active & Not Voted) */}
          {canVote && (
            <form onSubmit={handleCastVoteClick}>
              <h2 className="text-xl font-bold text-[#262D34] mb-4">
                Official Ballot Choices
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Please carefully select a single option below.
              </p>

              <div className="flex flex-col gap-4 mb-8">
                {election.candidates.map((candidate) => (
                  <label
                    key={candidate._id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border-2 transition cursor-pointer
                                            ${selectedCandidate === candidate._id ? "border-[#F28A36] bg-[#fffaf5] shadow-sm" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="candidate"
                        value={candidate._id}
                        checked={selectedCandidate === candidate._id}
                        onChange={() => setSelectedCandidate(candidate._id)}
                        className="w-5 h-5 accent-[#F28A36]"
                      />
                      <div className="flex flex-col">
                        <span
                          className={`text-lg font-bold ${selectedCandidate === candidate._id ? "text-[#00263A]" : "text-gray-700"}`}
                        >
                          {candidate.name}
                        </span>
                        {candidate.party && (
                          <span className="text-sm text-gray-400 font-semibold tracking-wider mt-0.5">
                            {candidate.party}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedCandidate}
                className={`w-full sm:w-auto px-10 py-4 font-bold text-lg rounded-xl flex justify-center items-center gap-3 transition shadow-md
                                    ${submitting || !selectedCandidate ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#00263A] text-white hover:bg-[#001a28] cursor-pointer"}`}
              >
                {submitting && <ButtonSpinner size="sm" />}
                {submitting ? "Encrypting Ballot..." : "Cast Final Vote"}
              </button>
            </form>
          )}

          {/* Results Logic (Closed) */}
          {isClosed && (
            <div>
              <h2 className="text-xl font-bold text-[#262D34] mb-6">
                Final Election Results
              </h2>

              {winners.length > 0 && (
                <div
                  className={`mb-8 p-6 border rounded-xl flex items-center justify-between ${isDraw ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200" : "bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200"}`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`text-xs font-bold uppercase tracking-widest mb-1 ${isDraw ? "text-indigo-500" : "text-orange-500"}`}
                    >
                      {isDraw ? "Declared Draw (Tie)" : "Declared Winner"}
                    </span>
                    <span className="text-2xl font-black text-[#00263A]">
                      {winners.map((w) => w.name).join(", ")}
                    </span>
                  </div>
                  <span className="text-5xl drop-shadow-sm">
                    {isDraw ? "🤝" : "👑"}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {candidatesSorted.map((c, index) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between px-6 py-4 border border-gray-100 rounded-lg bg-[#FAFAFA]"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 font-bold ml-1 w-4">
                        {index + 1}.
                      </span>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-lg">
                          {c.name}
                        </span>
                        {c.party && (
                          <span className="text-xs font-medium text-gray-400">
                            {c.party}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#00263A] leading-none block">
                        {c.voteCount}
                      </span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Votes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active but Voted Already (Pending Close) */}
          {isActive && hasVoted && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <span className="text-6xl mb-4">🔐</span>
              <h3 className="text-[#262D3A] font-bold text-2xl mb-2">
                Vote Secured
              </h3>
              <p className="text-gray-500 max-w-md">
                You have successfully voted in this election. The exact results
                are strictly encrypted and hidden until the election officially
                closes on {new Date(election.endDate).toLocaleString()}.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
      />
      <VoteConfirmationModal
        isOpen={voteConfirmationOpen}
        onClose={() => setVoteConfirmationOpen(false)}
        onConfirm={handleConfirmVote}
        selectedCandidate={election.candidates.find(
          (c) => c._id === selectedCandidate,
        )}
        loading={submitting}
      />
      <FaceVerificationModal
        isOpen={faceVerificationOpen}
        onClose={() => setFaceVerificationOpen(false)}
        onSuccess={handleFaceVerificationSuccess}
      />
    </div>
  );
};

export default VoterElectionDetails;
