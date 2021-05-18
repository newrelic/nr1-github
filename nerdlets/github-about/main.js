import React from 'react';
import PropTypes from 'prop-types';
import {
  AccountStorageMutation,
  AccountStorageQuery,
  Spinner,
  Tabs,
  TabsItem,
  Button,
  NerdGraphQuery,
  EntityStorageMutation,
  Stack,
  StackItem,
  UserStorageMutation
} from 'nr1';
import { UserSecretsMutation, UserSecretsQuery } from '@newrelic/nr1-community';
import get from 'lodash.get';
import GITHUB_URL from '../../CONFIGURE_ME';
import Setup from './setup';
import RepoPicker from './repo-picker';
import Readme from './readme';
import Contributors from './contributors';
import PullRequests from './pull-requests';
import Header from './header';
import { GH_TOKEN, ROUTES } from '../shared/constants';
import { formatGithubUrl } from '../shared/utils';
// allows us to test the github url with a short timeout
// https://stackoverflow.com/questions/46946380/fetch-api-request-timeout
function timeout(ms, promise) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error('timeout'));
    }, ms);
    promise.then(resolve, reject);
  });
}
export default class GithubAbout extends React.PureComponent {
  static propTypes = {
    nerdletUrlState: PropTypes.object
  };

  constructor(props) {
    super(props);
    this._setUserToken = this._setUserToken.bind(this);
    this._deleteUserToken = this._deleteUserToken.bind(this);
    this._setRepo = this._setRepo.bind(this);
    this._deleteGithubUrl = this._deleteGithubUrl.bind(this);
    this.checkGithubUrl = this.checkGithubUrl.bind(this);
    this._setGithubUrl = this._setGithubUrl.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this._setActiveTab = this._setActiveTab.bind(this);
    this.state = {
      entity: null,
      entityNotFound: null,
      accountId: null,
      githubUrl: null,
      visibleTab: null,
      githubAccessError: null,
      userToken: null
    };
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate({ nerdletUrlState }) {
    if (nerdletUrlState.entityGuid !== this.props.nerdletUrlState.entityGuid) {
      this.load();
    }
  }

  async load() {
    const { data: userTokenObj } = await UserSecretsQuery.query({
      name: GH_TOKEN
    });
    if (!userTokenObj) {
      const nerdStorageToken = await this.fetchNerdStorageToken();
      if (!nerdStorageToken) {
        this.setState({ visibleTab: ROUTES.TAB_SETUP, userToken: null });
      } else {
        const status = await this._setUserToken(nerdStorageToken);
        if (status === 'SUCCESS') {
          const mutation = {
            actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
            collection: 'global',
            documentId: 'userToken',
            document: { userToken: null }
          };
          await UserStorageMutation.mutate(mutation);
        }
      }
    } else {
      const { value: userToken } = userTokenObj;
      this.setState({ userToken });
    }
    await this.fetchEntityData();
    await this._getGithubUrl();
    await this.checkGithubUrl();
  }

  async fetchNerdStorageToken() {
    const query = `
    {
      actor {
        nerdStorage {
          userToken: document(collection: "global", documentId: "userToken")
        }
      }
    }
    `;
    const { data } = await NerdGraphQuery.query({ query });
    return get(data, 'actor.nerdStorage.userToken.userToken');
  }

  async fetchEntityData() {
    const { entityGuid } = this.props.nerdletUrlState;
    const query = `
    {
      actor {
        user {name email id}
        entity(guid: "${entityGuid}") {
          name domain type account { name id }
          nerdStorage {
            repoUrl: document(collection: "global", documentId: "repoUrl")
          }
        }
      }
    }`;
    const { data } = await NerdGraphQuery.query({ query });
    const accountId = get(data, 'actor.entity.account.id');
    const repoUrl = get(data, 'actor.entity.nerdStorage.repoUrl.repoUrl');
    const { user, entity } = data.actor;
    if (entity === null) {
      this.setState({ entityNotFound: true });
      return;
    }
    this.setState({
      user,
      accountId,
      entity,
      entityNotFound: null,
      repoUrl
    });
  }

  handleTabClick(tabName) {
    this.setState({ visibleTab: tabName });
  }

  async checkGithubUrl() {
    const { githubUrl } = this.state;
    if (!githubUrl) {
      return;
    }
    const GHURL = formatGithubUrl(githubUrl);
    return timeout(1000, fetch(`${GHURL}/status`, { mode: 'no-cors' }))
      .then(() => {
        this.setState({ githubAccessError: null });
      })
      .catch(err => {
        console.log('Failed to connect to github', err); // eslint-disable-line no-console
        this.setState({ githubAccessError: err });
      });
  }

  async _getGithubUrl() {
    const { accountId } = this.state;
    const query = {
      accountId,
      collection: 'global',
      documentId: 'githubUrl'
    };
    const result = await AccountStorageQuery.query(query);
    const { githubUrl } = result.data || false;
    if (githubUrl) {
      this.setState({ githubUrl });
    }
    if (!githubUrl && GITHUB_URL) {
      this.setState({ githubUrl: GITHUB_URL });
    }
  }

  async _setGithubUrl(githubUrl) {
    const { accountId } = this.state;
    githubUrl = formatGithubUrl(githubUrl);
    // console.log(githubUrl);
    if (githubUrl === '') {
      this.setState({ githubUrl });
      return;
    }
    const mutation = {
      accountId,
      actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: 'global',
      documentId: 'githubUrl',
      document: { githubUrl }
    };
    await AccountStorageMutation.mutate(mutation);
    this.setState({ githubUrl, githubAccessError: null }, this.checkGithubUrl);
  }

  async _deleteGithubUrl() {
    const { accountId } = this.state;
    const mutation = {
      accountId,
      actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: 'global',
      documentId: 'githubUrl'
    };
    await AccountStorageMutation.mutate(mutation);
    this.setState({ githubUrl: '', githubAccessError: null });
  }

  async _setUserToken(userToken) {
    const mutation = {
      actionType: UserSecretsMutation.ACTION_TYPE.WRITE_SECRET,
      name: 'GH_TOKEN',
      value: userToken
    };
    const { data } = await UserSecretsMutation.mutate(mutation);
    const status = get(data, 'nerdStorageVaultWriteSecret.status');
    if (status === 'SUCCESS') {
      this.setState({ userToken });
    }
    return status;
  }

  async _deleteUserToken() {
    await this._deleteGithubUrl();
    const mutation = {
      actionType: UserSecretsMutation.ACTION_TYPE.DELETE_SECRET,
      name: 'GH_TOKEN'
    };
    await UserSecretsMutation.mutate(mutation);
    this.setState({ userToken: null });
  }

  async _setRepo(repoUrl) {
    repoUrl = formatGithubUrl(repoUrl);
    await this._deleteUserToken();
    const { entityGuid } = this.props.nerdletUrlState;
    const mutation = {
      actionType: EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: 'global',
      entityGuid,
      documentId: 'repoUrl',
      document: { repoUrl }
    };
    await EntityStorageMutation.mutate(mutation);
    this.setState({ repoUrl });
  }

  parseRepoUrl(repoUrl) {
    let path = '';
    let owner = '';
    let project = '';
    let url;
    if (!repoUrl) {
      return { url, owner, project };
    }
    try {
      url = new URL(repoUrl);
      path = url.pathname.slice(1);
      const split = path.split('/');
      owner = split[0];
      project = split[1];
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error parsing repository URL', repoUrl, e);
    }
    return { url, owner, project };
  }

  _setActiveTab(tab) {
    this.setState({ visibleTab: tab });
  }

  renderTabs() {
    const { entity, githubUrl, repoUrl, userToken, visibleTab } = this.state;
    const isSetup =
      userToken !== null &&
      userToken !== undefined &&
      githubUrl !== null &&
      githubUrl !== '';
    const hasRepoUrl =
      repoUrl !== null && repoUrl !== '' && repoUrl !== undefined;
    const isDisabled = !isSetup || !hasRepoUrl;
    const { owner, project } = this.parseRepoUrl(repoUrl);
    const getTab = function() {
      if (!isSetup) {
        return 'setup';
      }
      if (isSetup && !visibleTab && !hasRepoUrl) {
        return 'repository';
      }
      // return 'pull-requests'
      return visibleTab || 'readme';
    };
    // console.log([repoUrl, owner, project]);
    return (
      <div className="container">
        <Header repoUrl={repoUrl} />
        <Tabs className="tabs" onChange={this.handleTabClick} value={getTab()}>
          <TabsItem
            className="tabsItem"
            value="readme"
            label="README.md"
            disabled={isDisabled}
          >
            <Readme
              isSetup={isSetup}
              githubUrl={githubUrl}
              repoUrl={repoUrl}
              owner={owner}
              project={project}
              userToken={userToken}
            />
          </TabsItem>
          <TabsItem
            className="tabsItem"
            value="contributors"
            label="Contributors"
            disabled={isDisabled}
          >
            <Contributors
              setActiveTab={this._setActiveTab}
              isSetup={isSetup}
              githubUrl={githubUrl}
              repoUrl={repoUrl}
              owner={owner}
              project={project}
              userToken={userToken}
            />
          </TabsItem>
          <TabsItem
            value="pull-requests"
            label="Pull Requests"
            disabled={isDisabled}
            className="tabsItem"
          >
            <PullRequests
              setActiveTab={this._setActiveTab}
              isSetup={isSetup}
              githubUrl={githubUrl}
              repoUrl={repoUrl}
              owner={owner}
              project={project}
              userToken={userToken}
            />
          </TabsItem>
          <TabsItem
            className="tabsItem"
            value="repository"
            label="Repository"
            disabled={!isSetup}
          >
            <RepoPicker
              isSetup={isSetup}
              githubUrl={githubUrl}
              repoUrl={repoUrl}
              setRepo={this._setRepo}
              deleteGithubUrl={this._deleteGithubUrl}
              userToken={userToken}
              entity={entity}
            />
          </TabsItem>
          <TabsItem value="setup" label="Setup" className="tabsItem">
            <Setup
              deleteUserToken={this._deleteUserToken}
              githubUrl={githubUrl}
              setGithubUrl={this._setGithubUrl}
              setUserToken={this._setUserToken}
              userToken={userToken}
              onError={this.onSetupErrors}
              setActiveTab={this._setActiveTab}
            />
          </TabsItem>
        </Tabs>
      </div>
    );
  }

  renderGithubAccessError() {
    return (
      <div className="root">
        <div className="container">
          <div className="gh-access-error-container">
            <Header />
            <h2>Error accessing GitHub</h2>
            <p>
              There was an error connecting to the repository. The typical fix
              for this will be to login to your VPN.
            </p>
            <Stack>
              <StackItem>
                <Button
                  iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__REFRESH}
                  type="normal"
                  onClick={() => this.checkGithubUrl()}
                >
                  Try Again
                </Button>
              </StackItem>
              <StackItem>
                <Button
                  iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__REFRESH}
                  onClick={() => this._deleteGithubUrl()}
                >
                  Reset Url
                </Button>
              </StackItem>
            </Stack>
          </div>
        </div>
      </div>
    );
  }

  renderEntityNotFound() {
    return (
      <div className="root">
        <div className="container">
          <Header />
          <h2>Entity not found for this Account</h2>
        </div>
      </div>
    );
  }

  render() {
    const { entityNotFound, githubAccessError, user } = this.state;
    if (githubAccessError) {
      return this.renderGithubAccessError();
    }
    if (entityNotFound) {
      return this.renderEntityNotFound();
    }
    if (!user) {
      return <Spinner fillContainer />;
    }
    return <div className="root">{this.renderTabs()}</div>;
  }
}
