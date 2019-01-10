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

export const createTodo = async arg => {
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
        this.setState({sugarError: false});
      } catch(error) {
        console.error('Failed to parse nextReminder with SugarJS.', error);
        return null;
      }
    }
    if (parts.length > 2 && parts[2].trim()) {
      todo['repeat'] = parts[2].trim().toLowerCase();
    }
  }
  console.log('Creating Todo: ', todo);
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
