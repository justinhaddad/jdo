import {debounce} from 'lodash';
import React from 'react';
import Sugar from 'sugar-date';
import {repeatSugar} from '../const';


export default class BaseTodoList extends React.Component {
  reloadTodos = async () => {
    const {remindersOnly, search} = this.state;
    await this.props.actions.loadTodos({remindersOnly, search});
  };

  handleToggleComplete = async (todoId, current) => {
    const todo = this.props.todos.filter(t => t.id === todoId)[0];
    await this.props.actions.updateTodo(todoId, {complete: !current});
    const nextReminder = Sugar.Date.create(repeatSugar[todo.repeat], {future: true});
    // Create a new todo if repeat is set.
    if(!current && todo.repeat) {
      const dup = {
        created: todo.created,
        headline: todo.headline,
        note: todo.note,
        priority: todo.priority,
        nextReminder: nextReminder.toISOString(),
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
  };

  handleCloseEditDialog = () => {
    this.setState({editing: null});
  };

  handleDelete = async id => {
    await this.props.actions.deleteTodo(id);
    this.handleCloseEditDialog();
  };

}
