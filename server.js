const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ TON MOT DE PASSE ICI
const ADMIN_PASSWORD = "AdminSilverKey2";


// ===============================
// BAN
// ===============================
app.get("/ban", (req, res) => {
    const { admin, key } = req.query;

    if (admin !== AdminSilverKey2) {
        return res.json({ error: "Unauthorized" });
    }

    if (!database[key]) {
        return res.json({ error: "Key not found" });
    }

    database[key].banned = true;
    saveDB();

    res.json({ success: true });
});

// ===============================
// DASHBOARD
// ===============================
app.get("/dashboard", (req, res) => {
    const { admin } = req.query;

    if (admin !== AdminSilverKey2) {
        return res.send("Unauthorized");
    }

    let html = `
    <html>
    <body style="background:#111;color:white;font-family:Arial;padding:20px">
    <h1>💎 Silver Demon Dashboard</h1>

    <input id="days" placeholder="Days">
    <button onclick="gen()">Generate</button>

    <script>
    async function gen(){
        let d = document.getElementById("days").value || 1;
        let res = await fetch("/generate?admin=${AdminSilverKey2}&days="+d);
        let data = await res.json();
        alert("Key: "+data.key);
        location.reload();
    }

    async function del(k){
        await fetch("/delete?admin=${AdminSilverKey2}&key="+k);
        location.reload();
    }

    async function ban(k){
        await fetch("/ban?admin=${AdminSilverKey2}&key="+k);
        location.reload();
    }
    </script>
    `;

    for (let key in database) {
        let k = database[key];

        let exp = new Date(k.expires).toLocaleString();
        let last = k.lastUsed ? new Date(k.lastUsed).toLocaleString() : "Never";

        html += `
        <div style="background:#222;padding:10px;margin:10px;border-radius:8px">
        <b>${key}</b><br>
        HWID: ${k.hwid || "none"}<br>
        Last Used: ${last}<br>
        Exp: ${exp}<br>
        Status: ${k.banned ? "🔴 BANNED" : "🟢 ACTIVE"}<br><br>

        <button onclick="del('${key}')">Delete</button>
        <button onclick="ban('${key}')">Ban</button>
        </div>
        `;
    }

    html += "</body></html>";
    res.send(html);
});

app.listen(PORT, () => console.log("Server running"));
