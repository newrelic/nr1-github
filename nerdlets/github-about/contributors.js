import React from 'react';
import PropTypes from 'prop-types';

import { Stack, StackItem, Button } from 'nr1';

import Github from './github';
import ErrorComponent from '../shared/error-component';
import humanizeDuration from 'humanize-duration';
import { ROUTES } from '../shared/constants';

export default class Contributors extends React.PureComponent {
  static propTypes = {
    githubUrl: PropTypes.string,
    isSetup: PropTypes.bool,
    userToken: PropTypes.string,
    project: PropTypes.string,
    owner: PropTypes.string,
    repoUrl: PropTypes.string,
    setActiveTab: PropTypes.func
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

  componentDidUpdate(prevProps) {
    if (
      prevProps.repoUrl !== this.props.repoUrl ||
      (!prevProps.isSetup && this.props.isSetup)
    ) {
      this.load();
    }
  }

  async processBatch(commitBatch, committers) {
    commitBatch.forEach(commit => {
      const { author } = commit;
      const commitAuthor = commit.commit.author;

      if (author) {
        const { login } = author;
        if (!committers[login]) {
          committers[login] = {
            login,
            homepage: author.html_url,
            email: commitAuthor.email,
            mostRecentCommit: commitAuthor.date,
            name: commitAuthor.name,
            commitCount: 0
          };
        }
        if (author.type === 'User') {
          const committer = committers[login];
          committer.commitCount += 1;
        }
      }
    });
  }

  async load() {
    this.setState({ committers: null });
    const { githubUrl, isSetup, owner, project, userToken } = this.props;

    if (!isSetup) {
      return;
    }

    const github = new Github({ userToken, githubUrl });
    const path = `repos/${owner}/${project}/commits`;

    // Bad url
    if (path.indexOf('//') > 0) {
      const error = new Error(`Bad repository url: ${path}`);
      this.setState({ error: error });
      return;
    }

    const committers = {};

    let query = '';
    let commitBatch = null;

    try {
      for await (const i of Array(5).fill()) {
        commitBatch = await github.get(path + query);

        if (i > 0 && commitBatch) {
          commitBatch = commitBatch.slice(1);
        }

        if (commitBatch && commitBatch.length > 0) {
          // subsequent batches include the last commit from the previous batch
          this.processBatch(commitBatch, committers);
          const lastCommit = commitBatch[commitBatch.length - 1];
          query = `?sha=${lastCommit.sha}`;
        }
      }

      const committerList = Object.values(committers).sort(
        (x, y) => y.commitCount - x.commitCount
      );
      this.setState({ error: null, committers: committerList });
    } catch (error) {
      this.setState({
        error
      });
    }
  }

  render() {
    const { setActiveTab } = this.props;
    const { error, committers } = this.state;

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
                onClick={() => setActiveTab(ROUTES.TAB_SETUP)}
              >
                Update Settings
              </Button>
            </StackItem>
          </Stack>
        </>
      );
    }

    if (!committers) {
      return null;
    }

    return (
      <div style={{ paddingTop: '12px' }}>
        <h2>Most Frequent Recent Committers</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Commits</th>
              <th className="right">Most Recent</th>
            </tr>
          </thead>
          <tbody>
            {committers.map(committer => {
              const duration =
                new Date() - new Date(committer.mostRecentCommit);
              const durationStr = humanizeDuration(duration, {
                largest: 2,
                units: ['y', 'mo', 'w', 'd', 'h', 'm'],
                round: true
              });

              return (
                <tr key={committer.login}>
                  <td>{committer.name}</td>
                  <td>{committer.email}</td>
                  <td>{committer.commitCount}</td>
                  <td className="right">{durationStr} ago</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
