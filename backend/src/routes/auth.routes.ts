import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const token = `jwt-${Buffer.from(email + ':' + Date.now()).toString('base64')}`;
    const user = {
      id: 'usr-1',
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      role: 'Candidate',
      token,
    };

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const token = `jwt-${Buffer.from(email + ':' + Date.now()).toString('base64')}`;
    const user = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'Candidate',
      token,
    };

    return res.json({
      success: true,
      message: 'Account registered successfully',
      token,
      user,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword, action } = req.body;

    if (action === 'request') {
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }
      return res.json({
        success: true,
        message: 'Password reset instructions sent to your email.',
      });
    }

    if (action === 'confirm') {
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
      }
      return res.json({
        success: true,
        message: 'Password has been updated successfully.',
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

export default router;
