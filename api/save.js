export default async function handler(req, res) {
  // Allow CORS for local testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { file, content } = req.body;
    if (!file || !content) {
      res.status(400).json({ error: 'Missing file or content' });
      return;
    }
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      res.status(500).json({ error: 'GitHub token not configured' });
      return;
    }
    const owner = 'izsimuzsika';
    const repo = 'laptopmobil';

    // fetch current file to get sha
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'laptop-editor'
      }
    });
    if (!getRes.ok) {
      const errData = await getRes.json();
      res.status(getRes.status).json({ error: errData });
      return;
    }
    const fileData = await getRes.json();
    const sha = fileData.sha;

    const message = `Update ${file} via admin interface`;
    const encodedContent = Buffer.from(content).toString('base64');

    const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'laptop-editor',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        content: encodedContent,
        sha: sha
      })
    });

    if (updateRes.ok) {
      res.status(200).json({ ok: true });
    } else {
      const errorData = await updateRes.json();
      res.status(updateRes.status).json({ error: errorData });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || err.toString() });
  }
}
