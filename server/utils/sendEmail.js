const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationCode(email, code) {
  try {
    await transporter.sendMail({
      from: `"寻梦助手" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '注册验证码',
      text: `您的验证码是：${code}，5分钟内有效。`,
    });
    return true;
  } catch (error) {
    console.error('邮件发送失败:', error);
    return false;
  }
}

module.exports = sendVerificationCode;