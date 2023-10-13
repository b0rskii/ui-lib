import { Component } from '../util/framework/component.js';
import { CounterView } from '../view/counter-view.js';
import { ButtonView } from '../view/button-view.js';

export class App extends Component {
  static selector = 'app-root';

  components = [
    CounterView,
    ButtonView,
  ];

  constructor() {
    super();
  }

  state = {
    count: 0,
  };

  getTemplate() {
    return `
      <div class="main-page">
        <counter-view
          ext-class="main-page__item"
          :count="count"
          @decrement="handleDecrementButtonClick"
          @increment="handleIncrementButtonClick"
        ></counter-view>
        <counter-view ext-class="main-page__item"></counter-view>
        <counter-view ext-class="main-page__item"></counter-view>

        <button-view ext-class="main-page__item" @click="handleResetButtonClick">
          Reset
        </button-view>
      </div>
    `;
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
