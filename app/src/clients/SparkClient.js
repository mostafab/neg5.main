import fetch from 'node-fetch';

export default class SparkClient {
  constructor() {
    this.host = process.env.NEG5_API_BASE_URL;
  }

  async get(url) {
    try {
      return (await fetch(this.host + url)).json();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async post(url) {
    try {
      return (await fetch(this.host + url, {
        method: 'POST',
      })).json();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
