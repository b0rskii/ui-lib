import { Component } from '../util/framework/component.js';
import { CounterView } from '../view/counter-view.js';
import { ButtonView } from '../view/button-view.js';

export class App extends Component {
  static selector = 'app-root';
  components = [CounterView, ButtonView];

  constructor() {
    super();
  }

  state = {
    count: 0,
  };

  lessThanZero = () => this.state.count < 0;

  getTemplate() {
    return /* html */`
      <div class="main-page">
        <div data-if="lessThanZero" ${this.uEl}>
          //////////////////////////////////////////
        </div>

        <counter-view
          class="main-page__item"
          :count="count"
          @decrement-button-click="handleDecrementButtonClick"
          @increment-button-click="handleIncrementButtonClick"
        ></counter-view>

        <counter-view class="main-page__item"></counter-view>
        <counter-view class="main-page__item"></counter-view>

        <button-view class="main-page__item" @click="handleResetButtonClick">
          Reset
        </button-view>
      </div>
    `;
  }

  afterMount() {
    // console.log(`Компонент App вмонтирован`);
  }

  afterUpdate() {
    // console.log(`Компонент App обновлен`);
  }

  handleDecrementButtonClick = () => {
    this.setState(s => s.count--);
  };

  handleIncrementButtonClick = () => {
    this.setState(s => s.count++);
  };

  handleResetButtonClick = () => {
    this.setState(s => s.count = 0);

    this.mountedComponents.forEach((component) => {
      component.resetCounter?.();
    });
  };
}
