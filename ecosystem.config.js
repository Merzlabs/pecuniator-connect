module.exports = {
  apps : [{
    script: 'server.js',
    watch: '.'
  }, {
    script: './service-worker/',
    watch: ['./service-worker']
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
