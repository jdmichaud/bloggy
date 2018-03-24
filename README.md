# Bloggy

A simple blog platform based on gist and markdown

## How to use

Add a 'meta.yml' file to you gist:
```yml
title = 'Explaining things'
```

In a `config.yml` file, configure your github username:
```yml
git_username: username
```

then run index.js
```bash
node ./index.js -c config.yml -p 8080
```
