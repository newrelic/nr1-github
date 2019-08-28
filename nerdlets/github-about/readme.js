import React from 'react'
import PropTypes from 'prop-types'

import ReactMarkdown from 'react-markdown'

export default class ReadMe extends React.Component {
  static propTypes = {
    nr1: PropTypes.object,
    owner: PropTypes.string,
    project: PropTypes.string,
    repository: PropTypes.string
  }

  componentDidMount() {
    this.load()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.repository != this.props.repository) {
      this.load()
    }
  }

  load() {
    const { owner, project, github } = this.props
    const path = `repos/${owner}/${project}/readme`
    github.get(path).then(response => {
      const readme = atob(response.content)
      this.setState({ readme })
    })
  }

  render() {
    const { readme} = (this.state || {})

    return (
      <div className="markdown">
        <h1>Readme.md</h1>
        <ReactMarkdown source={readme} escapeHtml={false} />
      </div>
    )
  }
}

