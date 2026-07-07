import React, { useContext, useState } from 'react'
import "./ChatWindow.css";
import "react-spinner/react-spinner.css";
import Chat from './Chat.jsx';
import MyContext from "./MyContext.jsx";
import { ThreeDots } from "react-loader-spinner";

const API_BASE_URL = import.meta.env.PROD
  ? "https://nova-mind-nrkc.onrender.com"
  : "http://localhost:8080";

function ChatWindow() {
  const { prompt, setPrompt, setReply, currThreadId, setPrevChats, setNewChat, authUser, isAuthenticated, token, setAuthUser, setToken } = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");

  const getReply = async () => {
    const userMessage = prompt.trim();
    if (!userMessage || loading) return;

    if (!isAuthenticated) {
      setShowAuthModal(true);
      setMode("login");
      setAuthError("Please log in to start chatting.");
      return;
    }

    setLoading(true);
    setNewChat(false);
    console.log("message", userMessage, "threadId", currThreadId);

    setPrevChats((prevChats) => [
      ...prevChats,
      { role: "user", content: userMessage }
    ]);
    setPrompt("");

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        message: userMessage,
        threadId: currThreadId
      })
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, options);
      const res = await response.json();
      console.log(res);
      setReply(res.reply);

      setPrevChats((prevChats) => [
        ...prevChats,
        { role: "assistant", content: res.reply }
      ]);
    } catch (err) {
      console.log(err);
      setPrevChats((prevChats) => [
        ...prevChats,
        { role: "assistant", content: "Sorry, I could not generate a reply." }
      ]);
    } finally {
      setLoading(false);
    }
  };
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    try {
      const endpoint = mode === "signup" ? `${API_BASE_URL}/api/auth/signup` : `${API_BASE_URL}/api/auth/login`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setToken(data.token);
      setAuthUser(data.user);
      setShowAuthModal(false);
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setAuthUser(null);
    setShowMenu(false);
  };

  return (
    <div className="chat-window">
      <div className="navbar">
        <span>NovaMind <i className="fa-solid fa-angle-down"></i></span>
        <div className="usericondiv">
          <div className="profile-menu">
            <button className="usericon" onClick={() => setShowMenu((prev) => !prev)}>
              <i className="fa-solid fa-user"></i>
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                {isAuthenticated ? (
                  <>
                    <div className="menu-user">{authUser?.name || "Signed in"}</div>
                    <button onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setMode("login"); setShowAuthModal(true); setShowMenu(false); }}>Login</button>
                    <button onClick={() => { setMode("signup"); setShowAuthModal(true); setShowMenu(false); }}>Sign up</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Chat></Chat>
      {loading && (
        <div className="loaderWrapper">
         <ThreeDots color='#fff'></ThreeDots>
        </div>
      )}

      <div className="chatInput">
        <div className="inputBox">
          <input placeholder="Ask anything" value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e)=> e.key==="Enter"? getReply(): ''}
            >

          </input>
          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>

      </div>

      {showAuthModal && (
        <div className="auth-modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h3>{mode === "signup" ? "Create account" : "Welcome back"}</h3>
              <button onClick={() => setShowAuthModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleAuthSubmit} className="auth-form">
              {mode === "signup" && (
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              {authError && <p className="auth-error">{authError}</p>}
              <button type="submit" className="auth-submit">
                {mode === "signup" ? "Sign up" : "Login"}
              </button>
            </form>
            <p className="auth-switch">
              {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
              <button onClick={() => setMode(mode === "signup" ? "login" : "signup")}>{mode === "signup" ? "Login" : "Sign up"}</button>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWindow
