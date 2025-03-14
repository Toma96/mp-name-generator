const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies.
app.use(express.json());

// The master list of 31 names.
const names = [
  "Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace",
  "Heidi", "Ivan", "Judy", "Kevin", "Laura", "Mallory", "Niaj",
  "Olivia", "Peggy", "Quentin", "Rupert", "Sybil", "Trent", "Uma",
  "Victor", "Wendy", "Xander", "Yvonne", "Zack", "Aaron", "Beth",
  "Cody", "Diana", "Ethan"
];

// Create working copies for available names and user assignments.
let availableNames = [...names];
let drawnMapping = {};

/**
 * POST /draw
 * Expects a JSON body: { user: "UserName" }
 * Draws a random name (not the user's own) from availableNames.
 */
app.post('/draw', (req, res) => {
  const { user } = req.body;
  if (!user) {
    return res.status(400).json({ error: 'User name is required.' });
  }

  // Check if this user has already drawn.
  if (drawnMapping[user]) {
    return res.status(400).json({ 
      error: 'User has already drawn a name.', 
      drawnName: drawnMapping[user]
    });
  }

  // Remove the user's own name from the candidate pool (case-insensitive).
  const candidates = availableNames.filter(
    name => name.toLowerCase() !== user.toLowerCase()
  );

  if (candidates.length === 0) {
    return res.status(400).json({ error: 'No available names to draw.' });
  }

  // Randomly select a name from the candidates.
  const randomIndex = Math.floor(Math.random() * candidates.length);
  const drawnName = candidates[randomIndex];

  // Remove the drawn name from availableNames.
  availableNames = availableNames.filter(name => name !== drawnName);

  // Record the assignment.
  drawnMapping[user] = drawnName;

  return res.json({ drawnName });
});

/**
 * POST /reset
 * Expects a JSON body: { adminPassword: "..." }
 * Resets the draw for a new round.
 */
app.post('/reset', (req, res) => {
  const { adminPassword } = req.body;
  const expectedPassword = "adminpass"; // Set your admin password here.
  if (adminPassword !== expectedPassword) {
    return res.status(403).json({ error: 'Incorrect admin password.' });
  }

  // Reset the state.
  availableNames = [...names];
  drawnMapping = {};
  return res.json({ message: 'Reset successful.' });
});

// (Optional) Serve static files from a "public" folder.
app.use(express.static('public'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
