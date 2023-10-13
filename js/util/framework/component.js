import { RenderPosition, createElement, firstCharToUpperCase } from './utils.js';

export class Component {
  static id = 0;
  static components = new Map();
  static selectors = '';

  id = '';
  uEl = '';

  constructor() {
    this.id = Component.id;
    this.uEl = `data-u="${this.id}"`;
    Component.id++;
  }

  element = null;
  parentComponent = null;
  mountedComponents = new Map();
  structuralElements = [];

  props = {};
  callback = {};
  state = {};

  init() {
    const componentTag = document.querySelector('app-root');
    const template = this.getTemplate();
    this.element = createElement(template);

    const selectors = [];

    this.components.forEach((componentClass) => {
      Component.components.set(componentClass.selector, componentClass);
      selectors.push(componentClass.selector);
    });
    Component.selectors = selectors.join(', ');

    componentTag.parentElement.replaceChild(this.element, componentTag);
    this.triggerChildComponents();
  }

  triggerChildComponents() {
    const componentTags = this.element.querySelectorAll(Component.selectors);

    componentTags.forEach((componentTag) => {
      const ComponentClass = Component.components.get(componentTag.tagName.toLowerCase());
      const component = new ComponentClass();
      component.mount(componentTag, this);

      this.mountedComponents.set(component.id, component);
    });
  }

  mount(componentTag, parentComponent) {
    this.parentComponent = parentComponent;
    this.content = componentTag.textContent;

    const { props, callback } = this.getPropsAndCallbacks(componentTag);

    this.props = props;
    this.callback = callback;

    const template = this.getTemplate();
    this.element = createElement(template);
    this.registerStructuralElements(componentTag);
    this.update();

    componentTag.parentElement.replaceChild(this.element, componentTag);
    this.setHandlers();

    this.triggerChildComponents();
  }

  update() {
    this.structuralUpdate();

    if (this.element.hasAttribute('data-u')) {
      this.updateAttrs(this.element);
    }

    this.element.querySelectorAll(`[data-u="${this.id}"]`).forEach((child) => {
      this.updateAttrs(child);
    });

    this.mountedComponents.forEach((mountedComponent) => {
      mountedComponent.update();
    });
  }

  structuralUpdate() {
    this.structuralElements.forEach((data, i) => {
      const { el, isComponent, isMounted, container, position, condition } = data;
      const shouldBeInDom = this[condition]();

      if (isMounted && !shouldBeInDom) {
        if (isComponent) {
          // TODO
        } else {
          el.remove();
          this.structuralElements[i].isMounted = false;
        }
      }
      if (!isMounted && shouldBeInDom) {
        if (isComponent) {
          // TODO
        } else {
          container.insertAdjacentElement(position, el);
          this.structuralElements[i].isMounted = true;
        }
      }
    });
  }

  updateAttrs(el) {
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      
      if (attr.name === ':content') {
        const newContent = attr.value;
        el.textContent = this[newContent] ?? this.props[newContent] ?? this.state[newContent];
        continue;
      }

      if (attr.name === ':class') {
        const addingClass = this.props[attr.value] ?? this.state[attr.value];
        el.classList.add(addingClass);
        continue;
      }

      if (attr.name.startsWith(':')) {
        const newAttrName = attr.name.slice(1, attr.name.length);
        const newAttrValue = this.props[attr.value] ?? this.state[attr.value];

        el.setAttribute(newAttrName, newAttrValue);
      }
    }
  }

  getPropsAndCallbacks(componentTag) {
    const attrs = {
      props: {},
      callback: {},
    };

    for (let i = 0; i < componentTag.attributes.length; i++) {
      const attr = componentTag.attributes[i];

      if (attr.name.startsWith(':')) {
        const propName = attr.name.slice(1, attr.name.length);

        const formatedPropName = propName.split('-').map((word, i) => {
          if (i !== 0) {
            return firstCharToUpperCase(word);
          }
          return word;
        }).join('');

        attrs.props[formatedPropName] = attr.value;
      }

      if (attr.name.startsWith('@')) {
        const callbackName = attr.name.slice(1, attr.name.length);
        attrs.callback[callbackName] = this.parentComponent[attr.value];
      }
    }

    return attrs;
  }

  registerStructuralElements(componentTag) {
    if (this.element.hasAttribute('data-if')) {
      const { container, position } = this.getElementPlaceData(componentTag);
      const condition = this.element.dataset.if;

      this.structuralElements.push({
        el: this.element,
        isComponent: true,
        isMounted: true,
        container,
        position,
        condition,
      });
    }

    this.element.querySelectorAll('[data-if]').forEach((ifElement) => {
      const { container, position } = this.getElementPlaceData(ifElement);
      const condition = ifElement.dataset.if;

      this.structuralElements.push({
        el: ifElement,
        isComponent: false,
        isMounted: true,
        container,
        position,
        condition,
      });
    });
  }

  getElementPlaceData(element) {
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

  setState(state) {
    this.state = state;
    this.update();
  }

  setHandlers() {}
}
