export const RenderPosition = {
  BEFOREBEGIN: 'beforebegin',
  AFTERBEGIN: 'afterbegin',
  BEFOREEND: 'beforeend',
  AFTEREND: 'afterend',
};

const firstCharToUpperCase = (str) => str[0].toUpperCase() + str.slice(1);

export const createElement = (template) => {
  const newElement = document.createElement('div');
  newElement.innerHTML = template;

  return newElement.firstElementChild;
};

export const formatFromKebabToCamelCase = (kebabStr) => {
  return kebabStr.split('-').map((word, i) => {
    if (i !== 0) {
      return firstCharToUpperCase(word);
    }
    return word;
  }).join('');
}
