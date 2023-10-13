import { Component } from '../util/framework/component.js';

export class CounterView extends Component {
  static selector = 'counter-view';

  constructor() {
    super();
  }

  state = {
    count: 0,
  };

  moreThanZero = () => this.state.count > 0;
  moreThanFive = () => this.state.count > 5;

  getTemplate = () => {
    return `
      <div class="counter-view main-page__item">
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
  };

  handleIDecButtonClick = () => {
    console.time();

    this.state.count--;
    this.setState(this.state);
    
    console.timeEnd();
  };

  handleIncButtonClick = () => {
    console.time();

    this.state.count++;
    this.setState(this.state);
    
    console.timeEnd();
  };
}
