import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const AI_API_URL = process.env.AI_API_URL || "http://localhost:8001";

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

export class AILabelingService {
  
  /**
   * Label all unlabeled expense transactions for a user
   */
  async labelUserTransactions(userId: number): Promise<void> {
    try {
      // Get all transactions with amountMinus > 0 (expenses) that haven't been labeled
      const unlabeledTransactions = await prisma.transactions.findMany({
        where: {
          amountMinus: { gt: 0 },
          predicted: null,
          remarks: { not: null }
        }
      });

      console.log(`Found ${unlabeledTransactions.length} unlabeled expense transactions`);

      // Label each transaction
      for (const transaction of unlabeledTransactions) {
        await this.labelSingleTransaction(transaction.id);
      }

      console.log('✅ All transactions labeled successfully');
    } catch (error) {
      console.error('Error labeling transactions:', error);
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
        console.log(`Transaction ${transactionId} has no remarks, skipping`);
        return;
      }

      // Call AI API for prediction
      const prediction = await this.getPrediction(transaction.remarks);

      // Update transaction with prediction
      await prisma.transactions.update({
        where: { id: transactionId },
        data: {
          predicted: prediction.prediction,
          predictedLabel: LABEL_MAP[prediction.prediction],
          confidence: prediction.confidence || 0
        }
      });

      console.log(`✅ Labeled transaction ${transactionId}: ${LABEL_MAP[prediction.prediction]}`);
    } catch (error) {
      console.error(`Error labeling transaction ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Get prediction from AI API
   */
  private async getPrediction(text: string): Promise<PredictionResponse> {
    try {
      const response = await axios.post(`${AI_API_URL}/predict`, { text });
      return response.data as PredictionResponse;
    } catch (error) {
      console.error('Error calling AI API:', error);
      throw new Error('Failed to get prediction from AI service');
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

      // Log feedback for retraining
      await prisma.feedback.create({
        data: {
          text: transaction.remarks || '',
          predicted: transaction.predicted || 0,
          corrected: correctedCategoryId,
          confidence: transaction.confidence || 0
        }
      });

      console.log(`✅ Correction recorded for transaction ${transactionId}`);
    } catch (error) {
      console.error('Error recording correction:', error);
      throw error;
    }
  }

  /**
   * Get all corrections for retraining
   */
  async getCorrectionsForRetraining(): Promise<Array<{text: string, label: number}>> {
    try {
      const corrections = await prisma.feedback.findMany({
        select: {
          text: true,
          corrected: true
        }
      });

      return corrections.map(c => ({
        text: c.text,
        label: c.corrected
      }));
    } catch (error) {
      console.error('Error fetching corrections:', error);
      throw error;
    }
  }

  /**
   * Export corrections to CSV for retraining
   */
  async exportCorrectionsToCSV(): Promise<string> {
    try {
      const corrections = await this.getCorrectionsForRetraining();
      
      // Create CSV content
      let csv = 'text,label\n';
      corrections.forEach(c => {
        // Escape quotes in text
        const escapedText = c.text.replace(/"/g, '""');
        csv += `"${escapedText}",${c.label}\n`;
      });

      return csv;
    } catch (error) {
      console.error('Error exporting corrections:', error);
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

      const totalFeedback = await prisma.feedback.count();

      return {
        totalExpenses,
        labeled,
        unlabeled: totalExpenses - labeled,
        corrected,
        totalFeedback,
        labelingRate: totalExpenses > 0 ? (labeled / totalExpenses * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }
}

export const aiLabelingService = new AILabelingService();