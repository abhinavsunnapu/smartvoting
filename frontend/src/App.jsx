import React from "react";
import NavBar from "./components/NavBar";
import ToastContainer from "./components/ToastContainer";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Elections from "./pages/Elections";
import MeetingVotes from "./pages/MeetingVotes";
import Services from "./pages/Services";
import GetStarted from "./pages/GetStarted";
import Dashboard from "./pages/Dashboard";
import ElectionDetails from "./pages/ElectionDetails";
import Login from "./pages/Login";
import VoterLogin from "./pages/VoterLogin";
import VoterRegister from "./pages/VoterRegister";
import VoterDashboard from "./pages/VoterDashboard";
import VoterElectionDetails from "./pages/VoterElectionDetails";
import ProtectRoute from "./components/ProtectRoute";
import GuestRoute from "./components/GuestRoute";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import { ToastProvider } from "./Context/ToastContext";
import CreateElection from "./pages/CreateElection";
import AddCandidates from "./pages/AddCandidates";
import UploadVoters from "./pages/UploadVoters";
import ProfileModal from "./components/ProfileModal";
import { useState } from "react";


const Layout = ({ children }) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div>
      <NavBar onProfileClick={() => setProfileModalOpen(true)}></NavBar>
      {children}
      <Footer></Footer>
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
      />
    </div>
  );
};
const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/elections"
            element={
              <Layout>
                <Elections />
              </Layout>
            }
          />
          <Route
            path="/meeting-votes"
            element={
              <Layout>
                <MeetingVotes />
              </Layout>
            }
          />
          <Route
            path="/services"
            element={
              <Layout>
                <Services />
              </Layout>
            }
          />
          <Route
            path="/get-started"
            element={
              <GuestRoute>
                <Layout>
                  <GetStarted />
                </Layout>
              </GuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Layout>
                  <Login></Login>
                </Layout>
              </GuestRoute>
            }
          />
          <Route
            path="/voter-register"
            element={
              <GuestRoute>
                <Layout>
                  <VoterRegister />
                </Layout>
              </GuestRoute>
            }
          />
          <Route
            path="/voter-login"
            element={
              <GuestRoute>
                <Layout>
                  <VoterLogin />
                </Layout>
              </GuestRoute>
            }
          />
          {/* <Route path="/pricing" /> */}

          <Route path='/dashboard' element={
            <ProtectRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectRoute>
          } />

          <Route path='/dashboard/election/:id' element={
            <ProtectRoute allowedRoles={['admin']}>
              <ElectionDetails />
            </ProtectRoute>
          } />

          <Route path='/voter-dashboard' element={
            <ProtectRoute allowedRoles={['voter']}>
              <VoterDashboard />
            </ProtectRoute>
          } />

          <Route path='/voter-dashboard/election/:id' element={
            <ProtectRoute allowedRoles={['voter']}>
              <VoterElectionDetails />
            </ProtectRoute>
          } />

          <Route
            path="/create-election"
            element={
              <ProtectRoute>
                <Layout>
                  <CreateElection></CreateElection>
                </Layout>
              </ProtectRoute>
            }
          ></Route>
          <Route
            path="create-election/candidates"
            element={
              <ProtectRoute>
                <Layout>
                  <AddCandidates />
                </Layout>
              </ProtectRoute>
            }
          ></Route>
          <Route
            path="/create-election/voters"
            element={
              <ProtectRoute>
                <Layout>
                  <UploadVoters></UploadVoters>
                </Layout>
              </ProtectRoute>
            }
          ></Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
