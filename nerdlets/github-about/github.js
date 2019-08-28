
export default class GitHub {
  constructor(userToken, host) {
    this.token = "abf489f34269c38278ff58ccc6f151868032f310"
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


