
export default function Header({repoUrl}) {
  return <div className="header">
    <h1>
      <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
      Github
    </h1>
    {repoUrl && <a href={repoUrl} target="_blank">{repoUrl}</a>}
  </div>
}