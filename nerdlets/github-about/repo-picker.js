import React from 'react'
import PropTypes from 'prop-types'

import { Button, BlockText, Stack, StackItem } from 'nr1'
import Github from './github'


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

  loadSuggestions() {
    const { github } = this.props
    const cleanName = this.cleanEntityName()
    if (!cleanName) return

    const q = `in:name in:readme in:description ${cleanName}`
    const path = 'search/repositories?q=' + encodeURIComponent(q)
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

  renderSuggestions() {
    const { suggestions } = this.state
    const { repoUrl } = this.props
    const cleanName = this.cleanEntityName()

    if (suggestions.length == 0) {
      return (
        <p>
          Couldn{"'"}t find a reposity matching this entity. We
          searched on <em>"{cleanName}"</em>.
        </p>
      )
    }

    // limit to top 5 suggestions
    return (
      <>
        <h2>Select a Repository</h2>
        <p>
          We've searched github for a repository matching this
          entity's name and have come up with these suggestions.
        </p>
        <table>
          <tbody>
            {suggestions.slice(0, 8).map(item => {
              return this.renderSuggestion(item, item.html_url == repoUrl)
            })}
          </tbody>
        </table>
      </>
    )
  }
  render() {
    const { suggestions } = this.state
    const { setUserToken, repoUrl } = this.props

    if (!suggestions) return "Loading suggestions..."

    return <Stack directionType="vertical" style={{ width: "100%" }}>
      <StackItem>
        {this.renderSuggestions()}
      </StackItem>
      <StackItem>
        <BlockText>
          We integrate with your github repository using your personal API token.
          <span> </span>
          <Button onClick={() => setUserToken(null)} sizeType="slim" type="destructive">
            Delete my user token
          </Button>
        </BlockText>
      </StackItem>
    </Stack>
  }


}

