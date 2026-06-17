import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import API_ENDPOINTS from "../config/api";
import NavBar from "../components/NavBar";
import ProfileModal from "../components/ProfileModal";
import Footer from "../components/Footer";
import { SkeletonLoader, ButtonSpinner } from "../components/Spinners";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const StatusBadge = ({ status }) => {
  const styles = {
    draft: "bg-gray-100 text-gray-500 border border-gray-200",
    active: "bg-green-100 text-green-700 border border-green-200",
    closed: "bg-red-100 text-red-700 border border-red-200",
  };
  return (
    <span
      className={`inter-font text-xs font-semibold px-3 py-1 rounded-full capitalize ${styles[status] || styles.draft}`}
    >
      {status || "draft"}
    </span>
  );
};

const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-gray-500 font-medium inter-font">{title}</h3>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-3xl font-bold text-[#00263A] inter-font">
        {value}
      </span>
      <span className="text-sm text-gray-400 mt-1">{subtitle}</span>
    </div>
  </div>
);

const ElectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { error } = useToast();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [ballots, setBallots] = useState([]);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (showLogs && ballots.length === 0) {
      const fetchBallots = async () => {
        try {
          const res = await fetch(API_ENDPOINTS.ELECTIONS_GET_BALLOTS(id), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            setBallots(await res.json());
          }
        } catch (err) {
          console.error("Failed to fetch ballots");
        }
      };
      fetchBallots();
    }
  }, [showLogs, id, token, ballots.length]);

  useEffect(() => {
    const fetchElectionDetails = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.ELECTIONS_GET_BY_ID(id), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch election context");
        }

        const data = await res.json();
        setElection(data);
      } catch (err) {
        error(err.message || "Error loading election details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchElectionDetails();
  }, [id, token, error, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
        <NavBar onProfileClick={() => setProfileModalOpen(true)} />
        <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <SkeletonLoader count={3} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!election) return null;

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const totalVoters = election.allowedVoters?.length || 0;
  const votedCount =
    election.allowedVoters?.filter((v) => v.hasVoted).length || 0;
  const pendingCount = totalVoters - votedCount;
  const turnoutPercentage =
    totalVoters === 0 ? 0 : Math.round((votedCount / totalVoters) * 100);

  // Color palette for charts
  const COLORS = [
    "#00263A",
    "#F28A36",
    "#3b82f6",
    "#10b981",
    "#f43f5e",
    "#8b5cf6",
    "#f59e0b",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <NavBar onProfileClick={() => setProfileModalOpen(true)} />

      <main className="flex-1 px-4 sm:px-8 py-8 w-full max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-500 hover:text-[#00263A] transition font-medium text-sm mb-6 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#00263A] inter-font">
                  {election.title}
                </h1>
                <StatusBadge status={election.status} />
              </div>
              <p className="text-gray-500 max-w-3xl leading-relaxed">
                {election.description || "No description provided."}
              </p>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-6">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Start Date
                  </span>
                  <span className="text-sm text-[#262D3A] font-medium">
                    {formatDate(election.startDate)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    End Date
                  </span>
                  <span className="text-sm text-[#262D3A] font-medium">
                    {formatDate(election.endDate)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Election Type
                  </span>
                  <span className="text-sm text-[#262D3A] font-medium capitalize">
                    {election.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voter Statistics */}
        <h2 className="text-xl font-bold text-[#262D3A] mb-4 inter-font">
          Voter Turnout & Participation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Allocated Voters"
            value={totalVoters}
            subtitle="Total whitelisted emails"
            icon="👥"
          />
          <StatCard
            title="Ballots Cast"
            value={votedCount}
            subtitle={`${turnoutPercentage}% turnout mapping`}
            icon="🗳️"
          />
          <StatCard
            title="Pending Votes"
            value={pendingCount}
            subtitle="Waiting for face verification"
            icon="⏳"
          />
          <StatCard
            title="Turnout Rate"
            value={`${turnoutPercentage}%`}
            subtitle="Overall engagement"
            icon="📈"
          />
        </div>

        {/* Secure Results Block */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col mb-10">
          <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#262D3A] inter-font">
                Election Results Data
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Official tallying algorithms
              </p>
            </div>

            {election.status === "closed" ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="px-6 py-2.5 bg-gray-100 text-[#00263A] border border-gray-200 font-semibold rounded-lg hover:bg-gray-200 transition shadow-sm"
                >
                  {showLogs ? "Hide Ledger" : "Audit Ledger"}
                </button>
                <button
                  onClick={() => setShowResults(!showResults)}
                  className="px-6 py-2.5 bg-[#00263A] text-white font-semibold rounded-lg hover:bg-[#001a28] transition shadow-sm"
                >
                  {showResults ? "Hide Results" : "Unlock & View Results"}
                </button>
              </div>
            ) : (
              <div className="px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
                <span>🔒</span>
                <span className="text-sm font-medium text-gray-500 tracking-wide">
                  RESULTS BOUND (ACTIVE)
                </span>
              </div>
            )}
          </div>

          {!showResults ? (
            <div className="w-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <span className="text-4xl mb-3">
                {election.status === "closed" ? "📊" : "🔒"}
              </span>
              <h3 className="text-[#262D3A] font-bold text-lg mb-1">
                {election.status === "closed"
                  ? "Data Compiled & Ready"
                  : "Election In Progress"}
              </h3>
              <p className="text-gray-500 text-sm max-w-sm text-center">
                {election.status === "closed"
                  ? "Results are officially sealed. Click the unlock button above to decode and deploy demographic charts."
                  : "Tallies are strictly hidden until the deadline closes to ensure absolute democratic integrity."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="w-full lg:w-3/5 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={election.candidates}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="voteCount" name="Votes" radius={[4, 4, 0, 0]}>
                      {election.candidates.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full lg:w-2/5">
                <h3 className="text-lg font-bold text-[#00263A] mb-4">
                  Official Tally Ledger
                </h3>
                <div className="flex flex-col gap-3">
                  {[...election.candidates]
                    .sort((a, b) => b.voteCount - a.voteCount)
                    .map((candidate, idx, arr) => {
                      const maxVotes = arr[0].voteCount;
                      const isTied =
                        maxVotes > 0 &&
                        arr.filter((c) => c.voteCount === maxVotes).length > 1;
                      const isWinner =
                        candidate.voteCount === maxVotes && maxVotes > 0;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#262D3A]">
                              {candidate.name}
                            </span>
                            {candidate.party && (
                              <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                                {candidate.party}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="block text-xl font-bold text-[#00263A] leading-none">
                                {candidate.voteCount}
                              </span>
                              <span className="text-xs text-gray-500">
                                Votes
                              </span>
                            </div>
                            {isWinner && (
                              <span
                                className="text-xl"
                                title={
                                  isTied ? "Tied for Lead" : "Current Leader"
                                }
                              >
                                {isTied ? "🤝" : "👑"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {showLogs && (
            <div className="mt-10 border-t border-gray-100 pt-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#00263A] inter-font">
                    Decoupled Audit Ledger
                  </h3>
                  <p className="text-sm text-gray-500">
                    Immutable cryptographic log of all securely recorded ballots
                  </p>
                </div>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                  {ballots.length} Records
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg max-h-96 overflow-y-auto border border-gray-200">
                {ballots.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    No immutable audit logs found for this election.
                  </p>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 bg-gray-100 uppercase sticky top-0 shadow-sm">
                      <tr>
                        <th className="px-6 py-4">Timestamp (UTC)</th>
                        <th className="px-6 py-4">Encrypted Action</th>
                        <th className="px-6 py-4">Receipt Hash ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ballots.map((b) => (
                        <tr
                          key={b._id}
                          className="border-b border-gray-200 hover:bg-white transition"
                        >
                          <td className="px-6 py-4 font-medium text-[#262D3A]">
                            {new Date(b.timestamp)
                              .toISOString()
                              .replace("T", " ")
                              .slice(0, 19)}
                          </td>
                          <td className="px-6 py-4 text-green-600 font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            +1 Vote recorded for {b.candidateName}
                          </td>
                          <td className="px-6 py-4 text-gray-400 font-mono text-xs tracking-wider">
                            {b._id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
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

export default ElectionDetails;
