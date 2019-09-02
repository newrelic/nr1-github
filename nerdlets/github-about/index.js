import React from 'react';
import PropTypes from 'prop-types'
import {  
  Spinner, Tabs, TabsItem, Button,
  NerdGraphQuery, UserStorageMutation, EntityStorageMutation,
} from 'nr1'

import GITHUB_URL from '../../CONFIGURE_ME'

import Github from './github'
import Setup from './setup'
import RepoPicker from './repo-picker'
import Readme from './readme'
import Contributors from './contributors'
import Header from './header'
import ConfigureMe from './configure-me'

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

export default class GithubAbout extends React.Component {
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
    await this.checkGithubUrl()
  }

  checkGithubUrl() {
    if(!GITHUB_URL) return

    return timeout(1000, fetch(`${GITHUB_URL}/status`, {mode: 'no-cors'}))
      .then(() => {
        this.setState({githubAccessError: null})
      })
      .catch(err => {
        console.log("Failed to connect to github", err)
        this.setState({githubAccessError: err})
      })    
  }


  async _setUserToken(userToken) {
    const mutation = {
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: "global",
      documentId: "userToken",
      document: userToken
    }
    await UserStorageMutation.mutate(mutation)

    // we are updating data in NerdGraph, but no state is changing. Force
    // an update because the GraphQL query will return different results.
    this.forceUpdate()
  }

  async _setRepo(repoUrl) {
    const {entityGuid} = this.props.nerdletUrlState
    const mutation = {
      actionType: EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: "global",
      entityGuid,
      documentId: "repoUrl",
      document: repoUrl
    }

    await EntityStorageMutation.mutate(mutation)
    this.setState({repoUrl})

    // we are updating data in NerdGraph, but no state is changing. Force
    // an update because the GraphQL query will return different results.
    this.forceUpdate()
  }

  renderTabs(contentProps) {
    const { repoUrl } = contentProps
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
      console.error("Error parsing repository URL", repoUrl, e)
    }

    return <>
      <Header repoUrl={repoUrl}/>
      <Tabs className="tabs">
        <TabsItem itemKey="readme" label="README.md">
          <Readme {...contentProps} owner={owner} project={project} />
        </TabsItem>
        <TabsItem itemKey="contributors" label="Contributors">
          <Contributors {...contentProps} owner={owner} project={project} />
        </TabsItem>
        <TabsItem itemKey="repository" label="Repository">
          <RepoPicker {...contentProps} setRepo={this._setRepo} />
        </TabsItem>
        <TabsItem itemKey="setup" label="Setup">
          <Setup {...contentProps} setUserToken={this._setUserToken} />
        </TabsItem>
      </Tabs>
    </>

  }

  renderContent(contentProps) {
    if (!contentProps.userToken) return <Setup setUserToken={this._setUserToken} />
    if (contentProps.repoUrl) return this.renderTabs(contentProps)

    return <RepoPicker {...contentProps} setRepo={this._setRepo} setUserToken={this._setUserToken} />
  }

  renderGithubAccessError() {
    return <div className="root">
      <Header/>
      <h2>Error accessing Github</h2>
      <p>
        There was an error connecting to <a href={GITHUB_URL}>{GITHUB_URL}</a>. The typical
        fix for this will be to login to your VPN.
      </p>
      <Button iconType="interface_operations_refresh" type="normal" 
            onClick={() => this.checkGithubUrl()}>
        Try Again
      </Button>
    </div>
  }

  render() {
    const {entityGuid} = this.props.nerdletUrlState
    const {githubAccessError} = this.state

    if(!GITHUB_URL) return <ConfigureMe/>
    if(githubAccessError) return this.renderGithubAccessError()

    const gql = `{
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
    }`

    return <NerdGraphQuery query={gql}>
      {({loading, error, data}) => {
        if(loading) return <Spinner fillContainer/>

        console.log("NerdGraph", data)
        console.log("Repo URL", data.actor.entity.nerdStorage.repoUrl)
        
        const {user, entity} = data.actor
        const userToken = JSON.parse(data.actor.nerdStorage.userToken)
        const github = userToken && new Github(userToken)
        const repoUrl = JSON.parse(data.actor.entity.nerdStorage.repoUrl)
        const contentProps = { user, entity, userToken, github, repoUrl }
        
        console.log("props", contentProps)
        return <div className="root">
          {this.renderContent(contentProps)}
        </div>
      }}
    </NerdGraphQuery>
  }
}
