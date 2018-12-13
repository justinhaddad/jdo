import React from 'react';
import {fromJS} from 'immutable';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import { DateTimePicker } from 'material-ui-pickers';
import Divider from '@material-ui/core/Divider';
import DeleteIcon from '@material-ui/icons/Delete';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Sugar from 'sugar-date';
import Toolbar from '../toolbar';
import Typography from '@material-ui/core/Typography';

import {createTodo, deleteTodo, loadTodos, updateTodo} from '../../api';

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

const repeatOptions = [
  'never', 'daily', 'weekly', 'hourly', 'monthly', 'weekdays', 'mondays', 'tuesdays', 'wednesdays',
  'thursdays', 'fridays'
];

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

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

class TodoList extends React.Component {
  state = {
    todos: fromJS([]),
  };

  async reloadTodos() {
    loadTodos(this.props.remindersOnly).then(data => this.setState({todos: fromJS(data)}));
  }

  componentDidMount() {
    this.reloadTodos();
  }

  create = async headline => {
    await createTodo(headline);
    this.reloadTodos();
  };

  delete = async id => {
    await deleteTodo(id);
    this.reloadTodos();
  };

  handleMenuItemClick = async (event, index) => {
    this.setState({ selectedIndex: index});
    await updateTodo(this.state.selectedTodo, {'repeat': repeatOptions[index]});
    this.reloadTodos();
  };

  handleRepeatChange = async (e, todoId) => {
    await updateTodo(todoId, {repeat: e.target.value});
    this.reloadTodos();
  };

  handleToggleComplete = async (todoId, current) => {
    await updateTodo(todoId, {complete: !current});
    this.reloadTodos();
  };

  handleNextReminderChange = async (todoId, date) => {
    await updateTodo(todoId, {nextReminder: date.toISOString()});
    this.reloadTodos();
  };

  render() {
    const {classes} = this.props;
    const {todos, order, orderBy} = this.state;
    return (
      <Paper className={classes.root}>
        <Toolbar onCreate={this.create}/>
        <List className={classes.root}>
          {stableSort(todos.toJS(), getSorting(order, orderBy))
            .map(n => {
              return (
                <React.Fragment>
                  <ListItem
                    role="checkbox"
                    key={n.id}
                  >
                    <Checkbox
                      checked={n.complete}
                      tabIndex={-1}
                      disableRipple
                      onClick={() => this.handleToggleComplete(n.id, n.complete)}
                    />
                    <ListItemText
                      primary={
                        <Typography className={n.complete ? classes.strikethru : null}>{n.headline}</Typography>
                      }
                      secondary={ !n.complete && (
                        <Grid container>
                          <Grid item xs>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DateTimePicker
                                value={n.nextReminder}
                                onChange={date => this.handleNextReminderChange(n.id, date)}
                                label="Next Reminder"
                                showTodayButton
                              />
                            </MuiPickersUtilsProvider>
                            ({n.nextReminder ? Sugar.Date(n.nextReminder).relative().raw : 'Never'})
                          </Grid>
                          <Grid item xs>
                            <Typography component="span" className={classes.inline} color="textSecondary">
                              Repeats:
                            </Typography>
                            <FormControl className={classes.formControl}>
                              <Select
                                value={n.repeat}
                                onChange={e => this.handleRepeatChange(e, n.id)}
                                inputProps={{
                                  name: `repeat-${n.id}`,
                                  id: `repeat-${n.id}`,
                                }}
                              >
                                {repeatOptions.map(option => (
                                  <MenuItem value={option}>{option.capitalize()}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      )}
                    />
                    <IconButton aria-label="Delete" onClick={() => this.delete(n.id)}>
                      <DeleteIcon/>
                    </IconButton>
                  </ListItem>
                  <li>
                    <Divider variant="inset"/>
                  </li>
                </React.Fragment>
              );
            })}
        </List>
      </Paper>
    );
  }
}

TodoList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TodoList);
