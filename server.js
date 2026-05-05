const express = require("express");
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// =========================
// 🧠 DATABASE MEMORY
// =========================
let keys = {};
let logs = [];
let blacklist = [];

// =========================
// 🔑 GENERATE KEY
// =========================
function generateKey() {
    return Math.random().toString(36).substring(2, 10);
}

// create key with duration (ms)
app.post("/create", (req, res) => {
    const { duration } = req.body;

    if (!duration) {
        return res.json({ success:false, reason:"NO_DURATION" });
    }

    const key = generateKey();

    keys[key] = {
        expires: Date.now() + duration,
        hwid: null
    };

    res.json({
        success: true,
        key: key,
        expires: keys[key].expires
    });
});

// =========================
// 🔍 VERIFY KEY + HWID + LOGS
// =========================
app.get("/verify", (req, res) => {
    const { key, hwid, user, userId } = req.query;

    // 🚫 blacklist check
    if (blacklist.includes(Number(userId))) {
        return res.json({ valid:false, reason:"BLACKLISTED" });
    }

    const data = keys[key];

    if (!data) {
        return res.json({ valid:false, reason:"INVALID_KEY" });
    }

    if (Date.now() > data.expires) {
        delete keys[key];
        return res.json({ valid:false, reason:"EXPIRED" });
    }

    if (data.hwid && data.hwid !== hwid) {
        return res.json({ valid:false, reason:"HWID_LOCKED" });
    }

    // bind HWID
    data.hwid = hwid;

    // LOG USER
    logs.push({
        user: user || "unknown",
        userId: Number(userId) || 0,
        key: key,
        hwid: hwid,
        time: Date.now()
    });

    res.json({ valid:true });
});

// =========================
// 📊 STATS
// =========================
app.get("/stats", (req, res) => {
    res.json({
        totalKeys: Object.keys(keys).length,
        totalLogs: logs.length,
        blacklistCount: blacklist.length
    });
});

// =========================
// 📋 GET KEYS
// =========================
app.get("/keys", (req, res) => {
    res.json(keys);
});

// =========================
// 📊 GET LOGS
// =========================
app.get("/logs", (req, res) => {
    res.json(logs.slice(-100).reverse());
});

// =========================
// ❌ DELETE KEY
// =========================
app.delete("/delete/:key", (req, res) => {
    const key = req.params.key;

    if (keys[key]) {
        delete keys[key];
        return res.json({ success:true });
    }

    res.json({ success:false, reason:"NOT_FOUND" });
});

// =========================
// 🚫 BLACKLIST USER
// =========================
app.post("/blacklist", (req, res) => {
    const { userId } = req.body;

    if (!blacklist.includes(Number(userId))) {
        blacklist.push(Number(userId));
    }

    res.json({ success:true });
});

// =========================
// ✅ REMOVE BLACKLIST
// =========================
app.post("/unblacklist", (req, res) => {
    const { userId } = req.body;

    blacklist = blacklist.filter(id => id !== Number(userId));

    res.json({ success:true });
});

// =========================
// 🚀 START SERVER
// =========================
app.listen(PORT, () => {
    console.log("🔥 Lumira Prestige Backend Running on port " + PORT);
});
