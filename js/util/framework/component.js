import { RenderPosition, createElement, formatFromKebabToCamelCase } from './utils.js';

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

  data = {
    props: [],
    dinamicProps: [],
    callbacks: [],
  };

  props = {};
  callback = {};
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
    this.element = createElement(template);

    this.triggerChildComponents();
    this.registerStructuralElements(componentTag);
    this.update(false);

    componentTag.parentElement.replaceChild(this.element, componentTag);

    this.setHandlers();
    this.afterMount();
  }

  triggerChildComponents() {
    const componentTags = this.element.querySelectorAll(Component.selectors);

    componentTags.forEach((componentTag) => {
      const ComponentClass = Component.components.get(componentTag.localName);
      const component = new ComponentClass();
      component.mount(componentTag, this);
      this.mountedComponents.set(component.id, component);
    });
  }

  mount(componentTag, parentComponent) {
    this.parentComponent = parentComponent;
    this.content = componentTag.textContent;

    this.getPropsAndCallbacks(componentTag);

    const template = this.getTemplate();
    this.element = createElement(template);

    this.triggerChildComponents();
    this.registerStructuralElements(componentTag);
    this.update(false);

    componentTag.parentElement.replaceChild(this.element, componentTag);

    this.setHandlers();
    this.afterMount();
  }

  update(isMounted = true) {
    this.updateProps();
    this.structuralUpdate();

    if (this.element.hasAttribute('data-u')) {
      this.updateAttrs(this.element);
    }

    this.element.querySelectorAll(`[data-u="${this.id}"]`).forEach((child) => {
      this.updateAttrs(child);
    });

    if (isMounted) {
      this.mountedComponents.forEach((mountedComponent) => {
        mountedComponent.update();
      });
  
      this.afterUpdate();
    }
  }

  updateProps() {
    this.data.props.forEach(([key, value]) => this.props[key] = value);

    this.data.dinamicProps.forEach(([key, value]) => {
      this.props[key] = this.parentComponent.props[value] ?? this.parentComponent.state[value];
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

  getPropsAndCallbacks(componentTag) {
    for (let i = 0; i < componentTag.attributes.length; i++) {
      const attr = componentTag.attributes[i];

      if (attr.name.startsWith(':')) {
        const propName = attr.name.slice(1, attr.name.length);
        const camelCasePropName = formatFromKebabToCamelCase(propName);
        this.data.dinamicProps.push([camelCasePropName, attr.value]);
        continue;
      }

      if (attr.name.startsWith('@')) {
        const callbackName = attr.name.slice(1, attr.name.length);
        const camelCaseCallbackName = formatFromKebabToCamelCase(callbackName);
        this.callback[camelCaseCallbackName] = this.parentComponent[attr.value];
        continue;
      }

      const camelCasePropName = formatFromKebabToCamelCase(attr.name);
      this.data.props.push([camelCasePropName, attr.value]);
    }
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

  setState(callback) {
    console.time();

    callback(this.state);
    this.update();

    console.timeEnd();
  }

  setHandlers() {}
  afterMount() {}
  afterUpdate() {}
}
