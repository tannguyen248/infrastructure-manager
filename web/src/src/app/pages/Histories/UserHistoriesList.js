import { CircularProgress } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import _ from 'lodash';
import Badge from '@material-ui/core/Badge';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { withFirebase } from '../../../Firebase/context';
import CustomSkeleton from './Skeleton';
import HistoryItem from './HistoryItem';
import CustomAvatar from './Avatar';

const StyledBadge = withStyles(theme => ({
  badge: {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: '$ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""'
    }
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0
    }
  }
}))(Badge);

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 1020,
    backgroundColor: theme.palette.background.paper
  },
  inline: {
    display: 'inline',
    fontWeight: 'bold',
    color: '#3f51b5'
  },
  listItem: {
    backgroundColor: '#efefef',
    marginBottom: '24px',
    borderRadius: '4px'
  },
  historyContainer: {
    margin: '24px auto'
  },
  itemContainer: {
    justifyContent: 'center'
  }
}));

const UserHistoriesList = React.memo(({ firebase, auth, ...props }) => {
  const classes = useStyles();
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [devices, setDevices] = useState([]);
  const [deviceName, setDeviceName] = useState('');
  const [noDeviceHistory, setNoDeviceHistory] = useState(false);
  const { deviceId } = useParams();
  const name = props.location.state;

  useEffect(() => {
    firebase
      .histories()
      .where('deviceId', '==', deviceId)
      .get()
      .then(snapshot => {
        const histories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDeviceHistory(histories);
      });
  }, []);

  useEffect(() => {
    firebase
      .device(deviceId)
      .get()
      .then(snapshot => {
        const device = snapshot.data();
        if (device && device.name) {
          setDeviceName(device.name);
        }
      });
  }, []);

  useEffect(() => {
    const getDevices = async () => {
      const res = deviceHistory.map(async history => {
        if (history && history.userId !== '') {
          const device = await firebase
            .user(history.userId)
            .get()
            .then(doc => {
              return {
                id: doc.id,
                history,
                ...doc.data()
              };
            });
          return device;
        }
        return {};
      });
      return await Promise.all(res);
    };

    getDevices().then(devices => {
      setDevices(devices.filter(device => device.id));
    });
  }, [deviceHistory]);

  const sortedDevices = useMemo(() => {
    return _.orderBy(
      devices,
      ['history.event', 'history.date'],
      ['asc', 'desc']
    );
  }, [devices]);

  return (
    <>
      <Grid
        className={classes.historyContainer}
        container
        direction='column'
        justify='center'
        alignItems='center'
      >
        <div>
          <Typography variant='h1' component='h2' gutterBottom>
            {name || deviceName}
          </Typography>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <WhoKeepDevice sortedDevices={sortedDevices} classes={classes} />
        </div>
        {sortedDevices.map((device, index) => {
          return (
            <HistoryItem
              device={device}
              classes={classes}
              key={index}
              src={device.imageUrl}
              lg={6}
              md={12}
            />
          );
        })}
        {sortedDevices && sortedDevices.length === 0 && <CircularProgress />}
      </Grid>
    </>
  );
});

const WhoKeepDevice = ({
  sortedDevices = [{ email: '' }],
  classes,
  ...props
}) => {
  return (
    <>
      {sortedDevices && sortedDevices[0] && sortedDevices[0]['email'] ? (
        <div>
          <StyledBadge
            overlap='circle'
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            variant='dot'
          >
            <CustomAvatar imageUrl={sortedDevices[0]['imageUrl']} />
          </StyledBadge>
          <Typography
            component='span'
            variant='body2'
            className={classes.inline}
            color='textPrimary'
          >
            {` ${sortedDevices[0]['email']}`}
          </Typography>
          <Typography component='span' variant='body2' color='textPrimary'>
            {` currently keep this device`}
          </Typography>
        </div>
      ) : null}
    </>
  );
};

const MyCircularProgress = ({ devices, ...props }) => {
  const [noHistory, setNoHistory] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!devices || devices.length === 0) {
        setNoHistory(true);
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  });

  return <>{noHistory ? <NoDeviceHistory /> : <CircularProgress />} </>;
};

const NoDeviceHistory = () => {
  return (
    <div>
      Yay you have no borrowed devices. Please contact Le Do to lend more and
      have fun.!!!!
    </div>
  );
};

export default withFirebase(UserHistoriesList);
