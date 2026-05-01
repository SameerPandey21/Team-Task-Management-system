const express = require('express');
const router = express.Router();
const authenticate = require('../auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Task
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, dueDate, priority, projectId, assignedToId } = req.body;
    
    // Check if user is a member of the project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(m => m.id === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'Medium',
        status: 'To Do',
        projectId,
        assignedToId: assignedToId || null,
        createdById: req.user.id
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { status, title, description, dueDate, priority, assignedToId } = req.body;
    const taskId = req.params.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } }
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check if user is a member of the project
    const isMember = task.project.members.some(m => m.id === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    // Admin (owner) can update everything, members can only update status if assigned to them
    const isAdmin = task.project.ownerId === req.user.id;
    const isAssignedToMe = task.assignedToId === req.user.id;

    if (!isAdmin && !isAssignedToMe) {
        return res.status(403).json({ message: 'Only admin or assigned member can update this task' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    
    // Only admin can change these fields
    if (isAdmin) {
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (priority) updateData.priority = priority;
      if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } }
      }
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks for a specific project
router.get('/project/:projectId', authenticate, async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true }
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isMember = project.members.some(m => m.id === req.user.id);
        if (!isMember) return res.status(403).json({ message: 'Access denied' });

        const tasks = await prisma.task.findMany({
            where: { projectId },
            include: {
                assignedTo: { select: { id: true, name: true } },
                createdBy: { select: { id: true, name: true } }
            }
        });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } }
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isMember = task.project.members.some(m => m.id === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const isAdmin = task.project.ownerId === req.user.id;
    const isCreator = task.createdById === req.user.id;
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Only admin or task creator can delete this task' });
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
