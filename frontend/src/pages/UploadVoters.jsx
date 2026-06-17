import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import API_ENDPOINTS from "../config/api";
import * as XLSX from "xlsx";
import { ButtonSpinner } from "../components/Spinners";

const UploadVoters = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Safety check: if accessed directly without form data, send back.
  const electionData = location.state?.electionData;

  const [voters, setVoters] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [manualEmail, setManualEmail] = useState("");

  // If no election data present, gracefully return to previous step
  if (!electionData) {
    navigate("/create-election");
    return null;
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError("");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });

      // Assume the first sheet is the one with the voters
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON array of objects
      const results = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (results.length === 0) {
        setError("The uploaded file appears to be empty.");
        return;
      }

      // Map header variations to our expected keys cleanly
      const parsedVoters = results
        .map((row) => {
          // Support 'Email', 'email', or grab the first column if no headers match properly
          let email = row.Email || row.email || "";
          if (!email && Object.values(row).length > 0) {
            // Fallback: if they just submitted a list of emails with no header, attempt to use the first value
            const possibleEmail = Object.values(row)[0];
            if (
              typeof possibleEmail === "string" &&
              possibleEmail.includes("@")
            ) {
              email = possibleEmail;
            }
          }
          return { email: String(email).trim().toLowerCase() };
        })
        // Filter out empty emails
        .filter((voter) => voter.email !== "");

      if (parsedVoters.length === 0) {
        setError(
          'No valid voters found. Ensure your file has an "Email" column.',
        );
        return;
      }

      setVoters(parsedVoters);
    } catch (err) {
      setError(
        "Failed to parse file. Make sure it is a valid .csv or .xlsx format.",
      );
    }
  };

  const handleAddManualVoter = (e) => {
    e.preventDefault();
    const email = manualEmail.trim();

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (voters.some((v) => v.email.toLowerCase() === email.toLowerCase())) {
      setError("This email is already in the list.");
      return;
    }

    setVoters([{ email: email.toLowerCase() }, ...voters]);
    setManualEmail("");
    setError("");
  };

  const removeVoter = (indexToRemove) => {
    setVoters(voters.filter((_, index) => index !== indexToRemove));
  };

  const onSubmitHandler = async () => {
    if (voters.length === 0) {
      setError(
        "Please upload a valid CSV list of voters before creating the election.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isEdit = !!electionData._id;
      const url = isEdit
        ? API_ENDPOINTS.ELECTIONS_UPDATE(electionData._id)
        : API_ENDPOINTS.ELECTIONS_CREATE;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...electionData,
          allowedVoters: voters,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.message || `Failed to ${isEdit ? "update" : "create"} election`,
        );
        setLoading(false);
        return;
      }

      // Successfully created or updated! Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Could not connect to server.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start justify-center px-4 py-6 sm:py-10 bg-[#FAFAFA] min-h-[80vh]">
      <div className="w-full max-w-4xl bg-white border border-gray-200 px-6 sm:px-10 py-8">
        <div className="mb-8">
          <h1 className="inter-font text-[32px] font-semibold text-[#262D34] mb-1">
            Upload Voters List
          </h1>
          <p className="text-[16px] text-gray-500">
            Step 2: Submit a CSV or Excel (.xlsx) file containing an{" "}
            <span className="font-medium text-gray-700">Email</span> column.
            Only these users will be allowed to vote in your election.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 inter-font mb-6">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="flex flex-col gap-4 mb-8">
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-10 h-10 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500 font-semibold">
                {fileName ? fileName : "Click to upload CSV or Excel"}
              </p>
              <p className="text-xs text-gray-500">.csv, .xlsx, .xls</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Manual Add Section */}
        <div className="mb-8 pb-6 border-b border-gray-100 border-dashed">
          <p className="text-[16px] text-[#262D3A] font-semibold inter-font mb-2">
            Or add voters manually:
          </p>
          <form
            onSubmit={handleAddManualVoter}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              placeholder="voter.name@university.edu"
              className="w-full sm:flex-1 px-4 py-3 bg-[#F3F7FE] border border-transparent focus:border-[#00263A] rounded outline-none transition"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#F28A36] text-white font-semibold rounded hover:bg-[#e07b2f] transition whitespace-nowrap"
            >
              + Add Single Voter
            </button>
          </form>
        </div>

        {/* Table Section */}
        {voters.length > 0 && (
          <div className="mb-8 border border-gray-200 rounded overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700 inter-font">
                Import Preview
              </h3>
              <span className="text-sm text-[#00263A] font-bold bg-[#00263A]/10 px-3 py-1 rounded-full">
                {voters.length} Valid Voters
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead className="bg-[#FAFAFA] sticky top-0">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 font-semibold text-gray-600"
                    >
                      Email Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {voters.slice(0, 100).map((v, i) => (
                    <tr key={i} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4 text-gray-800 flex justify-between items-center">
                        <span>{v.email}</span>
                        <button
                          type="button"
                          onClick={() => removeVoter(i)}
                          className="text-red-400 hover:text-red-600 font-bold opacity-0 group-hover:opacity-100 transition px-2"
                          title="Remove Voter"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                  {voters.length > 100 && (
                    <tr>
                      <td className="px-6 py-4 text-center text-gray-500 italic bg-gray-50">
                        ... and {voters.length - 100} more rows (not shown for
                        performance)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() =>
              navigate("/create-election/candidates", {
                state: { electionData: electionData },
              })
            }
            className="w-full sm:w-1/3 px-7 py-3 text-[#262D3A] bg-gray-200 font-semibold text-md inter-font rounded-md cursor-pointer hover:bg-gray-300 transition"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onSubmitHandler}
            disabled={loading || voters.length === 0}
            className={`w-full sm:w-2/3 px-7 py-3 flex items-center justify-center gap-2 text-white font-semibold text-md inter-font rounded-md transition shadow-sm
                            ${loading || voters.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#00263A] cursor-pointer hover:bg-[#001a28]"}`}
          >
            {loading && <ButtonSpinner size="sm" />}
            {loading
              ? "Processing..."
              : electionData?._id
                ? "Save Changes"
                : "Finish & Create Election"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadVoters;
