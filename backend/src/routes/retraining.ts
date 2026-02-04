import { Router } from "express";
import prisma from "../lib/prisma";
import { 
  checkAndTriggerRetraining, 
  getRetrainingStats,
  getRetrainingJobs 
} from "../services/retraining";

const router = Router();

/**
 * GET /api/retraining/stats
 * Get retraining statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await getRetrainingStats();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to fetch stats",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/retraining/trigger
 * Manually trigger retraining
 */
router.post("/trigger", async (req, res) => {
  try {
    const { force = true } = req.body;
    
    const result = await checkAndTriggerRetraining(force);
    
    if (result.triggered) {
      res.json({
        success: true,
        message: "Retraining started",
        jobId: result.jobId,
        correctionsCount: result.correctionsCount
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.reason,
        correctionsCount: result.correctionsCount
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to trigger retraining",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/retraining/jobs
 * Get retraining job history
 */
router.get("/jobs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const jobs = await getRetrainingJobs(limit);
    res.json({ jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to fetch jobs",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/retraining/jobs/:id
 * Get specific job details
 */
router.get("/jobs/:id", async (req, res) => {
  try {
    const job = await prisma.retrainingJob.findUnique({
      where: { id: req.params.id }
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to fetch job",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * PUT /api/retraining/jobs/:id
 * Update job status (called by Python script)
 */
router.put("/jobs/:id", async (req, res) => {
  try {
    const { status, trainSamples, valSamples, bestValAccuracy, errorMessage } = req.body;

    if (!status || !['running', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status" 
      });
    }

    const job = await prisma.retrainingJob.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(trainSamples && { trainSamples }),
        ...(valSamples && { valSamples }),
        ...(bestValAccuracy && { bestValAccuracy }),
        ...(errorMessage && { errorMessage }),
        ...(status === 'completed' || status === 'failed' ? { completedAt: new Date() } : {})
      }
    });

    res.json({ success: true, job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to update job",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/retraining/export-corrections
 * Export ONLY expense corrections as CSV for Python script
 * Skips income transactions (amountPlus > 0) since they have no categories
 */
router.get("/export-corrections", async (req, res) => {
  try {
    // Get ONLY expense corrections (amountMinus > 0)
    // Income transactions have no categories/remarks, so skip them
    const corrections = await prisma.transactions.findMany({
      where: { 
        correctedLabel: { not: null },
        usedForTraining: false,
        amountMinus: { gt: 0 },        // Only expenses
        remarks: { not: null }          // Must have remarks
      },
      select: {
        remarks: true,
        correctedLabel: true
      }
    });

    // Build CSV
    const csvRows = ['text,label'];

    corrections.forEach(item => {
      if (item.remarks && item.correctedLabel) {
        const text = item.remarks.replace(/"/g, '""');
        csvRows.push(`"${text}","${item.correctedLabel}"`);
      }
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=corrections.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to export corrections",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/retraining/mark-used
 * Mark all expense corrections as used (called by Python script after successful training)
 */
router.post("/mark-used", async (req, res) => {
  try {
    // Mark only expense corrections as used
    await prisma.transactions.updateMany({
      where: { 
        correctedLabel: { not: null },
        usedForTraining: false,
        amountMinus: { gt: 0 }
      },
      data: { usedForTraining: true }
    });

    res.json({ 
      success: true,
      message: "All expense corrections marked as used"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to mark corrections as used",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;