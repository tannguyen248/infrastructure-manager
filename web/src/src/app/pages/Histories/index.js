import { red } from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MediaCard from './MediaCard';
import { withFirebase } from '../../../Firebase/context';
import { CircularProgress } from '@material-ui/core';
import Lazyload from 'react-lazyload';
import Skeleton from '@material-ui/lab/Skeleton';
import SimpleContainer from './SimpleContainer';
import DeviceContext from '../../context/DeviceContext';
import SearchBar from './SearchBar';
import _ from 'lodash';

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 345
  },
  media: {
    height: 0,
    paddingTop: '56.25%' // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  },
  avatar: {
    backgroundColor: red[500]
  },
  historiesContainer: {
    marginTop: '24px'
  },
  items: {
    justifyContent: 'center'
  },
  searchBar: {
    justifyContent: 'center',
  }
}));


const Histories = ({ firebase, auth, ...props }) => {
  const classes = useStyles();
  const [devices, setDevices] = useState([]);
  const [filter, setFilter] = useState([]);
  const [value, setValue] = useState('');

  const getDeviceByName = () => {
    if (!value) return devices;
    return devices.filter(device => device.name.toLowerCase().includes(value.toLowerCase()));
  }

  const searchDevices = () => {
    console.log('device', getDeviceByName());
    setFilter(getDeviceByName());
  }

  const handleChange = useCallback(_.debounce(searchDevices, 900), [value]);

  const onChange = useCallback(e => {
    setValue(e.target.value)
    handleChange();
  }, [value]);

  // const handleClick = e => {
  //   setFilter(filteredDevices);
  // };

  useEffect(() => {
    const unsubcribe = firebase.devices().onSnapshot(snapshot => {
      const devices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDevices(devices);
      setFilter(devices);
    });

    return () => {
      unsubcribe && unsubcribe();
    };
  }, []);

  return (
    <>
     <Grid item xs={12} md={12}>
          <Grid container spacing={1} className={classes.searchBar}>
             <SearchBar onChange={onChange} />
         </Grid>
    </Grid>
        <Grid item xs={12} className={classes.historiesContainer}>
          <Grid container spacing={1} className={classes.items}>
      {filter && filter.length !== 0 ? (
        <>
            {filter.map(filter => (
                <DeviceCard device={filter} key={filter.id} />
            ))}
        </>
      ) : (
        <CircularProgress />
      )}
          </Grid>
        </Grid>
      {/* <SimpleContainer /> */}
    </>
  );
};

const DeviceCard = React.memo(({device, ...props}) => {
  return (
      <Grid
        item
        xs={2}
        sm={2}
        component={Link}
        to={{
          pathname: `/histories/${device.id}`,
          state: device.name
        }}
      >
          <MediaCard name={device.name} model={device.model} />
      </Grid>
  );
});

export default withFirebase(Histories);
