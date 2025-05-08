## Welcome to the Voltuoso notes ReadMe!

## Get started

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

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
