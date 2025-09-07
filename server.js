const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// public folder serve करना
app.use(express.static(path.join(__dirname, 'public')));

// सभी GET requests के लिए index.html serve करना
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LevelUp running at http://localhost:${PORT}`);
});
