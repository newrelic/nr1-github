import React from 'react';
import PropTypes from 'prop-types'
import {EntityByGuidQuery, Spinner, UserStorage, EntityStorage, Tabs, TabsItem} from 'nr1'

import Github from './github'
import GettingStarted from './get-started'
import RepoPicker from './repo-picker'
import Readme from './readme'
import Contributors from './contributors'

const GITHUB_URL="https://source.datanerd.us"

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

    async _setUserToken(userToken) {
      const github = userToken && new Github(userToken, GITHUB_URL)

      this.setState({github})
    }
    
    async _setRepo(repoUrl) {
      this.setState({repoUrl})
    }

    async componentDidMount() {
      const {entityGuid} = this.props.nerdletUrlState
      const {data} = await EntityByGuidQuery.query({entityGuid})
      const entity = data.actor.entities[0]

      this.setState({entity})
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
    
      return <Tabs>
        <TabsItem itemKey = "readme" label="Readme">
          <Readme {...this.state} owner={owner} project={project}/>
        </TabsItem>
        <TabsItem itemKey = "contributors" label="Contributors">
          <Contributors {...this.state} owner={owner} project={project}/>
        </TabsItem>
        <TabsItem itemKey = "setup" label="Setup">
          <RepoPicker {...this.state} setRepo={this._setRepo} setUserToken={this._setUserToken}/>
        </TabsItem>
      </Tabs>
    }

    render() {
      const {entity, github, repoUrl} = this.state
      if(!entity) return <Spinner/>
      if(!github) return <GettingStarted setUserToken={this._setUserToken}/>

      return (
        repoUrl ? 
            this.renderTabs() : 
            <RepoPicker {...this.state} setRepo={this._setRepo} setUserToken={this._setUserToken}/>
      )    
    }
}
