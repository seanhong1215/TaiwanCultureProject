/**
 * 取代 json-server-auth 的 /register、/signin。
 *
 * 簽發格式維持跟原本一致（{ accessToken, user }、JWT payload 用
 * { sub: <userId> }），因為 auth.js 的 resolveIdentity() 跟前端的
 * localStorage 存取都是照這個形狀寫的，不改格式才能兩邊都不用動。
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma.js';
import { ADMIN_ROLES } from '../auth.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'json-server-auth-123456';
const TOKEN_TTL = '7d';

const PUBLIC_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatar: true,
  uuid: true,
  signInHistory: true,
  currentStreak: true,
  rewards: true,
  tickets: true,
  createdAt: true,
};

const issueToken = (userId) => jwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: TOKEN_TTL });

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role, avatar } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email 和 password 為必填' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: '此 email 已被註冊' });
    }

    // 公開註冊端點不信任 client 傳來的管理者角色——
    // 沒有這一段，任何人都能自己 POST { role: "ADMIN" } 拿到後台權限。
    const safeRole = ADMIN_ROLES.includes(role) ? 'Member' : role || 'Member';

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name || '',
        role: safeRole,
        avatar: avatar || null,
      },
      select: PUBLIC_FIELDS,
    });

    res.status(201).json({ accessToken: issueToken(user.id), user });
  } catch (err) {
    next(err);
  }
});

router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email 和 password 為必填' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: '帳號或密碼錯誤' });
    }

    const { password: _password, ...publicUser } = user;
    res.status(200).json({ accessToken: issueToken(user.id), user: publicUser });
  } catch (err) {
    next(err);
  }
});

export default router;
