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

// Create submissions directory if it doesn't exist
const submissionsDir = path.join(__dirname, 'submissions');
console.log('Submissions directory path:', submissionsDir);
if (!fs.existsSync(submissionsDir)) {
    console.log('Creating submissions directory...');
    fs.mkdirSync(submissionsDir);
    console.log('Submissions directory created successfully');
} else {
    console.log('Submissions directory already exists');
}

// Form submission endpoint
app.post('/submit-form', async (req, res) => {
    try {
        console.log('Received form submission:', req.body);
        
        // Validate required fields
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            console.error('Missing required fields:', { name, email, subject, message });
            return res.status(400).json({ 
                message: 'Missing required fields',
                details: {
                    name: !name ? 'Name is required' : null,
                    email: !email ? 'Email is required' : null,
                    subject: !subject ? 'Subject is required' : null,
                    message: !message ? 'Message is required' : null
                }
            });
        }
        
        // Create a timestamp for the filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `submission-${timestamp}.json`;
        const filePath = path.join(submissionsDir, filename);
        
        // Save submission to a file
        const submissionData = {
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString()
        };
        
        console.log('Saving submission to file:', filePath);
        fs.writeFileSync(filePath, JSON.stringify(submissionData, null, 2));
        
        // Log to console
        console.log('Form submission saved successfully:', filePath);
        
        res.status(200).json({ 
            message: 'Form submitted successfully',
            submission: submissionData
        });
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ 
            message: 'Error submitting form',
            error: error.message
        });
    }
});

// Endpoint to view all submissions
app.get('/view-submissions', (req, res) => {
    try {
        console.log('Fetching submissions from directory:', submissionsDir);
        const files = fs.readdirSync(submissionsDir);
        console.log('Found files:', files);
        
        const submissions = files.map(file => {
            const filePath = path.join(submissionsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        });
        
        console.log('Returning submissions:', submissions);
        res.json(submissions);
    } catch (error) {
        console.error('Error reading submissions:', error);
        res.status(500).json({ 
            message: 'Error reading submissions',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Main website: http://localhost:${PORT}`);
    console.log(`View submissions at http://localhost:${PORT}/view-submissions`);
    console.log(`Admin page at http://localhost:${PORT}/admin.html`);
}); 