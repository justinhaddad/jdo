import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import LoopIcon from '@material-ui/icons/Loop';
import SnoozeIcon from '@material-ui/icons/Snooze';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import {fromJS} from 'immutable';
import {createTodo, loadTodos, updateTodo, snoozeAll} from '../../api';
import Popover from '@material-ui/core/Popover';
import Sugar from 'sugar-date';
import Toolbar from '../toolbar/Toolbar';

const remote = window.require('electron').remote;

const snoozeOptions = {
  '5m': 'in 5 minutes',
  '15m': 'in 15 minutes',
  '30m': 'in 30 minutes',
  '45m': 'in 45 minutes',
  '1h': 'in 1 hour',
  '2h': 'in 2 hours',
  '3h': 'in 3 hours',
  '4h': 'in 4 hours',
  '8h': 'in 8 hours',
  '1d': 'in 1 day',
  '2d': 'in 2 days',
  '3d': 'in 3 days',
  '1w': 'in 1 week',
  '2w': 'in 2 weeks',
  '1mo': 'in 1 month',
  '1y': 'in 1 year',
  'tomorrow morn': 'tomorrow at 9am',
  'tomorrow noon': 'tomorrow at noon',
  'tomorrow eve': 'tomorrow at 5pm',
  'Su': 'Sunday at noon',
  'M': 'Monday at noon',
  'Tu': 'Tuesday at noon',
  'W': 'Wednesday at noon',
  'Th': 'Thursday at noon',
  'F': 'Friday at noon',
  'Sa': 'Saturday at noon',
};

const repeatSugar = {
  'hourly': 'in an hour',
  'daily': 'tomorrow at noon',
  'nightly': 'tomorrow at 4pm',
  'weekly': 'next Sunday',
  'monthly': 'the beginning of next month',
  'sundays': 'next Sunday',
  'mondays': 'next Monday',
  'tuesdays': 'next Tuesday',
  'wednesdays': 'next Wednesday',
  'thursdays': 'next Thursday',
  'fridays': 'next Friday',
  'saturdays': 'next Saturday',
};

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

class Reminders extends React.Component {
  state = {
    todos: fromJS([]),
    anchorEl: null,
    orderBy: 'nextReminder',
    order: 'desc',
    searchTxt: null,
  };

  reloadTodos = async () => {
    let todos = await loadTodos(true);
    this.setState({todos: fromJS(todos)});
    if(todos.length == 0) {
      remote.getCurrentWindow().hide();
    }
  };

  componentDidMount() {
    this.reloadTodos();
    setInterval(this.reloadTodos, 5000);
  }

  handleSnooze = async e => {
    this.hideSnoozePopover();
    const next = Sugar.Date.create(e.currentTarget.value);
    await updateTodo(this.state.selected, {nextReminder: next.toISOString()});
    this.reloadTodos();
  };

  hideSnoozePopover = () => {
    this.setState({anchorEl: null});
  };

  handleToggleComplete = async (todoId, current) => {
    await updateTodo(todoId, {complete: !current});
    // Create a new todo if repeat is set.
    const todo = this.state.todos.toJS().filter(t => t.id === todoId)[0];
    if(!current && todo.repeat) {
      const dup = {
        created: todo.created,
        headline: todo.headline,
        note: todo.note,
        priority: todo.priority,
        nextReminder: Sugar.Date.create(repeatSugar[todo.repeat]).toISOString(),
        repeat: todo.repeat,
      };
      await createTodo(dup);
    }
    this.reloadTodos();
  };

  handleSnoozeAll = () => {
    snoozeAll(10);
  };

  handleSearch = searchTxt => {
    const {todos} = this.state;
    if(searchTxt) {
      const filtered = todos.toJS().filter(t => t.headline.toLowerCase().includes(searchTxt.toLowerCase()));
      this.setState({filtered});
    } else {
      this.setState({filtered: null});
    }
  };

  render() {
    const {classes} = this.props;
    const {todos, filtered, order, orderBy, anchorEl} = this.state;
    const open = Boolean(anchorEl);
    return (
      <React.Fragment>
        <Toolbar onSnoozeAll={this.handleSnoozeAll} onSearch={this.handleSearch}/>
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
                    <Checkbox
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
                                <LoopIcon color="disabled" className={classes.repeatIcon}/>
                              </Tooltip>
                            }
                          </Typography>
                        </span>
                      }
                    />
                    <IconButton aria-label="Snooze"
                                onClick={e => this.setState({anchorEl: e.currentTarget, selected: n.id})}>
                      <SnoozeIcon/>
                    </IconButton>
                  </ListItem>
                  <li>
                    <Divider variant="inset"/>
                  </li>
                </React.Fragment>
              );
            })
          }
        </List>
        <Popover
          id="simple-popper"
          open={open}
          anchorEl={anchorEl}
          onClose={this.hideSnoozePopover}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          {Object.keys(snoozeOptions).map(opt => (
            <Button value={snoozeOptions[opt]}
                    onClick={this.handleSnooze}>{opt}</Button>
          ))}
        </Popover>
      </Paper>
      </React.Fragment>
    );
  }
}

Reminders.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Reminders);
