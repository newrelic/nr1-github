import React from 'react';
import PropTypes from 'prop-types'
import {
  EntityByGuidQuery, Spinner,
  Tabs, TabsItem, Button,
  UserStorageMutation, UserStorageQuery,
  EntityStorageMutation, EntityStorageQuery
} from 'nr1'

import GitHub from './github'
import Setup from './setup'
import RepoPicker from './repo-picker'
import Readme from './readme'
import Contributors from './contributors'
import GITHUB_URL from '../../CONFIGURE_ME'

// allows us to test the github url with a short timeout
// https://stackoverflow.com/questions/46946380/fetch-api-request-timeout
function timeout(ms, promise) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error("timeout"))
    }, ms)
    promise.then(resolve, reject)
  })
}

export default class GitHubAbout extends React.Component {
  static propTypes = {
    nerdletUrlState: PropTypes.object,
    launcherUrlState: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this._setUserToken = this._setUserToken.bind(this)
    this._setRepo = this._setRepo.bind(this)

    this.state = {}
  }

  async componentDidMount() {
    const { entityGuid } = this.props.nerdletUrlState

    await this.checkGithubUrl()

    let result = await EntityByGuidQuery.query({ entityGuid })
    const entity = result.data.actor.entities[0]

    result = await UserStorageQuery.query({ collection: "global", documentId: "userToken" })
    const userToken = result.data.actor.nerdStorage.document

    result = await EntityStorageQuery.query({ entityGuid, collection: "global", documentId: "repoUrl" })
    const repoUrl = result.data.actor.entity.nerdStorage.document
    const github = userToken && new GitHub(userToken)

    this.setState({ entity, github, repoUrl, userToken })
  }

  checkGithubUrl() {
    if(!GITHUB_URL) return

    return timeout(1000, fetch(`${GITHUB_URL}/status`, {mode: 'no-cors'}))
      .then(() => {
        console.log("Github Connect OK")
        this.setState({githubAccessError: null})
      })
      .catch(err => {
        console.log("Failed to connect to github", err)
        this.setState({githubAccessError: err})
      })    
  }


  async _setUserToken(userToken) {
    const github = userToken && new GitHub(userToken)

    const mutation = {
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: "global",
      documentId: "userToken",
      document: userToken
    }
    await UserStorageMutation.mutate(mutation)

    this.setState({ github, userToken })
  }

  async _setRepo(repoUrl) {
    const { entity } = this.state

    console.log("SetRepo", repoUrl)

    const mutation = {
      actionType: EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: "global",
      entityGuid: entity.guid,
      documentId: "repoUrl",
      document: repoUrl
    }

    const result = await EntityStorageMutation.mutate(mutation)
    console.log("write repo URL", result)
    this.setState({ repoUrl })
  }

  renderTabs() {
    const { repoUrl } = this.state
    var path, owner, project
    try {
      const url = new URL(repoUrl)
      path = url.pathname.slice(1)
      const split = path.split('/')
      owner = split[0]
      project = split[1]
    }
    catch (e) {
      // eslint-disable-next-line
      console.error("Error parsing repository URL", repository, e)
    }

    return <>
      {this.renderHeader()}
      <Tabs className="tabs">
        <TabsItem itemKey="readme" label="README.md">
          <Readme {...this.state} owner={owner} project={project} />
        </TabsItem>
        <TabsItem itemKey="contributors" label="Contributors">
          <Contributors {...this.state} owner={owner} project={project} />
        </TabsItem>
        <TabsItem itemKey="repository" label="Repository">
          <RepoPicker {...this.state} setRepo={this._setRepo} />
        </TabsItem>
        <TabsItem itemKey="setup" label="Setup">
          <Setup {...this.state} setUserToken={this._setUserToken} />
        </TabsItem>
      </Tabs>
    </>

  }

  renderHeader() {
    const { repoUrl } = this.state
    return <div className="header">
    <h1>
      <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
      GitHub
      </h1>
      {repoUrl && <a href={repoUrl} target="_blank">{repoUrl}</a>}
    </div>
  }

  renderContent() {
    const { entity, github, repoUrl } = this.state

    if (!entity) return <Spinner fillContainer />
    if (!github) return <Setup {...this.state}
      setUserToken={this._setUserToken} setGitHub={this._setGitHub} />

    if (repoUrl) return this.renderTabs()
    return <RepoPicker {...this.state} setRepo={this._setRepo} setUserToken={this._setUserToken} />
  }

  renderConfigureMe() {
    return <div>
      {this.renderHeader()}
      <h2>Integrate with GitHub</h2>
      <p>
        Ever wondered what a Service does, or who has been working on it?
        Answer these questions and more with this GitHub integration!
      </p>
      <h2>First Things First.</h2>
      <p>
        Let's get you started! Set up this Nerdpack by configuring your organization'
        GitHub URL. It could be the public <a href="https://github.com">
        https://github.com</a> or it could be a private GitHub enterprise instance.
      </p>
      <p>
        Edit the URL in <code>CONFIGURE_ME.js</code> and come back here when
        you've saved the file.  Don't deploy this Nerdpack without proper configuration!
      </p>
    </div>
  }

  renderGithubAccessError() {
    return <div>
      {this.renderHeader()}
      <h2>Error accessing Github</h2>
      <p>
        There was an error connecting to <a href={GITHUB_URL}>{GITHUB_URL}</a>. The typical
        fix for this will be to login to your VPN.
      </p>
      <Button type="plain" onClick={() => this.checkGithubUrl()}>
        Try Again
      </Button>
    </div>
  }

  render() {
    const {githubAccessError} = this.state
    return <div className="root">
      {GITHUB_URL && !githubAccessError && this.renderContent()}
      {GITHUB_URL && githubAccessError && this.renderGithubAccessError()}
      {!GITHUB_URL && this.renderConfigureMe()}
    </div>
  }
}
