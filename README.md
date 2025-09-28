# BGG Similarity Score Calculator

A web application that calculates similarity scores between BoardGameGeek (BGG) users based on their owned board game collections using the Jaccard similarity index.

## Overview & Assumptions

This application compares two BGG users' game collections and calculates how similar their tastes are based on the games they own from BGG's top 100 ranked games. The similarity is calculated using the Jaccard index: `|A ∩ B| / |A ∪ B|`, where A and B are the sets of games owned by each user. Jaccard Similarity was used for simplicity. An attempt was made to include the bonus task but there is no endpoint from BGG to fetch all users and would be too cumbersome if attempted to be done thru web scraping.

## Features

- **Similarity Comparison**: Compare two BGG users and get a detailed similarity report
- **Top 100 Games**: Fetch and display the current BGG top 100 ranked games
- **User Collections**: Retrieve individual user's game collections
- **Caching**: Intelligent caching system for BGG top 100 games (6-hour TTL)
- **Error Handling**: error handling for API failures
- **Rate Limiting Protection**: Built-in protection against BGG API rate limits

## API Endpoints

### POST `/api/similarity`

Compare two BGG users' collections.

**Request Body:**

```json
{
  "userA": "username1",
  "userB": "username2"
}
```

**Response:**

```json
{
  "metadata": { "top100_count": 100 },
  "userA": { "username": "username1", "owned_top100_count": 25 },
  "userB": { "username": "username2", "owned_top100_count": 18 },
  "similarity": {
    "jaccard_score": 0.3333,
    "jaccard_percent": "33.33%",
    "intersection_count": 10,
    "union_count": 33,
    "common_games": [{ "id": "174430", "name": "Gloomhaven" }]
  }
}
```

### GET `/api/top100`

Fetch the current BGG top 100 ranked games.

**Response:**

```json
{
  "count": 100,
  "games": [{ "id": "174430", "name": "Gloomhaven" }]
}
```

### GET `/api/user/:username`

Fetch a specific user's game collection.

**Response:**

```json
{
  "username": "testuser",
  "gameCount": 150,
  "gameIds": ["174430", "316554", "161936"]
}
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation Steps

1. **Clone the repository:**

```bash
git clone <repository-url>
cd boardGameSimilarityScore
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set environment variables (optional):**
   Create a `.env` file in the root directory:

```env
PORT=3000
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts the server with nodemon for automatic restarts on file changes.

### Production Mode

```bash
npm start
```

This starts the server in production mode.

The server will be available at `http://localhost:3000` (or the port specified in your environment variables).

## Testing

Run the test suite:

```bash
npm test
```

The test suite includes:

- Unit tests for API endpoints
- Service layer testing
- Error handling validation

### Test Coverage

- **Controllers**: Tests for all similarity, top100, and user collection endpoints
- **Services**: Tests for BGG API integration and similarity calculations
- **Error Scenarios**: User not found, API failures

## Project Structure

```
├── server.js                    # Main application entry point
├── package.json                 # Dependencies and scripts
├── src/
│   ├── configs/
│   │   └── index.js            # Configuration constants
│   ├── controllers/
│   │   └── similarityController.js  # Request handlers
│   ├── routes/
│   │   └── index.js            # Route definitions
│   ├── services/
│   │   ├── bggService.js       # BGG API integration
│   │   └── similarityService.js    # Jaccard similarity calculations
│   ├── tests/
│   │   └── bgg.test.js         # Test suite
│   └── utils/
│       └── cache.js            # Simple in-memory cache
```

## Key Components

### BGG Service ([`bggService`](src/services/bggService.js))

- Fetches BGG top 100 games via web scraping
- Retrieves user collections via BGG XML API2
- Handles API rate limiting and errors

### Similarity Service ([`similarityService`](src/services/similarityService.js))

- Implements Jaccard similarity algorithm
- Maps game IDs to names for display
- Calculates intersection and union sets

### Cache System ([`cache`](src/utils/cache.js))

- Simple TTL-based in-memory cache
- Reduces BGG API calls for top 100 games
- 6-hour cache expiration for top 100 list

## Usage Examples

### Compare Two Users

```bash
curl -X POST http://localhost:3000/api/similarity \
  -H "Content-Type: application/json" \
  -d '{"userA": "boardgamer1", "userB": "boardgamer2"}'
```

### Get Top 100 Games

```bash
curl http://localhost:3000/api/top100
```

### Get User Collection

```bash
curl http://localhost:3000/api/user/boardgamer1
```

## Error Handling

The application handles various error scenarios:

- **400 Bad Request**: Missing required parameters
- **403 Forbidden**: Private user collections
- **404 Not Found**: Non-existent users
- **500 Internal Server Error**: API failures, parsing errors

## Performance Considerations

- **Caching**: Top 100 games cached for 6 hours to reduce API calls
- **Memory Management**: Simple cache with TTL expiration

## Dependencies

### Production Dependencies

- **express**: Web framework
- **axios**: HTTP client for BGG API calls
- **cheerio**: HTML parsing for web scraping
- **xml2js**: XML parsing for BGG API responses
- **morgan**: HTTP request logging

### Development Dependencies

- **jest**: Testing framework
- **supertest**: HTTP assertion testing
- **nodemon**: Development server with auto-restart

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

ISC License

## BGG API Usage

This application uses:

- BGG browse page for top 100 games (web scraping)
- BGG XML API v2 for user collections
- Respects BGG's rate limiting and terms of service

**Note**: BGG API can be slow and may have rate limits. The application includes appropriate error handling and caching to minimize impact.

