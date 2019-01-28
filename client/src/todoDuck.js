import { fromJS } from 'immutable';
import Sugar from 'sugar-date';


const URL_BASE = 'http://localhost:5005';
//const URL_BASE = 'http://ec2-3-17-36-180.us-east-2.compute.amazonaws.com';
const TODO_URL = `${URL_BASE}/todos`;
const SNOOZE_URL = `${URL_BASE}/snooze-all`;

const TYPES = {
  FETCH_TODOS: Symbol(),
  FETCH_TODOS_SUCCESS: Symbol(),
  FETCH_TODOS_FAILURE: Symbol(),
  CREATE_TODO: Symbol(),
  CREATE_TODO_SUCCESS: Symbol(),
  CREATE_TODO_FAILURE: Symbol(),
  DELETE_TODO: Symbol(),
  DELETE_TODO_SUCCESS: Symbol(),
  DELETE_TODO_FAILURE: Symbol(),
  UPDATE_TODO: Symbol(),
  UPDATE_TODO_SUCCESS: Symbol(),
  UPDATE_TODO_FAILURE: Symbol(),
};

const _loadTodos = (_filter={remindersOnly: false}) => async dispatch => {
  dispatch({type: TYPES.FETCH_TODOS});
  const url = `${TODO_URL}?remindersOnly=${_filter.remindersOnly}`;
  const resp = await fetch(url);
  const json = await resp.json();
  dispatch({type: TYPES.FETCH_TODOS_SUCCESS, payload: {todos: json.data, filter: _filter}});
};

export const ActionCreators = Object.freeze({
  loadTodos: _loadTodos,
  createTodo: arg => async dispatch => {
    dispatch({type: TYPES.CREATE_TODO});
    let todo = arg;
    if(typeof(arg) === 'string') {
      const parts = arg.split(';').map(s => s.trim());
      todo = {
        headline: parts[0],
      };
      if (parts.length > 1 && parts[1].trim()) {
        let nextReminder = parts[1].trim();
        if(nextReminder.startsWith('at')) {
          nextReminder = nextReminder.substring(nextReminder.indexOf('at') + 2);
        }
        try {
          console.log('Parsing:', nextReminder);
          nextReminder = Sugar.Date.create(nextReminder);
          todo.nextReminder = nextReminder.toISOString();
        } catch(error) {
          console.error('Failed to parse nextReminder with SugarJS.', error);
          return null;
        }
      }
      if (parts.length > 2 && parts[2].trim()) {
        todo['repeat'] = parts[2].trim().toLowerCase();
      }
    }
    const resp = await fetch(TODO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(todo),
    });
    const newTodo = await resp.json();
    dispatch({type: TYPES.CREATE_TODO_SUCCESS, payload: newTodo});
    // dispatch(_loadTodos());
  },
  updateTodo: (id, data)  => async dispatch => {
    dispatch({type: TYPES.UPDATE_TODO});
    const resp = await fetch(`${TODO_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(data),
    });
    const updated = await resp.json();
    console.log('Update resp:', updated);
    dispatch({type: TYPES.UPDATE_TODO_SUCCESS, payload: updated});
    // dispatch(_loadTodos());
  },
  deleteTodo: id => async dispatch => {
    dispatch({type: TYPES.DELETE_TODO});
    await fetch(`${TODO_URL}/${id}`, {
      method: 'DELETE',
    });
    dispatch({type: TYPES.DELETE_TODO_SUCCESS, payload: id});
    // dispatch(_loadTodos());
  },
  snoozeAll: seconds => async dispatch => {
    const end = Sugar.Date.create(`in ${seconds} seconds`).toISOString();
    await fetch(`${SNOOZE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({end}),
    });
  },
});

const initialState = fromJS({
  loading: false,
  todos: [],
  errors: [],
  filters: {},
});

const reducer = (state = initialState, action = {}) => {
  let todos = state.get('todos');
  switch (action.type) {
    case TYPES.FETCH_TODOS:
      return state.set('loading', true);
    case TYPES.FETCH_TODOS_SUCCESS:
      const newState = {loading: false, ...action.payload};
      return state.merge(newState);
    case TYPES.FETCH_TODOS_FAILURE:
      return state.merge({loading: false, error: action.payload});
    case TYPES.CREATE_TODO_SUCCESS:
      if(state.get('filter').remindersOnly) {
        return state;
      }
      todos.splice(0, 0, action.payload);
      console.log('Spliced: ', todos);
      return state.merge({'todos': todos});
    case TYPES.DELETE_TODO_SUCCESS:
      todos = todos.filter(t => t.id != action.payload);
      console.log('Filtered:', todos);
      return state.set('todos', todos);
    case TYPES.UPDATE_TODO_SUCCESS:
      const match = todos.findIndex(t => t.id === action.payload.id);
      todos[match] = action.payload;
      return state.merge({'todos': todos});
    default:
      return state;
  }
};

export default reducer;
