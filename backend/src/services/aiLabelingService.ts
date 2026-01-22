// backend/src/services/aiLabelingService.ts
import { PrismaClient } from "@prisma/client";
import { spawn } from "child_process";
import path from "path";

const prisma = new PrismaClient();

interface PredictionResponse {
  prediction: number;
  confidence?: number;
}

interface DetailedPrediction {
  text: string;
  category: string;
  confidence: number;
  confidence_level: string;
  top_predictions: Array<{
    category: string;
    confidence: number;
  }>;
}

// Label mapping - matches your AI model's categories
const LABEL_MAP: { [key: number]: string } = {
  0: 'education',
  1: 'entertainment',
  2: 'food & dining',
  3: 'healthcare',
  4: 'insurance',
  5: 'miscellaneous',
  6: 'rent',
  7: 'savings/investments',
  8: 'shopping',
  9: 'subscriptions',
  10: 'tax',
  11: 'transfers',
  12: 'transportation',
  13: 'utilities'
};

// Reverse map for faster lookup
const LABEL_TO_ID: { [key: string]: number } = Object.entries(LABEL_MAP).reduce(
  (acc, [id, label]) => ({ ...acc, [label]: parseInt(id) }),
  {}
);

export class AILabelingService {
  
  /**
   * Detect the correct Python command for the current platform
   */
  private getPythonCommand(): string {
    // On Windows, try 'python' first, then 'python3'
    // On Unix/Mac, try 'python3' first, then 'python'
    return process.platform === 'win32' ? 'python' : 'python3';
  }

  /**
   * Label all unlabeled expense transactions
   */
  async labelUserTransactions(): Promise<void> {
    try {
      // Get all transactions with amountMinus > 0 (expenses) that haven't been labeled
      const unlabeledTransactions = await prisma.transactions.findMany({
        where: {
          amountMinus: { gt: 0 },
          predicted: null,
          remarks: { not: null }
        }
      });

      console.log(`\n📊 Found ${unlabeledTransactions.length} unlabeled expense transactions`);

      if (unlabeledTransactions.length === 0) {
        console.log("✅ No unlabeled transactions to process");
        return;
      }

      let labeled = 0;
      let failed = 0;

      // Label each transaction
      for (const transaction of unlabeledTransactions) {
        try {
          await this.labelSingleTransaction(transaction.id);
          labeled++;
          
          // Progress indicator
          if (labeled % 10 === 0) {
            console.log(`⏳ Progress: ${labeled}/${unlabeledTransactions.length} labeled`);
          }
        } catch (error) {
          failed++;
          console.error(`❌ Failed to label transaction ${transaction.id}:`, error instanceof Error ? error.message : error);
        }
      }

      console.log(`\n✅ Labeling complete: ${labeled} labeled, ${failed} failed\n`);
    } catch (error) {
      console.error('❌ Error labeling transactions:', error);
      throw error;
    }
  }

  /**
   * Label a single transaction
   */
  async labelSingleTransaction(transactionId: number): Promise<void> {
    try {
      const transaction = await prisma.transactions.findUnique({
        where: { id: transactionId }
      });

      if (!transaction || !transaction.remarks) {
        console.log(`⚠️ Transaction ${transactionId} has no remarks, skipping`);
        return;
      }

      // Call Python prediction
      const prediction = await this.getPrediction(transaction.remarks);

      // Update transaction with prediction
      const updated = await prisma.transactions.update({
        where: { id: transactionId },
        data: {
          predicted: prediction.prediction,
          predictedLabel: LABEL_MAP[prediction.prediction],
          confidence: prediction.confidence || 0
        }
      });

      console.log(`✅ Transaction ${transactionId}: "${transaction.remarks.substring(0, 40)}..." → ${LABEL_MAP[prediction.prediction]} (${(prediction.confidence! * 100).toFixed(1)}%)`);
    } catch (error) {
      console.error(`❌ Error labeling transaction ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Get prediction from Python script (exposed for testing)
   */
  async getPrediction(text: string): Promise<PredictionResponse> {
    return new Promise((resolve, reject) => {
      // Path to Python script
      const pythonScript = path.resolve(__dirname, "../../../ai/predict.py");
      const pythonCommand = this.getPythonCommand();
      
      // Check if file exists
      const fs = require('fs');
      if (!fs.existsSync(pythonScript)) {
        reject(new Error(`Python script not found at: ${pythonScript}`));
        return;
      }
      
      // Spawn Python process with --predict flag
      const python = spawn(pythonCommand, [pythonScript, "--predict", text], {
        shell: process.platform === 'win32' // Use shell on Windows
      });
      
      let dataString = "";
      let errorString = "";

      python.stdout.on("data", (data) => {
        dataString += data.toString();
      });

      python.stderr.on("data", (data) => {
        errorString += data.toString();
      });

      python.on("close", (code) => {
        if (code !== 0) {
          console.error(`\n❌ Python Error for text: "${text.substring(0, 50)}..."`);
          console.error(`Exit code: ${code}`);
          console.error("STDERR:", errorString || "(empty)");
          console.error("STDOUT:", dataString || "(empty)");
          console.error("Python command:", pythonCommand);
          console.error("Script path:", pythonScript);
          reject(new Error(`Python failed (code ${code}): ${errorString || 'No error message'}`));
          return;
        }

        try {
          // Parse JSON output from Python
          const cleanOutput = dataString.trim();
          
          // Log raw output for debugging
          if (!cleanOutput) {
            reject(new Error(`Python returned empty output for text: "${text}"`));
            return;
          }
          
          // Remove any non-JSON output (warnings, etc.)
          const jsonMatch = cleanOutput.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            console.error("❌ No JSON found in output:", cleanOutput);
            reject(new Error(`No JSON found in Python output: ${cleanOutput}`));
            return;
          }
          
          const result = JSON.parse(jsonMatch[0]);
          
          // Validate result structure
          if (!result.category) {
            console.error("❌ Invalid result structure:", result);
            reject(new Error("Python result missing 'category' field"));
            return;
          }
          
          // Extract category ID from category name
          const categoryId = LABEL_TO_ID[result.category];
          
          if (categoryId === undefined) {
            console.warn(`⚠️ Unknown category "${result.category}" for text: "${text}", using miscellaneous`);
          }
          
          resolve({
            prediction: categoryId !== undefined ? categoryId : 5, // Default to miscellaneous
            confidence: result.confidence || 0
          });
        } catch (error) {
          console.error("❌ Failed to parse Python output:");
          console.error("Raw output:", dataString);
          console.error("Parse error:", error);
          reject(new Error(`Failed to parse Python output: ${error instanceof Error ? error.message : error}`));
        }
      });

      python.on("error", (error) => {
        console.error("❌ Failed to spawn Python process:", error);
        console.error(`Make sure Python is installed and accessible via '${pythonCommand}' command`);
        reject(new Error(`Python process error: ${error.message}`));
      });
    });
  }

  /**
   * Test Python connection
   */
  async testPythonConnection(): Promise<boolean> {
    try {
      console.log("\n🔍 Testing Python connection...");
      const result = await this.getPrediction("Netflix subscription test");
      console.log(`✅ Python test successful! Predicted: ${LABEL_MAP[result.prediction]} (${(result.confidence! * 100).toFixed(1)}%)\n`);
      return true;
    } catch (error) {
      console.error("❌ Python test failed:", error);
      return false;
    }
  }

  /**
   * Handle user correction of a prediction
   */
  async correctPrediction(
    transactionId: number, 
    correctedCategoryId: number
  ): Promise<void> {
    try {
      const transaction = await prisma.transactions.findUnique({
        where: { id: transactionId }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Update transaction with correction
      await prisma.transactions.update({
        where: { id: transactionId },
        data: {
          corrected: correctedCategoryId,
          correctedLabel: LABEL_MAP[correctedCategoryId]
        }
      });

      console.log(`✅ Correction recorded for transaction ${transactionId}`);
    } catch (error) {
      console.error('Error recording correction:', error);
      throw error;
    }
  }

  /**
   * Get labeling statistics
   */
  async getStats() {
    try {
      const totalExpenses = await prisma.transactions.count({
        where: { amountMinus: { gt: 0 } }
      });

      const labeled = await prisma.transactions.count({
        where: { 
          amountMinus: { gt: 0 },
          predicted: { not: null }
        }
      });

      const corrected = await prisma.transactions.count({
        where: { 
          amountMinus: { gt: 0 },
          corrected: { not: null }
        }
      });

      return {
        totalExpenses,
        labeled,
        unlabeled: totalExpenses - labeled,
        corrected,
        labelingRate: totalExpenses > 0 ? ((labeled / totalExpenses) * 100).toFixed(2) : "0.00"
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }
}

export const aiLabelingService = new AILabelingService();