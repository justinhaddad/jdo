import {debounce} from 'lodash';
import React from 'react';
import Sugar from 'sugar-date';

const repeatSugar = {
  'hourly': 'in an hour',
  'daily': 'tomorrow at noon',
  'nightly': 'tomorrow at 5pm',
  'weekly': 'Sunday noon',
  'monthly': 'the beginning of next month',
  'sundays': 'Sunday noon',
  'mondays': 'Monday noon',
  'tuesdays': 'Tuesday noon',
  'wednesdays': 'Wednesday noon',
  'thursdays': 'Thursday noon',
  'fridays': 'Friday noon',
  'saturdays': 'Saturday noon',
};

export default class BaseTodoList extends React.Component {
  reloadTodos = async () => {
    const {remindersOnly, search} = this.state;
    await this.props.actions.loadTodos({remindersOnly, search});
  };

  handleToggleComplete = async (todoId, current) => {
    const todo = this.props.todos.filter(t => t.id === todoId)[0];
    await this.props.actions.updateTodo(todoId, {complete: !current});
    // Create a new todo if repeat is set.
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
    // this.reloadTodos();
  };

  handleCloseEditDialog = () => {
    this.setState({editing: null});
  };

  handleDelete = async id => {
    await this.props.actions.deleteTodo(id);
    this.handleCloseEditDialog();
  };

}
