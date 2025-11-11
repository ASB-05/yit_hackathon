import React, { useState } from "react";
import "../App.css";
import { useAuth } from "../context/AuthContext";

type RoleOption = "student" | "instructor" | "admin";

export default function Login() {
  const { login } = useAuth();
  const [modalType, setModalType] = useState<RoleOption | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    email: "",
    password: "",
  });
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalType) {
      setError("Please choose a role to proceed.");
      return;
    }
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill all required fields.");
      return;
    }
    handleLogin(modalType);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (role: RoleOption) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role,
      });
      setModalType(null);
      setFormData({ name: "", id: "", email: "", password: "" });
    } catch (err: any) {
      setError(err?.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      alert("Please enter your registered email.");
      return;
    }
    alert(`Password reset link sent to ${resetEmail}`);
    setShowReset(false);
    setResetEmail("");
  };

  return (
    <div className="login-container">
      <h1>Welcome to LearnHub Pro 📚</h1>
      <p>Empowering Students and Educators through Knowledge</p>

      <div className="role-buttons">
        <button
          onClick={() => {
            setError(null);
            setModalType("student");
          }}
        >
          🎓 Student
        </button>
        <button
          onClick={() => {
            setError(null);
            setModalType("instructor");
          }}
        >
          👩‍🏫 Instructor
        </button>
        <button
          onClick={() => {
            setError(null);
            setModalType("admin");
          }}
        >
          🛡️ Admin
        </button>
      </div>

      {/* Login Modal */}
      {modalType && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              {modalType === "student"
                ? "Student Login"
                : modalType === "instructor"
                ? "Instructor Login"
                : "Admin Login"}
            </h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder={
                  modalType === "admin"
                    ? "Admin Name"
                    : modalType === "student"
                    ? "Student Name"
                    : "Instructor Name"
                }
                value={formData.name}
                onChange={handleChange}
              />

              {modalType !== "admin" && (
                <input
                  type="text"
                  name="id"
                  placeholder={
                    modalType === "student" ? "Student ID" : "Instructor ID"
                  }
                  value={formData.id}
                  onChange={handleChange}
                />
              )}

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <div className="modal-buttons">
                <button type="submit" className="login-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Login"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setModalType(null);
                    setFormData({ name: "", id: "", email: "", password: "" });
                    setError(null);
                  }}
                >
                  Cancel
                </button>
              </div>

              {/* Forgot Password */}
              <p
                className="forgot-password"
                onClick={() => {
                  setShowReset(true);
                  setError(null);
                }}
              >
                Forgot Password?
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showReset && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Reset Password</h2>
            <form onSubmit={handleReset}>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <div className="modal-buttons">
                <button type="submit" className="login-btn">
                  Send Reset Link
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowReset(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
