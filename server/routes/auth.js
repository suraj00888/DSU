const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    try {
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save the user with role 'user'
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // Generate refresh token
        const refreshToken = crypto.randomBytes(40).toString('hex');
        newUser.refreshToken = refreshToken;
        await newUser.save();

        res.status(201).json({ 
            token,
            refreshToken, 
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            } 
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password.' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h' // Shorter expiry for access token
        });

        // Generate refresh token
        const refreshToken = crypto.randomBytes(40).toString('hex');
        user.refreshToken = refreshToken;
        await user.save();

        // Return token and user details (including role)
        res.status(200).json({
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        // Find user with this refresh token
        const user = await User.findOne({ refreshToken });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        // Generate new access token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // Generate new refresh token
        const newRefreshToken = crypto.randomBytes(40).toString('hex');
        user.refreshToken = newRefreshToken;
        await user.save();

        // Return new tokens and user info
        res.status(200).json({
            token,
            refreshToken: newRefreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Error refreshing token:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/logout
router.post('/logout', protect, async (req, res) => {
    try {
        // Clear the refresh token in the database
        const user = await User.findById(req.user._id);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
        
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Error during logout:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        // Store token in the database
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Frontend URL for password reset
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        
        // Base64 encoded logo - replace with your actual logo
        // Logo as base64 to embed in email (fallback text logo if image doesn't load)
        const logoFallback = 'DSUConnect';
        
        // Create HTML email with embedded styling
        const htmlEmail = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your DSUConnect Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f0f8ff; line-height: 1.6;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; margin-top: 20px;">
                <tr>
                    <td style="padding: 0;">
                        <!-- Header with logo -->
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="padding: 25px 30px; text-align: center; background-color: #17C6ED; background-image: linear-gradient(135deg, #17C6ED 0%, #7FE0F3 100%);">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${logoFallback}</h1>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Main content -->
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="padding: 35px 30px 25px 30px;">
                                    <h2 style="margin: 0 0 20px 0; color: #17C6ED; font-size: 22px; border-bottom: 2px solid #E8F9FD; padding-bottom: 10px;">Reset Your Password</h2>
                                    <p style="margin: 0 0 20px 0; font-size: 16px;">Hello ${user.name || 'there'},</p>
                                    <p style="margin: 0 0 20px 0; font-size: 16px;">We received a request to reset your password for your DSUConnect account. If you didn't make this request, you can safely ignore this email.</p>
                                    <p style="margin: 0 0 25px 0; font-size: 16px;">To reset your password, click the button below:</p>
                                    
                                    <!-- CTA Button -->
                                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 30px auto;">
                                        <tr>
                                            <td style="border-radius: 6px;" bgcolor="#17C6ED">
                                                <a href="${resetUrl}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 6px; padding: 14px 30px; border: 1px solid #17C6ED; display: inline-block; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Reset Password</a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <div style="background-color: #f8f9fa; border-left: 4px solid #17C6ED; padding: 15px; margin-bottom: 25px;">
                                        <p style="margin: 0; font-size: 15px;">For security reasons, this password reset link will expire in <strong>1 hour</strong>.</p>
                                    </div>
                                    
                                    <p style="margin: 0 0 20px 0; font-size: 16px;">If the button above doesn't work, copy and paste this link into your browser:</p>
                                    <p style="margin: 0 0 20px 0; word-break: break-all; font-size: 14px; color: #666666; background-color: #f8f9fa; padding: 10px; border-radius: 4px;"><a href="${resetUrl}" style="color: #17C6ED; text-decoration: underline;">${resetUrl}</a></p>
                                    
                                    <p style="margin: 25px 0 10px 0; font-size: 15px;"><strong>Didn't request this change?</strong><br>If you didn't request a new password, please contact our support team immediately.</p>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Footer -->
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="padding: 20px 30px; text-align: center; font-size: 13px; background-color: #E8F9FD; color: #666666; border-top: 1px solid #C1EDF7;">
                                    <p style="margin: 0 0 10px 0;">This is an automated message from DSUConnect.</p>
                                    <p style="margin: 0 0 10px 0;">If you need assistance, please contact our support team at <a href="mailto:support@dsuconnect.com" style="color: #17C6ED;">support@dsuconnect.com</a></p>
                                    <p style="margin: 0;">© ${new Date().getFullYear()} DSUConnect. All rights reserved.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        // Plain text alternative for email clients that don't support HTML
        const textEmail = `
=== DSUConnect Password Reset ===

Reset Your DSUConnect Password

Hello ${user.name || 'there'},

We received a request to reset your password for your DSUConnect account. If you didn't make this request, you can safely ignore this email.

To reset your password, copy and paste this link into your browser:
${resetUrl}

This link will expire in 1 hour for security reasons.

This is an automated message from DSUConnect.
If you need assistance, please contact our support team.

© ${new Date().getFullYear()} DSUConnect. All rights reserved.
        `;

        // Send email with both HTML and plain text versions
        const mailOptions = {
            to: user.email,
            from: {
                name: 'DSUConnect Support',
                address: process.env.EMAIL_USER
            },
            subject: 'Reset Your DSUConnect Password',
            text: textEmail,
            html: htmlEmail,
            // Add headers to reduce chance of being marked as spam
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'High'
            }
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (err) {
        console.error('Error during forgot password process:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Invalidate the token
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been reset' });
    } catch (err) {
        console.error('Error during reset password process:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
