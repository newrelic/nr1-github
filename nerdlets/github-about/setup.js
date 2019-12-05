import React from 'react';
import PropTypes from 'prop-types';

import GITHUB_URL from '../../CONFIGURE_ME';
import { TextField, Button, Stack, StackItem, Grid, GridItem } from 'nr1';

export default class Setup extends React.PureComponent {
  static propTypes = {
    setUserToken: PropTypes.func.isRequired,
    userToken: PropTypes.string
  };

  renderUserTokenInput() {
    const { userToken } = this.state || {};
    const { setUserToken } = this.props;
    const GHURL =
      GITHUB_URL.indexOf('api.github.com') === -1
        ? GITHUB_URL.trim()
        : 'https://github.com';
    return (
      <StackItem>
        <h3>Personal Access Token</h3>
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
    const { setUserToken } = this.props;
    const GHURL =
      GITHUB_URL.indexOf('api.github.com') === -1
        ? GITHUB_URL.trim()
        : 'https://github.com';
    return (
      <StackItem>
        <h3>Personal Access Token</h3>
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
