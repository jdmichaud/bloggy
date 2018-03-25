# Bloggy

A simple blog platform based on gist and markdown

## How to use

Add a `README.md` file to your gist, and a 'meta.yml' file which contains a title:
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

finally popup a browser:
```
http://localhost:8080
```
