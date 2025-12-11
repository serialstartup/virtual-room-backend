import { Request, Response } from 'express';
import { SaveEmailService } from '../services/saveEmailService.js';

export class SaveEmailController {
  static async saveEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Email is required',
          success: false
        });
      }

      const result = await SaveEmailService.saveEmail({ email });

      res.status(201).json({
        success: true,
        message: 'Email saved successfully',
        data: {
          id: result.id,
          email: result.email,
          created_at: result.created_at
        }
      });
    } catch (error) {
      console.error('SaveEmailController saveEmail error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid email format')) {
          return res.status(400).json({
            error: 'Invalid email format',
            success: false
          });
        }
      }

      res.status(500).json({
        error: 'Failed to save email',
        success: false
      });
    }
  }

  static async getAllEmails(req: Request, res: Response) {
    try {
      const emails = await SaveEmailService.getAllEmails();

      res.status(200).json({
        success: true,
        data: emails,
        count: emails.length
      });
    } catch (error) {
      console.error('SaveEmailController getAllEmails error:', error);
      
      res.status(500).json({
        error: 'Failed to fetch emails',
        success: false
      });
    }
  }

  static async getEmailById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          error: 'Invalid ID format',
          success: false
        });
      }

      const email = await SaveEmailService.getEmailById(id);

      if (!email) {
        return res.status(404).json({
          error: 'Email not found',
          success: false
        });
      }

      res.status(200).json({
        success: true,
        data: email
      });
    } catch (error) {
      console.error('SaveEmailController getEmailById error:', error);
      
      res.status(500).json({
        error: 'Failed to fetch email',
        success: false
      });
    }
  }

  static async updateEmailStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          error: 'Invalid ID format',
          success: false
        });
      }

      if (!status) {
        return res.status(400).json({
          error: 'Status is required',
          success: false
        });
      }

      const result = await SaveEmailService.updateEmailStatus(id, status);

      res.status(200).json({
        success: true,
        message: 'Email status updated successfully',
        data: result
      });
    } catch (error) {
      console.error('SaveEmailController updateEmailStatus error:', error);
      
      res.status(500).json({
        error: 'Failed to update email status',
        success: false
      });
    }
  }

  static async deleteEmail(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          error: 'Invalid ID format',
          success: false
        });
      }

      await SaveEmailService.deleteEmail(id);

      res.status(200).json({
        success: true,
        message: 'Email deleted successfully'
      });
    } catch (error) {
      console.error('SaveEmailController deleteEmail error:', error);
      
      res.status(500).json({
        error: 'Failed to delete email',
        success: false
      });
    }
  }
}