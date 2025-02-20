export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, context, model } = req.body;

    if (!question || !context) {
      return res.status(400).json({ error: 'Question and context are required' });
    }

    const response = await processFollowUpQuestion(question, context, model);
    return res.status(200).json(response);
  } catch (error) {
    return handleApiError(error, res);
  }
} 