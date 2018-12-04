import React, { Component } from 'react';
import TodoList from './components/todo-list';
import './App.css';

const {app} = window.require('electron').remote;



class App extends Component {
  state = {
    count: 1,
    reminders: []
  };

  create = (headline, priority=5) => {
    let {reminders, count} = this.state;
    count += 1;
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

  delete = deleteId => {
    let {reminders} = this.state;
    reminders = reminders.filter(t => t.id !== deleteId);
    this.setState({reminders});
  };

  render() {
    return (
      <div className="App">
        <TodoList data={this.state.reminders}
                  onCreate={this.create}
                  onDelete={this.delete}
        />
      </div>
    );
  }
}

export default App;
