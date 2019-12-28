import CustomAvatar from './Avatar';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import React, { Suspense } from 'react';
import CustomSkeleton from './Skeleton';

const HistoryItem = ({ device, classes, lg, md, imageUrl, ...props }) => {
  return (
    <Grid container spacing={2} className={classes.itemContainer}>
      <Grid item lg={lg} md={md} className={classes.listItem}>
        <ListItem alignItems='flex-start'>
          <ListItemAvatar>
            <Suspense fallback={<CustomSkeleton />}>
              <CustomAvatar alt='Avatar image' imageUrl={imageUrl} />
            </Suspense>
          </ListItemAvatar>
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
};

export default HistoryItem;
