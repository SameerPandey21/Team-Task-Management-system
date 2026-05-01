const express = require('express');
const router = express.Router();
const authenticate = require('../auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all projects the user is a member of, including tasks for status
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { id: userId } }
      },
      include: {
        owner: { select: { id: true, name: true } },
        members: { select: { id: true, name: true } },
        tasks: { select: { id: true, status: true, dueDate: true, assignedToId: true } }
      }
    });

    if (projects.length === 0) {
      return res.json({
        totalTasks: 0,
        tasksByStatus: { 'To Do': 0, 'In Progress': 0, 'Done': 0 },
        overdueTasks: 0,
        myTasks: 0,
        projects: [],
        projectsByStatus: { 'Not Started': 0, 'In Progress': 0, 'Completed': 0 }
      });
    }

    const allTasks = projects.flatMap(p => p.tasks);

    const totalTasks = allTasks.length;
    const tasksByStatus = {
      'To Do': allTasks.filter(t => t.status === 'To Do').length,
      'In Progress': allTasks.filter(t => t.status === 'In Progress').length,
      'Done': allTasks.filter(t => t.status === 'Done').length
    };
    const overdueTasks = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length;
    const myTasks = allTasks.filter(t => t.assignedToId === userId).length;

    // Build project summaries using stored status (set by admin)
    const projectSummaries = projects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      owner: p.owner,
      members: p.members,
      totalTasks: p.tasks.length,
      doneTasks: p.tasks.filter(t => t.status === 'Done').length,
      status: p.status || 'Not Started'
    }));

    const projectsByStatus = {
      'Not Started': projectSummaries.filter(p => p.status === 'Not Started').length,
      'In Progress': projectSummaries.filter(p => p.status === 'In Progress').length,
      'Completed': projectSummaries.filter(p => p.status === 'Completed').length
    };

    res.json({
      totalTasks,
      tasksByStatus,
      overdueTasks,
      myTasks,
      projects: projectSummaries,
      projectsByStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
