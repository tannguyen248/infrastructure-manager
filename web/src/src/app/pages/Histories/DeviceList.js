import React, { Suspense } from 'react';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';
import CustomSkeleton from './Skeleton';

const DeviceList = React.memo(({ filter, ...props }) => {
  return (
    <>
      {filter.map(filter => (
        <DeviceItem device={filter} key={filter.id} />
      ))}
    </>
  );
});

const MediaCard = React.lazy(() => import('./MediaCard'));

const DeviceItem = React.memo(({ device, ...props }) => {
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
      <Suspense fallback={<CustomSkeleton />}>
        <MediaCard name={device.name} model={device.model} />
      </Suspense>
    </Grid>
  );
});

export default DeviceList;
