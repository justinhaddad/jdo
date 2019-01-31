const Sugar = require('sugar-date');
const TYPES = require('./const').ACTION_TYPES;
const URL_BASE = 'http://localhost:5005';
//const URL_BASE = 'http://ec2-3-17-36-180.us-east-2.compute.amazonaws.com';
const TODO_URL = `${URL_BASE}/todos`;
const SNOOZE_URL = `${URL_BASE}/snooze-all`;


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
    dispatch({type: TYPES.UPDATE_TODO_SUCCESS, payload: updated});
  },
  deleteTodo: id => async dispatch => {
    dispatch({type: TYPES.DELETE_TODO});
    await fetch(`${TODO_URL}/${id}`, {
      method: 'DELETE',
    });
    dispatch({type: TYPES.DELETE_TODO_SUCCESS, payload: id});
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
    dispatch({type: TYPES.SNOOZE_ALL_SUCCESS, payload: end});
  },
});


