# Empire Rise: Billionaire Simulator

Empire Rise is a React Native single-player economy simulator. Players build an expanding business portfolio, trade fictional markets, acquire property, research upgrades, complete missions, and manage a persistent balance sheet.

## Highlights

- Acquire, staff, and upgrade fictional companies
- Trade fictional stocks and crypto with saved price history
- Buy and improve property
- Research permanent bonuses
- Complete missions and unlock achievements
- Review net worth, liabilities, and transaction history
- Process capped offline earnings
- Persist progress locally with validated save/load flows

## Architecture

- `src/features/economy/` contains pure money, cash-flow, net-worth, and offline-progress calculations.
- `src/features/businesses/` contains the data-driven company catalogue.
- `src/store/gameStore.ts` is the typed state and action boundary.
- `src/services/storage/` owns save validation, migration defaults, serialization, and corrupted-save rejection.
- `src/constants/initialGameState.ts` defines the starting run.

## Technology

- React Native CLI
- TypeScript
- React Navigation
- Zustand-style typed store actions
- MMKV persistence
- Reanimated-compatible tooling
- Gesture Handler, SVG, Safe Area Context, and Vector Icons

## Run locally

Complete the official [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment), then run:

```bash
npm install
npm run typecheck
npm test
npm start
```

In a second terminal:

```bash
npm run android
# or
npm run ios
```

For iOS, install CocoaPods dependencies after native dependency changes:

```bash
bundle install
bundle exec pod install --project-directory=ios
```

## Project status

This is a private, local-first game prototype. It uses fictional in-game assets and does not connect to real-money financial services.
