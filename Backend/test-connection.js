import mongoose from "mongoose";
import "dotenv/config";
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) {
  console.error("No MONGO_URI / MONGODB_URI set");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB (test)");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Connection error (test):", err);
    process.exit(1);
  }
})();
