const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();

// ====== MongoDB Setup ======
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/levelup';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(()=>console.log('MongoDB connected'))
	.catch(err=>console.error('MongoDB error:', err));

// ====== Models ======
const userSchema = new mongoose.Schema({
	username: { type: String, unique: true },
	password: String,
	avatar: { type: String, default: '🧑' },
	xp: { type: Number, default: 0 },
	streak: { type: Number, default: 0 },
	lastActive: { type: String, default: '' },
	goals: { type: [String], default: [] },
});
const User = mongoose.model('User', userSchema);

// ====== Middleware ======
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'levelupsecret', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ====== Auth APIs ======
app.post('/api/register', async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
	try {
		const hash = await bcrypt.hash(password, 10);
		const user = new User({ username, password: hash });
		await user.save();
		req.session.user = user._id;
		res.json({ success: true, user: { username, avatar: user.avatar, xp: user.xp, streak: user.streak, goals: user.goals } });
	} catch (e) {
		res.status(400).json({ error: 'Username taken' });
	}
});

app.post('/api/login', async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username });
	if (!user) return res.status(400).json({ error: 'User not found' });
	const match = await bcrypt.compare(password, user.password);
	if (!match) return res.status(400).json({ error: 'Wrong password' });
	req.session.user = user._id;
	res.json({ success: true, user: { username, avatar: user.avatar, xp: user.xp, streak: user.streak, goals: user.goals } });
});

// ====== Profile APIs ======
app.get('/api/profile', async (req, res) => {
	if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
	const user = await User.findById(req.session.user);
	if (!user) return res.status(404).json({ error: 'User not found' });
	res.json({ username: user.username, avatar: user.avatar, xp: user.xp, streak: user.streak, goals: user.goals });
});

app.post('/api/profile', async (req, res) => {
	if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
	const { avatar, xp, streak, goals } = req.body;
	const user = await User.findById(req.session.user);
	if (!user) return res.status(404).json({ error: 'User not found' });
	if (avatar) user.avatar = avatar;
	if (typeof xp === 'number') user.xp = xp;
	if (typeof streak === 'number') user.streak = streak;
	if (Array.isArray(goals)) user.goals = goals;
	await user.save();
	res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
