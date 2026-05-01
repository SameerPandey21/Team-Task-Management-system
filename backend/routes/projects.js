const express = require('express');
const router = express.Router();
const authenticate = require('../auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Project
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: 'Not Started',
        ownerId: req.user.id,
        members: {
          connect: [{ id: req.user.id }]
        }
      },
      include: {
        members: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true } }
      }
    });
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's projects
router.get('/', authenticate, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { id: req.user.id }
        }
      },
      include: {
        owner: { select: { id: true, name: true } },
        members: { select: { id: true, name: true, email: true } },
        tasks: { select: { id: true, status: true } }
      }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true } },
        members: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(m => m.id === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project status (Admin only)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Not Started', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.ownerId !== req.user.id) return res.status(403).json({ message: 'Only admin can update project status' });

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add/Remove members (ID + name, no email required)
router.put('/:id/members', authenticate, async (req, res) => {
  try {
    const { action, userId, name } = req.body;
    const projectId = req.params.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.ownerId !== req.user.id) return res.status(403).json({ message: 'Only admin can manage members' });

    let updatedProject;

    if (action === 'add') {
      // Validate: userId must be exactly 5 digits
      if (!/^\d{5}$/.test(userId)) {
        return res.status(400).json({ message: 'Member ID must be exactly 5 numeric digits' });
      }
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Member name is required' });
      }
      // Max 5 members total (including owner)
      if (project.members.length >= 5) {
        return res.status(400).json({ message: 'Maximum 5 members allowed per project' });
      }
      // Check if already a member
      if (project.members.some(m => m.id === userId)) {
        return res.status(400).json({ message: 'This member is already in the project' });
      }

      let userToAdd = await prisma.user.findUnique({ where: { id: userId } });

      if (!userToAdd) {
        // Create a placeholder user with the given ID and name
        userToAdd = await prisma.user.create({
          data: {
            id: userId,
            name: name.trim(),
            email: `member_${userId}@placeholder.com`,
            password: 'placeholder_not_for_login'
          }
        });
      }

      updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { members: { connect: [{ id: userToAdd.id }] } },
        include: { members: { select: { id: true, name: true, email: true } } }
      });
    } else if (action === 'remove') {
      if (userId === project.ownerId) return res.status(400).json({ message: 'Cannot remove the project owner' });
      updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { members: { disconnect: [{ id: userId }] } },
        include: { members: { select: { id: true, name: true, email: true } } }
      });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.ownerId !== req.user.id) return res.status(403).json({ message: 'Only admin can delete project' });

    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
