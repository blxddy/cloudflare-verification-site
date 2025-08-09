const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 6969;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const verificationTokens = new Map();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'verification.html'));
});

app.post('/verify', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }
    
    console.log(`Verification received for token: ${token}`);
    
    verificationTokens.set(token, {
        verified: true,
        timestamp: Date.now()
    });
    
    res.json({ 
        success: true, 
        message: 'Verification successful! You can now close this terminal and return to your browser.' 
    });
});

app.get('/verify-status', (req, res) => {
    const { token } = req.query;
    
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }
    
    const verification = verificationTokens.get(token);
    
    if (verification && verification.verified) {
        console.log(`Status check: Token ${token} is verified`);
        res.json({ verified: true });
    } else {
        res.json({ verified: false });
    }
});

setInterval(() => {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;
    
    for (const [token, data] of verificationTokens.entries()) {
        if (now - data.timestamp > maxAge) {
            verificationTokens.delete(token);
            console.log(`🧹 Cleaned up expired token: ${token}`);
        }
    }
}, 5 * 60 * 1000);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Started on port ${PORT}`);
});
