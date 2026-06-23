const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// 临时存储验证码（生产环境请用 Redis）
const codeStore = new Map();

// 1. 发送验证码
router.post('/send-verification-code', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: '邮箱不能为空' });
  }

  // 生成6位随机码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codeStore.set(email, { code, expires: Date.now() + 5 * 60 * 1000 });

  // 尝试发送真实邮件
  const sent = await sendEmail(email, code);
  if (sent) {
    return res.json({ success: true, message: '验证码已发送至邮箱' });
  } else {
    // 降级模拟模式（开发时方便测试）
    return res.json({ success: true, message: `[模拟] 验证码：${code}，请填写此码注册` });
  }
});

// 2. 验证验证码（注册时使用）
router.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  const record = codeStore.get(email);
  if (!record) {
    return res.json({ success: false, message: '请先获取验证码' });
  }
  if (record.expires < Date.now()) {
    codeStore.delete(email);
    return res.json({ success: false, message: '验证码已过期' });
  }
  if (record.code !== code) {
    return res.json({ success: false, message: '验证码错误' });
  }
  // 验证成功后删除验证码（也可以保留，但一般用完即删）
  codeStore.delete(email);
  res.json({ success: true, message: '验证成功' });
});

// 3. 注册
router.post('/register', async (req, res) => {
  const { email, password, verifyCode } = req.body;
  if (!email || !password || !verifyCode) {
    return res.status(400).json({ success: false, message: '请填写所有字段' });
  }

  // 先验证验证码（复用 verify-code 逻辑）
  const record = codeStore.get(email);
  if (!record || record.code !== verifyCode || record.expires < Date.now()) {
    return res.json({ success: false, message: '验证码无效或已过期' });
  }
  codeStore.delete(email);

  // 检查用户是否已存在
  const existing = User.findByEmail(email);
  if (existing) {
    return res.json({ success: false, message: '该邮箱已被注册' });
  }

  // 创建新用户
  const user = new User({ email, password });
  await user.save();

  // 生成 JWT
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: { id: user._id, email: user.email, userName: user.userName, userAvatar: user.userAvatar },
    message: '注册成功',
  });
});

// 4. 登录
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '请填写邮箱和密码' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: false, message: '邮箱或密码错误' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.json({ success: false, message: '邮箱或密码错误' });
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: { id: user._id, email: user.email, userName: user.userName, userAvatar: user.userAvatar },
    message: '登录成功',
  });
});

// 5. （可选）获取当前用户信息（验证 token）
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  res.json({ success: true, user });
});

module.exports = router;