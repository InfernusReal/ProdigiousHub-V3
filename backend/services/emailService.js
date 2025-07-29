const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter
const verifyEmailService = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service ready!');
  } catch (error) {
    console.error('❌ Email service error:', error.message);
  }
};

// Send verification email
const sendVerificationEmail = async (email, username, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  
  const mailOptions = {
    from: `"ProdigiousHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🚀 Verify your ProdigiousHub account',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: system-ui, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">ProdigiousHub</h1>
          <p style="color: #6B7280; margin: 5px 0;">Gamified Project Collaboration</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center; color: white; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0;">Welcome to the Hub, ${username}! 🎉</h2>
          <p style="margin: 0; opacity: 0.9;">You're one step away from leveling up your project collaboration game!</p>
        </div>
        
        <div style="background: #F9FAFB; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
          <h3 style="color: #374151; margin: 0 0 15px 0;">🎯 What's Next?</h3>
          <p style="color: #6B7280; margin: 0 0 20px 0;">Click the button below to verify your email and start your journey:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              🚀 Verify Email & Start Gaming
            </a>
          </div>
        </div>
        
        <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; margin-bottom: 25px;">
          <h4 style="color: #1E40AF; margin: 0 0 10px 0;">🏆 What You'll Get:</h4>
          <ul style="color: #374151; margin: 0; padding-left: 20px;">
            <li>Join exciting projects and earn XP</li>
            <li>Level up and unlock achievements</li>
            <li>Discord integration for seamless collaboration</li>
            <li>Track your progress on the leaderboard</li>
          </ul>
        </div>
        
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0;">
            This verification link will expire in 24 hours.
          </p>
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, username, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"ProdigiousHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Reset your ProdigiousHub password',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: system-ui, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">ProdigiousHub</h1>
          <p style="color: #6B7280; margin: 5px 0;">Password Reset Request</p>
        </div>
        
        <div style="background: #FEF2F2; border-radius: 8px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #EF4444;">
          <h3 style="color: #DC2626; margin: 0 0 15px 0;">🔐 Password Reset Requested</h3>
          <p style="color: #374151; margin: 0;">Hi ${username}, we received a request to reset your password.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            🔑 Reset Password
          </a>
        </div>
        
        <div style="background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 15px; margin-bottom: 25px;">
          <p style="color: #92400E; margin: 0; font-weight: bold;">⚠️ Security Notice:</p>
          <p style="color: #374151; margin: 10px 0 0 0;">This reset link will expire in 1 hour. If you didn't request this reset, please ignore this email.</p>
        </div>
        
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #E5E7EB;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            For security reasons, this link can only be used once.
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    return false;
  }
};

module.exports = {
  verifyEmailService,
  sendVerificationEmail,
  sendPasswordResetEmail
};
