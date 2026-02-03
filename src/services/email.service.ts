import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create Gmail/Google Workspace transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your@yourdomain.com (Google Workspace email)
    pass: process.env.EMAIL_PASSWORD, // 16-char App Password (not regular password)
  },
});

interface SendEmailParams {
  to: string;
  toName: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export const sendEmail = async ({
  to,
  toName,
  subject,
  htmlContent,
  textContent,
}: SendEmailParams): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"SolarWorks POS" <${process.env.EMAIL_USER}>`,
      to: `"${toName}" <${to}>`,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

// Email template for staff verification
export const sendStaffVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string,
  temporaryPassword: string,
): Promise<void> => {
  const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SolarWorks POS</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
        }
        .content {
          background-color: white;
          padding: 25px;
          border-radius: 6px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #2563eb;
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .credentials {
          background-color: #f0f7ff;
          border-left: 4px solid #2563eb;
          padding: 15px;
          margin: 20px 0;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">☀️ SolarWorks POS</div>
        </div>
        
        <div class="content">
          <h2>Welcome to SolarWorks POS, ${name}! 👋</h2>
          
          <p>Your account has been created by an administrator. To get started, please verify your email address and set up your account.</p>
          
          <div class="credentials">
            <h3>📧 Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 5px 10px; border-radius: 4px; font-size: 16px;">${temporaryPassword}</code></p>
          </div>
          
          <div class="warning">
            <p><strong>⚠️ Important:</strong> You will be required to change this password upon your first login for security purposes.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email & Activate Account</a>
          </div>
          
          <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
          <p style="background: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">
            ${verificationUrl}
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
          
          <h3>🚀 Next Steps:</h3>
          <ol>
            <li>Click the verification button above</li>
            <li>Your account will be automatically verified</li>
            <li>Log in with your credentials</li>
            <li>Change your password when prompted</li>
          </ol>
          
          <p style="margin-top: 20px;">If you have any questions, please contact your administrator.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} SolarWorks POS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Welcome to SolarWorks POS, ${name}!
    
    Your account has been created. Please verify your email address to activate your account.
    
    Login Credentials:
    Email: ${email}
    Temporary Password: ${temporaryPassword}
    
    Verification Link: ${verificationUrl}
    
    IMPORTANT: You will be required to change this password upon your first login.
    
    Next Steps:
    1. Click the verification link
    2. Your account will be automatically verified
    3. Log in with your credentials
    4. Change your password when prompted
    
    If you have any questions, please contact your administrator.
  `;

  await sendEmail({
    to: email,
    toName: name,
    subject: "Welcome to SolarWorks POS - Verify Your Email",
    htmlContent,
    textContent,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  temporaryPassword: string,
): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .content { background: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .credentials { background: #f0f7ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <h2>Password Reset - SolarWorks POS</h2>
          <p>Hello ${name},</p>
          <p>Your password has been reset by an administrator.</p>
          
          <div class="credentials">
            <h3>🔑 Your New Temporary Password:</h3>
            <p><code style="background: #e9ecef; padding: 5px 10px; border-radius: 4px; font-size: 16px;">${temporaryPassword}</code></p>
          </div>
          
          <p><strong>⚠️ Important:</strong> You will be required to change this password upon your next login.</p>
          
          <p>If you did not request this password reset, please contact your administrator immediately.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    toName: name,
    subject: "Your Password Has Been Reset - SolarWorks POS",
    htmlContent,
  });
};
