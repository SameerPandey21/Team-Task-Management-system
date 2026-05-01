const express = require('express');
const router = express.Router();
const authenticate = require('../auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Search users by email (for adding to projects)
router.get('/search', authenticate, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email || email.length < 2) {
      return res.json([]);
    }
    const users = await prisma.user.findMany({
      where: {
        email: { contains: email },
        NOT: { id: req.user.id } // exclude self
      },
      select: { id: true, name: true, email: true },
      take: 8
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
