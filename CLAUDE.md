# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Poor Man's Slope Distance Calculator (PMSDC) is a Progressive Web App (PWA) built with SvelteKit that calculates true distance on slopes using device motion sensors. The app captures angle measurements via accelerometer and applies trigonometric calculations to determine actual distance.

## Commands

### Development
```bash
npm run dev              # Start dev server on port 5173
npm run dev -- --open    # Start dev server and open browser
ngrok http 5173         # Expose dev server via ngrok tunnel for mobile testing
```

### Build & Preview
```bash
npm run build           # Build for production (outputs to dist/)
npm run preview         # Preview production build
```

### Code Quality
```bash
npm run check           # Type-check with svelte-check
npm run check:watch     # Type-check in watch mode
npm run format          # Format code with Prettier
npm run lint            # Check formatting with Prettier
```

## Architecture

### PWA Configuration
- Uses `@sveltejs/adapter-static` to build static files to `dist/` directory
- Configured with `@vite-pwa/sveltekit` for Progressive Web App capabilities
- Service worker automatically updates with `registerType: 'autoUpdate'`
- Manifest configured for standalone display mode with custom icons

### State Management
The app uses a centralized Svelte writable store pattern:
- **`rangefinderData` store** (`src/lib/stores/rangefinder.ts`): Manages all measurement state including permissions, angles, distances, and errors

### Sensor Integration
Device motion/orientation sensors are abstracted through utilities in `src/lib/utils/sensorUtils.ts`:
- **iOS Safari handling**: Detects iOS Safari and requests required permissions via `DeviceOrientationEvent.requestPermission()` and `DeviceMotionEvent.requestPermission()`
- **Angle calculation**: Uses accelerometer data (accelerationIncludingGravity) to calculate pitch angle via `Math.atan2()` - designed for landscape mode
- **`AngleCapture` class**: Manages real-time angle updates and capture lifecycle

### Distance Calculation
Trigonometric calculations in `sensorUtils.ts`:
- **Uphill** (angle > 0): `trueDistance = straightDistance / cos(angle)`
- **Downhill** (angle < 0): `trueDistance = straightDistance * cos(abs(angle))`
- Results rounded to 1 decimal place

### Page Flow
1. **Dashboard** (`/dashboard`): Entry point showing last measurement and permission status
2. **Capture Angle** (`/capture-angle`): Full-screen angle capture interface with live angle display
3. **Distance Input** (`/distance-input`): Accepts straight-line distance (0.1-999 yards) and calculates true distance
4. **Home** (`/`): Redirects to dashboard component

### Browser Compatibility
- iOS Safari requires explicit user interaction for sensor permission requests
- Non-iOS browsers auto-grant sensor access
- All sensor operations check `browser` environment flag from `$app/environment`

### TypeScript Configuration
- Strict mode enabled
- Uses bundler module resolution
- Path aliases configured via SvelteKit (`$lib`, `$app`)
- Extends `.svelte-kit/tsconfig.json` for SvelteKit-specific settings

### Testing Mobile Features
Since this app requires device sensors (accelerometer/gyroscope):
- Use `npm run dev` and `ngrok http 5173` to create a tunnel
- Test on actual mobile devices using the ngrok URL
- iOS devices require HTTPS (ngrok provides this automatically)
