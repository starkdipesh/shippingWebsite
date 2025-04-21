const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./'));

// Path to the submissions file
const submissionsFile = path.join(__dirname, 'all-submissions.json');

// Initialize submissions file if it doesn't exist
if (!fs.existsSync(submissionsFile)) {
    fs.writeFileSync(submissionsFile, JSON.stringify([], null, 2));
}

// Handle form submission
app.post('/submit-form', (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Read existing submissions
        let submissions = [];
        try {
            const fileContent = fs.readFileSync(submissionsFile, 'utf8');
            submissions = JSON.parse(fileContent);
        } catch (error) {
            console.error('Error reading submissions file:', error);
        }

        // Create new submission
        const newSubmission = {
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString()
        };

        // Add new submission to array
        submissions.push(newSubmission);

        // Write updated submissions back to file
        fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));

        res.json({
            success: true,
            message: 'Form submitted successfully'
        });
    } catch (error) {
        console.error('Error saving submission:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving form submission'
        });
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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Main website: http://localhost:${PORT}`);
    console.log(`View submissions at http://localhost:${PORT}/submissions`);
    console.log(`Admin page at http://localhost:${PORT}/admin.html`);
}); 