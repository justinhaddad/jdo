import React from 'react';
import {fromJS} from 'immutable';
import {debounce} from 'lodash';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import DateFnsUtils from '@date-io/date-fns';
import {InlineDateTimePicker} from 'material-ui-pickers';
import Divider from '@material-ui/core/Divider';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import EditTodoDialog from '../edit-dialog';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import LoopIcon from '@material-ui/icons/Loop';
import MenuItem from '@material-ui/core/MenuItem';
import {MuiPickersUtilsProvider} from 'material-ui-pickers';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Paper from '@material-ui/core/Paper';
import {repeatOptions} from '../constants';
import Select from '@material-ui/core/Select';
import Sugar from 'sugar-date';
import Toolbar from '../toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import {createTodo, deleteTodo, loadTodos, updateTodo} from '../../api';
import BaseTodoList from '../BaseTodoList';

// const remote = window.require('electron').remote;

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};


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
  repeatSelect: {
    width: 130,
  },
  repeats: {
    fontSize: 10,
  },
  icon: {
    fontSize: 20,
    marginTop: 10,
    marginRight: 10,
  },
  editControl: {
    padding: 3,
  }
});

class TodoList extends BaseTodoList {
  state = {
    todos: fromJS([]),
    orderBy: 'nextReminder',
    order: 'desc',
    editing: false,
  };

  create = async headline => {
    await createTodo(headline);
    this.reloadTodos();
  };

  handleMenuItemClick = async (event, index) => {
    this.setState({selectedIndex: index});
    await updateTodo(this.state.selectedTodo, {repeat: repeatOptions[index]});
    this.reloadTodos();
  };

  handleRepeatChange = async (e, todoId) => {
    await updateTodo(todoId, {repeat: e.target.value});
    this.reloadTodos();
  };

  handleNextReminderChange = async (todoId, date) => {
    await updateTodo(todoId, {nextReminder: date.toISOString()});
    this.reloadTodos();
  };

  render() {
    const {classes} = this.props;
    const {todos, filtered, order, orderBy, editing} = this.state;
    return (
      <React.Fragment>
        <Toolbar onCreate={this.create} onSearch={this.handleSearch} showSnooze={false}
                 count={todos.size} />
        <Paper className={classes.root}>
          <List className={classes.root}>
            {stableSort(filtered || todos.toJS(), getSorting(order, orderBy))
              .map(n => {
                return (
                  <React.Fragment>
                    <ListItem
                      role="checkbox"
                      key={n.id}
                    >
                      <Grid container>
                        <Grid xs={1}>
                          <Checkbox className={classes.editControl}
                            checked={n.complete}
                            tabIndex={-1}
                            disableRipple
                            onClick={() => this.handleToggleComplete(n.id, n.complete)}
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <Typography className={n.complete ? classes.strikethru : null}
                                      variant="subtitle2"
                          >
                            {n.headline}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Tooltip title={n.nextReminder ? Sugar.Date(n.nextReminder).relative().raw : null}>
                            <NotificationsIcon className={classes.icon}/>
                          </Tooltip>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <InlineDateTimePicker
                              keyboard
                              value={n.nextReminder}
                              onChange={date => this.handleNextReminderChange(n.id, date)}
                              label={null}
                              showTodayButton
                              format="MMM do h:ss a"
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={3}>
                          <LoopIcon className={classes.icon}/>
                          <FormControl className={classes.formControl}>
                            <Select className={classes.repeatSelect}
                                    value={n.repeat}
                                    onChange={e => this.handleRepeatChange(e, n.id)}
                                    inputProps={{
                                      name: `repeat-${n.id}`,
                                      id: `repeat-${n.id}`,
                                    }}
                            >
                              {repeatOptions.map(option => (
                                <MenuItem className={classes.repeats}
                                          value={option}>{option.capitalize()}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <IconButton aria-label="Edit" className={classes.editControl}
                                      onClick={e => this.setState({editing: n})}>
                            <EditIcon/>
                          </IconButton>
                          <IconButton aria-label="Delete" className={classes.editControl}
                                      onClick={() => this.handleDelete(n.id)}>
                            <DeleteIcon/>
                          </IconButton>
                        </Grid>
                      </Grid>
                    </ListItem>
                    <li>
                      <Divider variant="inset"/>
                    </li>
                  </React.Fragment>
                );
              })}
          </List>
          <EditTodoDialog todo={editing} onSave={this.handleSave}
                          onCancel={this.handleCloseEditDialog}
                          onDelete={this.handleDelete}
          />
        </Paper>
      </React.Fragment>
    );
  }
}

TodoList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TodoList);
