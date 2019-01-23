import Sugar from 'sugar-date';

const URL_BASE = 'http://localhost:5005';
//const URL_BASE = 'http://ec2-3-17-36-180.us-east-2.compute.amazonaws.com';
const TODO_URL = `${URL_BASE}/todos`;
const SNOOZE_URL = `${URL_BASE}/snooze-all`;

export const xloadTodos = async (remindersOnly = false) => {
  const url = `${TODO_URL}?remindersOnly=${remindersOnly}`;
  const resp = await fetch(url, {
    // headers: {'Access-Control-Allow-Origin': '*'},
  });
  const data = await resp.json();
  return data.data;
};

export const xcreateTodo = async arg => {
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

export const xdeleteTodo = async id => {
  await fetch(`${TODO_URL}/${id}`, {
    method: 'DELETE',
  });
};

export const xupdateTodo = async (id, data) => {
  await fetch(`${TODO_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  });
};

export const xsnoozeAll = async seconds => {
  const end = Sugar.Date.create(`in ${seconds} seconds`).toISOString();
  await fetch(`${SNOOZE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({end}),
  });
};
