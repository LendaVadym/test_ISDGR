// State machine implementation

class State {
  constructor(name) {
    this.name = name;
    this.transitions = {};
    this.onEnter = null;
    this.onExit = null;
    this.onUpdate = null;
  }

  /**
   * Adds a transition
   */
  addTransition(event, targetState, guard = null, action = null) {
    this.transitions[event] = {
      target: targetState,
      guard,
      action
    };
    return this;
  }

  /**
   * Handles state entry
   */
  enter(context) {
    if (this.onEnter) {
      this.onEnter(context);
    }
  }

  /**
   * Handles state exit
   */
  exit(context) {
    if (this.onExit) {
      this.onExit(context);
    }
  }

  /**
   * Handles state update
   */
  update(context, delta) {
    if (this.onUpdate) {
      this.onUpdate(context, delta);
    }
  }

  /**
   * Gets transition for event
   */
  getTransition(event) {
    return this.transitions[event];
  }
}

class StateMachine {
  constructor(initialState) {
    this.states = new Map();
    this.currentState = initialState;
    this.previousState = null;
    this.context = {};
    this.listeners = [];
    this.isRunning = false;
    this.history = [];
    this.maxHistory = 100;
  }

  /**
   * Adds a state
   */
  addState(state) {
    this.states.set(state.name, state);
    return this;
  }

  /**
   * Gets a state
   */
  getState(name) {
    return this.states.get(name);
  }

  /**
   * Enters the state machine
   */
  enter(context = {}) {
    this.context = context;
    this.currentState.enter(this.context);
    this.isRunning = true;
    this._notifyListeners('enter');
    return this;
  }

  /**
   * Exits the state machine
   */
  exit() {
    this.currentState.exit(this.context);
    this.isRunning = false;
    this._notifyListeners('exit');
    return this;
  }

  /**
   * Sends an event
   */
  send(event, payload = null) {
    if (!this.isRunning) {
      console.warn('State machine not running');
      return false;
    }

    const transition = this.currentState.getTransition(event);
    if (!transition) {
      console.warn(`No transition for event "${event}" from state "${this.currentState.name}"`);
      return false;
    }

    // Check guard condition
    if (transition.guard && !transition.guard(this.context, payload)) {
      return false;
    }

    this.previousState = this.currentState;

    // Execute action
    if (transition.action) {
      transition.action(this.context, payload);
    }

    // Transition to target state
    this.currentState.exit(this.context);
    this.currentState = transition.target;
    this.currentState.enter(this.context);

    // Record in history
    this._recordHistory(event);
    this._notifyListeners('transition', {
      from: this.previousState.name,
      to: this.currentState.name,
      event,
      payload
    });

    return true;
  }

  /**
   * Updates the state
   */
  update(delta = 16) {
    if (!this.isRunning) return this;

    this.currentState.update(this.context, delta);
    this._notifyListeners('update');

    return this;
  }

  /**
   * Gets current state name
   */
  current() {
    return this.currentState.name;
  }

  /**
   * Checks if in specific state
   */
  is(stateName) {
    return this.currentState.name === stateName;
  }

  /**
   * Gets context
   */
  getContext() {
    return { ...this.context };
  }

  /**
   * Updates context
   */
  setContext(updates) {
    this.context = { ...this.context, ...updates };
    return this;
  }

  /**
   * Registers state change listener
   */
  on(event, listener) {
    this.listeners.push({ event, listener });
    return this;
  }

  /**
   * Removes listener
   */
  off(event, listener) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.listener === listener)
    );
    return this;
  }

  /**
   * Resets to initial state
   */
  reset(initialState) {
    if (this.isRunning) {
      this.exit();
    }
    this.currentState = initialState;
    this.previousState = null;
    this.context = {};
    this.history = [];
    return this;
  }

  /**
   * Gets transition history
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Clears history
   */
  clearHistory() {
    this.history = [];
    return this;
  }

  /**
   * Sets max history
   */
  setMaxHistory(max) {
    this.maxHistory = max;
    return this;
  }

  /**
   * Can transition on event
   */
  can(event) {
    return !!this.currentState.getTransition(event);
  }

  /**
   * Gets possible transitions
   */
  getPossibleTransitions() {
    return Object.keys(this.currentState.transitions);
  }

  /**
   * Exports as JSON
   */
  toJSON() {
    return {
      currentState: this.currentState.name,
      previousState: this.previousState?.name || null,
      context: this.context,
      isRunning: this.isRunning,
      history: this.history
    };
  }

  /**
   * Notifies listeners
   */
  _notifyListeners(type, data = null) {
    this.listeners.forEach(({ event, listener }) => {
      if (event === type || event === '*') {
        listener(data);
      }
    });
  }

  /**
   * Records transition in history
   */
  _recordHistory(event) {
    this.history.push({
      from: this.previousState.name,
      to: this.currentState.name,
      event,
      timestamp: Date.now()
    });

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }
}

module.exports = { State, StateMachine };
