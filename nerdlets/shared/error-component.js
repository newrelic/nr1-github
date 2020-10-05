import React from 'react';
import PropTypes from 'prop-types';

export default class ErrorComponent extends React.PureComponent {
  static propTypes = {
    error: PropTypes.object
  };

  render() {
    const { error } = this.props;

    return (
      <>
        <h2>An error occurred:</h2>
        <pre>{error ? error.message : JSON.stringify(error, null, 2)}</pre>
      </>
    );
  }
}
