import { Component } from '../util/framework/component.js';

export class CounterView extends Component {
  static selector = 'counter-view';

  constructor() {
    super();
  }

  props = {
    class: '',
    count: null, //number
  };
  callback = {
    decrementButtonClick: null,
    incrementButtonClick: null,
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
    return /* html */`
      <div class="counter-view" :class="class">
        <div class="counter-view__value" :content="count">
          {{ count }}
        </div>
        <div data-if="moreThanZero">Больше ноля!</div>
        <div class="counter-view__buttons">
          <button-view @click="handleIDecButtonClick">-</button-view>
          <button-view @click="handleIncButtonClick">+</button-view>
        </div>
        <div data-if="moreThanFive">Больше пяти!</div>
      </div>
    `;
  }

  // afterMount() {
  //   console.log('afterMount', this);
  // }

  // afterUpdate() {
  //   console.log('afterUpdate', this);
  // }

  // beforeUnmount() {
  //   console.log('beforeUnmount', this);
  // }

  resetCounter = () => {
    this.setState(s => s.count = 0);
  };

  handleIDecButtonClick = () => {
    if (this.callback.decrementButtonClick) {
      this.callback.decrementButtonClick();
      return;
    }
    this.setState(s => s.count--);
  };

  handleIncButtonClick = () => {
    if (this.callback.incrementButtonClick) {
      this.callback.incrementButtonClick();
      return;
    }
    this.setState(s => s.count++);
  };
}
