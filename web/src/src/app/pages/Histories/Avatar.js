import Avatar from '@material-ui/core/Avatar';
import React from 'react';
import avatar from '../../../../src/static/images/Missing_avatar.png';

const CustomAvatar = ({ imageUrl, ...props }) => (
  <Avatar src={imageUrl || avatar} {...props} />
);

export default CustomAvatar;
