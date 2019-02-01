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
  'tonight': '6pm',
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
