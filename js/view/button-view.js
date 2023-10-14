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
        :content="content"
        @click="handleClick"
      >
        {{ content }}
      </button>
    `;
  }

  afterMount() {
    // console.log(`Компонент ButtonView вмонтирован`);
  }

  afterUpdate() {
    // console.log(`Компонент ButtonView обновлен`);
  }

  handleClick = () => {
    this.callback.click?.();
  };
}
