# seekinmonky

## Features

### Bitcoin Price Display

This project includes a Bitcoin price display feature that shows the current Bitcoin price in USD. The price is fetched from the CoinGecko API and updates automatically every 5 minutes. The display includes a time-based icon (sun during day, moon during night) and is shown in the footer of the site.

### Code Editor

This project includes a simple code editor that supports JavaScript and Python syntax highlighting. The editor allows you to:

- Write and edit code with syntax highlighting
- Switch between different programming languages
- Copy your code to the clipboard
- Reset the code to the default template
- Share the current session URL

The code editor can be accessed at `/playground/[sessionId]` where you can create coding sessions with unique URLs.

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Highlight.js for syntax highlighting
- CoinGecko API for Bitcoin price data
