require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serves index.html, styles, js

// Transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Endpoint to send email verification code
app.post('/api/send-code', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required.' });
  }

  try {
    await transporter.sendMail({
      from: `"VibeShort" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'VibeShort - Verification Code',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Confirm Your Email</h2>
          <p>Your 6-digit confirmation code is:</p>
          <h1 style="color: #6366f1; letter-spacing: 4px;">${code}</h1>
        </div>
      `,
    });

    res.json({ success: true, message: 'Verification email sent!' });
  } catch (error) {
    console.error('Nodemailer Error:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});