import { formatGithubUrl } from '../shared/utils';
import isUrl from 'is-url';

export default class GitHub {
  constructor({ userToken, githubUrl }) {
    this.token = userToken;
    this.githubUrl = formatGithubUrl(githubUrl);
  }

  // attempt to reach the github instance. Throw an execption
  // if it's not reachable (e.g. user is not on a VPN)
  static async ping() {
    const GHURL = this.githubUrl;
    const request = { mode: 'no-cors', 'Content-Type': 'application/json' };
    fetch(`${GHURL}/status`, request);
  }

  async call(httpMethod, path, payload) {
    const GHURL = this.githubUrl;

    try {
      const isValidUrl = isUrl(GHURL);

      if (!isValidUrl) {
        throw new Error(`Github Url is not valid`);
      }
    } catch (e) {
      const originalErrorMessage = e.message;
      return new Error(`${originalErrorMessage} for Github Url: ${GHURL}`);
    }

    const url =
      GHURL.indexOf('api.github.com') > 0
        ? `${GHURL}/${path}` // github.com
        : `${GHURL}/api/v3/${path}`; // GHE

    const options = {
      method: httpMethod,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `token ${this.token}`
      }
    };

    if (payload) {
      options.body = JSON.stringify(payload);
    }

    try {
      const response = await fetch(url, options);

      if (response.status !== 200) {
        const bodyText = await response.text();
        throw new Error(
          `Error code ${response.status} when connecting to Github server (${GHURL}). Response: ${bodyText}`
        );
      }

      try {
        const bodyJson = await response.json();
        return bodyJson;
      } catch (e) {
        return new Error('Error parsing JSON from Github server');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
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
