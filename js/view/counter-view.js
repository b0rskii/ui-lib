import { Component } from '../util/framework/component.js';

export class CounterView extends Component {
  static selector = 'counter-view';

  constructor() {
    super();
  }

  props = {
    extClass: '',
    count: null,
  };
  callback = {
    decrement: null,
    increment: null,
  };

  state = {
    count: 0,
  };

  moreThanZero = () => {
    if (this.props.count !== null) return this.props.count > 0;
    return this.state.count > 0;
  };
  moreThanFive = () => {
    if (this.props.count !== null) return this.props.count > 5;
    return this.state.count > 5;
  };

  getTemplate() {
    return `
      <div ${this.uEl} class="counter-view" :class="extClass">
        <div ${this.uEl} :content="count" class="counter-view__value">
          {{ count }}
        </div>
        <div ${this.uEl} data-if="moreThanZero">Больше ноля!</div>
        <div class="counter-view__buttons">
          <button-view @click="handleIDecButtonClick">-</button-view>
          <button-view @click="handleIncButtonClick">+</button-view>
        </div>
        <div ${this.uEl} data-if="moreThanFive">Больше пяти!</div>
      </div>
    `;
  }

  resetCounter = () => {
    this.setState(s => s.count = 0);
  };

  handleIDecButtonClick = () => {
    if (this.callback.decrement) {
      this.callback.decrement();
      return;
    }
    this.setState(s => s.count--);
  };

  handleIncButtonClick = () => {
    if (this.callback.decrement) {
      this.callback.increment();
      return;
    }
    this.setState(s => s.count++);
  };
}
