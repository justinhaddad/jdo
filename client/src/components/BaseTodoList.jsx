import React from 'react';
import {createTodo, deleteTodo, loadTodos, updateTodo} from '../api';
import {fromJS} from "immutable";
import Sugar from 'sugar-date';

const repeatSugar = {
  'hourly': 'in an hour',
  'daily': 'tomorrow at noon',
  'nightly': 'tomorrow at 4pm',
  'weekly': 'next Sunday',
  'monthly': 'the beginning of next month',
  'sundays': 'next Sunday',
  'mondays': 'next Monday',
  'tuesdays': 'next Tuesday',
  'wednesdays': 'next Wednesday',
  'thursdays': 'next Thursday',
  'fridays': 'next Friday',
  'saturdays': 'next Saturday',
};

export default class BaseTodoList extends React.Component {
  reloadTodos = async () => {
    const {remote, remindersOnly} = this.state;
    let todos = await loadTodos(remindersOnly);
    this.setState({todos: fromJS(todos)});
    if(remote && todos.length == 0) {
      remote.getCurrentWindow().hide();
    }
  };

  componentDidMount() {
    this.reloadTodos();
    setInterval(this.reloadTodos, 5000);
  }

  handleToggleComplete = async (todoId, current) => {
    await updateTodo(todoId, {complete: !current});
    // Create a new todo if repeat is set.
    const todo = this.state.todos.toJS().filter(t => t.id === todoId)[0];
    if(!current && todo.repeat) {
      const dup = {
        created: todo.created,
        headline: todo.headline,
        note: todo.note,
        priority: todo.priority,
        nextReminder: Sugar.Date.create(repeatSugar[todo.repeat]).toISOString(),
        repeat: todo.repeat,
      };
      await createTodo(dup);
    }
    this.reloadTodos();
  };

  handleSearch = searchTxt => {
    const {todos} = this.state;
    if(searchTxt) {
      const filtered = todos.toJS().filter(t => t.headline.toLowerCase().includes(searchTxt.toLowerCase()));
      this.setState({filtered});
    } else {
      this.setState({filtered: null});
    }
  };

  handleSave = async (todo) => {
    await updateTodo(todo.id, todo);
    this.handleCloseEditDialog();
    this.reloadTodos();
  };

  handleCloseEditDialog = () => {
    this.setState({editing: false});
  };

  handleDelete = async id => {
    await deleteTodo(id);
    this.reloadTodos();
    this.handleCloseEditDialog();
  };

}
