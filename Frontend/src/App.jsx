import './App.css'
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import MyContext from "./MyContext.jsx";
import { useEffect, useState } from 'react';
import {v1 as uuidv1} from "uuid";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState([]);
  const [allThreads, setAllThreads] = useState([]);
  const [authUser, setAuthUser] = useState(() => {
    const storedUser = localStorage.getItem("novamindUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("novamindToken"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("novamindToken", token);
    } else {
      localStorage.removeItem("novamindToken");
    }
  }, [token]);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem("novamindUser", JSON.stringify(authUser));
    } else {
      localStorage.removeItem("novamindUser");
    }
  }, [authUser]);

  const isAuthenticated = Boolean(token && authUser);

  const providerValue = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
    authUser, setAuthUser,
    token, setToken,
    isAuthenticated
  };

  return (
    <div className="app">
      <MyContext.Provider value={providerValue}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  )
}

export default App
