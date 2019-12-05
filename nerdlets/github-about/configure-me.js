import React from 'react';
import Header from './header';

export default function ConfigureMe() {
  return (
    <div className="root">
      <Header />
      <h2>Integrate with GitHub</h2>
      <p>
        Ever wondered what a service does, or who's been working on it? Answer
        these questions and more with this GitHub integration!
      </p>
      <h2>First Things First.</h2>
      <p>
        Let's get you started! Set up this Nerdpack by configuring your
        organization's GitHub URL. It could be the public{' '}
        <a href="https://github.com">https://github.com</a> or it could be a
        private GitHub enterprise instance.
      </p>
      <p>
        Edit the URL in <code>CONFIGURE_ME.js</code> and come back here when
        you've saved the file. Don't deploy this Nerdpack without proper
        configuration!
      </p>
    </div>
  );
}
