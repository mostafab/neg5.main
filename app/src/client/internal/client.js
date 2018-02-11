import axios from 'axios';

export default class InternalClient {

  /**
   * Override this method in sub classes
   */
  getHost() {
    return '';
  }

  async post(url, payload) {
    const response = await axios.post(this.getHost() + url, payload);
    return response.data;
  }

}
