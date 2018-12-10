import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import TodoList from '../todo-list';

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },
  strikethru: {
    textDecoration: 'line-through',
  },
});

class Reminders extends React.Component {
  render() {
    console.log('Window: ', window);
    const {classes} = this.props;
    return (
      <Paper className={classes.root}>
        <TodoList remindersOnly={true} />
      </Paper>
    );
  }
}

Reminders.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Reminders);
