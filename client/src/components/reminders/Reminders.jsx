import {ActionCreators} from '../../actions';
import Badge from '@material-ui/core/Badge';
import BaseTodoList from '../BaseTodoList';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import EditTodoDialog from '../edit-dialog';
import LoopIcon from '@material-ui/icons/Loop';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import SnoozeButton from './SnoozeButton';
import Sugar from 'sugar-date';
import Toolbar from '../toolbar/Toolbar';
import {withStyles} from '@material-ui/core/styles';
import {bindActionCreators, compose} from 'redux';
import {connect} from 'react-redux';

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
  repeatIcon: {
    fontSize: 16,
  },
  editControl: {
    padding: 3,
  },
  badge: {
    fontSize: 9,
    top: 8,
    right: -8,
    width: 15,
    height: 15,
  },
  todoRow: {
    padding: 2
  },
});

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

class Reminders extends BaseTodoList {
  state = {
    orderBy: 'nextReminder',
    order: 'desc',
    searchTxt: null,
    editing: false,
    remindersOnly: true,
  };

  handleSnooze = async (id, value) => {
    let nextReminder = Sugar.Date(value);
    if(nextReminder.isPast().raw) {
      nextReminder = Sugar.Date(`next ${value}`);
    }
    await this.props.actions.updateTodo(
      id, {nextReminder: nextReminder.toISOString().raw});
  };

  handleSnoozeAll = () => {
    this.props.actions.snoozeAll(300);
  };

  handleCompleteRecurring = reminders => {
    reminders.filter(r => r.repeat != null).map(r => {
      this.props.actions.updateTodo(r.id, {complete: true});
    });
  };

  render() {
    let {classes, todos} = this.props;
    if (!todos) {
      todos = [];
    }
    todos = todos.filter(t => !t.complete && t.nextReminder &&
      new Date(t.nextReminder) <= new Date());
    const {filtered, order, orderBy, editing} = this.state;

    const abbreviatedRepeat =repeat => {
      let abbrev = repeat.charAt(0).toUpperCase();
      if(repeat.endsWith('days')) {
        abbrev += repeat.charAt(1);
      }
      return abbrev;
    };

    return (
      <React.Fragment>
        <Toolbar onSnoozeAll={this.handleSnoozeAll}
           count={todos.length}
           onCompleteRecurring={() => this.handleCompleteRecurring(todos)}
        />
        <Paper className={classes.root}>
        <List className={classes.root}>
          {stableSort(filtered || todos, getSorting(order, orderBy))
            .map(n => {
              return (
                <React.Fragment key={n.id}>
                  <ListItem role="checkbox" className={classes.todoRow}>
                    <Checkbox className={classes.editControl}
                      checked={n.complete}
                      tabIndex={-1}
                      disableRipple
                      onClick={() => this.handleToggleComplete(n.id, n.complete)}
                    />
                    <ListItemText
                      primary={
                        <span>
                          <Typography className={n.complete ? classes.strikethru : null}>
                            {n.headline}
                            {n.repeat && n.repeat !== 'never' &&
                              <Tooltip title={n.repeat}>
                                <Badge badgeContent={abbreviatedRepeat(n.repeat)} color="primary"
                                       classes={{badge: classes.badge}}>
                                  <LoopIcon color="primary" className={classes.repeatIcon}/>
                                </Badge>
                              </Tooltip>
                            }
                          </Typography>
                        </span>
                      }
                    />
                    <IconButton aria-label="Edit" className={classes.editControl}
                                onClick={() => this.setState({editing: n})}>
                      <EditIcon/>
                    </IconButton>
                    <SnoozeButton reminder={n} onClick={this.handleSnooze}/>
                  </ListItem>
                  <li>
                    <Divider />
                  </li>
                </React.Fragment>
              );
            })
          }
        </List>
        <EditTodoDialog todo={editing} onSave={this.handleSave}
                        onClose={this.handleCloseEditDialog}
                        onDelete={this.handleDelete}
        />
      </Paper>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {return {...state}};

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators(ActionCreators, dispatch),
    dispatch,
  };
};

Reminders.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )
)(Reminders);
