/**
 * API endpoint to logout from LinkedIn
 * Clears the cookies related to LinkedIn authentication
 */

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear all LinkedIn-related cookies
  res.setHeader('Set-Cookie', [
    'linkedin_access_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
    'linkedin_user_id=; Path=/; Max-Age=0; SameSite=Lax'
  ]);

  return res.status(200).json({ success: true, message: 'Logged out from LinkedIn' });
}
