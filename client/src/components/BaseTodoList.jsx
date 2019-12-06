import {debounce} from 'lodash';
import React from 'react';


export default class BaseTodoList extends React.Component {
  reloadTodos = async (search = null) => {
    const {remindersOnly} = this.state;
    if (search == null) {
      search = this.state.search;
    } else {
      this.setState({search});
    }
    await this.props.actions.loadTodos({remindersOnly, search});
  };

  handleToggleComplete = (todoId, current) => {
    this.props.actions.updateTodo(todoId, {complete: !current});
  };

  handleSearch = debounce(searchTxt => {
    this.reloadTodos(searchTxt);
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
