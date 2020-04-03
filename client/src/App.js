import React, { Component } from 'react';
import './App.css';
import ViewManager from './ViewManager';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';

//const {app} = window.require('electron').remote;

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <ViewManager />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
