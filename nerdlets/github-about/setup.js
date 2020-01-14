import React from 'react';
import PropTypes from 'prop-types';

import { TextField, Button, Stack, StackItem, Grid, GridItem } from 'nr1';

export default class Setup extends React.PureComponent {
  static propTypes = {
    githubUrl: PropTypes.string,
    setUserToken: PropTypes.func.isRequired,
    userToken: PropTypes.string,
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

  renderUserTokenInput() {
    const { userToken } = this.state || {};
    const { githubUrl, setUserToken } = this.props;
    const GHURL =
      githubUrl.indexOf('api.github.com') === -1
        ? githubUrl.trim()
        : 'https://github.com';
    return (
      <StackItem>
        <h2>2. Personal Access Token</h2>
        <p>
          To get started,{' '}
          <a
            href={`${GHURL}/settings/tokens`}
            target="_blank"
            rel="noopener noreferrer"
          >
            generate a personal access token
          </a>{' '}
          for your GitHub account. You don't need to give the token any special
          access scopes.
        </p>
        <Stack alignmentType="center">
          <StackItem grow>
            <TextField
              autofocus
              label="GitHub Token"
              placeholder="Paste your user token here"
              onChange={({ target }) => {
                this.setState({ userToken: target.value }); // eslint-disable-line react/no-unused-state
              }}
            />
          </StackItem>
          <StackItem>
            <Button
              onClick={() => setUserToken(userToken)}
              disabled={!userToken || userToken.length !== 40}
              type="primary"
            >
              Set Your GitHub Token
            </Button>
          </StackItem>
        </Stack>
        <p>
          <strong>Remember</strong> if using a private github repository, be
          sure you are connected to your organization's private network to
          access it.
        </p>
      </StackItem>
    );
  }

  renderDeleteUserToken() {
    const { setUserToken, githubUrl } = this.props;
    const GHURL =
      githubUrl.indexOf('api.github.com') === -1
        ? githubUrl.trim()
        : 'https://github.com';
    return (
      <StackItem>
        <h2>2. Personal Access Token</h2>
        <p>
          You have provided a GitHub personal access token, which you can{' '}
          <a
            href={`${GHURL}/settings/tokens`}
            target="_blank"
            rel="noopener noreferrer"
          >
            delete from GitHub
          </a>
          . You can also delete your token from New Relic's secure storage.
        </p>
        <Stack alignmentType="center" distributionType="trailing" fill>
          <StackItem>
            <Button
              onClick={() => setUserToken(null)}
              iconType="interface_operations_trash"
              sizeType={Button.SIZE_TYPE.SMALL}
              type={Button.TYPE.DESTRUCTIVE}
            >
              Delete my User Token
            </Button>
          </StackItem>
        </Stack>
      </StackItem>
    );
  }

  render() {
    const { userToken } = this.props;
    return (
      <Grid className="container integration-container">
        <GridItem columnSpan={8}>
          <Stack directionType="vertical" gapType={Stack.GAP_TYPE.EXTRA_LOOSE}>
            <StackItem>
              <h1>Integrate with GitHub</h1>
              <p>
                Ever wondered what a Service does, or who has been working on
                it? Answer these questions and more with this GitHub
                integration!
              </p>
              <Stack alignmentType="center">
                <StackItem grow>
                  <h2>1. First Things First.</h2>
                  <p>
                    Let's get you started! Set up this Nerdpack by configuring
                    your organization's GitHub URL. It could be the public{' '}
                    <a href="https://github.com">https://github.com</a> or it
                    could be a private GitHub enterprise instance.
                  </p>
                  <TextField
                    autofocus
                    label="GitHub Url"
                    placeholder="Provide your Github instance URL"
                    onChange={e =>
                      this.handleChange({
                        field: 'githubUrl',
                        value: e.target.value
                      })
                    }
                  />
                </StackItem>
                <StackItem>
                  <Button
                    onClick={() => this.handleSubmit()}
                    disabled={!userToken || userToken.length !== 40}
                    type="primary"
                  >
                    Set Your GitHub URL
                  </Button>
                </StackItem>
              </Stack>
            </StackItem>

            {!userToken && this.renderUserTokenInput()}
            {userToken && this.renderDeleteUserToken()}
          </Stack>
        </GridItem>
        <GridItem columnSpan={4}>
          <img
            width="200px"
            height="166px"
            src="https://github.githubassets.com/images/modules/logos_page/Octocat.png"
          />
        </GridItem>
      </Grid>
    );
  }
}
