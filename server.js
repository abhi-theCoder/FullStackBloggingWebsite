require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const session = require('express-session');
const connectDB = require('./Backend/db');
const User = require('./Backend/models/User');
const Article = require('./Backend/models/Article');
const methodOverride = require('method-override');
const { escape } = require('querystring');

const PORT = process.env.PORT || 3000; 
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(methodOverride('_method'));
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true
}));

// Static files
app.use(express.static(path.join(__dirname, 'INDEX')));
app.use(express.static(path.join(__dirname, 'PUBLIC'))); 

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './Backend/templates'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`);
});

// Connect to MongoDB
connectDB();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'INDEX', 'index.html'));
});

app.get('/INDEX/index.html', (req, res) => res.redirect('/'));
app.get('/publisher/publisher.html', (req, res) => res.sendFile(path.join(__dirname, 'publisher', 'publisher.html')));
app.get('/CONTACT%20US/contact.html', (req, res) => res.sendFile(path.join(__dirname, 'contact us', 'contact.html')));
app.get('/about/about.html', (req, res) => res.sendFile(path.join(__dirname, 'about', 'about.html')));
app.get('/publish/publish-article.html', (req, res) => res.sendFile(path.join(__dirname, 'publish', 'publish-article.html')));
app.get('/beach/beach.html', (req, res) => res.sendFile(path.join(__dirname, 'beach', 'beach.html')));
app.get('/CITY%20ESCAPE/cescape.html', (req, res) => res.sendFile(path.join(__dirname, 'CITY ESCAPE', 'cescape.html')));
app.get('/mountain/mountain.html', (req, res) => res.sendFile(path.join(__dirname, 'mountain', 'mountain.html')));
app.get('/TOUR%20STATUS/tstatus.html', (req, res) => res.sendFile(path.join(__dirname, 'TOUR STATUS', 'tstatus.html')));
app.get('/privacy/privacy.html', (req, res) => res.sendFile(path.join(__dirname, 'privacy', 'privacy.html')));
app.get('/terms/terms.html', (req, res) => res.sendFile(path.join(__dirname, 'terms', 'terms.html')));

// Register & Login
app.get('/login-register', (req, res) => res.sendFile(path.join(__dirname, 'index', 'login-register.html')));

app.post('/register', async (req, res) => {  
    try {
        const { first_Name, last_Name, email, password, role } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ first_Name, last_Name, email, password: hashedPassword, role });

        await newUser.save();
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        req.session.user = { _id: user._id, email: user.email, first_Name: user.first_Name, role: user.role  };
        console.log('Login successful');
        res.redirect('/articles');
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Articles Routes
app.get('/articles', async (req, res) => {
    try {
        const articles = await Article.find().populate("user", "first_Name email");
        res.render('articles', { user: req.session.user || null, articles });
    } catch (error) {
        res.status(500).send("Error fetching articles");
    }
});

app.post('/articles', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    try {
        const { title, content, type } = req.body;
        const newArticle = new Article({ title, content, type, user: req.session.user._id });
        await newArticle.save();
        res.redirect('/articles');
        // res.json({ message: 'Article created successfully', article: newArticle });
    } catch (error) {
        res.status(500).json({ error: 'Error creating article' });
    }
});

app.put('/articles/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized. Please log in.' });

    try {
        const article = await Article.findById(req.params.id);
        if ((req.session.user.role !== 'admin') && (!article || article.user.toString() !== req.session.user._id.toString())) {
            return res.status(403).json({ error: 'You can only edit your own articles.' });
        }

        article.title = req.body.title;
        article.content = req.body.content;
        await article.save();
        // res.json({ message: 'Article updated successfully', article });
        res.redirect('/articles');
    } catch (error) {
        res.status(500).json({ error: 'Error updating article' });
    }
});

app.get('/articles/edit/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/login-register');

    try {
        const article = await Article.findById(req.params.id);
        if ((req.session.user.role !== 'admin') && (!article || article.user.toString() !== req.session.user._id.toString())) {
            console.log(req.session.user.role);
            console.log(req.session.user.role !== 'admin');
            
            return res.status(403).send("Unauthorized");
        }
        res.render('edit-article', { user: req.session.user, article });
    } catch (error) {
        res.status(500).send("Error loading edit page");
    }
});


app.delete('/articles/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized. Please log in.' });

    try {
        await Article.findByIdAndDelete(req.params.id);
        // res.json({ message: 'Article deleted successfully' });
        res.redirect('/articles');
    } catch (error) {
        res.status(500).json({ error: 'Error deleting article' });
    }
});

app.get('/articles/:articleName', async (req, res) => {
    try {
        let articleName = decodeURIComponent(req.params.articleName);

        if(articleName === 'City%20Escapes')
        articleName = 'City Escapes';

        // Filter directly in the database query
        let articles = await Article.find({ type: articleName })
            .populate("user", "first_Name email");

        res.render('articles', { user: req.session.user || null, articles });
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).send("Error fetching articles");
    }
});