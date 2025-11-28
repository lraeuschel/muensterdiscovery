# Münster Discovery

An interactive web application for exploring the city of Münster, Germany. Discover Christmas markets, track your explored areas, and compete with others in a gamified city exploration experience.

## Features

- **Interactive Map**: Explore Münster's Christmas markets with an interactive Leaflet map featuring real-time data from the Stadt Münster WFS service
- **User Profiles**: Track your exploration progress, view explored areas, and manage your favorite routes
- **Achievements System**: Earn badges for exploring different areas, completing routes, and discovering all Christmas markets
- **Multilingual Support**: Available in 12 languages (German, English, French, Spanish, Italian, Dutch, Polish, Portuguese, Turkish, Russian, Japanese, Arabic)
- **Responsive Design**: Optimized for desktop and mobile devices using Chakra UI

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **UI Framework**: Chakra UI 3
- **Mapping**: Leaflet & React-Leaflet
- **Internationalization**: react-intl
- **Routing**: React Router 7
- **Authentication**: Supabase (integration prepared)
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
cd muensterdiscovery
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Project Structure

- `/src/pages` - Main application pages (Welcome, Profile, OpenWorld, etc.)
- `/src/components` - Reusable components (Header, Menu, LanguageSelector)
- `/src/i18n` - Internationalization files for 12 languages
- `/src/assets` - Images and static resources

## Data Source

Christmas market data is dynamically loaded from the official [Stadt Münster WFS service](https://www.stadt-muenster.de/ows/mapserv706/poiserv), providing real-time information about locations and opening times.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Academic Context

This project is a student project developed as part of the Master's program in Geoinformatics and Spatial Data Science at the University of Münster.

## Contributors

- Lukas Räuschel
- Mika Dinnus
- Julia Ilchmann
- Anke Nienaber
- Matteo Weickert
- Darian Weiß

---

© 2025 muensterdiscovery
