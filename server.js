const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Simpele database met gebruikers
const users = [
    { id: 1, username: "Iven", password: "secret123", apiKey: "IVEN123" },
    { id: 2, username: "Cyuer47", password: "hunter2", apiKey: "CYUER456" }
];

// Fake database met data
let data = [
    { id: 1, name: "Item 1", owner: "IVEN123" },
    { id: 2, name: "Item 2", owner: "CYUER456" }
];

// Middleware om API-key te controleren
function checkApiKey(req, res, next) {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(403).json({ error: "Geen API-key meegegeven" });

    const user = users.find(u => u.apiKey === apiKey);
    if (!user) return res.status(403).json({ error: "Ongeldige API-key" });

    req.user = user;
    next();
}

// Endpoint om API-key op te halen met gebruikersnaam en wachtwoord
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) return res.status(403).json({ error: "Ongeldige inloggegevens" });

    res.json({ apiKey: user.apiKey });
});

// GET - Haal alleen items van de gebruiker op
app.get("/api/items", checkApiKey, (req, res) => {
    const userItems = data.filter(item => item.owner === req.user.apiKey);
    res.json(userItems);
});

// POST - Voeg een nieuw item toe
app.post("/api/items", checkApiKey, (req, res) => {
    const newItem = { id: Date.now(), name: req.body.name, owner: req.user.apiKey };
    data.push(newItem);
    res.json(newItem);
});

// DELETE - Verwijder een item
app.delete("/api/items/:id", checkApiKey, (req, res) => {
    const id = parseInt(req.params.id);
    const itemIndex = data.findIndex(item => item.id === id && item.owner === req.user.apiKey);
    
    if (itemIndex === -1) return res.status(403).json({ error: "Item niet gevonden of geen rechten" });

    data.splice(itemIndex, 1);
    res.json({ message: "Item verwijderd" });
});

// Start server
app.listen(port, () => {
    console.log(`✅ API draait op http://localhost:${port}`);
});
