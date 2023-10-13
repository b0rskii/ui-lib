const TaskGroupType = {
  BACKLOG: 'backlog',
  PROCESSING: 'processing',
  DONE: 'done',
  BASKET: 'basket',
};

const TaskGroupTitle = {
  BACKLOG: 'Бэклог',
  PROCESSING: 'В процессе',
  DONE: 'Готово',
};

const TaskStatus = {
  DEFAULT: 'DEFAULT',
  ACTIVE: 'ACTIVE',
};

const ActionType = {
  ADD_TASK: 'ADD_TASK',
  EMPTY_TRASH: 'EMPTY_TRASH',
  UPDATE_TASK: 'UPDATE_TASK',
};

const UpdateType = {
  MINOR: 'MINOR',
};

export {TaskGroupType, TaskGroupTitle, TaskStatus, ActionType, UpdateType};
