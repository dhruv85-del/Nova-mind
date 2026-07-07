import express from "express";
import "dotenv/config";
import cors from "cors";
import { OpenRouter } from "@openrouter/sdk";
import mongoose from "mongoose";
import dns from 'dns';
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";


const app=express();
const PORT=8080;
dns.setServers(["1.1.1.1","8.8.8.8"]);


app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.log("JSON Parse Error:", err.message);
        return res.status(400).json({error: "Invalid JSON in request body", details: err.message});
    }
    next();
});

const connectDB=async()=>{
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if(!mongoUri){
        console.error("MongoDB URI is not set. Please define MONGO_URI or MONGODB_URI in Backend/.env");
        return false;
    }

    try{
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
        console.log("Connected to MongoDB");
        return true;
    } catch(err){
        console.error("Error connecting to MongoDB:", err);
        return false;
    }
};

const startServer = async () => {
    await connectDB();
    app.listen(PORT, ()=>{
        console.log(`server is running on ${PORT}`);
    });
};

startServer();

// app.post("/test", async(req,res)=>{
//     const options={
//         method:"POST",
//         headers:{
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${process.env.API_KEY}`
//         },
//         body: JSON.stringify({
//             model:"google/gemma-4-31b-it:free",
//             messages:[{"role": "user", "content": req.body.message || "Hello"}]
//         })
//     };

//     try{
//        const response= await fetch("https://openrouter.ai/api/v1/chat/completions", options);
//        console.log("Status:", response.status);
//        const data = await response.json();
//        console.log("Response:", data);
//        res.send(data);
//     } catch(err){
//         console.log("Error:", err);
//         res.status(500).send({error: err.message});
//     }
// });


