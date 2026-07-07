import "./Sidebar.css";
import React, { useEffect } from 'react'
import img from "../src/images/novamind.jpg"
import { useContext } from 'react';
import MyContext from "./MyContext"
import {v1 as uuidv1} from "uuid";


const API_BASE_URL = import.meta.env.PROD
    ? "https://nova-mind-nrkc.onrender.com"
    : "http://localhost:8080";

function Sidebar() {
    const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats, token} = useContext(MyContext);

    const getAllThreads=async()=>{
        if (!token) {
            setAllThreads([]);
            return;
        }

        try{
           const response= await fetch(`${API_BASE_URL}/api/threads`, {
               headers: { Authorization: `Bearer ${token}` }
           });

           const res = await response.json();
           const filterData = res.map(thread => ({threadId: thread.threadId, title: thread.title}));
           setAllThreads(filterData);
        } catch(err){
            console.log(err);
        }
    };
    useEffect(()=>{
        getAllThreads();
    },[currThreadId, token])

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    }

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);

        try{
           const response=await fetch(`${API_BASE_URL}/api/thread/${newThreadId}`, {
               headers: { Authorization: `Bearer ${token}` }
           });
           const res=await response.json();
           console.log(res);
           setPrevChats(res);
           setNewChat(false);
           setReply(null);


        } catch(err){
            console.log(err);
        }
    }
    const deleteThread = async(threadId) => {
        try{
            const response= await fetch(`${API_BASE_URL}/api/thread/${threadId}`, {
                method:"DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const res = await response.json();
            console.log(res);

            //updated thread re-render
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
            if(threadId === currThreadId) {
                createNewChat();
            }

        } catch(err) {
            console.log(err);
        }
    }
    return (
        <section className="sidebar">
            <button onClick={createNewChat}>
                <img src={img} alt="NovaMind Logo" className="logo"></img>
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            <div className="historyWrapper">
              <ul className="history">
                <h6>Recents</h6>
                {
                    allThreads?.map((thread, idx) => (
                        <li key={idx}
                        onClick={(e) => changeThread(thread.threadId)}
                        >{thread.title}
                        <i className="fa-solid fa-trash"
                        onClick={(e) => {
                            e.stopPropagation();//stop event bubbling
                            deleteThread(thread.threadId);
                        }}
                        ></i>
                        </li>
                    ))
                }
              </ul>
            </div>

            <div className="sign">
                <p>by NovaMind &hearts;</p>

            </div>
        </section>
    )
}

export default Sidebar
