import React from 'react';
import PropTypes from 'prop-types';
import Header from './header';

export default class ConfigureMe extends React.PureComponent {
  static propTypes = {
    githubUrl: PropTypes.string,
    onUpdate: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      accountSettings: {
        githubUrl: props.githubUrl || ''
      }
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onUpdate = props.onUpdate.bind(this);
  }

  handleChange({ field, value }) {
    this.setState(previousState => {
      const updatedSettings = {
        ...previousState.accountSettings
      };
      updatedSettings[field] = value;

      return {
        ...previousState,
        accountSettings: updatedSettings
      };
    });
  }

  handleSubmit(e) {
    const { onUpdate } = this.props;
    const { accountSettings } = this.state;

    e.preventDefault();
    onUpdate({ accountSettings });
  }

  render() {
    return (
      <div className="root">
        <Header />
        <h2>Integrate with GitHub</h2>
        <p>
          Ever wondered what a service does, or who's been working on it? Answer
          these questions and more with this GitHub integration!
        </p>
        <h2>First Things First.</h2>
        <p>
          Let's get you started! Set up this Nerdpack by configuring your
          organization's GitHub URL. It could be the public{' '}
          <a href="https://github.com">https://github.com</a> or it could be a
          private GitHub enterprise instance.
        </p>
        <form onSubmit={this.handleSubmit}>
          <label>
            Github Url:
            <input
              type="text"
              value={this.state.value}
              onChange={e =>
                this.handleChange({ field: 'githubUrl', value: e.target.value })
              }
            />
          </label>
          <input type="submit" value="Submit" />
        </form>
        {/* <p>
          Edit the URL in <code>CONFIGURE_ME.js</code> and come back here when
          you've saved the file. Don't deploy this Nerdpack without proper
          configuration!
        </p> */}
      </div>
    );
  }
}
