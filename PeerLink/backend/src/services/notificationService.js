const { sendEmail } = require("./emailService");

const {
  connectionRequestEmail,
} = require("../templates/emailTemplates");

const sendConnectionRequestNotification = async ({
  receiver,
  sender,
}) => {
  const emailContent = connectionRequestEmail({
    receiverName: receiver.name,
    senderName: sender.name,
  });

  console.log("EMAIL WILL BE SENT TO:", receiver.email);

  return await sendEmail({
    to: receiver.email,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });
};

module.exports = {
  sendConnectionRequestNotification,
};