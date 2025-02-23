const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Temporary in-memory database (to be replaced with SQL later)
const users = [];
const channelOwners = [];

// Helper function to check if email or username already exists
const userExists = (email, username) =>
    [...users, ...channelOwners].some(user => user.email === email || user.username === username);

// Registration route
app.post("/register", async (req, res) => {
    const { email, username, password, confirmPassword, accountType, channelName } = req.body;
    let errors = [];

    // Validation checks
    if (!email || !username || !password || !confirmPassword || !accountType)
        errors.push("All fields are required!");
    
    if (accountType !== "user" && accountType !== "channelOwner")
        errors.push("Invalid account type!");

    if (password !== confirmPassword)
        errors.push("Passwords do not match!");

    if (userExists(email, username))
        errors.push("Email or username already registered!");

    if (accountType === "channelOwner" && !channelName)
        errors.push("Channel name is required for channel owners!");

    // If errors exist, return all at once
    if (errors.length) return res.status(400).json({ errors });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, username, password: hashedPassword };

    // Store in the correct database
    accountType === "user" ? users.push(newUser) : channelOwners.push({ ...newUser, channelName });

    res.status(201).json({ message: `${accountType === "user" ? "Regular user" : "Channel owner"} registered successfully!` });
});

// Start server
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
