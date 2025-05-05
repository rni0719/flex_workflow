import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

function NotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
      }}
    >
      <Typography variant="h1" color="text.secondary" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        ページが見つかりませんでした
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        お探しのページは存在しないか、移動した可能性があります。
      </Typography>
      <Button variant="contained" component={RouterLink} to="/">
        ホームに戻る
      </Button>
    </Box>
  );
}

export default NotFound;
