import React from 'react';
import PropTypes from 'prop-types';
import Github from './github';
import { Link } from 'nr1';
import humanizeDuration from 'humanize-duration';

export default class PullRequests extends React.PureComponent {
  static propTypes = {
    githubUrl: PropTypes.string,
    setActiveTab: PropTypes.func,
    isSetup: PropTypes.bool,
    userToken: PropTypes.string,
    project: PropTypes.string,
    owner: PropTypes.string,
    repoUrl: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate({ owner, project, isSetup }) {
    if (
      owner !== this.props.owner ||
      project !== this.props.project ||
      (!isSetup && this.props.isSetup)
    ) {
      this.load();
    }
  }

  async load() {
    this.setState({ pullRequests: null });
    const { githubUrl, isSetup, owner, project, userToken } = this.props;

    if (!isSetup) {
      return;
    }

    const github = new Github({ userToken, githubUrl });
    const path = `repos/${owner}/${project}/pulls`;

    // Bad url
    if (path.indexOf('//') > 0) {
      const error = new Error(`Bad repository url: ${path}`);
      this.setState({ error: error.message });
      return;
    }

    const response = await github.get(path);
    if (response instanceof Error) {
      this.setState({ error: response.message });
    } else {
      this.setState({ pullRequests: response, error: null });
    }
  }

  render() {
    const { error, pullRequests } = this.state;
    const { setActiveTab } = this.props;

    if (error) {
      return (
        <>
          <h2>An error occurred:</h2>
          <p>
            Possible issues include a repository that has moved, is within a
            different instance of GitHub, or is malformed. The repository URL
            can be set in the{' '}
            <a onClick={() => setActiveTab('repository')}>repository tab</a>.
          </p>
          <p>{error}</p>
        </>
      );
    }

    if (!pullRequests) {
      return 'Loading Pull Requests...';
    }

    return (
      <div style={{ paddingTop: '12px' }}>
        <h2>Pull Requests</h2>
        <table>
          <thead>
            <tr>
              <th>Pull Request</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {pullRequests.map(pr => (
              <PullRequest key={pr.id} {...pr} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

function PullRequest({ html_url, title, created_at }) {
  const duration = new Date() - new Date(created_at);
  const durationStr = humanizeDuration(duration, {
    largest: 2,
    units: ['y', 'mo', 'w', 'd', 'h', 'm'],
    round: true
  });

  let className = 'pr-green';
  const DAY = 24 * 60 * 60 * 1000;
  if (duration > 7 * DAY) className = 'pr-yellow';
  if (duration > 14 * DAY) className = 'pr-red';

  return (
    <tr>
      <td>
        <Link to={html_url}>{title}</Link>
      </td>
      <td>
        <div style={{ display: 'flex' }}>
          <div className={`pr ${className}`} />
          {durationStr}
        </div>
      </td>
    </tr>
  );
}

PullRequest.propTypes = {
  html_url: PropTypes.string,
  title: PropTypes.string,
  created_at: PropTypes.string
};
