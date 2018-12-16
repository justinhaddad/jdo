import Sugar from 'sugar-date';

const TODO_URL = 'http://localhost:5005/todos';
const SNOOZE_URL = 'http://localhost:5005/snooze-all';

export const loadTodos = async (remindersOnly = false) => {
  const url = `${TODO_URL}?remindersOnly=${remindersOnly}`;
  const resp = await fetch(url, {
    // headers: {'Access-Control-Allow-Origin': '*'},
  });
  const data = await resp.json();
  return data.data;
};

export const createTodo = async headline => {
  const parts = headline.split(';').map(s => s.trim());
  const todo = {
    headline: parts[0],
  };
  if(parts.length > 1) {
    const nextReminder = Sugar.Date.create(parts[1]);
    todo['nextReminder'] = nextReminder.toISOString();
  }
  if(parts.length > 2) {
    todo['repeat'] = parts[2];
  }
  console.log('Todo: ', todo);
  const resp = await fetch(TODO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(todo),
  });
  return await resp.json();
};

export const deleteTodo = async id => {
  await fetch(`${TODO_URL}/${id}`, {
    method: 'DELETE',
  });
};

export const updateTodo = async (id, data) => {
  await fetch(`${TODO_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  });
};

export const snoozeAll = async seconds => {
  const end = Sugar.Date.create(`in ${seconds} seconds`).toISOString();
  await fetch(`${SNOOZE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({end}),
  });
};
