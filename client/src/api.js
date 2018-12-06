import Sugar from 'sugar-date';

const URL = 'http://localhost:5005/todos';

export const loadTodos = async () => {
  const resp = await fetch(URL, {
    headers: {'Access-Control-Allow-Origin': '*'},
  });
  const data = await resp.json();
  return data;
};

export const createTodo = async headline => {
  const parts = headline.split(';').map(s => s.trim());
  console.log('Parts: ', parts);
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
  const resp = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(todo),
  });
  return await resp.json();
};

export const deleteTodo = async id => {
  await fetch(`${URL}/${id}`, {
    method: 'DELETE',
  });
};
