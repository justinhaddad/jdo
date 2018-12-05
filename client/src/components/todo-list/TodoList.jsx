import React from 'react';
import {fromJS} from 'immutable';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '../toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import {createTodo, deleteTodo, loadTodos} from '../../api';

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
});

class TodoList extends React.Component {
  state = {
    todos: fromJS([]),
  };

  reloadTodos() {
    loadTodos().then(data => this.setState({todos: fromJS(data)}))
      .catch(reason => console.error(reason));
  }

  componentDidMount() {
    this.reloadTodos();
  }

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    this.setState({ selected: newSelected });
  };

  create = async todo => {
    await createTodo(todo);
    this.reloadTodos();
  };

  delete = async id => {
    await deleteTodo(id);
    this.reloadTodos();
  }

  render() {
    const { classes } = this.props;
    const { todos, order, orderBy } = this.state;
    return (
      <Paper className={classes.root}>
        <Toolbar onCreate={this.create}/>
        <List className={classes.root}>
            {stableSort(todos.toJS(), getSorting(order, orderBy))
              .map(n => {
                return (
                  <ListItem
                    hover
                    // onClick={event => this.handleClick(event, n.id)}
                    role="checkbox"
                    tabIndex={-1}
                    key={n.id}
                  >
                    <Checkbox
                      checked={n.complete}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText primary={n.headline} />
                    <IconButton aria-label="Delete" onClick={() => this.delete(n.id)}>
                      <DeleteIcon/>
                    </IconButton>
                  </ListItem>
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
