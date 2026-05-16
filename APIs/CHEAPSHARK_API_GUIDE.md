# CheapShark API Integration

This document explains how to use the CheapShark API integration in the Free Game App.

## Overview

The CheapShark API provides price comparison data for digital PC games across multiple stores (Steam, GOG, Fanatical, etc.). The integration includes:

- **Smart caching** with 6-hour TTL to minimize API calls
- **Rate limit handling** to respect the API's rate limiting policy
- **Custom hooks** for easy integration throughout the app
- **Pre-built components** for displaying price information

## Files Added

### API Module
- **`APIs/getCheapSharkAPIs.js`** - Main API module with caching logic

### Custom Hook
- **`hooks/useCheapShark.js`** - React hook for easy API access

### Components
- **`components/PriceComparison.jsx`** - Display best prices and store options

## Usage Examples

### 1. Search for Games

```javascript
import { useCheapShark } from '../hooks/useCheapShark';

function MyComponent() {
  const { searchForGames, loading, error } = useCheapShark();

  const handleSearch = async () => {
    const results = await searchForGames("Elden Ring", 10);
    console.log(results);
    // Returns array of game objects with steamAppID
  };

  return <TouchableOpacity onPress={handleSearch}>Search</TouchableOpacity>;
}
```

### 2. Get Price Deals for a Specific Game

```javascript
import { useCheapShark } from '../hooks/useCheapShark';

function GameDetails({ steamAppID }) {
  const { getPriceDeals, loading } = useCheapShark();
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const fetchDeals = async () => {
      const priceDeals = await getPriceDeals(steamAppID);
      setDeals(priceDeals);
    };
    fetchDeals();
  }, [steamAppID]);

  return (
    <View>
      {deals.map(deal => (
        <Text key={deal.dealID}>
          {deal.title}: ${deal.salePrice}
        </Text>
      ))}
    </View>
  );
}
```

### 3. Get Best Price for a Game

```javascript
import { useCheapShark } from '../hooks/useCheapShark';

function BestPriceWidget({ steamAppID }) {
  const { getBestPriceData } = useCheapShark();
  const [bestPrice, setBestPrice] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const best = await getBestPriceData(steamAppID);
      setBestPrice(best);
    };
    fetch();
  }, [steamAppID]);

  return bestPrice ? (
    <Text>Best Price: ${bestPrice.salePrice}</Text>
  ) : null;
}
```

### 4. Check if Game is on Sale

```javascript
import { useCheapShark } from '../hooks/useCheapShark';

function SaleIndicator({ steamAppID }) {
  const { checkIfOnSale } = useCheapShark();
  const [onSale, setOnSale] = useState(false);

  useEffect(() => {
    const check = async () => {
      const isOnSale = await checkIfOnSale(steamAppID);
      setOnSale(isOnSale);
    };
    check();
  }, [steamAppID]);

  return onSale ? <Text style={{ color: 'red' }}>ON SALE!</Text> : null;
}
```

### 5. Using the PriceComparison Component

```javascript
import PriceComparison from '../components/PriceComparison';

function GameCard({ game }) {
  return (
    <View>
      <Text>{game.title}</Text>
      <PriceComparison steamAppID={game.steamAppID} />
    </View>
  );
}
```

### 6. Browse Deals with Filtering

```javascript
import { useCheapShark } from '../hooks/useCheapShark';

function DealsScreen() {
  const { fetchDeals, loading } = useCheapShark();
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const load = async () => {
      const results = await fetchDeals({
        pageNumber: 0,
        pageSize: 20,
        sortBy: 'DealRating',
        desc: true,
        lowerPrice: 0,
        upperPrice: 15,
        onSale: true,
      });
      setDeals(results);
    };
    load();
  }, []);

  return (
    <FlatList
      data={deals}
      renderItem={({ item }) => <Text>{item.title}: ${item.salePrice}</Text>}
      keyExtractor={item => item.dealID}
    />
  );
}
```

## API Methods

### Direct API Module (`getCheapSharkAPIs.js`)

#### `searchGames(title, limit = 60, exact = false)`
Search for games by title.

**Returns:** Array of game objects

**Parameters:**
- `title` (string) - Game title to search
- `limit` (number) - Max results (default 60)
- `exact` (boolean) - Exact match only (default false)

#### `getDealsBySteamAppID(steamAppID, options = {})`
Get all deals for a specific Steam game.

**Returns:** Array of deal objects

**Parameters:**
- `steamAppID` (string) - Steam App ID
- `options` (object) - Filter options
  - `storeID` (string) - Filter by store ID
  - `lowerPrice` (number) - Min price filter
  - `upperPrice` (number) - Max price filter
  - `onSale` (boolean) - Only on-sale items

#### `getDeals(options = {})`
Get deals with flexible filtering.

**Returns:** Array of deal objects

**Options:**
- `pageNumber` (number) - Page to fetch (default 0)
- `pageSize` (number) - Results per page (default 20, max 60)
- `sortBy` (string) - Sort field (default 'DealRating')
  - Options: 'DealRating', 'Title', 'Savings', 'Price', 'Metacritic', 'Reviews', 'ReviewCount', 'Release', 'Store', 'Recent'
- `desc` (boolean) - Descending order (default false)
- `storeID` (string) - Filter by stores (comma-separated)
- `lowerPrice` (number) - Min price
- `upperPrice` (number) - Max price
- `metacritic` (number) - Min Metacritic score
- `steamRating` (number) - Min Steam rating percentage
- `title` (string) - Search by title
- `exact` (boolean) - Exact title match
- `onSale` (boolean) - Only on-sale games

#### `getBestPrice(steamAppID)`
Get the best (lowest) price for a game across all stores.

**Returns:** Deal object or null

#### `isGameOnSale(steamAppID)`
Check if a game is currently on sale anywhere.

**Returns:** Boolean

#### `getStores()`
Get list of all available stores.

**Returns:** Array of store objects

#### `clearCache()`
Clear all cached CheapShark data.

#### `getCacheStats()`
Get cache statistics for debugging.

## Data Structures

### Deal Object
```javascript
{
  internalName: string,
  title: string,
  dealID: string,
  storeID: string,
  gameID: string,
  salePrice: number,        // Current price
  normalPrice: number,      // Original price
  isOnSale: boolean,
  savings: number,          // Percentage saved (0-100)
  dealRating: string,       // 0-10 scale (CheapShark quality rating)
  metacriticScore: string,
  steamRatingPercent: string,
  steamRatingCount: string,
  steamAppID: string,
  releaseDate: Date,        // Converted from Unix timestamp
  lastChange: Date,         // When deal last changed
  thumb: string             // Game thumbnail URL
}
```

### Game Search Result
```javascript
{
  gameID: string,
  steamAppID: string,
  name: string,
  thumb: string,
  steamRatingText: string,
  steamRatingPercent: number,
  steamRatingCount: number,
  metacriticScore: number,
  cheap_review_metascore: number
}
```

## Caching

All API responses are cached in AsyncStorage for 6 hours. Caching is based on query parameters, so:
- Different search terms create different cache entries
- Same query within 6 hours returns cached result
- Expired cache entries are automatically removed

To manually clear cache:
```javascript
import { clearCache } from '../APIs/getCheapSharkAPIs';

// Clear all CheapShark cache
await clearCache();
```

## Common Store IDs

| ID | Store |
|:--|:--|
| 1 | Steam |
| 3 | GOG |
| 21 | GreenManGaming |
| 22/23 | Fanatical |
| 30 | Humble Bundle |
| 34 | GOG |
| 35 | GamesPlanet |

## Important Notes

⚠️ **Rate Limiting:**
- Excessive automated requests will result in rate limiting (HTTP 429)
- The API is designed for user-driven queries (searches, pagination)
- Avoid building cached catalogs through automated scraping
- If rate limited, check the `Retry-After` header for wait time

✅ **Best Practices:**
1. Use user input-driven queries whenever possible
2. Cache results locally to minimize API calls
3. Display CheapShark attribution with links back to CheapShark.com
4. Use CORS-enabled direct requests from the app

## Attribution

As per CheapShark's TOS, remember to:
- Include CheapShark links when directing users to deals
- Optionally mention that your app uses CheapShark API
- Use the redirect URL format: `https://www.cheapshark.com/redirect?dealID={dealID}`

The PriceComparison component already handles this automatically!

## Troubleshooting

**Getting rate limited (429 errors)?**
- Reduce frequency of API calls
- Use longer cache TTL
- Avoid automated bulk requests
- Call API only in response to user actions

**Getting empty results?**
- Check that game title is spelled correctly
- Try with `exact: false` for broader searches
- Not all games have Steam App IDs

**Timestamps seem wrong?**
- CheapShark returns Unix timestamps in **seconds**
- They're automatically converted to JS Date objects (milliseconds)
