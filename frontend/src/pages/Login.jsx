import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import { ButtonSpinner } from "../components/Spinners";
import API_ENDPOINTS from "../config/api";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { error: showError, success } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.message || "Invalid email or password");
        setLoading(false);
        return;
      }
      success("Login successful!");
      login(data.user, data.token);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      showError("Server connection failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-2">
      <div className="flex flex-col gap-2 px-4 py-2 w-full max-w-md">
        <div>
          <h1 className="inter-font text-[32px] font-semibold text-[#262D34]">
            Administrator Login
          </h1>
          <p className="text-[16px] text-[#262D3A] mb-6.25">
            To Cast Your Vote, Visit{" "}
            <a
              className="text-orange-400 underline text-sm font-bold"
              href="/voter-login"
            >
              Voting Page
            </a>
          </p>
        </div>
        <form onSubmit={onSubmitHandler} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[16px] text-[#262D3A] mb-1 inter-font font-semibold">
              Email
            </p>
            <input
              className="w-full px-4 py-3 bg-[#F3F7FE] outline-none"
              type="email"
              name="email"
              value={form.email}
              required
              onChange={handleChange}
              placeholder="Email"
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[16px] text-[#262D3A] mb-1 inter-font font-semibold">
              Password
            </p>
            <input
              className="w-full px-4 py-3 bg-[#F3F7FE] outline-none"
              type="password"
              name="password"
              value={form.password}
              required
              onChange={handleChange}
              placeholder="Password"
              disabled={loading}
            />
          </div>

          <div className="flex justify-center mt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-[70%] px-7 py-3 text-white font-semibold text-md inter-font my-2 rounded-md flex items-center justify-center gap-2
                            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#00263A] cursor-pointer hover:bg-[#001a28] transition"}`}
            >
              {loading && <ButtonSpinner size="sm" />}
              {loading ? "Logging In..." : "Login"}
            </button>
          </div>
          <div className="flex items-center justify-center px-7 py-3 ">
            <p className="px-1">Don't Have Account ?</p>
            <a
              className="text-orange-400 underline text-md font-normal hover:text-orange-500"
              href="/get-started"
            >
              SignUp
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
