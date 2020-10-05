import React from 'react';
import PropTypes from 'prop-types';

import { Stack, StackItem, Button } from 'nr1';
import ReactMarkdown from 'react-markdown';
import Github from './github';
import ErrorComponent from '../shared/error-component';
import { ROUTES } from '../shared/constants';

export default class ReadMe extends React.PureComponent {
  static propTypes = {
    githubUrl: PropTypes.string,
    isSetup: PropTypes.bool,
    owner: PropTypes.string,
    userToken: PropTypes.string,
    repoUrl: PropTypes.string,
    project: PropTypes.string,
    setActiveTab: PropTypes.func
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

  async load() {
    const { isSetup, githubUrl, owner, project, userToken } = this.props;

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

    try {
      const response = await github.get(path);
      const readme = atob(response.content);
      this.setState({ error: null, readme });
    } catch (error) {
      this.setState({ error });
    }
  }

  renderError() {
    const { error } = this.state;
    return (
      <>
        <h2>An error occurred:</h2>
        <pre>{error.message}</pre>
      </>
    );
  }

  render() {
    const { setActiveTab } = this.props;
    const { error, readme } = this.state;

    if (error) {
      return (
        <>
          <ErrorComponent error={error} />
          <Stack>
            <StackItem>
              <Button
                iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__REFRESH}
                type="normal"
                onClick={this.load}
              >
                Try Again
              </Button>
            </StackItem>
            <StackItem>
              <Button
                iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__REFRESH}
                onClick={() => setActiveTab(ROUTES.SETUP_TAB)}
              >
                Update Settings
              </Button>
            </StackItem>
          </Stack>
        </>
      );
    }

    return (
      <div className="markdown-body">
        <ReactMarkdown source={readme} escapeHtml={false} />
      </div>
    );
  }
}
