/* eslint-disable react/no-did-update-set-state */
import React from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  Button,
  Stack,
  StackItem,
  Grid,
  GridItem,
  Tooltip,
  Badge,
  Icon
} from 'nr1';
import isUrl from 'is-url';

const PUBLIC_GITHUB_API = 'https://api.github.com';
export default class Setup extends React.PureComponent {
  static propTypes = {
    githubUrl: PropTypes.string,
    setGithubUrl: PropTypes.func.isRequired,
    setUserToken: PropTypes.func.isRequired,
    deleteUserToken: PropTypes.func.isRequired,
    userToken: PropTypes.string,
    setActiveTab: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      userToken: props.userToken || '',
      githubUrl: props.githubUrl || '',
      isGithubEnterprise: true,
      isValidUrl: true
    };
    this.handleSetGithubUrl = this.handleSetGithubUrl.bind(this);
    this.renderTooltip = this.renderTooltip.bind(this)
  }

  componentDidUpdate(prevProps) {
    const { githubUrl, userToken } = this.props;
    if (prevProps.githubUrl !== githubUrl) {
      this.setState({ githubUrl });
      if (githubUrl !== null) {
        // When resetting url, also reset isGithubEnterprise
        if (githubUrl === '') {
          this.setState({ isGithubEnterprise: true });
        }
        if (githubUrl.indexOf('api.github.com') >= 0) {
          this.setState({ isGithubEnterprise: false });
        }
      }
    }
    if (prevProps.userToken !== userToken) {
      this.setState({ userToken });
    }
  }

  _getGithubUrl() {
    const { githubUrl } = this.state;
    if (githubUrl && githubUrl.indexOf('api.github.com')) {
      return 'https://github.com';
    }
    return githubUrl;
  }

  handleSetGithubUrl() {
    const { githubUrl } = this.state;
    const { setGithubUrl, setActiveTab } = this.props;
    if (githubUrl === '') {
      return;
    }
    const isValidUrl = isUrl(githubUrl);
    if (!isValidUrl) {
      this.setState({ isValidUrl: false });
      return;
    }
    this.setState({
      isValidUrl: true
    });
    setGithubUrl(githubUrl);
    setActiveTab('repository');
  }

  renderUserTokenInput() {
    const { userToken } = this.state;
    const { setUserToken } = this.props;
    const GHURL = this._getGithubUrl();
    return (
      <StackItem className="integration-step-container">
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
          for your GitHub account. If your repo is private you will need to{' '}
          include the repo access scope.
        </p>
        <Stack
          fullWidth
          verticalType={Stack.VERTICAL_TYPE.BOTTOM}
          className="integration-input-container"
        >
          <StackItem grow>
            <TextField
              autofocus
              label="GitHub Token"
              placeholder="Paste your user token here"
              onChange={({ target }) => {
                this.setState({ userToken: target.value });
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
        <small>
          <strong>Remember</strong> if using a private github repository, be
          sure you are connected to your organization's private network to
          access it.
        </small>
      </StackItem>
    );
  }

  renderDeleteUserToken() {
    const { deleteUserToken } = this.props;
    const GHURL = this._getGithubUrl();
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
              onClick={deleteUserToken}
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

  renderTooltip() {
    const { userToken } = this.state;
    if (userToken) {
      return (
        <Tooltip
          text="Please delete your Personal Access Token before changing your URL"
          placementType={Tooltip.PLACEMENT_TYPE.BOTTOM}
        >
          <Badge type={Badge.TYPE.CRITICAL}>
            <Icon type={Icon.TYPE.INTERFACE__SIGN__EXCLAMATION__V_ALTERNATE} />
          </Badge>
        </Tooltip>
      );
    }
  }

  renderGithubUrlInput() {
    const { isGithubEnterprise, githubUrl, isValidUrl, userToken } = this.state;
    return (
      <StackItem>
        <h1>Integrate with GitHub</h1>
        <p>
          Ever wondered what a Service does, or who has been working on it?
          Answer these questions and more with this GitHub integration!
        </p>
        <Stack alignmentType="center">
          <StackItem className="integration-step-container">
            <h2>1. First Things First.</h2>
            <p>
              Let's get you started! Set up this Nerdpack by configuring your
              organization's GitHub URL. It could be the public{' '}
              <a href="https://github.com">https://github.com</a> or it could be
              a private GitHub enterprise instance.
            </p>
            <Stack
              gapType={Stack.GAP_TYPE.SMALL}
              className="integration-github-type-selection"
            >
              <StackItem>
                <Button
                  sizeType={Button.SIZE_TYPE.LARGE}
                  type={
                    !isGithubEnterprise
                      ? Button.TYPE.PRIMARY
                      : Button.TYPE.NEUTRAL
                  }
                  onClick={() => {
                    this.setState(
                      {
                        githubUrl: PUBLIC_GITHUB_API,
                        isGithubEnterprise: false
                      },
                      this.handleSetGithubUrl
                    );
                  }}
                >
                  Public Github
                </Button>
              </StackItem>
              <StackItem>
                <Button
                  sizeType={Button.SIZE_TYPE.LARGE}
                  disabled={userToken}
                  type={
                    isGithubEnterprise
                      ? Button.TYPE.PRIMARY
                      : Button.TYPE.NEUTRAL
                  }
                  onClick={() => {
                    this.setState(
                      { githubUrl: '', isGithubEnterprise: true },
                      this.handleSetGithubUrl
                    );
                  }}
                >
                  Github Enterprise
                </Button>
                {this.renderTooltip()}
              </StackItem>
            </Stack>
            <Stack
              fullWidth
              verticalType={Stack.VERTICAL_TYPE.CENTER}
              className="integration-input-container"
            >
              <StackItem grow>
                <TextField
                  autofocus
                  label="GitHub Url"
                  placeholder="Provide your Github instance URL"
                  onChange={({ target }) => {
                    this.setState({ githubUrl: target.value });
                  }}
                  value={githubUrl}
                />
                {!isValidUrl && (
                  <span>URL is invalid, please provide a valid url</span>
                )}
              </StackItem>
              <StackItem>
                <Button
                  onClick={this.handleSetGithubUrl}
                  disabled={!isGithubEnterprise || !githubUrl}
                  type={Button.TYPE.PRIMARY}
                >
                  Set Your GitHub URL
                </Button>
              </StackItem>
            </Stack>
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
            {this.renderGithubUrlInput()}
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
