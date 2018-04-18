# Based on schnack.js

[Schnack](https://dict.leo.org/englisch-deutsch/schnack) is a simple Disqus-like drop-in commenting system written in JavaScript. 

* [Documentation](https://schnack.cool/)
* [Say hello to Schnack.js](https://www.vis4.net/blog/2017/10/hello-schnack/)
* Follow [@schnackjs](https://twitter.com/schnackjs) on Twitter

## Features

Features:
- Tiny! It takes only ~**8 KB!!!** to embed Schnack.
- **Open source** and **self-hosted**.
- Ad-free and Tracking-free. Schnack will **not disturb your users**.
- It's simpy to moderate, with a **minimal** and **slick UI** to allow/reject comments or trust/block users.
- **[webpush protocol](https://tools.ietf.org/html/draft-ietf-webpush-protocol-12) to notify the site owner** about new comments awaiting for moderation.
- **Third party providers for authentication** like Github, Twitter, Google and Facebook. Users are not required to register a new account on your system and you don't need to manage a user management system.

### Quickstart

**Requirements**:
- Node.js (>= v6)
- npm (>= v5)

Clone or download schnack:

```bash
git clone https://github.com/doessnarktranslate/ghost-comments.git
```

Go to the ghost-comments directory:
```bash
cd ghost-comments
```

Install dependencies:
```bash
npm install
```

Copy and edit the config file according to [configuration](https://schnack.cool/#configuration) section:

```bash
cp config.tpl.json config.json
vim config.json                 # or open with any editor of your choice
```

Run the server:
```bash
npm start
```

Embed in your HTML page:

```html
<div class="post-comments"></div>
<script src="https://comments.example.com/embed.js"
    data-schnack-slug="{{slug}}"
    data-schnack-target=".post-comments">
</script>
```

You will find further information on the [schnack page](https://schnack.cool/).
