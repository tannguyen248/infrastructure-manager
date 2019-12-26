import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import LazyLoad from 'react-lazyload';
import Skeleton from '@material-ui/lab/Skeleton';
import appleLogo from '../../../../src/static/images/apple.png';
import androidLogo from '../../../../src/static/images/android.png';
import { DeviceContext } from '../../context';

const useStyles = makeStyles({
  card: {
    maxWidth: 345
  },
  media: {
    height: 200
  },
  title: {
    fontSize: '14px'
  }
});
const Loading = () => <div>Loading</div>;

const MediaCard = React.memo(({ name, model, ...props }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image={model.toLowerCase().includes('ios') ? appleLogo : androidLogo}
          title='Contemplative Reptile'
        />
        <CardContent>
          <Typography className={classes.title}>{name}</Typography>
        </CardContent>
      </CardActionArea>
      <CardActions></CardActions>
    </Card>
  );
});

export default MediaCard;
