import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import {repeatOptions} from '../constants';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import {withStyles} from '@material-ui/core/styles/index';

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  formControl: {
    margin: 10,
  },
});

class EditTodo extends React.Component {
  state = {
  };

  static getDerivedStateFromProps(props, state) {
    if(state.todo) {
      return state;
    }
    const todo = props.todo ? {...props.todo} : null;
    return {...state, todo};
  }

  handleSave = () => {
    const {todo} = this.state;
    this.props.onSave(todo);
    this.handleClose();
  };

  handleChange = e => {
    const {todo} = this.state;
    todo[e.target.name] = e.target.value;
    this.setState({todo});
  };

  handleDelete = () => {
    const {todo, onDelete} = this.props;
    onDelete(todo.id);
    this.handleClose();
  };

  handleClose = () => {
    this.setState({todo: null});
    this.props.onClose();
  };

  render() {
    const {classes} = this.props;
    const {todo} = this.state;
    const open = !!todo;
    return (
      <Dialog
        open={open}
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Edit Todo</DialogTitle>
        <DialogContent>
          <DialogContentText>
          </DialogContentText>
          <TextField
            autoFocus
            id="headline"
            name="headline"
            fullWidth
            multiline
            rows={3}
            defaultValue={todo ? todo.headline : ''}
            onChange={this.handleChange}
            variant="outlined"
          />
          <FormControl className={classes.formControl}>
            <Select className={classes.repeatSelect}
                    value={todo ? todo.repeat : ''}
                    onChange={this.handleChange}
                    inputProps={{
                      name: 'repeat',
                      id: 'repeat',
                    }}
            >
              {repeatOptions.map(option => (
                <MenuItem key={option} className={classes.repeats}
                          value={option}>{option.capitalize()}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleDelete} color="secondary">
            Delete
          </Button>
          <Button onClick={this.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(EditTodo);
