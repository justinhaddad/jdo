import {snoozeOptions} from './const';

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

const parseDateTime = nextReminderSugar => {
  if (nextReminderSugar.startsWith('at')) {
    // Sugar doesn't like the 'at' in 'at 5pm', so strip it.
    nextReminderSugar = nextReminderSugar.substring(nextReminderSugar.indexOf('at') + 2);
  }
  // Support snooze options
  if (nextReminderSugar in snoozeOptions) {
    nextReminderSugar = snoozeOptions[nextReminderSugar];
  }
  return Sugar.Date.create(nextReminderSugar, {future: true});
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
        try {
          todo.nextReminder = parseDateTime(parts[1].trim().toLowerCase());
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


