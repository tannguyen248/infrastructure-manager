import { CircularProgress } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState, useContext } from 'react';
import DeviceContext from '../../context/DeviceContext';
import { withFirebase } from '../../../Firebase/context';
import { useParams } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Lazyload from 'react-lazyload';
import avatar from '../../../../src/static/images/Missing_avatar.png';
// import { sortBy } from '../../helper';
import _ from 'lodash';

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

const Loading = () => {
  return <div>Loading</div>;
};

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
        console.log('history', histories);
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

  console.log('Devices', devices);

  return (
    <>
      {devices && devices.length !== 0 ? (
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
          {_.orderBy(devices, ['created_at'], 'desc').map((device, index) => {
            return (
              <HistoryItem
                device={device}
                classes={classes}
                key={index}
                avatar={avatar}
                lg={6}
                md={12}
              />
            );
          })}
        </Grid>
      ) : (
        <MyCircularProgress devices={devices}/>
      )}
    </>
  );
});

const HistoryItem = ({avatar, device, classes,lg, md, ...props}) => {
  return (
    <Grid
        container
        spacing={2}
        className={classes.itemContainer}
      >
        <Grid item lg={lg} md={md} className={classes.listItem}>
          <ListItem alignItems='flex-start'>
            <Lazyload placeholder={<Loading />}>
              <ListItemAvatar>
                <Avatar alt='' src={avatar} />
              </ListItemAvatar>
            </Lazyload>
            <ListItemText
              primary={device.email}
              secondary={
                <React.Fragment>
                  <Typography
                    component='span'
                    variant='body2'
                    className={classes.inline}
                    color='textPrimary'
                  >
                    {device.history.event} on
                  </Typography>
                  <Typography
                    component='span'
                    variant='body2'
                    color='textPrimary'
                  >
                    {` ${device.history.date.toDate().toString()}`}
                  </Typography>
                </React.Fragment>
              }
            />
          </ListItem>
        </Grid>
      </Grid>
  );
}

const MyCircularProgress = ({devices, ...props}) => {
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

  return <>{noHistory ? <NoDeviceHistory /> : <CircularProgress />}  </>;
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
