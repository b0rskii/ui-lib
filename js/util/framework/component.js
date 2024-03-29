import { RenderPosition, createElement, formatFromKebabToCamelCase, getId } from './utils.js';

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
    attrs: [],
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

    this.#renderTree();
    this.#update(true);

    componentTag.parentElement.replaceChild(this.#element, componentTag);

    this.#setHandlers();
    this.afterMount();
  }

  #renderTree() {
    this.#renderNode(this.#element);

    this.#element.querySelectorAll('*').forEach((el) => {
      this.#renderNode(el);
    });
  }

  #renderNode(el) {
    if (el.localName.includes('-')) {
      const ComponentClass = Component.components.get(el.localName);
      const component = new ComponentClass();

      const updatable = {
        Class: ComponentClass,
        component,
      };
      
      if (el.hasAttribute('data-if')) {
        const placeData = this.#getElementPlaceData(el);
        updatable.placeData = placeData;
        updatable.condition = el.dataset.if;
      }

      const data = component.#initialMount(el, this);
      updatable.data = data;

      let shouldBeInDom = true;
      if (updatable.condition && !this[updatable.condition]()) {
        shouldBeInDom = false;
      }

      if (shouldBeInDom) {
        component.#setHandlers();
        component.afterMount();
      }

      this.#updatables.push(updatable);
      return;
    }

    let isUpdatable = false;

    const updatable = {
      el,
      data: [],
    };

    if (el.hasAttribute('data-if')) {
      const placeData = this.#getElementPlaceData(el);
      updatable.placeData = placeData;
      updatable.condition = el.dataset.if;
      updatable.elMounted = true,
      isUpdatable = true;
    }

    const elInnerHTML = el.innerHTML.trim();

    if (elInnerHTML.startsWith('{{')) {
      const contentValue = elInnerHTML.slice(2, -2).trim();
      updatable.data.push(['content', contentValue]);
      isUpdatable = true;
    }

    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];

      if (attr.name[0] === ':') {
        updatable.data.push([attr.name.slice(1), attr.value]);
        isUpdatable = true;
        continue;
      }

      if (attr.name[0] === '@') {
        this.#markEventElement(el);
      }
    }

    updatable.data.forEach(([attrToRemoveName]) => {
      el.removeAttribute(`:${attrToRemoveName}`);
    });

    if (isUpdatable) this.#updatables.push(updatable);
  }

  #initialMount(componentTag, parentComponent) {
    this.#parentComponent = parentComponent;
    this.content = componentTag.textContent;

    const template = this.getTemplate();
    this.#element = createElement(template);

    this.#getPropsAndCallbacks(componentTag);
    this.#renderTree();
    this.#addElementAttrs();
    this.#update(true);

    componentTag.parentElement.replaceChild(this.#element, componentTag);

    return { ...this.#data, callback: this.callback, content: this.content };
  }

  #mount(parentComponent, placeData, data) {
    this.#parentComponent = parentComponent;
    this.#data.props = data.props;
    this.#data.dinamicProps = data.dinamicProps;
    this.#data.attrs = data.attrs;
    this.callback = data.callback;
    this.content = data.content;

    const template = this.getTemplate();
    this.#element = createElement(template);

    this.#renderTree();
    this.#addElementAttrs();
    this.#update(true);
    this.#defunePositionAndMount(this.#element, this.#parentComponent.#element, placeData);
    this.#setHandlers();
    this.afterMount();
  }

  #update(isInitialUpdate = false) {
    this.#updateProps(isInitialUpdate);

    this.#updatables.forEach(({
      component,
      data,
      Class,
      el,
      elMounted,
      placeData,
      condition,
    }, i) => {
      const currentUpdatable = this.#updatables[i];
      
      if (Class) {
        if (condition === undefined) {
          component.#update(isInitialUpdate);
        } else {
          const shouldBeInDom = this[condition]();

          if (shouldBeInDom && component) {
            component.#update(isInitialUpdate);
          }
          if (shouldBeInDom && !component) {
            const component = new Class();
            component.#mount(this, placeData, data);
            currentUpdatable.component = component;
          }
          if (!shouldBeInDom && component) {
            if (isInitialUpdate) {
              const componentElId = component.#element.getAttribute('id');
              if (componentElId) currentUpdatable.data.attrs.push(['id', componentElId]);
            } else {
              component.beforeUnmount();
            }

            component.#element.remove();
            currentUpdatable.component = null;
          }
        }

        return;
      }

      if (condition === undefined) {
        this.#updateAttrs(el, data);
      } else {
        const shouldBeInDom = this[condition]();

        if (shouldBeInDom && elMounted) {
          this.#updateAttrs(el, data);
        }
        if (shouldBeInDom && !elMounted) {
          this.#defunePositionAndMount(el, this.#element, placeData);
          currentUpdatable.elMounted = true;
        }
        if (!shouldBeInDom && elMounted) {
          el.remove();
          currentUpdatable.elMounted = false;
        }
      }
    });

    if (!isInitialUpdate) this.afterUpdate(); 
  }

  #defunePositionAndMount(el, parent, placeData) {
    for (const place of placeData) {
      let container;

      if (typeof place.container === 'object') {
        container = place.container;
      } else {
        container = parent.querySelector(`#${place.container}`);
      }

      if (container) {
        container.insertAdjacentElement(place.position, el);
        break;
      }
    }
  }

  #addElementAttrs() {
    this.#data.attrs.forEach(([name, value]) => {
      this.#element.setAttribute(name, value);
    });
  }

  #updateProps(isInitialUpdate) {
    if (isInitialUpdate) {
      this.#data.props.forEach(([key, value]) => this.props[key] = value);
    }

    this.#data.dinamicProps.forEach(([key, value]) => {
      this.props[key] = this.#parentComponent.props[value] ?? this.#parentComponent.state[value];
    });
  }

  #updateAttrs(el, data) {
    data.forEach(([attrName, attrValue]) => {
      if (attrName === 'content') {
        el.textContent = this.props[attrValue] ?? this.state[attrValue] ?? this[attrValue];
        return;
      }

      if (attrName === 'class') {
        const addingClass = this.props[attrValue] ?? this.state[attrValue];
        if (addingClass.length) el.classList.add(addingClass);
        return;
      }

      const newAttrValue = this.props[attrValue] ?? this.state[attrValue];
      el.setAttribute(attrName, newAttrValue);
    });
  }

  #getPropsAndCallbacks(componentTag) {
    for (let i = 0; i < componentTag.attributes.length; i++) {
      const attr = componentTag.attributes[i];

      if (attr.name === 'data-if' || attr.name === 'data-for') {
        this.#data.attrs.push([attr.name, attr.value]);
        continue;
      }

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
    const placeData = [];
    this.#defineElementPlaceData(element, placeData);
    return placeData;
  }

  #defineElementPlaceData(element, placeData) {
    const prevElSibling = element.previousElementSibling;
    const nextElSibling = element.nextElementSibling;

    if (!prevElSibling) {
      placeData.push({
        container: element.parentElement,
        position: RenderPosition.AFTERBEGIN,
      });
      return;
    }

    if (!nextElSibling) {
      placeData.push({
        container: element.parentElement,
        position: RenderPosition.BEFOREEND,
      });
      return;
    }

    const prevElHasNoIf = !prevElSibling.hasAttribute('data-if');
    const prevElHasNoFor = !prevElSibling.hasAttribute('data-for');

    if (prevElHasNoIf && prevElHasNoFor) {
      placeData.push({
        container: prevElSibling,
        position: RenderPosition.AFTEREND,
      });
      return;
    }

    let id = '';

    if (!prevElSibling.hasAttribute('id')) {
      id = getId('el_');
      prevElSibling.setAttribute('id', id);
    } else {
      id = prevElSibling.getAttribute('id');
    }

    placeData.push({
      container: id,
      position: RenderPosition.AFTEREND,
    });

    this.#defineElementPlaceData(prevElSibling, placeData);
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
