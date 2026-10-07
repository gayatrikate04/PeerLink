const connectionRequestEmail = ({ receiverName, senderName }) => {
    return {
        subject: "New Connection Request | PeerLink",

        text: `
Hello ${receiverName},

${senderName} has sent you a connection request on PeerLink.

Log in to PeerLink to view the request.

Regards,
PeerLink Team
        `,

        html: `
<!DOCTYPE html>
<html>
<body>

<h2>New Connection Request</h2>

<p>Hello ${receiverName},</p>

<p>
<strong>${senderName}</strong> has sent you a connection request on PeerLink.
</p>

<p>
Log in to PeerLink to view the request.
</p>

<p>
Regards,<br>
<strong>PeerLink Team</strong>
</p>

</body>
</html>
        `,
    };
};

module.exports = {
    connectionRequestEmail,
};