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
    click: () => {},
  };

  getTemplate() {
    return /* html */`
      <button class="button-view" :class="class" :content="content" ${this.uEl}>
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

  setHandlers() {
    this.element.addEventListener('click', this.handleClick);
  }

  handleClick = () => {
    this.callback.click?.();
  };
}
