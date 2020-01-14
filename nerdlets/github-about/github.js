export default class GitHub {
  constructor({ userToken, githubUrl }) {
    this.token = userToken;
    this.githubUrl = githubUrl;
  }

  // attempt to reach the github instance. Throw an execption
  // if it's not reachable (e.g. user is not on a VPN)
  static async ping() {
    const GHURL = this.githubUrl.trim();
    const request = { mode: 'no-cors', 'Content-Type': 'application/json' };
    fetch(`${GHURL}/status`, request);
  }

  async call(httpMethod, path, payload) {
    const GHURL = this.githubUrl.trim();
    const url =
      GHURL.indexOf('api.github.com') > 0
        ? `${GHURL}/${path}` // github.com
        : `${GHURL}/api/v3/${path}`; // GHE

    const options = {
      method: httpMethod,
      // mode: 'no-cors',
      headers: {
        Accept: 'application/json',
        // 'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        Authorization: `token ${this.token}`
      }
    };

    if (payload) {
      options.body = JSON.stringify(payload);
    }

    try {
      const response = await fetch(url, options);
      return response.json();
    } catch (e) {
      console.debug(e);
      return e;
    }
  }

  async get(path) {
    return this.call('GET', path);
  }

  async post(path, payload) {
    return this.call('POST', path, payload);
  }
}
