## Welcome to the Voltuoso notes ReadMe!

1. Ensure you’re on the right Node version (if you use nvm):
   nvm use node       # or whatever alias/version you’ve set, e.g. `nvm use 18`

2. Update your local repo
   git init
   git pull       # grab any upstream commits

3. Install any new JS deps
   npm install    # or `yarn install` if you use Yarn

4. Sync iOS native modules (once per dependency change)
   npx pod-install    # runs `pod install` in ios/

5. Clear Metro’s cache and start the bundler
   npx expo start -c

   (If you’re using the development client build:)
   npx expo run:ios   # to rebuild+launch your custom dev client
   npx expo run:android
   eas build --profile development --platform ios (if you're having issues)

## Current Voltuoso App Features:

1. File‑system based routing via Expo Router’s expo-router plugin, so pages under the app/ directory automatically become navigable routes. 

2. Bottom‑tab & stack navigation powered by React Navigation (@react-navigation/bottom-tabs, @react-navigation/stack, @react-navigation/native), giving you both tab bars and nested screen stacks. 

3. Map view with location permissions through the expo-maps plugin and react-native-maps, including runtime permission prompts on iOS & Android. 

4. Device location services via expo-location, with both “when‑in‑use” and “always” permission descriptions (for background tracking). 

5. Branded splash screens configured with Expo’s expo-splash-screen plus react-native-bootsplash for a smooth app launch. 

6. Rich UI components from both react-native-elements and react-native-paper, accelerating screen layouts and theming. 

7. Gesture handling & animations via react-native-gesture-handler and react-native-reanimated for fluid, native‑feeling interactions. 

8. Optimized image & font loading with expo-image and expo-font, ensuring crisp graphics and custom typography. 

9. Haptic feedback support through expo-haptics, adding tactile cues for taps and transitions.

10. Web content & deep‑linking via react-native-webview, expo-web-browser, and expo-linking for in‑app browser views and external links. 

11. Environment‐driven configuration—an extra block in app.json injects your backend apiUrl and the GOOGLE_CLOUD_API_KEY at runtime. 

12. Adaptive icons & theming: Android adaptive‑icon assets plus userInterfaceStyle: automatic for light/dark mode support. 

13. TypeScript ready with a typescript dependency and tsconfig.json for static type‑checking across the codebase. 

14. Custom CLI & build scripts—includes eas.json, .easignore, and package‑scripts like reset-project and lint to streamline your Expo/EAS workflow. 

## Next Features to target adding to the Voltuoso App

1. User Authentication & Profiles

Implement secure sign‑up/sign‑in (email, social, SSO) and a user profile screen—so you can tie favorites, history, and billing to individual accounts. Driivz highlights that “easy registration” is critical for lowering onboarding friction 

2. Station Discovery & Map Integration

Add a map view with pins for nearby charging stations, clustered at zoomed‑out levels. Greatpelican lists “Find Charging Stations” as its #1 must‑have feature 

3. Custom Filters & Saved Favorites

Allow users to filter by connector type, charging speed, network, price—and save frequently used stations to a “Favorites” list. ChargePoint’s filters for “station availability, price, charging speed, connector type” show how vital this is 

4. Real‑Time Status & Turn‑by‑Turn Directions

Display live availability (in‑use vs. free) and integrate with Apple/Google Maps for navigation. ChargePoint touts “real‑time data of any network” plus “turn‑by‑turn directions” 

5. Charging Session Control (Start/Stop)

Provide in‑app controls to initiate and terminate a session remotely, with session timers and wattage graphs. EVBox names “Start charging instantly” and “Control charging” as core features 

6. Scheduled & Automated Charging

Let users schedule charging windows (e.g. off‑peak rates) and receive reminders to plug in. ChargePoint’s home app “Schedule charging when electricity rates are low” and “Get reminders to plug in” highlight this functionality 


7. Payment & Billing Integration

Support multiple payment methods (cards, wallets), show real‑time session costs, and email/download receipts. Driivz calls out “multiple payment methods” as a key driver to streamline checkout 

8. Notifications & Alerts

Push notifications for session start, completion, faults, price changes, and station downtime. EVBox ranks “Receive notifications and alerts” among the top six features 

9. Charging History & Usage Analytics

Show past sessions, total kWh delivered, cost summaries, and carbon savings. EVBox’s emphasis on “Collect data, insights, and statistics” underscores the value of analytics 

10. Community Reviews & Station Ratings

Let drivers leave and view reviews, tips, and photos. Wired’s roundup of PlugShare notes that “real‑time updates and reviews from a large community” empower better station choice 


11. Station‑Owner / Admin Dashboard

Build a separate interface (web or in‑app) for station hosts to add locations, set pricing, view usage, and manage availability. Moon Technolabs recommends “innovative EV charging app features for efficient operations,” including owner management tools 

12. Offline Caching & Resilience

Cache station data to handle spotty connectivity, and gracefully fall back when offline—crucial for drivers in low‑coverage areas. Metizsoft explains that “filters, a time and charging date scheduler, a notifications system” must all work reliably even when network quality drops

13. After these, you can tackle platform integrations (e.g. Android Auto/CarPlay), voice assistants (Alexa/Siri), widgets, referral programs, and advanced accessibility/localization.