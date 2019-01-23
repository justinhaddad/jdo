import {debounce} from 'lodash';
import React from 'react';
import Sugar from 'sugar-date';

const repeatSugar = {
  'hourly': 'in an hour',
  'daily': 'tomorrow at noon',
  'nightly': 'tomorrow at 5pm',
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
    const {remindersOnly, search} = this.state;
    await this.props.actions.loadTodos({remindersOnly, search});
  };

  componentDidMount() {
    this.reloadTodos();
    setInterval(this.reloadTodos, 5000);
  }

  handleToggleComplete = async (todoId, current) => {
    await this.props.actions.updateTodo(todoId, {complete: !current});
    // Create a new todo if repeat is set.
    const todo = this.props.todos.filter(t => t.id === todoId)[0];
    if(!current && todo.repeat) {
      const dup = {
        created: todo.created,
        headline: todo.headline,
        note: todo.note,
        priority: todo.priority,
        nextReminder: Sugar.Date.create(repeatSugar[todo.repeat]).toISOString(),
        repeat: todo.repeat,
      };
      await this.props.actions.createTodo(dup);
    }
    this.reloadTodos();
  };

  handleSearch = debounce(searchTxt => {
    const {todos} = this.props;
    let filtered = null;
    if(searchTxt) {
      filtered = todos.filter(t => t.headline.toLowerCase().includes(searchTxt.toLowerCase()));
    }
    this.setState({filtered, searchTxt});
  }, 200);

  handleSave = async (todo) => {
    await this.props.actions.updateTodo(todo.id, todo);
    this.handleCloseEditDialog();
    this.reloadTodos();
  };

  handleCloseEditDialog = () => {
    this.setState({editing: null});
  };

  handleDelete = async id => {
    await this.props.actions.deleteTodo(id);
    this.handleCloseEditDialog();
  };

}
