# Empire Rise: Billionaire Simulator

An original React Native CLI investor-tycoon game. The current build is a playable single-player economy: acquire and staff companies, upgrade them, trade fictional stocks and crypto with saved price history, buy and improve property, research permanent bonuses, complete missions, unlock achievements, inspect net worth and liabilities, review the transaction ledger, and process capped offline earnings.

## Run locally

```sh
npm install
npm run typecheck
npm test
npm run android
# or: npm run ios
```

This is a bare React Native 0.87.1 project. It does not use Expo or a backend. The native integrations use React Navigation, Zustand-compatible typed store actions, MMKV, SVG, Reanimated-compatible React Native tooling, Gesture Handler, Safe Area Context, and Vector Icons packages.

### iOS setup

Run CocoaPods once after installing or changing native dependencies, then launch the app from the workspace:

```sh
/Users/lp424-macbook-pro/.rbenv/shims/bundle exec pod install --project-directory=ios
npm run ios
```

The `RNGestureHandlerModule could not be found` redbox means the simulator is running an older binary that was built before Pods were installed. Close the old app and rebuild with the commands above. The current iOS workspace autolinks `RNGestureHandler` along with Reanimated, Worklets, MMKV, SVG, Screens, Vector Icons, and Safe Area Context.

### Android setup

Make sure Android SDK tools are available. On this machine the SDK is at `/Users/lp424-macbook-pro/Library/Android/sdk`:

```sh
export ANDROID_HOME=/Users/lp424-macbook-pro/Library/Android/sdk
export ANDROID_SDK_ROOT="$ANDROID_HOME"
npm run android
```

## Architecture

- `src/features/economy/economyEngine.ts` contains pure, deterministic money calculations and offline-progress rules.
- `src/features/businesses/businessData.ts` is the data-driven catalogue of sixteen fictional industries, including late-game media, aerospace, biotech, and orbital infrastructure companies.
- `src/store/gameStore.ts` is the typed state/action boundary used by the UI. It validates affordability, duplicate purchases, unlocks, upgrades, trade quantities and fees, cost basis, property rent and upgrades, research prerequisites, mission claims, achievement rewards, and MMKV save/load.
- `src/services/storage/saveService.ts` owns save validation, v1 migration defaults, serialization, and corrupted-save rejection.
- `src/features/economy/cashFlow.ts`, `netWorth.ts`, and `src/features/offlineProgress/offlineProgressEngine.ts` keep balance-sheet and idle-progress calculations separate from presentation.
- `src/constants/initialGameState.ts` defines the $10,000 starting run.
- `src/app/` owns providers, initialization/offline processing, and the user-facing error boundary.
- `src/navigation/` owns the five-tab navigator and contextual stack navigation.
- `src/screens/` contains the dashboard, businesses, markets, assets, onboarding, profile, and finance screens; shared visual primitives live under `src/components/common/`.
- `src/screens/lifestyle/`, `src/screens/progression/`, and `src/screens/settings/` provide fictional luxury assets, local leaderboard/prestige, and local save controls.
- `App.tsx` is only the application shell and lifecycle composition point.

Persistence is versioned as `empire-rise-save-v1` in MMKV, with validation, safe migration defaults, and corrupted-save deletion. A JS-only test runner falls back safely when native MMKV bindings are unavailable. The economy uses deterministic simulated prices, capped offline time, transaction fees, persisted market history, and a local-only liabilities field; there is no real-money trading, blockchain, network market, or backend account.

Prestige is an explicit, opt-in reset available at $1,000,000 net worth. It resets the current run while retaining the founder name, achievements, reputation, prestige points, and a permanent income bonus. Lifestyle assets and leaderboard rivals are local fictional game content.

The Android debug APK build and iOS simulator workspace build have been verified locally. Android Gradle emits compatibility/deprecation warnings from the current React Native/Android Gradle toolchain, but both builds complete successfully.

## Economy notes

The game uses whole virtual currency units, one tick equals one minute, and offline earnings are capped at eight hours. Business value, live fictional portfolio prices, and property equity contribute to net worth. All market assets are simulated and use virtual currency only.
