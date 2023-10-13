export class Observable {
  constructor () {
    this._observers = new Set();
  }

  subscribe = (observer) => {
    this._observers.add(observer);
  };

  unsubscribe = (observer) => {
    this._observers.delete(observer);
  };

  _notify = (event, payload) => {
    this._observers.forEach((observer) => observer(event, payload));
  };
}
