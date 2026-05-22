# Lumora TV App 📺

This is the Android TV and Apple TV (tvOS) companion application for the **Lumora** streaming platform, built using Expo SDK 54 and the React Native TV fork (`react-native-tvos`).

## TV-Optimized Architecture & UX

Unlike mobile applications, TV applications are navigated strictly via a **D-pad** (Up, Down, Left, Right, Select/Enter, Back) and displayed in landscape (16:9) orientation. Lumora TV features:

1. **Left Side Navigation Drawer:**
   - Designed using `SideNavigation.tsx` which automatically collapses to 80px (showing only icons) when main page content is focused.
   - When the user presses `Left` to focus any sidebar item, it expands smoothly to 240px and displays labels.

2. **Focused Hero Backdrop (Netflix Pattern):**
   - In `index.tsx` (Home Screen), the large backdrop poster, title, description, and genres dynamically update to match the **currently focused** video card in the rows below.
   - This prevents unnecessary page loads or manual carousel scrolling, providing a fluid browsing experience.

3. **D-pad Focus Feedback:**
   - Standard touch states are replaced by custom focused states (`transform: [{ scale: 1.05 - 1.08 }]` and white/red highlight borders) utilizing React Native `Pressable` component's `({ focused })` styling API.
   - Action buttons in the Hero section and Detail screens use contrasting colors and clean borders to clearly signal focus to the user.

4. **Split-Screen Details View:**
   - The media info page (`info/[type]/[id].tsx`) features a landscape split-screen layout.
   - The left half displays permanent media details (synopsis, directors, play/watchlist actions).
   - The right half dynamically renders scrollable episode lists (for TV series) or Cast & Crew / similar recommendations (for movies).

---

## Getting Started

### 1. Install Dependencies
Run `npm install` inside the `tv/` directory to fetch the dependencies (including the React Native TV fork and configurations):
```bash
cd tv
npm install
```

### 2. Configure Native TV Targets (Prebuild)
Since standard Expo Go does not support native TV integrations, you must perform an Expo **Prebuild** to generate the native `/android` and `/ios` directories configured for TV:
```bash
export EXPO_TV=1
npx expo prebuild --clean
```
*Note: The `EXPO_TV=1` environment variable tells the `@react-native-tvos/config-tv` plugin to update AndroidManifest intents for TV launcher screens and configure Xcode for tvOS targets.*

### 3. Run on Emulator / Device
Start the development server and run the native build on your target emulator or physical TV device:

#### Android TV:
Ensure your Android TV emulator (e.g., Android TV / Google TV Virtual Device) is running in Android Studio:
```bash
npx expo run:android
```

#### Apple TV (tvOS):
Ensure you are on macOS with Xcode installed and have an Apple TV simulator active:
```bash
npx expo run:ios
```

---

## Directory Structure

* `/assets` — Splash screen, TV icon, and tab assets.
* `/src/app` — File-based router screens:
  * `index.tsx` — Home screen featuring dynamic hero backdrop and horizontal movie cards.
  * `explore.tsx` — TV-optimized search screen with a 5-column results grid.
  * `mylist.tsx` — Personal watchlist screen showing bookmarked movies and shows.
  * `info/[type]/[id].tsx` — Split-screen media detail pages.
  * `watch/[type]/[id].tsx` — Full-screen streaming player with focusable overlays.
* `/src/components` — Universal TV components (e.g., `SideNavigation.tsx`).
* `/src/constants` — Styling configurations (`theme.ts`) and offline backup models (`mockData.ts`).
* `/src/hooks` — Shared global logic (watchlist management, search, and themes).
