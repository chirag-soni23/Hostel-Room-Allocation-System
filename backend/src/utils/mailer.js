import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, 
  },
});

export const sendMail = async ({ fromName, fromEmail, subject, message, phone }) => {
const html = `
  <div style="
    font-family: 'Poppins', 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #eef2ff, #f8fafc);
    padding: 40px;
    border-radius: 18px;
    border: 1px solid #e2e8f0;
    max-width: 640px;
    margin: 0 auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  ">

    <!-- Header -->
    <div style="text-align:center; margin-bottom: 30px;">
      <div style="
        display: inline-block;
        background: linear-gradient(90deg, #6366f1, #8b5cf6);
        padding: 14px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        letter-spacing: 0.5px;
        font-size: 18px;
        text-shadow: 0 1px 3px rgba(0,0,0,0.2);
        box-shadow: 0 4px 15px rgba(99,102,241,0.4);
      ">
        ✨ New Contact Message ✨
      </div>
      <p style="color:#6b7280; margin-top: 14px; font-size: 14px;">
        You’ve received a new inquiry from your website’s contact form.
      </p>
    </div>

    <!-- Card -->
    <div style="
      background: rgba(255,255,255,0.75);
      backdrop-filter: blur(8px);
      border-radius: 16px;
      padding: 28px 32px;
      border: 1px solid rgba(255,255,255,0.5);
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    ">
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight:600; color:#4f46e5; width:120px;">Name:</td>
          <td style="color:#111827;">${fromName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight:600; color:#4f46e5;">Email:</td>
          <td><a href="mailto:${fromEmail}" style="color:#2563eb; text-decoration:none;">${fromEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight:600; color:#4f46e5;">Phone:</td>
          <td style="color:#111827;">${phone || "N/A"}</td>
        </tr>
        ${
          subject
            ? `<tr>
                <td style="padding: 8px 0; font-weight:600; color:#4f46e5;">Subject:</td>
                <td style="color:#111827;">${subject}</td>
              </tr>`
            : ""
        }
      </table>

      <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;">

      <div style="
        color:#111827;
        line-height:1.7;
        font-size:15px;
        white-space:pre-wrap;
        border-left:4px solid #8b5cf6;
        padding-left:14px;
      ">
        ${message}
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center; margin-top: 35px;">
      <p style="color:#6b7280; font-size:13px; margin-bottom:8px;">
        This email was generated from your website’s <b>Contact Form</b>.
      </p>
      <p style="color:#9ca3af; font-size:12px; margin:0;">
        &copy; ${new Date().getFullYear()} <b>Your Website</b> — All rights reserved.
      </p>

      <div style="margin-top:16px;">
        <a target="_blank" href="https://www.instagram.com/0x_chirag_0x/" style="text-decoration:none; margin:0 6px;">
          <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="22" height="22"/>
        </a>
        <a target="_blank" href="https://x.com/ChiragSoni23" style="text-decoration:none; margin:0 6px;">
          <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" width="22" height="22"/>
        </a>
        <a target="_blank" href="https://www.linkedin.com/in/chiragsoni023/" style="text-decoration:none; margin:0 6px;">
          <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" alt="LinkedIn" width="22" height="22"/>
        </a>
        <a target="_blank" href="https://github.com/chirag-soni23/" style="text-decoration:none; margin:0 6px;">
          <img src="https://cdn-icons-png.flaticon.com/512/733/733553.png" alt="GitHub" width="22" height="22"/>
        </a>
      </div>
    </div>
  </div>
`;



  return transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: process.env.RECEIVER_EMAIL || process.env.SMTP_USER, 
    subject: subject || "New Contact Form Message",
    html,
  });
};
