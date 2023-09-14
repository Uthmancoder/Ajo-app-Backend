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

const ForgotPassword = async (email, username, generatedNum) => {
  const contactTemplate = `
  <div>
  <div>
    <h2 style="color:#2036ea;">Confirmation of Password Reset Request:</h2>
    <h3>Title: "Password Reset Confirmation</h3>
    <ul>
     <li>Message: "Hi ${username} We've received your request to reset your password. Please follow the instructions below to complete the process.</li>
    </ul>

    
   
  </div>
  <div>
   <h3>Instructions for Creating a New Password:</h3>
   <ul>
   <li>Heading: Create a New Password</li>
   <li>Message: To reset your password, please choose a new one that is secure and unique to you. Follow the password guidelines below for best security.</li>
   </ul>
   <p>Here is your OTP verification code  </p>
   <small class="text-primary">${generatedNum}</small>
  </div>

  <p>Enter the code for your password reset</p>

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
  subject: "Ultimate Microfinance Bank Forgot Password",
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

module.exports = { sendMail, ForgotPassword };
