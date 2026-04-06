const express = require("express");
const app = express();

// tes clés
const keys = [
    "abc123",
    "lumira",
    "premium2026"
];

app.get("/verify", (req, res) => {
    const key = req.query.key;

    if (keys.includes(key)) {
        res.send("VALID");
    } else {
        res.send("INVALID");
    }
});

app.get("/", (req, res) => {
    res.send("API ONLINE");
});

app.listen(3000, () => console.log("API RUNNING"));