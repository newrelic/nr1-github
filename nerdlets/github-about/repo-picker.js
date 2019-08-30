import React from 'react'
import PropTypes from 'prop-types'

import GITHUB_URL from '../../CONFIGURE_ME'
import { Button, Stack, StackItem, TextField } from 'nr1'


export default class RepoPicker extends React.Component {
  static propTypes = {
    repository: PropTypes.string,
    onSetRepo: PropTypes.func,
    entity: PropTypes.object,
    savedBy: PropTypes.object
  }

  constructor(props) {
    super(props)

    this.state = { value: props.repository || '', suggestions: null }
  }

  componentDidMount() {
    this.loadSuggestions()
  }

  componentDidUpdate(prevProps) {
    const prevEntityId = prevProps.entity && prevProps.entity.id
    const enitityId = this.props.entity && this.props.entity.id

    if (prevEntityId != enitityId && this.props.entity) {
      this.loadSuggestions()
    }
  }

  cleanEntityName() {
    const { entity } = this.props
    if (!entity) return null

    return entity.name
      .replace(/production/i, '')
      .replace(/staging/i, '')
      .replace(/canary/i, '')
      .replace(/\(/i, ' ')
      .replace(/ EU /, '')        // NR specific?
      .replace(/\)/i, ' ')
      .replace(/-/i, ' ')
  }

  getSearchQuery() {
    const cleanName = this.cleanEntityName()
    if (!cleanName) return

    return `in:name in:readme in:description ${cleanName}`
  }

  loadSuggestions() {
    const {github} = this.props

    const path = 'search/repositories?q=' + encodeURIComponent(this.getSearchQuery())
    github.get(path).then(suggestions => {
      this.setState({ suggestions: suggestions.items })
    })
  }

  renderSuggestion(item, isSelected) {
    const { setRepo } = this.props
    const className = isSelected ? 'repo active' : 'repo'

    let buttonType = 'normal'
    let setRepoValue = item.html_url
    let buttonTitle = 'Set Repository'

    if (isSelected) {
      buttonType = 'plain'
      setRepoValue = ''
      buttonTitle = 'Clear'
    }

    return (
      <tr key={item.full_name} className={className}>
        <td>
          <a onClick={() => { setRepo(setRepoValue) }}>{item.full_name}</a>
          <br />
          <small>
            <a target="_blank" href={item.html_url}>{item.html_url}</a>
          </small>
        </td>
        <td>
          <Button type={buttonType} sizeType="slim" onClick={() => setRepo(setRepoValue)}>
            {buttonTitle}
          </Button>
        </td>
      </tr>
    )
  }

  renderCustomUrlRow(hasMatch) {
    const { setRepo, repoUrl } = this.props
    let { customRepo } = this.state
    

    return <tr>
      <td>
      <TextField 
              defaultValue={hasMatch ? "" : repoUrl}
              onChange={(event) => this.setState({customRepo: event.target.value})}
              label="Or provide your own repository URL" />
      </td>
      <td>
      <Button sizeType="slim" type="normal" 
              onClick={() => setRepo(customRepo || repoUrl)}>
            {repoUrl ? "Update" : "Set"} Repository
          </Button>
      </td>
    </tr>

  }
  renderSuggestions() {
    const { suggestions } = this.state
    if(!suggestions) return ""

    const { repoUrl, entity } = this.props
    const cleanName = this.cleanEntityName()

    if (suggestions.length == 0) {
      return (
        <p>
          Couldn{"'"}t find a reposity matching {entity.name}. We
          searched on <em>"{cleanName}"</em>.
        </p>
      )
    }
    
    let hasMatch = false
    const searchUrl = `${GITHUB_URL}/search?q=${this.getSearchQuery()}` 
    // limit to top 5 suggestions
    return (
      <>
        <h2>Select a Repository</h2>
        <p>
          We've <a href={searchUrl} target="_blank">searched github</a> for 
          a repository matching <em>{entity.name}</em> and have come up 
          with these suggestions.
        </p>
        <table style={{width: "100%", marginTop: "16px"}}>
          <tbody>
            {suggestions.slice(0, 8).map(item => {
              const isSelected = item.html_url == repoUrl
              hasMatch = hasMatch || isSelected
              return this.renderSuggestion(item, isSelected)
            })}
            {this.renderCustomUrlRow(hasMatch)}
          </tbody>
        </table>
      </>
    )
  }


  render() {
    const { suggestions } = this.state

    if (!suggestions) return <div/>

    return <Stack directionType="vertical" alignmentType="fill">
      <StackItem>
        {this.renderSuggestions()}
      </StackItem>
    </Stack>
  }


}

