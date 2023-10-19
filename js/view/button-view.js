import { Component } from '../util/framework/component.js';

export class ButtonView extends Component {
  static selector = 'button-view';

  constructor() {
    super();
  }

  props = {
    class: '',
  };
  callback = {
    click: null,
  };

  getTemplate() {
    return /* html */`
      <button
        class="button-view"
        :class="class"
        @click="handleClick"
      >
        {{ content }}
      </button>
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

  handleClick = () => {
    this.callback.click?.();
  };
}
