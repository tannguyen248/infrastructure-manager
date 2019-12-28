import { CircularProgress } from '@material-ui/core';
import { red } from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useState,
  useMemo
} from 'react';
import { withFirebase } from '../../../Firebase/context';
import SearchBar from './SearchBar';

const DeviceList = React.lazy(() => import('./DeviceList'));

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
    justifyContent: 'center'
  }
}));

const Histories = ({ firebase, auth, ...props }) => {
  const classes = useStyles();
  const [devices, setDevices] = useState([]);
  const [filterDevices, setFilter] = useState([]);

  const getDeviceByName = useCallback(
    searchTerm => {
      if (!searchTerm) return devices;
      return devices.filter(device =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    [devices]
  );

  const searchDevices = useCallback(
    searchTerm => {
      const filteredDevices = getDeviceByName(searchTerm);

      if (filteredDevices && filteredDevices.length !== 0) {
        setFilter(getDeviceByName(searchTerm));
      } else {
        setFilter([]);
      }
    },
    [getDeviceByName, devices]
  );

  const handleChange = useCallback(
    _.debounce(searchTerm => searchDevices(searchTerm), 900),
    [devices]
  );

  const onChange = useCallback(
    e => {
      handleChange(e.target.value);
    },
    [devices, handleChange]
  );

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
          <Suspense fallback={<CircularProgress />}>
            <DeviceList filter={filterDevices} />
          </Suspense>
          {devices.length === 0 && <CircularProgress />}
          {filterDevices.length === 0 && (!devices || devices.length !== 0) && (
            <DeviceNotFound />
          )}
        </Grid>
      </Grid>
    </>
  );
};

const DeviceNotFound = React.memo((...props) => {
  return <div>Devices not found</div>;
});

export default withFirebase(Histories);
