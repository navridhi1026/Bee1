const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Define log file path and maximum log size (optional log rotation feature)
const LOG_FILE_PATH = path.join(__dirname, 'requests.log');
const MAX_LOG_SIZE = 1 * 1024 * 1024; // 1MB

// Middleware to capture and log request details
app.use((req, res, next) => {
    const logDetails = {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        url: req.originalUrl,
        protocol: req.protocol,
        method: req.method,
        hostname: req.hostname,
        query: req.query,
        headers: req.headers,
        userAgent: req.get('User-Agent'),
    };

    const logString = JSON.stringify(logDetails) + '\n';

    // Log Rotation: Check file size and archive if necessary
    fs.stat(LOG_FILE_PATH, (err, stats) => {
        if (!err && stats.size > MAX_LOG_SIZE) {
            const archivePath = path.join(__dirname, `requests_${Date.now()}.log`);
            fs.rename(LOG_FILE_PATH, archivePath, (renameErr) => {
                if (renameErr) console.error('Failed to archive log file', renameErr);
            });
        }

        // Append log details to the file
        fs.appendFile(LOG_FILE_PATH, logString, (appendErr) => {
            if (appendErr) console.error('Failed to write to log file', appendErr);
        });
    });

    // Proceed to the next middleware or route handler
    next();
});

// Test route to verify the server
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
