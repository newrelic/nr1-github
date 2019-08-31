import React from 'react';
import PropTypes from 'prop-types'
import {EntityByGuidQuery, Spinner, Tabs, TabsItem,
  UserStorageMutation, UserStorageQuery, 
  EntityStorageMutation, EntityStorageQuery} from 'nr1'

import Github from './github'
import Setup from './setup'
import RepoPicker from './repo-picker'
import Readme from './readme'
import Contributors from './contributors'

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
      const {entityGuid} = this.props.nerdletUrlState
      
      let result = await EntityByGuidQuery.query({entityGuid})
      const entity = result.data.actor.entities[0]

      result = await UserStorageQuery.query({collection: "global", documentId: "userToken"})
      const userToken = result.data.actor.nerdStorage.document

      result = await EntityStorageQuery.query({entityGuid, collection: "global", documentId: "repoUrl"})
      const repoUrl = result.data.actor.entity.nerdStorage.document
      const github = userToken && new Github(userToken)

      this.setState({entity, github, repoUrl, userToken})
    }


    async _setUserToken(userToken) {
      const github = userToken && new Github(userToken)

      const mutation = {actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT, 
        collection: "global", 
        documentId: "userToken", 
        document: userToken}
      await UserStorageMutation.mutate(mutation)

      this.setState({github, userToken})
    }
    
    async _setRepo(repoUrl) { 
      const {entity} = this.state

      console.log("SetRepo", repoUrl)

      const mutation = {actionType: EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT, 
        collection: "global", 
        entityGuid: entity.guid, 
        documentId: "repoUrl", 
        document: repoUrl}
      
      const result = await EntityStorageMutation.mutate(mutation)      
      console.log("write repo URL", result)
      this.setState({repoUrl})
    }

    renderTabs() {
      const {repoUrl} = this.state
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
        <div className="header">
          <h1>
          <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />            
              Github
          </h1>
          
          <a href={repoUrl} target="_blank">{repoUrl}</a>
        </div>
        <Tabs className="tabs">
          <TabsItem itemKey = "readme" label="README.md">
            <Readme {...this.state} owner={owner} project={project}/>
          </TabsItem>
          <TabsItem itemKey = "contributors" label="Contributors">
            <Contributors {...this.state} owner={owner} project={project}/>
          </TabsItem>
          <TabsItem itemKey = "repository" label="Repository">
            <RepoPicker {...this.state} setRepo={this._setRepo}/>
          </TabsItem>
          <TabsItem itemKey = "setup" label="Setup">
            <Setup {...this.state} setUserToken={this._setUserToken}/>
          </TabsItem>
        </Tabs>
      </>
      
    }

    renderContent() {
      const {entity, github, repoUrl} = this.state

      if(!entity) return <Spinner fillContainer/>
      if(!github) return <Setup {...this.state}
            setUserToken={this._setUserToken} setGithub={this._setGithub}/>
            
      if(repoUrl) return this.renderTabs()            
      return <RepoPicker {...this.state} setRepo={this._setRepo} setUserToken={this._setUserToken}/>
    }

    render() {
      return <div className="root">
        {this.renderContent()}
      </div>
    }
}
