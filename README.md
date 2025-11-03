# MiradorStack UI

<div align="center">
  <img src="./src/assets/logo.svg" alt="MiradorStack UI" height="90px" />
  
  **Modern Observability Dashboard for MiradorStack Platform**
</div>

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)](package.json)
[![Vue](https://img.shields.io/badge/vue-3.x-brightgreen.svg)](package.json)

## About

MiradorStack UI is a modern, responsive observability dashboard built on Vue 3 and TypeScript. It provides comprehensive visualization and analysis capabilities for metrics, logs, traces, and system monitoring data from the MiradorStack platform.

**This project is derived from [Apache SkyWalking Booster UI](https://github.com/apache/skywalking-booster-ui) and maintains Apache 2.0 licensing with proper attribution.**

## Features

- 📊 **Interactive Dashboards** - Customizable widgets and real-time data visualization
- 🔍 **Observability** - Metrics, logs, and distributed tracing analysis  
- 🎨 **Modern UI** - Built with Vue 3, TypeScript, and Element Plus
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🌐 **Internationalization** - Multi-language support
- ⚡ **High Performance** - Optimized with Vite build system
- 🔧 **Extensible** - Plugin architecture for custom widgets

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MiradorStack Core backend running

### Installation

```bash
# Clone the repository
git clone https://github.com/platformbuilds/miradorstack-ui.git
cd miradorstack-ui

# Install dependencies
npm install

# Configure backend connection
echo "VITE_MIRADOR_CORE_URL=http://localhost:8080" > .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Development

Built with modern technologies:

- **Vue 3.x** - Progressive JavaScript framework
- **TypeScript** - Static typing for enhanced development
- **Vite** - Fast build tool and dev server
- **Element Plus** - Vue 3 UI component library

### Development Commands

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting and code formatting
npm run lint

# Unit tests
npm run test:unit

# Build for production
npm run build
```

# Contact Us

- Mail list: **dev@skywalking.apache.org**. Mail to `dev-subscribe@skywalking.apache.org`, follow the reply to subscribe to the mail list.
- Send `Request to join SkyWalking slack` mail to the mail list(`dev@skywalking.apache.org`), we will invite you in.
- For Chinese speaker, send `[CN] Request to join SkyWalking slack` mail to the mail list(`dev@skywalking.apache.org`), we will invite you in.
- Twitter, [ASFSkyWalking](https://twitter.com/AsfSkyWalking)
- [bilibili B 站 视频](https://space.bilibili.com/390683219)

# License

[Apache 2.0 License.](/LICENSE)
