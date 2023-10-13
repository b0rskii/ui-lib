import { Component } from '../util/framework/component.js';

export class ButtonView extends Component {
  static selector = 'button-view';

  constructor() {
    super();
  }

  props = {
    extClass: '',
  };
  callback = {
    click: () => {},
  };

  getTemplate() {
    return `
      <button ${this.uEl} class="button-view" :class="extClass" :content="content">
        {{ content }}
      </button>
    `;
  }

  setHandlers() {
    this.element.addEventListener('click', this.handleClick);
  }

  handleClick = () => {
    this.callback.click?.();
  };
}
