// controllers/authController.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

// Create this client ID in your Google Cloud Console
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  const { credential } = req.body; // The token from React

  try {
    // Verify the token with Google's servers
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    // Create your own JWT for the application session
    const token = jwt.sign(
      { email: payload.email, name: payload.name }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      success: true, 
      token, 
      user: { name: payload.name, email: payload.email, picture: payload.picture } 
    });
  } catch (err) {
    console.error('Auth Error:', err);
    res.status(401).json({ success: false, message: 'Invalid Google Token' });
  }
};