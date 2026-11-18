# Keyword of the Day

A small web app that shows one coding keyword each day, with a plain-English definition and a short code example.

**Live demo:** https://Mohammad161616.github.io/keyword-of-the-day/

<!-- Add a screenshot or short GIF here, e.g. ![Screenshot](screenshot.png) -->

## Why I built this

While studying software engineering I kept running into keywords I only half understood, and I wished there was a low-effort way to learn one a day without opening a textbook. This is that tool. The long-term plan is an iOS home screen widget, so a new keyword is visible every time you glance at your phone.

## Features

- **Daily keyword:** chosen by date, so everyone sees the same word on the same day, with no backend or database.
- **30 keywords** across Python, JavaScript and Java, each with a definition and example.
- **Language filter** to focus on the language you are learning.
- **Mark as learned** with a progress counter, saved in the browser.
- **Recent keywords** so you can catch up on the last five days.
- **Random keyword** for extra practice.
- **Dark mode** that follows your system setting, and a layout that works on a phone.

## How it works

- `keywords.json` holds the data. Each entry has a `keyword`, `language`, `definition` and `example`.
- `app.js` counts the days since a fixed start date and takes that number modulo the list length to pick today's entry.
- Progress is saved with `localStorage`, wrapped in `try/catch` so the app still works if storage is blocked.
- Content is written to the page with `textContent` rather than `innerHTML`, so data can never be run as HTML (a basic defence against cross-site scripting).

## Run it locally

`fetch` does not work on `file://` URLs, so serve the folder with any static server:

```bash
python3 -m http.server
```

Then open http://localhost:8000.

## Run the tests

The date and selection logic is covered by a small Node test (no dependencies):

```bash
node test.js
```

## Roadmap

- [ ] iOS home screen widget (SwiftUI + WidgetKit)
- [ ] Spaced repetition for keywords marked as learned
- [ ] More languages (C, C++, SQL, Go)
- [ ] Search and a full keyword library page
- [ ] Contribution guide so others can add keywords

## Tech

HTML, CSS, vanilla JavaScript. No frameworks or build step, hosted on GitHub Pages.
