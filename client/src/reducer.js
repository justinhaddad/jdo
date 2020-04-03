const TYPES = require('./const').ACTION_TYPES;

const initialState = {
  loading: false,
  todos: [],
  errors: [],
  filtered: null,
};

const reducer = (state = initialState, action = {}) => {
  let todos = state.todos ? [...state.todos] : [];
  let filtered = state.filtered ? [...state.filtered] : null;
  switch (action.type) {
    case TYPES.FETCH_TODOS:
      return {...state, loading: true};
    case TYPES.FETCH_TODOS_SUCCESS:
      return {...state, loading: false, ...action.payload};
    case TYPES.FETCH_TODOS_FAILURE:
      return state.merge({loading: false, error: action.payload});
    case TYPES.CREATE_TODO_SUCCESS:
      if(state.filter.remindersOnly) {
        return state;
      }
      todos.splice(0, 0, action.payload);
      return {...state, todos};
    case TYPES.DELETE_TODO_SUCCESS:
      todos = todos.filter(t => t.id !== action.payload);
      return {...state, todos, filtered};
    case TYPES.UPDATE_TODO_SUCCESS:
      let match = todos.findIndex(t => t.id === action.payload.id);
      if(state.filter.remindersOnly && todos[match].complete) {
        todos.splice(match, 1);
      } else {
        todos[match] = action.payload;
      }
      if (filtered) {
        let match = filtered.findIndex(t => t.id === action.payload.id);
        filtered[match] = action.payload;
      }
      return {...state, todos, filtered};
    case TYPES.SNOOZE_ALL_SUCCESS:
      return {...state, snoozeAllEnd: action.payload};
    default:
      return state;
  }
};

module.exports.reducer = reducer;