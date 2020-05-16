import React from 'react';
import PropTypes from 'prop-types';
import Github from './github';
import humanizeDuration from 'humanize-duration';

export default class Contributors extends React.PureComponent {
  static propTypes = {
    githubUrl: PropTypes.string,
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
      this.setState({ error: error.message });
      return;
    }

    const committers = {};

    let query = '';
    let commitBatch = null;
    try {
      for (let i = 0; i < 5; i++) {
        commitBatch = await github.get(path + query);
        // console.log(commitBatch);
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
    } catch (e) {
      this.setState({
        error:
          commitBatch && commitBatch.message
            ? commitBatch.message
            : 'unknown error'
      });
      console.error(e); // eslint-disable-line no-console
    }
  }

  render() {
    const { error, committers } = this.state;

    if (error) {
      return (
        <>
          <h2>An error occurred:</h2>
          <p>{error}</p>
        </>
      );
    }

    if (!committers) {
      return 'Loading Committers...';
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
