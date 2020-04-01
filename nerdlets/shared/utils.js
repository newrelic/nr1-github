export const formatGithubUrl = githubUrl => {
  githubUrl = githubUrl.replace(/\/+$/, '').trim();
  return githubUrl;
};
