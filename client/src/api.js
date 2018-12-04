const URL = 'http://localhost:5005/todos';

export const loadTodos = async () => {
  const resp = await fetch(URL, {
    headers: {'Access-Control-Allow-Origin': '*'},
  });
  const data = await resp.json();
  console.log('DATA: ', data);
  return data;
};
