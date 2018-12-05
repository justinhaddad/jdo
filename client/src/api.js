const URL = 'http://localhost:5005/todos';

export const loadTodos = async () => {
  const resp = await fetch(URL, {
    headers: {'Access-Control-Allow-Origin': '*'},
  });
  const data = await resp.json();
  return data;
};

export const createTodo = async todo => {
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
