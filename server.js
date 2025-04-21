const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./'));

// Path to the single submissions file in root directory
const submissionsFile = path.join(__dirname, 'all-submissions.json');

// Initialize the file with an empty array if it doesn't exist
if (!fs.existsSync(submissionsFile)) {
    fs.writeFileSync(submissionsFile, JSON.stringify([], null, 2));
}

// Handle form submission
app.post('/submit-form', (req, res) => {
    const formData = req.body;
    const timestamp = new Date().toISOString();
    
    // Read existing submissions
    let submissions = [];
    try {
        const fileContent = fs.readFileSync(submissionsFile, 'utf8');
        submissions = JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading submissions file:', error);
    }

    // Add new submission
    const newSubmission = {
        ...formData,
        timestamp
    };
    submissions.push(newSubmission);

    // Write updated submissions back to file
    try {
        fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));
        console.log('Form submission saved successfully');
        res.json({ success: true, message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Error saving submission:', error);
        res.status(500).json({ success: false, message: 'Error saving form submission' });
    }
});

// Get all submissions
app.get('/submissions', (req, res) => {
    try {
        const fileContent = fs.readFileSync(submissionsFile, 'utf8');
        const submissions = JSON.parse(fileContent);
        res.json(submissions);
    } catch (error) {
        console.error('Error reading submissions:', error);
        res.status(500).json({ error: 'Error reading submissions' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Main website: http://localhost:${PORT}`);
    console.log(`View submissions at http://localhost:${PORT}/submissions`);
    console.log(`Admin page at http://localhost:${PORT}/admin.html`);
}); 