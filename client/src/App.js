import React, { Component } from 'react';
import TodoList from './components/todo-list';
import './App.css';

const {app} = window.require('electron').remote;

class App extends Component {
  render() {
    return (
      <div className="App">
        <TodoList />
      </div>
    );
  }
}

export default App;
