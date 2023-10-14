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
      <div class="counter-view" :class="class" ${this.uEl}>
        <div class="counter-view__value" :content="count" ${this.uEl}>
          {{ count }}
        </div>
        <div data-if="moreThanZero" ${this.uEl}>Больше ноля!</div>
        <div class="counter-view__buttons">
          <button-view @click="handleIDecButtonClick">-</button-view>
          <button-view @click="handleIncButtonClick">+</button-view>
        </div>
        <div data-if="moreThanFive" ${this.uEl}>Больше пяти!</div>
      </div>
    `;
  }

  afterMount() {
    // console.log(`Компонент CounterView вмонтирован`);
  }

  afterUpdate() {
    // console.log(`Компонент CounterView обновлен`);
  }

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
