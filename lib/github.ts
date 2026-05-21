function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function apiUrl(filePath: string): string {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  return `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
}

export async function getFileFromGitHub(filePath: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(apiUrl(filePath), { headers: githubHeaders() });
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status} for ${filePath}`);
  const data = await res.json();
  const content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
  return { content, sha: data.sha };
}

export async function updateFileInGitHub(
  filePath: string,
  content: string,
  sha: string,
  message?: string
): Promise<void> {
  const encodedContent = Buffer.from(content).toString('base64');
  const res = await fetch(apiUrl(filePath), {
    method: 'PUT',
    headers: githubHeaders(),
    body: JSON.stringify({
      message: message ?? `content: update ${filePath}`,
      content: encodedContent,
      sha,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub PUT failed: ${res.status} — ${JSON.stringify(err)}`);
  }
}

export async function uploadFileToGitHub(filePath: string, base64Content: string): Promise<void> {
  let sha: string | undefined;
  try {
    const existing = await getFileFromGitHub(filePath);
    sha = existing.sha;
  } catch {
    // File doesn't exist yet — that's fine
  }

  const body: Record<string, string> = {
    message: `upload: add ${filePath}`,
    content: base64Content,
  };
  if (sha) body.sha = sha;

  const res = await fetch(apiUrl(filePath), {
    method: 'PUT',
    headers: githubHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub upload failed: ${res.status} — ${JSON.stringify(err)}`);
  }
}
