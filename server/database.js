// server/database.js
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs'); // 密码加密仍然需要

// 1. 连接数据库（文件会自动创建）
const db = new Database(path.join(__dirname, 'xunmeng.db'));

// 2. 建表（初始化）
// 这里我们使用 WAL 模式来提升性能，并打开外键约束
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const createUserTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    userName TEXT DEFAULT '',
    userAvatar TEXT DEFAULT '',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;
db.exec(createUserTable);

// 3. 封装一个 User 对象，提供类似模型的接口
const User = {
  // 根据邮箱查找用户
  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },
  // 根据ID查找用户
  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },
  // 创建新用户
  create: async (userData) => {
    const { email, password, userName = '', userAvatar = '' } = userData;
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare(`
      INSERT INTO users (email, password, userName, userAvatar)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(email, hashedPassword, userName, userAvatar);
    // 返回新创建的用户对象
    return User.findById(info.lastInsertRowid);
  },
  // 验证密码
  comparePassword: async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = { db, User };