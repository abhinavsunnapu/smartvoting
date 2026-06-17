import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import API_ENDPOINTS from "../config/api";
import NavBar from "../components/NavBar";
import ProfileModal from "../components/ProfileModal";
import Footer from "../components/Footer";
import { SkeletonLoader } from "../components/Spinners";

const VoterDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { error, success } = useToast();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchVoterElections = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.VOTER_ELECTIONS_GET_ALL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok)
          throw new Error(data.message || "Failed to fetch your elections");
        setElections(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchVoterElections();
  }, [token, error]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const activeElections = elections.filter((e) => e.status === "active");
  const closedElections = elections.filter((e) => e.status === "closed");

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar onProfileClick={() => setProfileModalOpen(true)} />

      <main className="flex-1 bg-[#FAFAFA] px-4 sm:px-8 py-8 w-full">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div>
              <h1 className="inter-font text-[32px] font-bold text-[#262D34] mb-2">
                Voter Dashboard
              </h1>
              <p className="inter-font text-gray-600">
                Welcome back,{" "}
                <span className="font-semibold">{user?.name}</span>. Here are
                your assigned elections.
              </p>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader count={3} />
          ) : elections.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-2xl font-bold text-[#00263A] mb-2">
                No Active Ballots
              </h2>
              <p className="text-gray-500 max-w-sm mx-auto">
                You currently have no assigned elections. When administrators
                add your email address to a live election, it will automatically
                appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {/* Active Elections Box */}
              {activeElections.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-[#262D3A] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Open for Voting
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeElections.map((election) => (
                      <div
                        key={election._id}
                        className="bg-white border-2 border-green-50 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-[#00263A] text-xl">
                              {election.title}
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-green-100 text-green-700">
                              Live
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-6">
                            {election.description || "Official Election Ballot"}
                          </p>

                          <div className="flex flex-col gap-1 mb-6 text-sm">
                            <span className="text-gray-400">
                              <strong>Closes:</strong>{" "}
                              {formatDate(election.endDate)}
                            </span>
                          </div>
                        </div>

                        {election.userHasVoted ? (
                          <div className="w-full text-center py-3 bg-gray-100/50 border border-gray-200 text-gray-500 rounded-lg font-bold text-sm">
                            ✅ Ballot Submitted
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              navigate(
                                `/voter-dashboard/election/${election._id}`,
                              )
                            }
                            className="w-full py-3 bg-[#00263A] text-white rounded-lg font-semibold hover:bg-[#001a28] transition shadow-md"
                          >
                            Vote Now ➔
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Closed Elections Box */}
              {closedElections.length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <h2 className="text-lg font-bold text-gray-400 mb-4 flex items-center gap-2">
                    ⏱️ Past Elections
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {closedElections.map((election) => (
                      <div
                        key={election._id}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col justify-between"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-1">
                            {election.title}
                          </h3>
                          <p className="text-xs text-gray-400 mb-4">
                            Ended: {formatDate(election.endDate)}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            navigate(
                              `/voter-dashboard/election/${election._id}`,
                            )
                          }
                          className="w-full py-2 bg-white border border-gray-300 text-gray-600 rounded font-medium text-sm hover:bg-gray-100 transition"
                        >
                          View Results
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
    </div>
  );
};

export default VoterDashboard;
