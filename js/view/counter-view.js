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

  moreThan1 = () => {
    if (this.props.count !== null) return this.props.count > 1;
    return this.state.count > 1;
  };
  moreThan5 = () => {
    if (this.props.count !== null) return this.props.count > 5;
    return this.state.count > 5;
  };
  moreThan2 = () => {
    if (this.props.count !== null) return this.props.count > 2;
    return this.state.count > 2;
  };
  lessThan0 = () => {
    if (this.props.count !== null) return this.props.count < 0;
    return this.state.count < 0;
  };
  moreThan3 = () => {
    if (this.props.count !== null) return this.props.count > 3;
    return this.state.count > 3;
  };

  getTemplate() {
    return /* html */`
      <div class="counter-view" :class="class">
        <div class="counter-view__value" :content="count">
          {{ count }}
        </div>
        <div class="counter-view__buttons">
          <button-view @click="handleIDecButtonClick">-</button-view>
          <button-view @click="handleIncButtonClick">+</button-view>
        </div>
        <div data-if="moreThan1">Номер 1</div>
        <div data-if="moreThan5">Номер 2</div>
        <div data-if="moreThan2">Номер 3</div>
        <div data-if="lessThan0">Номер 4</div>
        <div data-if="moreThan3">Номер 5</div>
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
