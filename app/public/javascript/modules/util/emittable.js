export default class Emittable {
  constructor() {
    this.eventListeners = [];
  }

  on(eventName, callback) {
    this.eventListeners.push({
      eventName,
      callback,
    })
  }

  emit(eventName, payload) {
    this.eventListeners
      .filter(listener => listener.eventName === eventName)
      .forEach(listener => listener.callback(payload));
  }
}
