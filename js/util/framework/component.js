import { RenderPosition, createElement, formatFromKebabToCamelCase } from './utils.js';

export class Component {
  static id = 0;
  static components = new Map();
  static selectors = '';

  #id = '';

  constructor() {
    this.#id = Component.id;
    Component.id++;
  }

  #element = null;
  #parentComponent = null;
  #updatables = [];

  #data = {
    props: [],
    dinamicProps: [],
  };

  props = {};
  callback = {};
  content = null;
  state = {};

  init() {
    const selectors = [];

    this.components.forEach((componentClass) => {
      Component.components.set(componentClass.selector, componentClass);
      selectors.push(componentClass.selector);
    });
    Component.selectors = selectors.join(', ');

    const componentTag = document.querySelector('app-root');
    const template = this.getTemplate();
    this.#element = createElement(template);

    this.#prepareUpdatables();
    this.#update(false);

    componentTag.parentElement.replaceChild(this.#element, componentTag);

    this.#setHandlers();
    this.afterMount();
  }

  #prepareUpdatables() {
    this.#checkAndPrepareUpdatable(this.#element);

    this.#element.querySelectorAll('*').forEach((el) => {
      this.#checkAndPrepareUpdatable(el);
    });
  }

  #checkAndPrepareUpdatable(el) {
    if (el.localName.includes('-')) {
      const ComponentClass = Component.components.get(el.localName);
      const component = new ComponentClass();

      const updatable = {
        Class: ComponentClass,
        component,
      };
      
      if (el.hasAttribute('data-if')) {
        const { container, position } = this.#getElementPlaceData(el);
        updatable.container = container;
        updatable.position = position;
        updatable.condition = el.dataset.if;
      }

      const data = component.#initialMount(el, this);
      updatable.data = data;

      this.#updatables.push(updatable);
      return;
    }

    let isUpdatable = false;

    const updatable = {
      el: el,
    };

    if (el.hasAttribute('data-if')) {
      const { container, position } = this.#getElementPlaceData(el);
      updatable.container = container;
      updatable.position = position;
      updatable.condition = el.dataset.if;
      updatable.elMounted = true,
      isUpdatable = true;
    }

    if (el.textContent.startsWith('{{')) {
      isUpdatable = true;
    } else {
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];

        if (attr.name[0] === ':') {
          isUpdatable = true;
        }

        if (attr.name[0] === '@') {
          this.#markEventElement(el);
        }
      }
    }

    if (isUpdatable) this.#updatables.push(updatable);
  }

  #initialMount(componentTag, parentComponent) {
    this.#parentComponent = parentComponent;
    this.content = componentTag.textContent;

    const template = this.getTemplate();
    this.#element = createElement(template);

    this.#getPropsAndCallbacks(componentTag);
    this.#prepareUpdatables();
    this.#update(false);

    componentTag.parentElement.replaceChild(this.#element, componentTag);

    this.#setHandlers();
    this.afterMount();

    return { ...this.#data, callback: this.callback, content: this.content };
  }

  #mount(parentComponent, container, position, data) {
    this.#parentComponent = parentComponent;

    const template = this.getTemplate();
    this.#element = createElement(template);

    this.#data.props = data.props;
    this.#data.dinamicProps = data.dinamicProps;
    this.callback = data.callback;
    this.content = data.content;

    this.#prepareUpdatables();
    this.#update(false);

    container.insertAdjacentElement(position, this.#element);

    this.#setHandlers();
    this.afterMount();
  }

  #update(needTriggerLifeCycle = true) {
    this.#updateProps();

    this.#updatables.forEach(({
      component,
      data,
      Class,
      el,
      elMounted,
      container,
      position,
      condition,
    }, i) => {
      const currentUpdatable = this.#updatables[i];
      
      if (Class) {
        if (condition === undefined) {
          component.#update(needTriggerLifeCycle);
        } else {
          const shouldBeInDom = this[condition]();

          if (shouldBeInDom && component) {
            component.#update(needTriggerLifeCycle);
          }
          if (shouldBeInDom && !component) {
            const component = new Class();
            component.#mount(this, container, position, data);
            currentUpdatable.component = component;
          }
          if (!shouldBeInDom && component) {
            if (needTriggerLifeCycle) component.beforeUnmount();
            component.#element.remove();
            currentUpdatable.component = null;
          }
        }

        return;
      }

      if (condition === undefined) {
        this.#updateAttrs(el);
      } else {
        const shouldBeInDom = this[condition]();

        if (shouldBeInDom && elMounted) {
          this.#updateAttrs(el);
        }
        if (shouldBeInDom && !elMounted) {
          container.insertAdjacentElement(position, el);
          currentUpdatable.elMounted = true;
        }
        if (!shouldBeInDom && elMounted) {
          el.remove();
          currentUpdatable.elMounted = false;
        }
      }
    });

    if (needTriggerLifeCycle) this.afterUpdate(); 
  }

  #updateProps() {
    this.#data.props.forEach(([key, value]) => this.props[key] = value);

    this.#data.dinamicProps.forEach(([key, value]) => {
      this.props[key] = this.#parentComponent.props[value] ?? this.#parentComponent.state[value];
    });
  }

  #updateAttrs(el) {
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      
      if (attr.name === ':content') {
        const newContent = attr.value;
        el.textContent = this.props[newContent] ?? this.state[newContent] ?? this[newContent];
        continue;
      }

      if (attr.name === ':class') {
        const addingClass = this.props[attr.value] ?? this.state[attr.value];
        if (addingClass.length) el.classList.add(addingClass);
        continue;
      }

      if (attr.name.startsWith(':')) {
        const newAttrName = attr.name.slice(1, attr.name.length);
        const newAttrValue = this.props[attr.value] ?? this.state[attr.value];

        el.setAttribute(newAttrName, newAttrValue);
      }
    }
  }

  #getPropsAndCallbacks(componentTag) {
    for (let i = 0; i < componentTag.attributes.length; i++) {
      const attr = componentTag.attributes[i];

      if (attr.name.startsWith(':')) {
        const propName = attr.name.slice(1, attr.name.length);
        const camelCasePropName = formatFromKebabToCamelCase(propName);
        this.#data.dinamicProps.push([camelCasePropName, attr.value]);
        continue;
      }

      if (attr.name.startsWith('@')) {
        const callbackName = attr.name.slice(1, attr.name.length);
        const camelCaseCallbackName = formatFromKebabToCamelCase(callbackName);
        this.callback[camelCaseCallbackName] = this.#parentComponent[attr.value];
        continue;
      }

      const camelCasePropName = formatFromKebabToCamelCase(attr.name);
      this.#data.props.push([camelCasePropName, attr.value]);
    }
  }

  #getElementPlaceData(element) {
    const prevElSibling = element.previousElementSibling;

    if (!prevElSibling) {
      return {
        container: element.parentElement,
        position: RenderPosition.AFTERBEGIN,
      };
    }

    const prevElHasNoIf = !prevElSibling.hasAttribute('data-if');
    const prevElHasNoFor = !prevElSibling.hasAttribute('data-for');

    if (prevElHasNoIf && prevElHasNoFor) {
      return {
        container: prevElSibling,
        position: RenderPosition.AFTEREND,
      };
    }
  }

  #markEventElement(el) {
    el.setAttribute('data-e', this.#id);
  }

  #setHandlers() {
    if (this.#element.hasAttribute('data-e')) {
      this.#setElementHandlers(this.#element);
    }

    this.#element.querySelectorAll(`[data-e="${this.#id}"]`).forEach((el) => {
      this.#setElementHandlers(el);
    });
  }

  #setElementHandlers(el) {
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];

      if (attr.name[0] === '@') {
        el.addEventListener(`${attr.name.slice(1)}`, this[attr.value]);
      }
    }

    el.removeAttribute('data-e');
  }

  getTemplate() {}

  setState(callback) {
    console.time();

    callback(this.state);
    this.#update();

    console.timeEnd();
  }

  afterMount() {}
  afterUpdate() {}
  beforeUnmount() {}
}
