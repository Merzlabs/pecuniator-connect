module.exports = {
  apps : [{
    name: "Pecuniator signaling server",
    script: 'server.js',
    watch: '.'
  }],

  deploy : {
    production : {
      user : 'root',
      host : '192.168.178.12',
      ref  : 'origin/master',
      repo : 'https://github.com/Merzlabs/pecuniator-connect',
      path : 'pecuniator',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
