const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
const port = process.env.PORT || 5000;
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: [String], default: [] },
  link: { type: String, default: '' },
  repo: { type: String, default: '' },
  image: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: '' },
  message: { type: String, required: true }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
const Message = mongoose.model('Message', messageSchema);

const defaultProjects = [
  {
    title: 'Portfolio Website',
    description: 'A modern full-stack portfolio website built with Express, MongoDB, and React-driven frontend architecture.',
    tags: ['Frontend', 'Backend', 'Database'],
    link: '',
    repo: 'https://github.com/your-username/portfolio',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    order: 1
  },
  {
    title: 'Task Tracker App',
    description: 'A lightweight task manager with filters, deadlines, and a responsive interface.',
    tags: ['Frontend', 'UI/UX', 'API'],
    link: '',
    repo: 'https://github.com/your-username/task-tracker',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    order: 2
  },
  {
    title: 'Landing Page Redesign',
    description: 'A polished frontend landing page built for conversion, accessibility, and responsive UX.',
    tags: ['Frontend', 'UI/UX', 'Design'],
    link: 'https://example.com/landing-page',
    repo: 'https://github.com/your-username/landing-page-redesign',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    order: 3
  },
  {
    title: 'Blog Dashboard',
    description: 'An admin dashboard designed for content planning, analytics, and publishing workflows.',
    tags: ['Backend', 'Dashboard', 'DevOps'],
    link: '',
    repo: 'https://github.com/your-username/blog-dashboard',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    order: 4
  },
  {
    title: 'API Services Suite',
    description: 'A backend service layer that powers frontend applications and stores data in MongoDB.',
    tags: ['Backend', 'Database', 'DevOps'],
    link: '',
    repo: 'https://github.com/your-username/api-services',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    order: 4
  }
];

async function initializeProjects() {
  const count = await Project.countDocuments();
  if (count === 0) {
    await Project.create(defaultProjects);
    console.log('Seeded default project data.');
  }
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('Connected to MongoDB');
    await initializeProjects();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });

const requireAdmin = (req, res, next) => {
  const password = req.headers['x-admin-password'] || req.body?.adminPassword;
  if (password !== adminPassword) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

app.get('/api/projects', async (req, res) => {
  try {
    const { tag } = req.query;
    const filter = {};
    if (tag && tag !== 'All') {
      filter.tags = tag;
    }
    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load projects', error: error.message });
  }
});

app.get('/api/summary', async (req, res) => {
  try {
    const projectCount = await Project.countDocuments();
    const messageCount = await Message.countDocuments();
    res.json({ projectCount, messageCount, uptime: process.uptime().toFixed(0) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load summary', error: error.message });
  }
});

app.post('/api/projects', requireAdmin, async (req, res) => {
  try {
    const { title, description, tags, link, repo, image, order } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Project title and description are required.' });
    }
    const project = await Project.create({ title, description, tags, link, repo, image, order: order || 0 });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create project', error: error.message });
  }
});

app.put('/api/projects/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update project', error: error.message });
  }
});

app.delete('/api/projects/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    res.json({ message: 'Project deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete project', error: error.message });
  }
});

app.get('/api/messages', requireAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load messages', error: error.message });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (password !== adminPassword) {
      return res.status(401).json({ message: 'Invalid admin password.' });
    }
    res.json({ authenticated: true });
  } catch (error) {
    res.status(500).json({ message: 'Unable to complete login', error: error.message });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }
    await Message.create({ name, email, subject, message });
    res.json({ message: 'Thanks! Your message has been received.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to submit contact request', error: error.message });
  }
});

app.get('/api/profile', (req, res) => {
  res.json({
    name: 'Ramya',
    role: 'Full-Stack Developer',
    location: 'Remote',
    email: 'ramya.dev@example.com',
    summary: 'I build polished web applications and backend APIs using modern JavaScript, Node.js, and MongoDB.'
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Portfolio server running on http://localhost:${port}`);
});
