require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');
const sendEmail = require('./utils/sendEmail');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- 初始化 SQLite 数据库 ----------
const db = new Database(path.join(__dirname, 'xunmeng.db'));
db.pragma('journal_mode = WAL');

// 创建用户表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    userName TEXT DEFAULT '',
    userAvatar TEXT DEFAULT '',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 创建验证码表
db.exec(`
  CREATE TABLE IF NOT EXISTS verification_codes (
    email TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expires INTEGER NOT NULL
  )
`);

// 辅助函数
function getUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

function createUser(email, hashedPassword) {
  const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
  const info = stmt.run(email, hashedPassword);
  return { id: info.lastInsertRowid, email, userName: '', userAvatar: '' };
}

function saveVerificationCode(email, code, expires) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO verification_codes (email, code, expires)
    VALUES (?, ?, ?)
  `);
  stmt.run(email, code, expires);
}

function getVerificationCode(email) {
  const stmt = db.prepare('SELECT * FROM verification_codes WHERE email = ?');
  return stmt.get(email);
}

function deleteVerificationCode(email) {
  const stmt = db.prepare('DELETE FROM verification_codes WHERE email = ?');
  stmt.run(email);
}

// ---------- 路由 ----------
// 发送验证码
app.post('/api/send-verification-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: '邮箱不能为空' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000;
  saveVerificationCode(email, code, expires);

  const sent = await sendEmail(email, code);
  if (sent) {
    res.json({ success: true, message: '验证码已发送至邮箱' });
  } else {
    res.json({ success: true, message: `[模拟] 验证码：${code}，请填写此码注册` });
  }
});

// 注册
app.post('/api/register', async (req, res) => {
  const { email, password, verifyCode } = req.body;
  if (!email || !password || !verifyCode) {
    return res.status(400).json({ success: false, message: '请填写所有字段' });
  }

  const record = getVerificationCode(email);
  if (!record || record.code !== verifyCode || record.expires < Date.now()) {
    return res.json({ success: false, message: '验证码无效或已过期' });
  }
  deleteVerificationCode(email);

  const existing = getUserByEmail(email);
  if (existing) {
    return res.json({ success: false, message: '该邮箱已被注册' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = createUser(email, hashedPassword);

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: { id: newUser.id, email: newUser.email, userName: '', userAvatar: '' },
    message: '注册成功',
  });
});

// 登录
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '请填写邮箱和密码' });
  }

  const user = getUserByEmail(email);
  if (!user) {
    return res.json({ success: false, message: '邮箱或密码错误' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.json({ success: false, message: '邮箱或密码错误' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, userName: user.userName, userAvatar: user.userAvatar },
    message: '登录成功',
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('SQLite 数据库已初始化，文件: xunmeng.db');
});