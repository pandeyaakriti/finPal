import { PrismaClient } from "@prisma/client";
import { spawn } from "child_process";
import path from "path";

const prisma = new PrismaClient();

// Configuration
const MIN_CORRECTIONS = 100;  // Trigger retraining after 100 corrections
const AUTO_RETRAIN = true;    // Enable/disable automatic retraining

/**
 * Check if retraining should be triggered and start if needed
 */
export async function checkAndTriggerRetraining(force: boolean = false): Promise<{
  triggered: boolean;
  jobId?: string;
  reason?: string;
  correctionsCount?: number;
}> {
  try {
    // Count corrections not yet used for training
    // ONLY from expenses (amountMinus > 0) since income has no categories
    const correctionsCount = await prisma.transactions.count({
      where: { 
        correctedLabel: { not: null },  // User corrected the label
        usedForTraining: false,         // Not yet used for training
        amountMinus: { gt: 0 },         // Only expenses (income has no categories)
        remarks: { not: null }          // Must have remarks to train on
      }
    });

    console.log(`📊 Unused expense corrections: ${correctionsCount}/${MIN_CORRECTIONS}`);

    // Check if there's already a running job
    const runningJob = await prisma.retrainingJob.findFirst({
      where: {
        status: { in: ['pending', 'running'] }
      }
    });

    if (runningJob) {
      return {
        triggered: false,
        reason: 'A retraining job is already in progress',
        correctionsCount
      };
    }

    // Check if we should trigger
    const shouldTrigger = force || (AUTO_RETRAIN && correctionsCount >= MIN_CORRECTIONS);

    if (!shouldTrigger) {
      return {
        triggered: false,
        reason: `Not enough corrections (${correctionsCount}/${MIN_CORRECTIONS})`,
        correctionsCount
      };
    }

    // Create retraining job
    const job = await prisma.retrainingJob.create({
      data: {
        status: 'pending',
        totalCorrections: correctionsCount,
        epochs: 8,
        learningRate: 0.00002
      }
    });

    console.log(`🚀 Starting retraining job ${job.id}...`);

    // Start retraining process
    startRetrainingProcess(job.id);

    return {
      triggered: true,
      jobId: job.id,
      correctionsCount
    };
  } catch (error) {
    console.error('Error in checkAndTriggerRetraining:', error);
    throw error;
  }
}

/**
 * Start Python retraining script in background
 */
function startRetrainingProcess(jobId: string) {
  const pythonScript = path.join(process.cwd(), 'retrain_corrections_only.py');
  
  // Spawn Python process in background
  const pythonProcess = spawn('python3', [pythonScript, '--job-id', jobId], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Log output
  pythonProcess.stdout?.on('data', (data) => {
    console.log(`[Retraining] ${data.toString()}`);
  });

  pythonProcess.stderr?.on('data', (data) => {
    console.error(`[Retraining Error] ${data.toString()}`);
  });

  // Don't wait for the process
  pythonProcess.unref();

  // Update job status
  prisma.retrainingJob.update({
    where: { id: jobId },
    data: { 
      status: 'running',
      startedAt: new Date()
    }
  }).catch(err => {
    console.error('Failed to update job status:', err);
  });
}

/**
 * Get retraining statistics
 */
export async function getRetrainingStats() {
  try {
    // Only count expense corrections (amountMinus > 0)
    const correctionsCount = await prisma.transactions.count({
      where: { 
        correctedLabel: { not: null },
        usedForTraining: false,
        amountMinus: { gt: 0 },
        remarks: { not: null }
      }
    });

    const latestJob = await prisma.retrainingJob.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const runningJob = await prisma.retrainingJob.findFirst({
      where: { status: { in: ['pending', 'running'] } },
      orderBy: { createdAt: 'desc' }
    });

    return {
      unusedCorrections: correctionsCount,
      minCorrections: MIN_CORRECTIONS,
      readyForRetraining: correctionsCount >= MIN_CORRECTIONS,
      autoRetrain: AUTO_RETRAIN,
      latestJob: latestJob ? {
        id: latestJob.id,
        status: latestJob.status,
        totalCorrections: latestJob.totalCorrections,
        bestValAccuracy: latestJob.bestValAccuracy,
        completedAt: latestJob.completedAt
      } : null,
      runningJob: runningJob ? {
        id: runningJob.id,
        status: runningJob.status,
        startedAt: runningJob.startedAt
      } : null
    };
  } catch (error) {
    console.error('Error getting retraining stats:', error);
    throw error;
  }
}

/**
 * Get all retraining jobs
 */
export async function getRetrainingJobs(limit: number = 20) {
  try {
    const jobs = await prisma.retrainingJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}