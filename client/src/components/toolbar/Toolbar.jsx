import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import AddIcon from '@material-ui/icons/Add';
import AppBar from '@material-ui/core/AppBar';
import { fade } from '@material-ui/core/styles/colorManipulator';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import SnoozeIcon from '@material-ui/icons/Snooze';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';

import {withStyles} from '@material-ui/core/styles/index';
import {lighten} from '@material-ui/core/styles/colorManipulator';
import {snoozeAll} from '../../api';

const remote = window.require('electron').remote;

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
  bar: {
    marginBottom: 0,
    height: 80,
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit,
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing.unit * 5 ,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 5,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 50,
      '&:focus': {
        width: 200,
      },
    },
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

  snooze = () => {
    snoozeAll(300);
    console.log('Hiding window.', remote.getCurrentWindow().getTitle());
    remote.getCurrentWindow().hide();
  };

  onSearch = e => {
    this.props.onSearch(e.target.value);
  };

  render() {
    const {numSelected, classes, onCreate, showSnooze} = this.props;
    const {headline} = this.state;

    return (
      <div className={classes.bar}>
      <AppBar position="fixed" className={classes.bar}>
      <Toolbar
        className={classNames(classes.root, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        {onCreate &&
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <AddIcon />
            </div>
            <InputBase
              placeholder="New Todo…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              value={headline}
              onChange={e => this.setState({headline: e.target.value})}
              onKeyPress={this.catchReturn}
            />
          </div>
        }
        <div className={classes.spacer}/>
        <div className={classes.search}>
          <div className={classes.searchIcon}>
            <SearchIcon />
          </div>
          <InputBase
            placeholder="Search…"
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
            onChange={this.onSearch}
          />
        </div>
        <div className={classes.actions}>
          {showSnooze &&
            <IconButton aria-label="Snooze"
                        onClick={this.snooze}>
              <SnoozeIcon/>
            </IconButton>
          }
        </div>
      </Toolbar>
      </AppBar>
      </div>
    );
  }
}

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  showSnooze: PropTypes.bool,
};

EnhancedTableToolbar.defaultProps = {
  showSnooze: true,
};


export default withStyles(toolbarStyles)(EnhancedTableToolbar);
