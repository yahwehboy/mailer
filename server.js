const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// API Routes - BEFORE static files
// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get recipients from file
app.get('/recipients', (req, res) => {
    try {
        const recipientsPath = path.join(__dirname, 'recipients.txt');
        let recipients = [];
        if (fs.existsSync(recipientsPath)) {
            const content = fs.readFileSync(recipientsPath, 'utf-8');
            recipients = content
                .split('\n')
                .map(line => line.trim())
                .filter(line => line);
        }
        res.json({ recipients });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send emails endpoint
app.post('/send-email', async (req, res) => {
    const {
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        smtpPass,
        fromAddress,
        subject,
        recipients,
        htmlBody
    } = req.body;

    const logs = [];

    try {
        // Validate required fields
        if (!recipients || !htmlBody || !subject) {
            return res.status(400).json({ error: 'Missing required fields', logs });
        }

        // Parse recipients
        const recipientList = recipients.split('\n').map(r => r.trim()).filter(r => r);

        if (recipientList.length === 0) {
            return res.status(400).json({ error: 'No recipients provided', logs });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort),
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        logs.push({ message: `Starting to send emails to ${recipientList.length} recipient(s)...`, type: 'info' });

        // Send individual emails
        for (const toAddress of recipientList) {
            try {
                const mailOptions = {
                    from: fromAddress,
                    to: toAddress,
                    subject: subject,
                    html: htmlBody
                };

                await transporter.sendMail(mailOptions);
                logs.push({ message: `✓ Sent to ${toAddress}`, type: 'success' });
                console.log(`Sent to ${toAddress}`);
            } catch (error) {
                logs.push({ message: `✗ Failed to send to ${toAddress}: ${error.message}`, type: 'error' });
                console.error(`Failed to send to ${toAddress}: ${error.message}`);
            }
        }

        logs.push({ message: 'All emails processed!', type: 'info' });
        console.log('All emails sent successfully!');

        res.json({ success: true, logs });
    } catch (error) {
        logs.push({ message: `Failed to send emails: ${error.message}`, type: 'error' });
        console.error(`Failed to send emails: ${error.message}`);
        res.status(500).json({ error: error.message, logs });
    }
});

// Static files - AFTER API routes
app.use(express.static(__dirname));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Email Sender UI running at http://localhost:${PORT}`);
});
