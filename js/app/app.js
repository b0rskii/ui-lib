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

  getTemplate = () => {
    return `
      <div class="main-page">
        <counter-view></counter-view>
        <counter-view></counter-view>
        <counter-view></counter-view>

        <button-view :ext-class="main-page__item">
          Reset
        </button-view>
      </div>
    `;
  };
}
