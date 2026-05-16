# Integration Examples

This file shows practical examples of how to use the CheapShark API in your app.

## Example 1: Adding Price Information to Wishlist Games

To display current prices for games in wishlists, add the `PriceComparison` component to your wishlist item display:

```javascript
// In app/(tabs)/wishlists.jsx or app/wishlist/[id].jsx

import { GameCard } from "../../components/GameCard";
import { PriceComparison } from "../../components/PriceComparison";

function WishlistGameItem({ game }) {
  // Only show price comparison if game has a Steam App ID
  const steamAppID = game.steamAppID || extractSteamAppIDFromURL(game.url);

  return (
    <View>
      <GameCard game={game} />
      {steamAppID && <PriceComparison steamAppID={steamAppID} />}
    </View>
  );
}
```

## Example 2: Adding a "Find Best Price" Button to Game Details

```javascript
import { useCheapShark } from '../../hooks/useCheapShark';

function GameDetailsScreen({ game }) {
  const { getBestPriceData, loading } = useCheapShark();
  const [bestPrice, setBestPrice] = useState(null);

  const handleFindBestPrice = async () => {
    if (game.steamAppID) {
      const best = await getBestPriceData(game.steamAppID);
      setBestPrice(best);
    }
  };

  return (
    <View>
      <TouchableOpacity 
        onPress={handleFindBestPrice}
        style={styles.button}
      >
        <Text>Find Best Price</Text>
      </TouchableOpacity>

      {bestPrice && (
        <View style={styles.bestPriceDisplay}>
          <Text>Best Price: ${bestPrice.salePrice}</Text>
          <Text>Store: {bestPrice.storeID}</Text>
          <Text>Savings: {bestPrice.savings.toFixed(0)}%</Text>
        </View>
      )}
    </View>
  );
}
```

## Example 3: Search Games and Show Prices

```javascript
import { useCheapShark } from '../../hooks/useCheapShark';

function SearchGamesScreen() {
  const { searchForGames, getPriceDeals, loading } = useCheapShark();
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [deals, setDeals] = useState([]);

  const handleSearch = async (title) => {
    const results = await searchForGames(title);
    setSearchResults(results);
  };

  const handleSelectGame = async (game) => {
    setSelectedGame(game);
    if (game.steamAppID) {
      const priceDeals = await getPriceDeals(game.steamAppID);
      setDeals(priceDeals);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Search games..."
        onChangeText={handleSearch}
      />

      {/* Search Results */}
      <FlatList
        data={searchResults}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => handleSelectGame(item)}
            style={styles.searchResult}
          >
            <Text>{item.name}</Text>
            <Text style={styles.secondary}>
              Steam ID: {item.steamAppID}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.gameID}
      />

      {/* Deals for Selected Game */}
      {selectedGame && (
        <View>
          <Text style={styles.title}>{selectedGame.name}</Text>
          <FlatList
            data={deals}
            renderItem={({ item }) => (
              <View style={styles.dealCard}>
                <Text>Store ID: {item.storeID}</Text>
                <Text style={styles.price}>
                  ${item.salePrice}
                </Text>
                {item.isOnSale && (
                  <Text style={styles.savings}>
                    Save {item.savings.toFixed(0)}%
                  </Text>
                )}
              </View>
            )}
            keyExtractor={item => item.dealID}
          />
        </View>
      )}
    </View>
  );
}
```

## Example 4: Automatic Price Tracking for Wishlist Items

Store Steam App IDs with wishlist items to enable price tracking:

```javascript
// When adding game to wishlist, extract Steam App ID
import { searchGames } from '../../APIs/getCheapSharkAPIs';

async function findGameOnSteam(gameTitle) {
  const results = await searchGames(gameTitle, 5, true);
  if (results.length > 0) {
    return results[0].steamAppID;
  }
  return null;
}

// In handleAddToWishlist
const handleAddToWishlist = async (game) => {
  const steamAppID = game.steamAppID || await findGameOnSteam(game.title);

  addGameToWishlist(
    {
      id: game.id || Math.random().toString(),
      title: game.title,
      image: game.image,
      steamAppID: steamAppID,  // Store this!
      // ... other fields
    },
    wishlistId
  );
};
```

## Example 5: Browse Deals Within Price Range

```javascript
import { useCheapShark } from '../../hooks/useCheapShark';

function DealsFilterScreen() {
  const { fetchDeals, loading } = useCheapShark();
  const [deals, setDeals] = useState([]);
  const [maxPrice, setMaxPrice] = useState(20);

  const handleFilterDeals = async () => {
    const filtered = await fetchDeals({
      pageNumber: 0,
      pageSize: 30,
      sortBy: 'DealRating',
      desc: true,
      lowerPrice: 0,
      upperPrice: maxPrice,
      onSale: true,
    });
    setDeals(filtered);
  };

  return (
    <View>
      <Slider
        value={maxPrice}
        onValueChange={setMaxPrice}
        min={0}
        max={60}
      />
      <Text>Max Price: ${maxPrice}</Text>

      <TouchableOpacity onPress={handleFilterDeals}>
        <Text>Find Deals</Text>
      </TouchableOpacity>

      <FlatList
        data={deals}
        renderItem={({ item }) => (
          <View style={styles.dealCard}>
            <Image source={{ uri: item.thumb }} style={styles.thumbnail} />
            <Text>{item.title}</Text>
            <Text style={styles.price}>${item.salePrice}</Text>
            <Text style={styles.rating}>
              Rating: {item.dealRating}/10
            </Text>
          </View>
        )}
        keyExtractor={item => item.dealID}
      />
    </View>
  );
}
```

## Example 6: Game On Sale Indicator

```javascript
import { useCheapShark } from '../../hooks/useCheapShark';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function GameOnSaleIndicator({ steamAppID }) {
  const { checkIfOnSale } = useCheapShark();
  const [onSale, setOnSale] = useState(false);

  useEffect(() => {
    const check = async () => {
      const sale = await checkIfOnSale(steamAppID);
      setOnSale(sale);
    };
    check();
  }, [steamAppID]);

  if (!onSale) return null;

  return (
    <View style={styles.saleIndicator}>
      <MaterialCommunityIcons name="fire" size={16} color="#FF6B6B" />
      <Text style={styles.saleText}>ON SALE</Text>
    </View>
  );
}
```

## Example 7: Cache Management

```javascript
import { getCacheStats, clearCache } from '../../APIs/getCheapSharkAPIs';

function CacheDebugScreen() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      const cacheStats = await getCacheStats();
      setStats(cacheStats);
    };
    loadStats();
  }, []);

  const handleClearCache = async () => {
    await clearCache();
    const newStats = await getCacheStats();
    setStats(newStats);
    Alert.alert('Success', 'Cache cleared');
  };

  return (
    <View>
      {stats && (
        <View>
          <Text>Cache Entries: {stats.entries}</Text>
          <Text>Cache Size: {(stats.totalCacheSize / 1024).toFixed(2)} KB</Text>
          <Text>TTL: {stats.ttlHours} hours</Text>
        </View>
      )}
      <TouchableOpacity onPress={handleClearCache}>
        <Text>Clear Cache</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Integration Checklist

- [ ] Import `useCheapShark` hook in screens where you need price data
- [ ] Add `PriceComparison` component to game display areas
- [ ] Store `steamAppID` with wishlist items for price tracking
- [ ] Add error handling for API failures
- [ ] Test with various game titles and Steam App IDs
- [ ] Monitor API rate limiting if needed
- [ ] Add CheapShark attribution to relevant screens
- [ ] Display prices in USD (API only supports USD)

## Common Patterns

### Pattern 1: Debounced Search
```javascript
import { useMemo } from 'react';

function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const { searchForGames } = useCheapShark();

  const debouncedSearch = useMemo(() => {
    return debounce(async (term) => {
      if (term.length > 2) {
        const results = await searchForGames(term);
        setResults(results);
      }
    }, 500);
  }, []);

  return (
    <TextInput
      onChangeText={text => {
        setSearchTerm(text);
        debouncedSearch(text);
      }}
      value={searchTerm}
    />
  );
}
```

### Pattern 2: Conditional Price Display
```javascript
function GameCard({ game }) {
  const steamAppID = game.steamAppID;

  return (
    <View>
      <Text>{game.title}</Text>
      {steamAppID ? (
        <PriceComparison steamAppID={steamAppID} />
      ) : (
        <Text style={styles.noPrice}>
          Steam App ID not available
        </Text>
      )}
    </View>
  );
}
```

### Pattern 3: Batch Price Checking
```javascript
async function checkPricesForMultipleGames(games) {
  const pricePromises = games
    .filter(g => g.steamAppID)
    .map(g => getBestPrice(g.steamAppID));

  const prices = await Promise.all(pricePromises);
  return prices;
}
```
