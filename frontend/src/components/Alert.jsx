import React from 'react';
import MuiAlert from '@mui/material/Alert';
import PropTypes from 'prop-types';

const Alert = ({ severity, message }) => {
  if (!message) {
    return null; // Don't render if no message
  }

  return (
    <MuiAlert severity={severity} sx={{ mb: 2 }}>
      {message}
    </MuiAlert>
  );
};

Alert.propTypes = {
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']).isRequired,
  message: PropTypes.string,
};

Alert.defaultProps = {
  message: null,
};

export default Alert;
