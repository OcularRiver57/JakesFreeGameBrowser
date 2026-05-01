# JakesFreeGameBrowser
This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

**Name**
Jake's Free Game Browser and Wishlist

**Overview**
Will use multiple web APIs to show the user games that are free or on sale and allow user to add games from websites to a wishlist and get notified when they go on sale or giveaway. user will also be able to export and import wishlists for sharing with others

**Behaviors***
 - Home page will have buttons to Free games, Game Deals, and Wishlists screens.
 - Free Games and Game Deals will have lists of games with pictures titles prices and links to games. 
 - Wishlists (plural) page will have one or more wishlists displayed like games with a picture of a game from the list and a title for the list
 - Wishlist page will display like Free games / Game deals page showing the same things.

**Product Backlog**
 - Show list of games obtained from API < MVP
 - Take user to game deal when clicking link < MVP
 - Show Images for each game from store page
 - Filter games by store, price, platform, and possibly more.
 - Allow user to make wishlist
    - save game to wishlist 
    - add game by URL
    - check if wishlist games are on sale
    - import / export lists
    - share list with link or QR code or something
    - make database for user accounts and wishlists to allow for sharing lists like amazon.
    - add friends and see their wishlists
