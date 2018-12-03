import React, { Component } from 'react';
import TodoTable from './components/todo-table';
import './App.css';

const {app} = window.require('electron').remote;



class App extends Component {
  state = {
    count: 1,
    reminders: []
  }

  constructor(props) {
    super(props);
    this.create('Add toolbar', 5);
    this.create('get rid of pagination', 5);
    this.create('support create', 1);
    this.create('support delete', 2);
  }

  create = (headline, priority=5) => {
    let {reminders, count} = this.state;
    reminders.push({
      id: count++,
      headline,
      priority,
      complete: false,
      nextAlert: null,
      repeat: null,
      note: 'This is a note.',
      created: new Date(),
    });
    console.log(reminders);
    this.setState({reminders, count});
  };

  render() {
    return (
      <div className="App">
        <TodoTable data={this.state.reminders} onCreate={this.create} />
      </div>
    );
  }
}

export default App;
