import React from 'react';
import PropTypes from 'prop-types';

import AddIcon from '@material-ui/icons/Add';
import AppBar from '@material-ui/core/AppBar';
import ClearIcon from '@material-ui/icons/Clear';
import { fade } from '@material-ui/core/styles/colorManipulator';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputBase from '@material-ui/core/InputBase';
import {repeatOptions} from '../constants';
import SearchIcon from '@material-ui/icons/Search';
import SnoozeIcon from '@material-ui/icons/Snooze';
import Sugar from 'sugar-date';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

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
  addInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 5,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 200,
      '&:focus': {
        width: 400,
      },
    },
  },
  searchInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 5,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 100,
      '&:focus': {
        width: 400,
      },
    },
  },
  barText: {
    color: theme.palette.text.primary,
  },
  info: {
    width: 300,
  },
  error: {
    position: 'relative',
    top: -20,
    fontSize: 15,
    left: 165,
  },
});

class EnhancedTableToolbar extends React.Component {
  state = {
    headline: '',
    searchText: '',
    errorMessage: false,
  };

  handleCreate = () => {
    // Check for valid nextReminder term before attemptng to create.
    let headline = this.state.headline;
    const parts = headline.split(';');
    let errorMessage = '';
    if(parts.length > 1) {
      try {
        if(parts[1].trim()) {
          Sugar.Date.create(parts[1]).toISOString();
        }
        if(parts.length > 2 && parts[2].trim()) {
          if(!repeatOptions.includes(parts[2].trim().toLowerCase())) {
            errorMessage = `Invalid repeat option: ${parts[2]}`;
          }
        }
      } catch(error) {
        errorMessage = `Invalid reminder time: ${parts[1]}`;
      }
    }
    if(!errorMessage) {
      this.props.onCreate(headline);
      headline = '';
    }
    this.setState({errorMessage, headline});
  };

  catchReturn = e => {
    if (e.key === 'Enter') {
      this.handleCreate();
    }
  };

  onSearch = e => {
    this.setState({searchText: e.target.value});
    this.props.onSearch(e.target.value);
  };

  clearSearch = () => {
    this.setState({searchText: ''});
    this.props.onSearch('');
  };

  render() {
    const {classes, onCreate, showSnooze, count, onSnoozeAll} = this.props;
    const {headline, searchText, errorMessage} = this.state;

    return (
      <div className={classes.bar}>
      <AppBar position="fixed" className={classes.bar}>
      <Toolbar className={classes.root}>
        <div className={classes.info}>
          <Typography variant="h6" className={classes.barText}>Total: {count}</Typography>
        </div>
        {onCreate &&
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <AddIcon/>
            </div>
            <InputBase
              placeholder="New Todo… [; reminder, e.g. noon [; repeat, e.g. daily]]"
              classes={{
                root: classes.inputRoot,
                input: classes.addInput,
              }}
              value={headline}
              onChange={e => this.setState({headline: e.target.value})}
              onKeyPress={this.catchReturn}
              error={!!errorMessage}
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
              input: classes.searchInput,
            }}
            value={searchText}
            onChange={this.onSearch}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="Clear search"
                  onClick={this.clearSearch}
                >
                  <ClearIcon className={classes.barText}/>
                </IconButton>
              </InputAdornment>
            }
          />
        </div>
        <div className={classes.actions}>
          {showSnooze &&
            <IconButton aria-label="Snooze"
                        onClick={onSnoozeAll}>
              <SnoozeIcon className={classes.barText}/>
            </IconButton>
          }
        </div>
      </Toolbar>
      {errorMessage &&
        <FormHelperText className={classes.error} error={true}>{errorMessage}</FormHelperText>
      }

      </AppBar>
      </div>
    );
  }
}

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  showSnooze: PropTypes.bool,
  onSnoozeAll: PropTypes.func.isRequired,
};

EnhancedTableToolbar.defaultProps = {
  showSnooze: true,
};


export default withStyles(toolbarStyles)(EnhancedTableToolbar);
