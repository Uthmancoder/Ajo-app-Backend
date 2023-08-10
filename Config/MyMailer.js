const nodemailer = require("nodemailer");

const sendMail = async (email, username) => {
  const contactTemplate = `
    <div>
    <div>
      <h2 style="color:#2036ea;">Message Title: Welcome message</h2>
    </div>
    <ul>
      <li>Name: ${username}</li>
      <li>Email: ${email}</li>
    </ul>
    <div>
      <p>
        Dear ${username}, welcome to Ultimate Microfinance bank.
      </p>
      <p> It's a great pleasure to see you here and we are also assuring you that you are gonna receive your best treats contributing with any of our vendors </p>
    </div>
    <p style="color:#2036ea;"><i>Ultimate Microfinance Bank</i></p>
  </div>`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "adewaleagbolahan025@gmail.com",
      pass: "enpvsrboebaqywwp",
    },
  });

  const MailOptions = {
    from: process.env.GMAIL,
    to: email,
    subject: "Ultimate Microfinance Bank Welcome Message",
    text: "Ultimate Microfinance",
    html: contactTemplate,
  };

  try {
    await transporter.sendMail(MailOptions);
    console.log("Email sent Successfully !!");
  } catch (error) {
    console.log("Error sending mail", error);
    throw error;
  }
};

module.exports = {sendMail}
