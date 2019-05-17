# ws-scrape-poc

proof-of-concept scraper script for jk+bushi to build an english card DB.

downloads a local copy of JKTCG's pricing pages, then cross-refs them with bushi's publicly available english database to compile JSON-formatted data.

to run:
```bash
# install dependencies
npm install
# to create a database AND pull+optimize images
npm start
# to create a database ONLY
npm run data
# to pull+optimize images ONLY
npm run img
```

user can add new sets to en-sets.js, accepts in JKTCG's current format.

plz don't DoS bushi, long live encoredecks.
