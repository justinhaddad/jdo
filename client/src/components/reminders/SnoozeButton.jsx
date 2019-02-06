import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import React from 'react';
import SnoozeIcon from '@material-ui/icons/Snooze';
import Typography from '@material-ui/core/Typography';
import Zoom from '@material-ui/core/Zoom';
import {withStyles} from '@material-ui/core/styles/index';
import {compose} from 'redux';
import {snoozeOptions} from '../../const';

const styles = theme => ({
  popoverTitle: {
    padding: 10,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
  },
  container: {
    position: 'relative',
  },
  quick: {
    width: 13,
    height: 13,
    fontSize: 6,
    position: 'absolute',
    zIndex: 100,
  },
  quicktop: {
    top: 2,
  },
  quickbottom: {
    top: 30,
  },
  quickleft: {
    left: 4,
  },
  quickright: {
    left: 30,
  },
  bulge: {
    width: 20,
    height: 20,
    fontSize: 8,
  },
});

class SnoozeButton extends React.Component {
  state = {
    anchorEl: null,
  }

  showSnoozePopover = e => {
    this.setState({
      anchorEl: e.currentTarget,
    });
  };

  hideSnoozePopover = () => {
    this.setState({anchorEl: null});
  };

  handleSnooze = e => {
    const {reminder, onClick} = this.props;
    this.hideSnoozePopover();
    onClick(reminder.id, e.currentTarget.value);
  };

  quickSnooze = (value, vert, horiz) => {
    const {classes, onClick, reminder} = this.props;
    const {hoverOnSnooze, hoverOnQuickie, hoverTarget} = this.state;
    const class1 = `quick${vert}`;
    const class2 = `quick${horiz}`;
    let classList = `${classes.quick} ${classes[class1]} ${classes[class2]}`;
    if(hoverOnQuickie && value === hoverTarget) {
      classList += ' ' + classes.bulge;
    }
    return (
      <Zoom in={hoverOnSnooze || hoverOnQuickie}>
        <Button className={classList}
                variant="fab" value={snoozeOptions[value]}
                onClick={e => onClick(reminder.id, e.currentTarget.value)}
                onMouseEnter={() => this.setState({hoverOnQuickie: true, hoverTarget: value})}
                onMouseLeave={() => this.setState({hoverOnQuickie: false})}
        >
          {value}
        </Button>
      </Zoom>
    );
  };

  render() {
    const {classes, reminder} = this.props;
    const {anchorEl} = this.state;
    const open = Boolean(anchorEl);

    return (
      <React.Fragment>
        <div className={classes.container}>
          {this.quickSnooze('1h', 'top', 'left')}
          {this.quickSnooze('8h', 'top', 'right')}
          <IconButton aria-label="Snooze" className={classes.editControl}
                      onClick={this.showSnoozePopover}
                      onMouseEnter={() => this.setState({hoverOnSnooze: true})}
                      onMouseLeave={() => this.setState({hoverOnSnooze: false})}
          >
            <SnoozeIcon/>
          </IconButton>
          {this.quickSnooze('Tu', 'bottom', 'left')}
          {this.quickSnooze('F', 'bottom', 'right')}
        </div>

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
            {`Snooze: ${reminder.headline}`}
          </Typography>
          <Divider/>
          {Object.keys(snoozeOptions).map(opt => (
            <Button key={opt} value={snoozeOptions[opt]}
                    onClick={this.handleSnooze}>{opt}</Button>
          ))}
        </Popover>
      </React.Fragment>
    );
  }
}

export default compose(
  withStyles(styles),
)(SnoozeButton);
