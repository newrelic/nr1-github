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
  UserStorageMutation,
  EntityStorageMutation,
  EntityByGuidQuery
} from 'nr1';
import { get } from 'lodash';

import GITHUB_URL from '../../CONFIGURE_ME';

import Setup from './setup';
import RepoPicker from './repo-picker';
import Readme from './readme';
import Contributors from './contributors';
import Header from './header';
import ConfigureMe from './configure-me';

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

export default class GithubAbout extends React.Component {
  static propTypes = {
    nerdletUrlState: PropTypes.object,
    launcherUrlState: PropTypes.object
  };

  constructor(props) {
    super(props);

    this._setUserToken = this._setUserToken.bind(this);
    this._setRepo = this._setRepo.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this._setGithubUrl = this._setGithubUrl.bind(this);
    this.handleSettingsUpdate = this.handleSettingsUpdate.bind(this);

    this.state = {
      entity: null,
      accountId: null,
      githubUrl: null,
      visibleTab: 'readme'
    };
  }

  async componentDidMount() {
    await this.fetchAccountFromEntity();
    await this._getGithubUrl();
    await this.checkGithubUrl();
    await this.fetchEntityData();
  }

  async fetchAccountFromEntity() {
    const { entityGuid } = this.props.nerdletUrlState;
    const response = await EntityByGuidQuery.query({ entityGuid });
    const { data } = response;
    const { entities = [] } = data;

    if (entities.length > 0) {
      const entity = entities[0];

      this.setState({ accountId: entity.accountId });
    }
  }

  async fetchEntityData() {
    const { entityGuid } = this.props.nerdletUrlState;
    const query = `{
      actor {
        nerdStorage {
          userToken: document(collection: "global", documentId: "userToken")
        }
        user {name email id}
        entity(guid: "${entityGuid}") {
          name domain type account { name id }
          nerdStorage {
            repoUrl: document(collection: "global", documentId: "repoUrl")
          }
        }
      }
    }`;
    // await this._getGithubUrl();
    const { data } = await NerdGraphQuery.query({ query });
    // console.debug([query, data]); //eslint-disable-line
    const userToken = get(data, 'actor.nerdStorage.userToken.userToken');
    const repoUrl = get(data, 'actor.entity.nerdStorage.repoUrl.repoUrl');
    const { user, entity } = data.actor;

    this.setState({ user, entity, userToken, repoUrl });
  }

  handleTabClick(tabName) {
    this.setState({ visibleTab: tabName });
  }

  async handleSettingsUpdate({ accountSettings }) {
    const { githubUrl } = accountSettings;
    await this._setGithubUrl(githubUrl);
    this.setState({ githubUrl }, this.checkGithubUrl());
  }

  async checkGithubUrl() {
    const { githubUrl } = this.state;

    if (!githubUrl) {
      return;
    }

    const GHURL = githubUrl.trim();
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

    const mutation = {
      accountId,
      actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: 'global',
      documentId: 'githubUrl',
      document: { githubUrl }
    };
    await AccountStorageMutation.mutate(mutation);
    this.setState({ githubUrl });
  }

  async _setUserToken(userToken) {
    const mutation = {
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: 'global',
      documentId: 'userToken',
      document: { userToken }
    };
    await UserStorageMutation.mutate(mutation);
    this.setState({ userToken });
  }

  async _setRepo(repoUrl) {
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

  renderTabs() {
    const { githubUrl, repoUrl, userToken, visibleTab } = this.state;
    const isSetup = userToken !== null && githubUrl !== null;
    const { url, owner, project } = this.parseRepoUrl(repoUrl);

    // console.log([repoUrl, owner, project]);
    return (
      <div className="container">
        <Header repoUrl={url} />
        <Tabs
          className="tabs"
          onChange={this.handleTabClick}
          value={visibleTab}
        >
          <TabsItem value="readme" label="README.md" disabled={!isSetup}>
            {isSetup && (
              <Readme
                isSetup={isSetup}
                githubUrl={githubUrl}
                {...this.state}
                owner={owner}
                project={project}
              />
            )}
          </TabsItem>
          <TabsItem
            value="contributors"
            label="Contributors"
            disabled={!isSetup}
          >
            <Contributors
              isSetup={isSetup}
              githubUrl={githubUrl}
              {...this.state}
              owner={owner}
              project={project}
            />
          </TabsItem>
          <TabsItem value="repository" label="Repository" disabled={!isSetup}>
            <RepoPicker
              isSetup={isSetup}
              githubUrl={githubUrl}
              {...this.state}
              setRepo={this._setRepo}
            />
          </TabsItem>
          <TabsItem value="setup" label="Setup">
            <Setup
              githubUrl={githubUrl}
              onUpdate={this.handleSettingsUpdate}
              setUserToken={this._setUserToken}
            />

            {/* <Setup {...this.state} setUserToken={this._setUserToken} />
            <ConfigureMe
              githubUrl={githubUrl}
              onUpdate={this.handleSettingsUpdate}
            /> */}
          </TabsItem>{' '}
        </Tabs>
      </div>
    );
  }

  renderContent() {
    // const { githubUrl, repoUrl, userToken } = this.state;
    // const isSetup = userToken && githubUrl;
    // if (!githubUrl) {
    //   return (
    //     <ConfigureMe
    //       githubUrl={githubUrl}
    //       onUpdate={this.handleSettingsUpdate}
    //     />
    //   );
    // }
    // if (!userToken) {
    //   return <Setup githubUrl={githubUrl} setUserToken={this._setUserToken} />;
    // }
    // return this.renderTabs();
    // if (!isSetup) {
    //   return this.renderTabs();
    // }
    // return (
    //   <RepoPicker
    //     {...this.state}
    //     setRepo={this._setRepo}
    //     setUserToken={this._setUserToken}
    //   />
    // );
  }

  renderGithubAccessError() {
    const { githubUrl } = this.state;
    const GHURL = githubUrl.trim();
    return (
      <div className="root">
        <div className="container">
          <Header />
          <h2>Error accessing GitHub</h2>
          <p>
            There was an error connecting to <a href={GHURL}>{GHURL}</a>. The
            typical fix for this will be to login to your VPN.
          </p>
          <Button
            iconType="interface_operations_refresh"
            type="normal"
            onClick={() => this.checkGithubUrl()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const { githubAccessError, user } = this.state;

    if (githubAccessError) {
      return this.renderGithubAccessError();
    }

    if (!user) {
      return <Spinner fillContainer />;
    }

    return <div className="root">{this.renderTabs()}</div>;
  }
}
