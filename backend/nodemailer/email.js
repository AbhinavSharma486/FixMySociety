import transporter from "./nodemailer.config.js";
import {
  NEW_RESIDENT_WELCOME_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE
} from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name) => {

  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to ",
      html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name),
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("Error in sending welcome email", error);
    throw new Error(`Error in sending welcome email: ${error.message}`);
  }
};

export const sendPasswordResetRequestEmail = async (email, resetURL) => {

  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL)
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error in sending password reset email", error);
    throw new Error(`Error in sending password reset email: ${error.message}`);
  }
};

export const sendResetSuccessEmail = async (email) => {

  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password reset successfull",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error in sending password reset success email", error);
    throw new Error(`Error sending password reset success email: ${error.message}`);
  }
};

export const sendNewResidentWelcomeEmail = async (email, fullName, password, flatNumber, buildingName) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Welcome to your New Home at FixMYSociety!",
      html: NEW_RESIDENT_WELCOME_TEMPLATE
        .replace(/{fullName}/g, fullName)
        .replace(/{email}/g, email)
        .replace(/{password}/g, password)
        .replace(/{flatNumber}/g, flatNumber)
        .replace(/{buildingName}/g, buildingName),
    };

    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Welcome email sent successfully",
      messageId: info.messageId,
      Response: info.response
    });
  } catch (error) {
    console.error("Error in sending new resident welcome email:", error);
    throw new Error(`Error sending new resident welcome email: ${error.message}`);
  }
};