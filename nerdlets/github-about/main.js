import React from 'react';
import PropTypes from 'prop-types';
import {
  Spinner,
  Tabs,
  TabsItem,
  Button,
  NerdGraphQuery,
  UserStorageMutation,
  EntityStorageMutation,
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
    launcherUrlState: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this._setUserToken = this._setUserToken.bind(this);
    this._setRepo = this._setRepo.bind(this);

    this.state = {};
  }

  async componentDidMount() {
    const { entityGuid } = this.props.nerdletUrlState;
    await this.checkGithubUrl();

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

    const { data } = await NerdGraphQuery.query({ query });
    console.debug(data); //eslint-disable-line
    const userToken = get(data, 'actor.nerdStorage.userToken.userToken');
    const repoUrl = get(data, 'actor.entity.nerdStorage.repoUrl.repoUrl');
    const { user, entity } = data.actor;

    this.setState({ user, entity, userToken, repoUrl });
  }

  checkGithubUrl() {
    if (!GITHUB_URL) return;

    return timeout(1000, fetch(`${GITHUB_URL}/status`, { mode: 'no-cors' }))
      .then(() => {
        this.setState({ githubAccessError: null });
      })
      .catch(err => {
        console.log('Failed to connect to github', err);
        this.setState({ githubAccessError: err });
      });
  }

  async _setUserToken(userToken) {
    const mutation = {
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: 'global',
      documentId: 'userToken',
      document: { userToken },
    };
    UserStorageMutation.mutate(mutation);
    this.setState({ userToken });
  }

  async _setRepo(repoUrl) {
    const { entityGuid } = this.props.nerdletUrlState;
    const mutation = {
      actionType: EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: 'global',
      entityGuid,
      documentId: 'repoUrl',
      document: { repoUrl },
    };

    EntityStorageMutation.mutate(mutation);
    this.setState({ repoUrl });
  }

  renderTabs() {
    const { repoUrl } = this.state;
    var path, owner, project;
    try {
      const url = new URL(repoUrl);
      path = url.pathname.slice(1);
      const split = path.split('/');
      owner = split[0];
      project = split[1];
    } catch (e) {
      // eslint-disable-next-line
      console.error("Error parsing repository URL", repoUrl, e)
    }

    return (
      <div className="container">
        <Header repoUrl={repoUrl} />
        <Tabs className="tabs">
          <TabsItem value="readme" label="README.md">
            <Readme {...this.state} owner={owner} project={project} />
          </TabsItem>
          <TabsItem value="contributors" label="Contributors">
            <Contributors {...this.state} owner={owner} project={project} />
          </TabsItem>
          <TabsItem value="repository" label="Repository">
            <RepoPicker {...this.state} setRepo={this._setRepo} />
          </TabsItem>
          <TabsItem value="setup" label="Setup">
            <Setup {...this.state} setUserToken={this._setUserToken} />
          </TabsItem>
        </Tabs>
      </div>
    );
  }

  renderContent() {
    const { userToken, repoUrl } = this.state;
    if (!userToken) return <Setup setUserToken={this._setUserToken} />;
    if (repoUrl) return this.renderTabs();

    return (
      <RepoPicker
        {...this.state}
        setRepo={this._setRepo}
        setUserToken={this._setUserToken}
      />
    );
  }

  renderGithubAccessError() {
    return (
      <div className="root">
        <div className="container">
          <Header />
          <h2>Error accessing GitHub</h2>
          <p>
            There was an error connecting to <a href={GITHUB_URL}>{GITHUB_URL}</a>
            . The typical fix for this will be to login to your VPN.
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

    if (!GITHUB_URL) return <ConfigureMe />;
    if (githubAccessError) return this.renderGithubAccessError();

    if (!user) return <Spinner fillContainer />;
    return <div className="root">{this.renderContent()}</div>;
  }
}
