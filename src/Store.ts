export class Store {
  private _state: any = {};
  private states: any = {};
  private subscribers: any = {};

  constructor(initialState = {}) {
    this._state = initialState;

    // Using a proxy allows us to have dynamic properties and methods.
    return new Proxy(this, {
      has(target, property) {
        if (property in target.states) {
          return true;
        }
        return property in target;
      },
      get(target, property) {
        if (property in target.states) {
          return target.states[property];
        }
        return target[property];
      },
      set(target, property, value) {
        if (property in target.states) {
          throw new Error('Cannot set state directly. Use registerState or dispatch.');
        }
        return target[property] = value;
      },
      ownKeys(target) {
        return [...Reflect.ownKeys(target), ...Reflect.ownKeys(target.states)];
      },
      deleteProperty(target, property) {
        if (property in target.states) {
          throw new Error('Cannot delete state directly. Use unregisterState.');
        }
        return delete target[property];
      },
    });
  }

  public get state() {
    return this._state;
  }

  protected callbacks(namespace, event) {
    this.subscribers[namespace] = this.subscribers[namespace] || {};
    this.subscribers[namespace][event] = this.subscribers[namespace][event] || [];
    return this.subscribers[namespace][event];
  }

  public dispatch(payload) {
    const publishers = [];
    this._state = Object.keys(this.states).reduce((state, namespace) => {
      state[namespace] = this.states[namespace].reduce(this._state[namespace], payload);

      if (state[namespace] !== this._state[namespace]) {
        publishers.push(() => this.publish(namespace, 'change', {
          state: state[namespace],
          previous: {...this._state[namespace]},
          namespace,
          payload,
        }));
      }

      return state;
    }, {});
    publishers.map(func => func());
  }

  public publish(namespace, event, data) {
    this.callbacks(namespace, event).forEach(callback => callback(data));
  }

  public subscribe(namespace, event, callback) {
    const callbacks = this.callbacks(namespace, event);
    callbacks.push(callback);

    // Return an unsubscribe function.
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  public registerState(namespace, State, definition) {
    this.states[namespace] = new State(this, namespace, definition);
  }

  public unregisterState(namespace) {
    delete this.states[namespace];
  }
}
