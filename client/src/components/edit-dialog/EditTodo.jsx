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
    open: false,
  };

  /*
  static getDerivedStateFromProps(props, state) {
    console.log('Deriving from:', props.todo);
    // return {...state, todo: props.todo};
  }
  */

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({open: false, todo: null});
  };

  handleSave = () => {
    const {todo} = this.state;
    this.props.onSave(todo);
    this.setState({todo: null});
  };

  handleChange = e => {
    const todo = this.state.todo || {...this.props.todo};
    todo[e.target.name] = e.target.value;
    this.setState({todo});
  };

  handleDelete = () => {
    const {todo, onDelete} = this.props;
    onDelete(todo.id);
    this.handleClose();
  };

  render() {
    const {classes, onCancel} = this.props;
    const todo = this.state.todo || this.props.todo;
    return (
      <Dialog
        open={!!todo}
        onClose={onCancel}
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
            defaultValue={todo.headline}
            onChange={this.handleChange}
            variant="outlined"
          />
          <FormControl className={classes.formControl}>
            <Select className={classes.repeatSelect}
                    value={todo.repeat}
                    onChange={this.handleChange}
                    inputProps={{
                      name: 'repeat',
                      id: 'repeat',
                    }}
            >
              {repeatOptions.map(option => (
                <MenuItem className={classes.repeats}
                          value={option}>{option.capitalize()}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleDelete} color="secondary">
            Delete
          </Button>
          <Button onClick={onCancel} color="primary">
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
