import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import AddIcon from '@material-ui/icons/Add';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Toolbar from '@material-ui/core/Toolbar';

import {withStyles} from '@material-ui/core/styles/index';
import {lighten} from '@material-ui/core/styles/colorManipulator';

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
  addBox: {
    width: 500,
  },
});

class EnhancedTableToolbar extends React.Component {
  state = {
    headline: ''
  };

  handleCreate = () => {
    this.props.onCreate(this.state.headline);
    this.setState({headline: ''});
  };

  catchReturn = e => {
    if (e.key === 'Enter') {
      this.handleCreate();
    }
  };

  render() {
    const {numSelected, classes} = this.props;
    const {headline} = this.state;

    return (
      <Toolbar
        className={classNames(classes.root, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        <div className={classes.title}>
          <TextField
            id="outlined-with-placeholder"
            label="New Reminder"
            className={classes.addBox}
            margin="normal"
            variant="outlined"
            value={headline}
            onChange={e => this.setState({headline: e.target.value})}
            onKeyPress={this.catchReturn}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Add new jdo"
                    onClick={this.handleCreate}
                    disabled={!headline}
                  >
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
        <div className={classes.spacer}/>
        <div className={classes.actions}>
        </div>
      </Toolbar>
    );
  }
}

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(toolbarStyles)(EnhancedTableToolbar);
