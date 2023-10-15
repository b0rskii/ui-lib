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

  moreThanZero = () => this.state.count > 0;

  getTemplate() {
    return /* html */`
      <div class="main-page">
        <counter-view
          class="main-page__item"
          :count="count"
          @decrement-button-click="handleDecrementButtonClick"
          @increment-button-click="handleIncrementButtonClick"
        ></counter-view>

        <button-view
          data-if="moreThanZero"
          class="main-page__item"
          @click="handleResetButtonClick"
        >
          Reset
        </button-view>

        <counter-view class="main-page__item"></counter-view>
        <counter-view class="main-page__item"></counter-view>
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

  handleDecrementButtonClick = () => {
    this.setState(s => s.count--);
  };

  handleIncrementButtonClick = () => {
    this.setState(s => s.count++);
  };

  handleResetButtonClick = () => {
    this.setState(s => s.count = 0);
  };
}
