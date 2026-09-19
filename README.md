# ProductCategory_Mapping

A browser-based tool for mapping product categories from a CSV export into a standardized category structure. Upload a file, review the mapping, and download the processed result — no server upload required.

## How it works

1. **Upload** — provide a CSV file with an ID column and a Categories column, where category paths use ` -> ` as a separator (e.g. `Electronics -> Phones -> Smartphones`); multiple paths per row are supported
2. **Process** — the app parses each category path and maps it against a master category list
3. **Download** — export the mapped result as a file ready for import elsewhere

## Features

- Simple three-step upload → process → download flow
- Master category list matching via `categoryProcessor`
- Multi-language UI (i18n support with a language switcher)
- Runs entirely in the browser

## Tech Stack

- React + TypeScript, built with Vite
- shadcn-ui components on top of Tailwind CSS

## Getting Started

```bash
# install dependencies
npm i

# start the dev server
npm run dev

# production build
npm run build
```

## Project Origin

This project was originally scaffolded with [Lovable](https://lovable.dev/).

## License

No license specified yet.
