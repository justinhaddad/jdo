import React, { Component } from 'react';
// import TodoList from './components/todo-list';
import './App.css';
import ViewManager from './ViewManager';

//const {app} = window.require('electron').remote;

class App extends Component {
  render() {
    return (
      <div className="App">
        <ViewManager />
      </div>
    );
  }
}

export default App;
