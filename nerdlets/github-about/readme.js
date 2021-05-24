import React from 'react';
import PropTypes from 'prop-types';

import ReactMarkdown from 'react-markdown';
import Github from './github';

export default class ReadMe extends React.PureComponent {
  static propTypes = {
    githubUrl: PropTypes.string,
    isSetup: PropTypes.bool,
    owner: PropTypes.string,
    userToken: PropTypes.string,
    repoUrl: PropTypes.string,
    project: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      readme: ''
    };
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.repoUrl !== this.props.repoUrl ||
      (!prevProps.isSetup && this.props.isSetup)
    ) {
      this.load();
    }
  }

  load() {
    const { isSetup, githubUrl, owner, project, userToken } = this.props;
    // console.log(isSetup);

    if (!isSetup) {
      return;
    }

    const github = new Github({ userToken, githubUrl });
    const path = `repos/${owner}/${project}/readme`;

    // Bad url
    if (path.indexOf('//') > 0) {
      const error = new Error(`Bad repository url: ${path}`);
      this.setState({ error: error.message });
      return;
    }

    github.get(path).then(response => {
      const readme = atob(response.content);
      this.setState({ error: null, readme });
    });
  }

  renderError() {
    const { error } = this.state;
    return (
      <>
        <h2>An error occurred:</h2>
        <p>{error}</p>
      </>
    );
  }

  render() {
    const { error, readme } = this.state;

    if (error) {
      return this.renderError();
    }

    return (
      <div className="markdown-body">
        <ReactMarkdown source={readme} escapeHtml={false} />
      </div>
    );
  }
}
