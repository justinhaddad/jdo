import Badge from '@material-ui/core/Badge';
import BaseTodoList from '../BaseTodoList';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import EditTodoDialog from '../edit-dialog';
import LoopIcon from '@material-ui/icons/Loop';
import SnoozeIcon from '@material-ui/icons/Snooze';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import PropTypes from 'prop-types';
import React from 'react';
import Sugar from 'sugar-date';
import Toolbar from '../toolbar/Toolbar';
import {withStyles} from '@material-ui/core/styles';
import {bindActionCreators, compose} from 'redux';
import {ActionCreators} from '../../actions';
import {connect} from 'react-redux';


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
  '12h': 'in 12 hours',
  '20h': 'in 20 hours',
  '1d': 'in 1 day',
  '2d': 'in 2 days',
  '3d': 'in 3 days',
  '1w': 'in 1 week',
  '2w': 'in 2 weeks',
  '1mo': 'in 1 month',
  '3mo': 'in 3 months',
  '6mo': 'in 6 months',
  '1y': 'in 1 year',
  'morrow morn': 'tomorrow at 9am',
  'morrow noon': 'tomorrow at noon',
  'morrow eve': 'tomorrow at 5pm',
  'Su': 'next Sunday at noon',
  'M': 'next Monday at noon',
  'Tu': 'next Tuesday at noon',
  'W': 'next Wednesday at noon',
  'Th': 'next Thursday at noon',
  'F': 'next Friday at noon',
  'Sa': 'next Saturday at noon',
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
  popoverTitle: {
    padding: 10,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
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
    anchorEl: null,
    orderBy: 'nextReminder',
    order: 'desc',
    searchTxt: null,
    editing: false,
    remindersOnly: true,
};

  handleSnooze = async e => {
    this.hideSnoozePopover();
    const next = Sugar.Date.create(e.currentTarget.value);
    await this.props.actions.updateTodo(
      this.state.selected, {nextReminder: next.toISOString()});
  };

  showSnoozePopover = (target, id, headline) => {
    this.setState({
      anchorEl: target,
      selected: id,
      selectedHeadline: headline,
    });
  };

  hideSnoozePopover = () => {
    this.setState({anchorEl: null});
  };


  handleSnoozeAll = () => {
    this.props.actions.snoozeAll(300);
  };

  render() {
    let {classes, todos} = this.props;
    if (!todos) {
      todos = [];
    }
    todos = todos.filter(t => !t.complete && t.nextReminder &&
      new Date(t.nextReminder) <= new Date());
    const {filtered, order, orderBy, anchorEl, editing} = this.state;
    const open = Boolean(anchorEl);

    const abbreviatedRepeat =repeat => {
      let abbrev = repeat.charAt(0).toUpperCase();
      if(repeat.endsWith('days')) {
        abbrev += repeat.charAt(1);
      }
      return abbrev;
    };

    return (
      <React.Fragment>
        <Toolbar onSnoozeAll={this.handleSnoozeAll} onSearch={this.handleSearch}
                 count={todos.length} />
        <Paper className={classes.root}>
        <List className={classes.root}>
          {stableSort(filtered || todos, getSorting(order, orderBy))
            .map(n => {
              return (
                <React.Fragment key={n.id}>
                  <ListItem role="checkbox">
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
                                onClick={e => this.setState({editing: n})}>
                      <EditIcon/>
                    </IconButton>
                    <IconButton aria-label="Snooze" className={classes.editControl}
                                onClick={e => this.showSnoozePopover(e.currentTarget, n.id, n.headline)}
                    >
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
          <Typography className={classes.popoverTitle} variant="subheading" component="h5">
            {`Snooze: ${this.state.selectedHeadline}`}
          </Typography>
          <Divider/>
          {Object.keys(snoozeOptions).map(opt => (
            <Button key={opt} value={snoozeOptions[opt]}
                    onClick={this.handleSnooze}>{opt}</Button>
          ))}
        </Popover>
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
