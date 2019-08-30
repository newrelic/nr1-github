
import GITHUB_URL from '../../CONFIGURE_ME'

export default class GitHub {
  constructor(userToken) {
    this.token = userToken
  }

  // attempt to reach the github instance. Throw an execption
  // if it's not reachable (e.g. user is not on a VPN)
  static async ping() {
    const request = {mode: 'no-cors', 'content-type': 'application/json'}
    fetch(`${GITHUB_URL}/status.json`, request)
  }

  async call(httpMethod, path, payload) {
    const url = `${GITHUB_URL}/api/v3/${path}`
    const options = {
      method: httpMethod,
      headers: {
        "content-type": 'application/json',
        "Authorization": `token ${this.token}`
      }
    }
    if(payload) {
      options.body = JSON.stringify(payload)
    }
    const response = await fetch(url, options)
    return response.json()
  }

  async get(path) {
    return await this.call('get', path)
  }

  async post(path, payload) {
    return await this.call('post', path, payload)
  }
}


