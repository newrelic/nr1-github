export const formatGithubUrl = githubUrl => {
  githubUrl = githubUrl.replace(/\/+$/, '').trim();
  return githubUrl;
};

export const sanitizeUrl = url => {
  try {
    const fullUrl = new URL(url);
    const protocol = fullUrl.protocol;
    if (protocol === 'https:' || protocol === 'http:') {
      return fullUrl.toString();
    }
  } catch {
    return '';
  }
  return '';
};

export const isUrlSafe = url => {
  return sanitizeUrl(url) !== '';
};

export const isPublicGithubApi = url => {
  try {
    return new URL(url).hostname === 'api.github.com';
  } catch {
    return false;
  }
};
