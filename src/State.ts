import {Store} from './Store';

export class State {
  protected store: Store;
  protected getters: any;
  protected actions: any;
  protected namespace: string;
  protected definition: any;

  constructor(store, namespace, definition) {
    this.store = store;
    this.namespace = namespace;
    this.definition = definition;

    // Using a proxy allows us to have dynamic properties and methods.
    return new Proxy(this, {
      has(target, property) {
        if ('getters' in target && property in target.getters) {
          return true;
        }
        if ('actions' in target && property in target.actions) {
          return true;
        }
        if ('state' in target && property in target.state) {
          return true;
        }
        return property in target;
      },
      get(target, property) {
        if ('getters' in target && property in target.getters) {
          const state = target.state;
          return target.getters[property](target.state);
        }
        if ('actions' in target && property in target.actions) {
          return target.actions[property];
        }
        if ('state' in target && property in target.state) {
          return target.state[property];
        }
        return target[property];
      },
      set(target, property, value) {
        if ('getters' in target && property in target.getters) {
          throw new Error('Cannot add getter directly. Extend the State class.');
        }
        if ('actions' in target && property in target.actions) {
          throw new Error('Cannot add actions directly. Extend the State class.');
        }
        if ('state' in target && property in target.state) {
          throw new Error('Cannot modify state directly. Use dispatch instead.');
        }
        return target[property] = value;
      },
      ownKeys(target) {
        return [
          ...Reflect.ownKeys(target.getters),
          ...Reflect.ownKeys(target.actions),
          ...Reflect.ownKeys(target.state),
          ...Reflect.ownKeys(target)
        ];
      },
      deleteProperty(target, property) {
        if ('getters' in target && property in target.getters) {
          throw new Error('Cannot delete getter directly. Extend the State class.');
        }
        if ('actions' in target && property in target.actions) {
          throw new Error('Cannot delete actions directly. Extend the State class.');
        }
        if ('state' in target && property in target.state) {
          throw new Error('Cannot modify state directly. Use dispatch instead.');
        }
        return delete target[property];
      },
    });
  }

  protected get defaultState() {
    return {};
  }

  public get state() {
    return this.store.state[this.namespace] || this.defaultState;
  }

  public reduce(state = this.defaultState, payload) {
    return state;
  }
}
