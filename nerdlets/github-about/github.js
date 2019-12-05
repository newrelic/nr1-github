import GITHUB_URL from '../../CONFIGURE_ME';

export default class GitHub {
  constructor(userToken) {
    this.token = userToken;
  }

  // attempt to reach the github instance. Throw an execption
  // if it's not reachable (e.g. user is not on a VPN)
  static async ping() {
    const GHURL = GITHUB_URL.trim();
    const request = { mode: 'no-cors', 'Content-Type': 'application/json' };
    fetch(`${GHURL}/status`, request);
  }

  async call(httpMethod, path, payload) {
    const GHURL = GITHUB_URL.trim();
    const url =
      GHURL.indexOf('api.github.com') === -1
        ? `${GHURL}/api/v3/${path}`
        : `${GHURL}/${path}`;
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
    const response = await fetch(url, options);
    // console.debug(response);
    return response.json();
  }

  async get(path) {
    return this.call('GET', path);
  }

  async post(path, payload) {
    return this.call('POST', path, payload);
  }
}
