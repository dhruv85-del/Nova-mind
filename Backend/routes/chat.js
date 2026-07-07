import express from "express";
import Thread from "../models/thread.js";
import getOpenAIResponse from "../utils/openai.js";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();

//create a testing thread with a title and a message /thread
router.post("/test", async (req, res) => {
    try {

        const thread = new Thread({
            threadId: "abc213",
            title: "Test Thread"
        });
        const response = await thread.save();
        res.send(response);
    } catch (err) {
        console.log("Error:", err);
        res.status(500).send({ error: err.message });
    }
})

router.use(authMiddleware);

//get all threads /threads
router.get("/threads", async (req, res) => {
    try {
        const threads = await Thread.find({ userId: req.user.id }).sort({ updatedAt: -1 });
        // descending order of updatedAt... most recent data on top
        res.json(threads);
    } catch (err) {
        console.log("Error:", err);
        res.status(500).send({ error: err.message });

    }
});

//get a specific thread by threadId /thread/:threadId
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await Thread.findOne({ threadId, userId: req.user.id });
        if (!thread) {
            return res.status(404).send({ error: "Thread not found" });
        }
        res.json(thread.messages);
    } catch (err) {
        console.log("Error:", err);
        res.status(500).send({ error: err.message });
    }
});

//delete a specific thread by threadId
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const deletedThread = await Thread.deleteOne({ threadId, userId: req.user.id });
        if (!deletedThread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.status(200).json({ success: "Thread  deleted successfully" });

    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ error: "Failed to delete thread" });
    }
});

//chat route
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;
    if (!threadId || !message) {
        return res.status(400).json({ error: "threadId and message are required" });

    }
    try {
        let thread = await Thread.findOne({ threadId, userId: req.user.id });
        if (!thread) {
            // create a new thread if it doesn't exist
            const newThread = new Thread({
                userId: req.user.id,
                threadId,
                title: message,
                messages: [{ role: "user", content: String(message) }]
            });
            await newThread.save();
            // use the saved thread for subsequent updates
            thread = newThread;
        } else {
            // update the existing thread
            thread.messages.push({ role: "user", content: String(message) });
        }

        const assistantReply = await getOpenAIResponse(message);
        const assistantText = typeof assistantReply === "string" ? assistantReply : JSON.stringify(assistantReply);
        thread.messages.push({ role: "assistant", content: assistantText });
        thread.updatedAt = Date.now();
        await thread.save();
        res.json({ reply: assistantReply });

    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});
export default router;


