import React from 'react';
import PropTypes from 'prop-types';

import ReactMarkdown from 'react-markdown';
import Github from './github';

export default class ReadMe extends React.Component {
  static propTypes = {
    owner: PropTypes.string,
    userToken: PropTypes.string,
    repoUrl: PropTypes.string,
    project: PropTypes.string
  };

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.repoUrl !== this.props.repoUrl) {
      this.load();
    }
  }

  load() {
    const { owner, project, userToken } = this.props;
    const github = new Github(userToken);
    const path = `repos/${owner}/${project}/readme`;
    github.get(path).then(response => {
      const readme = atob(response.content);
      this.setState({ readme }); // eslint-disable-line react/no-unused-state
    });
  }

  render() {
    const { readme } = this.state || {};

    return (
      <div className="markdown-body">
        <ReactMarkdown source={readme} escapeHtml={false} />
      </div>
    );
  }
}
