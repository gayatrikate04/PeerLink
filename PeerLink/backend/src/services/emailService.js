// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD,
//     },
// });

// const sendEmail = async ({ to, subject, text, html }) => {
//     try {
//         const info = await transporter.sendMail({
//             from: `"PeerLink" <${process.env.EMAIL_USER}>`,
//             to,
//             subject,
//             text,
//             html,
//         });

//         console.log("Email sent:", info.messageId);

//         return {
//             success: true,
//             messageId: info.messageId,
//         };
//     } catch (error) {
//         console.error("Email sending failed:", error);

//         return {
//             success: false,
//             error: error.message,
//         };
//     }
// };

// module.exports = {
//     sendEmail,
// };

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"PeerLink" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });

    console.log("Email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  sendEmail,
};