import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import API_ENDPOINTS from "../config/api";
import { ButtonSpinner, SkeletonLoader } from "../components/Spinners";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import ProfileModal from "../components/ProfileModal";
import FaceVerificationModal from "../components/FaceVerificationModal";
import ActivationModal from "../components/ActivationModal";
import DeletionModal from "../components/DeletionModal";

const StatusBadge = ({ status }) => {
  const styles = {
    draft: "bg-gray-100 text-gray-500",
    active: "bg-green-100 text-green-700",
    closed: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inter-font text-xs font-semibold px-3 py-1 rounded-full capitalize ${styles[status] || styles.draft}`}
    >
      {status || "draft"}
    </span>
  );
};

const StatCard = ({ icon, label, value }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="inter-font text-gray-600 text-sm font-medium">
            {label}
          </p>
          <p className="inter-font text-3xl font-bold text-[#00263A] mt-2">
            {value}
          </p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
};

const ElectionCard = ({ election, onDelete, onView, onActivate, onEdit }) => {
  const format = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const handleDelete = () => {
    onDelete(election);
  };

  return (
    <div className="bg-white border border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md hover:border-[#F28A36]/40 transition-all duration-200 rounded-lg">
      <div className="flex flex-col gap-1 w-full sm:flex-1">
        <h3 className="inter-font text-[#00263A] font-semibold text-base break-words">
          {election.title}
        </h3>
        {election.description && (
          <p className="inter-font text-gray-400 text-xs max-w-md truncate">
            {election.description}
          </p>
        )}
        <p className="inter-font text-gray-400 text-xs">
          {format(election.startDate)} — {format(election.endDate)}
        </p>
      </div>
      <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0 border-gray-100 justify-between sm:justify-end">
        <StatusBadge status={election.status} />
        <div className="flex items-center gap-4">
          {election.status === "draft" && (
            <button
              onClick={() => onEdit(election)}
              className="inter-font text-sm text-yellow-600 hover:text-yellow-700 cursor-pointer transition font-medium"
            >
              Edit
            </button>
          )}
          {election.status === "draft" && (
            <button
              onClick={() => onActivate(election)}
              className="inter-font text-sm text-green-600 hover:text-green-700 cursor-pointer transition font-medium"
            >
              Activate
            </button>
          )}
          <button
            onClick={() => onView(election._id)}
            className="inter-font text-sm text-blue-600 hover:text-blue-700 cursor-pointer transition font-medium"
          >
            View
          </button>
          <button
            onClick={handleDelete}
            className="inter-font text-sm text-red-600 hover:text-red-700 cursor-pointer transition font-medium disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  // Activation Modal State
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [electionToActivate, setElectionToActivate] = useState(null);
  const [activating, setActivating] = useState(false);

  // Deletion Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [electionToDelete, setElectionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.ELECTIONS_GET_ALL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setElections(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("Failed to fetch Elections", err);
        error("Failed to load elections");
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, [token, error]);

  const promptDelete = (election) => {
    setElectionToDelete(election);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!electionToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(
        API_ENDPOINTS.ELECTIONS_DELETE(electionToDelete._id),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Delete failed");
      setElections((prev) =>
        prev.filter((e) => e._id !== electionToDelete._id),
      );
      success("Election deleted successfully");
      setDeleteModalOpen(false);
    } catch (err) {
      console.log("Delete Failed", err);
      error("Failed to delete election");
    } finally {
      setDeleting(false);
      setElectionToDelete(null);
    }
  };

  const handleView = (id) => {
    navigate(`/dashboard/election/${id}`);
  };

  const handleEdit = (election) => {
    navigate("/create-election", { state: { prevData: election } });
  };

  const handleLogout = () => {
    logout();
    success("Logged out successfully");
    navigate("/", { replace: true });
  };

  const promptActivate = (election) => {
    setElectionToActivate(election);
    setActivateModalOpen(true);
  };

  const confirmActivate = async () => {
    if (!electionToActivate) return;
    setActivating(true);
    try {
      const res = await fetch(
        API_ENDPOINTS.ELECTIONS_ACTIVATE(electionToActivate._id),
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to activate");
      setElections((prev) =>
        prev.map((e) =>
          e._id === electionToActivate._id ? { ...e, status: "active" } : e,
        ),
      );
      success("Election activated successfully!");
      setActivateModalOpen(false);
    } catch (err) {
      console.log("Activate Failed", err);
      error("Failed to activate election");
    } finally {
      setActivating(false);
      setElectionToActivate(null);
    }
  };

  const stats = {
    total: elections.length,
    active: elections.filter((e) => e.status === "active").length,
    draft: elections.filter((e) => e.status === "draft").length,
    closed: elections.filter((e) => e.status === "closed").length,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar onProfileClick={() => setProfileModalOpen(true)} />

      {/* Main Content */}
      <main className="flex-1 min-h-screen bg-[#FAFAFA] px-4 sm:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="inter-font text-[32px] font-semibold text-[#262D34] mb-2">
              Dashboard
            </h1>
            <p className="inter-font text-gray-600">
              Welcome back, <span className="font-semibold">{user?.name}</span>
            </p>
          </div>

          {/* Create Election Button */}
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => setVerifyModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 text-white font-semibold text-md inter-font rounded-md bg-[#00263A] hover:bg-[#001a28] transition shadow-md cursor-pointer"
            >
              🗳️ Create Election
            </button>
          </div>

          {/* Stats Grid */}
          {!loading && elections.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon="📊"
                label="Total Elections"
                value={elections.length}
              />
              <StatCard
                icon="🟢"
                label="Active"
                value={elections.filter((e) => e.status === "active").length}
              />
              <StatCard
                icon="📝"
                label="Draft"
                value={elections.filter((e) => e.status === "draft").length}
              />
              <StatCard
                icon="✓"
                label="Closed"
                value={elections.filter((e) => e.status === "closed").length}
              />
            </div>
          )}

          {/* Elections List */}
          {loading ? (
            <SkeletonLoader count={3} />
          ) : elections.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
              <div className="text-6xl mb-4">🗳️</div>
              <h2 className="varela-font text-2xl font-bold text-[#00263A] mb-2">
                No Elections Yet
              </h2>
              <p className="inter-font text-gray-600 mb-6">
                Create your first election to get started
              </p>
              <button
                onClick={() => setVerifyModalOpen(true)}
                className="inline-block px-8 py-3 text-white font-semibold text-md inter-font rounded-md bg-[#00263A] hover:bg-[#001a28] transition cursor-pointer"
              >
                Create Election
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="inter-font text-[24px] font-semibold text-[#262D34]">
                  Your Elections
                </h2>
                <span className="inter-font text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                  {elections.length} total
                </span>
              </div>
              <div className="space-y-3">
                {elections.map((election) => (
                  <ElectionCard
                    key={election._id}
                    election={election}
                    onDelete={promptDelete}
                    onView={handleView}
                    onActivate={promptActivate}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
      />

      <FaceVerificationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        onSuccess={() => {
          setVerifyModalOpen(false);
          navigate("/create-election");
        }}
      />

      <ActivationModal
        isOpen={activateModalOpen}
        onClose={() => setActivateModalOpen(false)}
        onConfirm={confirmActivate}
        electionName={electionToActivate?.title}
        loading={activating}
      />

      <DeletionModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        electionName={electionToDelete?.title}
        loading={deleting}
      />
    </div>
  );
};

export default Dashboard;
