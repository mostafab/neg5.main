export default class EmittionService {
  constructor() {
    this.eventListeners = [];
  }

  on(eventName, callback) {
    this.eventListeners.push({
      eventName,
      callback,
    })
  }

  emit(eventName) {
    
  }
}
