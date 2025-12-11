import { Router } from 'express';
import { SaveEmailController } from '../controllers/saveEmailController.js';

const router = Router();

// POST /save-email - Save a new email address
router.post('/', SaveEmailController.saveEmail);

// GET /save-email - Get all email addresses (admin endpoint)
router.get('/', SaveEmailController.getAllEmails);

// GET /save-email/:id - Get specific email by ID
router.get('/:id', SaveEmailController.getEmailById);

// PUT /save-email/:id - Update email status
router.put('/:id', SaveEmailController.updateEmailStatus);

// DELETE /save-email/:id - Delete email
router.delete('/:id', SaveEmailController.deleteEmail);

export default router;