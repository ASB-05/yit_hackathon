import React, { useState } from "react";
import "../App.css";

export default function Login({
  onSelectRole,
}: {
  onSelectRole: (role: "student" | "instructor" | "admin") => void;
}) {
  const [modalType, setModalType] = useState<"student" | "instructor" | "admin" | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    email: "",
    password: "",
  });
  const [resetEmail, setResetEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      (modalType !== "admin" && !formData.id)
    ) {
      alert("Please fill all required fields!");
      return;
    }
    alert(`Welcome ${formData.name}!`);
    onSelectRole(modalType!);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        <button onClick={() => setModalType("student")}>🎓 Student</button>
        <button onClick={() => setModalType("instructor")}>👩‍🏫 Instructor</button>
        <button onClick={() => setModalType("admin")}>🛡️ Admin</button>
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

              <div className="modal-buttons">
                <button type="submit" className="login-btn">
                  Login
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setModalType(null);
                    setFormData({ name: "", id: "", email: "", password: "" });
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
