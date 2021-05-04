export const formatGithubUrl = githubUrl => {
  githubUrl = githubUrl.replace(/\/+$/, '').trim();
  return githubUrl;
};

export const isUrlSafe = url => {
  try {
    const fullUrl = new URL(url);
    const protocol = fullUrl.protocol;

    if (protocol === 'https:' || protocol === 'http:') {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
