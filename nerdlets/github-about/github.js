
export default class GitHub {
  constructor(userToken, host) {
    this.token = userToken
    this.host = "https://source.datanerd.us/api/v3"
  }

  async call(httpMethod, path, payload) {
    const url = `${this.host}/${path}`
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

  get(path) {
    return this.call('get', path)
  }

  post(path, payload) {
    return this.call('post', path, payload)
  }
}


