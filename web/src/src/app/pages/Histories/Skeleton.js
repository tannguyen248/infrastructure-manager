import Skeleton from '@material-ui/lab/Skeleton';
import React from 'react';

const CustomSkeleton = () => {
  return (
    <div>
      <Skeleton variant='text' />
      <Skeleton variant='circle' width={40} height={40} />
      <Skeleton variant='rect' width={210} height={118} />
    </div>
  );
};

export default CustomSkeleton;
