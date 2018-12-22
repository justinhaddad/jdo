import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'
import TodoList from './components/todo-list';
import Reminders from './components/reminders';

export default class ViewManager extends Component {

  static Views() {
    return {
      todos: <TodoList/>,
      reminders: <Reminders/>
    }
  }

  static View(props) {
    let name = props.location.search.substr(1) || 'todos';
    let view = ViewManager.Views()[name];
    if(view == null)
      throw new Error("View '" + name + "' is undefined");
    return view;
  }

  render() {
    return (
      <Router>
        <div>
          <Route path='/' component={ViewManager.View}/>
        </div>
      </Router>
    );
  }
}
