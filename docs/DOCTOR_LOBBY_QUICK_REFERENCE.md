# 🏥 Doctor Lobby - Quick Reference Guide

## 🔌 API Endpoints Summary

### Base URL

```
http://localhost:8080/doctors
```

---

## 1️⃣ Get Doctor Lobby (Main)

```http
GET /doctors/lobby
```

### Query Parameters

| Parameter            | Type   | Required | Default | Description                   |
| -------------------- | ------ | -------- | ------- | ----------------------------- |
| `specialization`     | string | No       | -       | Filter by specialization      |
| `verificationStatus` | string | No       | -       | verified, pending, unverified |
| `availabilityStatus` | string | No       | -       | online, offline, busy         |
| `minRating`          | number | No       | -       | Minimum rating (0.0-5.0)      |
| `location`           | string | No       | -       | City name (partial match)     |
| `sortBy`             | string | No       | rating  | Field to sort by              |
| `sortDirection`      | string | No       | desc    | asc or desc                   |
| `page`               | number | No       | 0       | Page number                   |
| `size`               | number | No       | 20      | Items per page (max 50)       |

### Example Request

```bash
curl "http://localhost:8080/doctors/lobby?specialization=Cardiology&verificationStatus=verified&minRating=4.0&page=0&size=20"
```

### Response Structure

```json
{
  "content": [
    /* Array of DoctorLobbyCardDTO */
  ],
  "totalPages": 10,
  "totalElements": 200,
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "last": false,
  "first": true
}
```

---

## 2️⃣ Search Doctors

```http
GET /doctors/search
```

### Query Parameters

| Parameter | Type   | Required | Default |
| --------- | ------ | -------- | ------- |
| `q`       | string | **Yes**  | -       |
| `page`    | number | No       | 0       |
| `size`    | number | No       | 20      |

### Searches Across

- First Name
- Last Name
- Title
- Bio
- Specialization

### Example Request

```bash
curl "http://localhost:8080/doctors/search?q=john&page=0&size=10"
```

---

## 3️⃣ Get Nearby Doctors

```http
GET /doctors/nearby
```

### Query Parameters

| Parameter | Type   | Required | Default |
| --------- | ------ | -------- | ------- |
| `lat`     | double | **Yes**  | -       |
| `lng`     | double | **Yes**  | -       |
| `radius`  | number | No       | 10 (km) |

### Example Request

```bash
curl "http://localhost:8080/doctors/nearby?lat=30.0444&lng=31.2357&radius=10"
```

### Response

Returns **Array** (not paginated) of `DoctorLobbyCardDTO`

---

## 📊 Data Models

### DoctorLobbyCardDTO

```typescript
{
  id: string;                           // UUID
  fullName: string;                     // "Dr. John Smith"
  title: string;                        // "MD, FACC"
  specialization: string;               // "Cardiology"
  yearsOfExperience: number;            // 15
  rating: number;                       // 4.8
  totalReviews: number;                 // 234
  profilePictureThumbnailUrl: string;   // URL
  location: string;                     // "Cairo, Egypt"
  availabilityStatus: string;           // "online" | "offline" | "busy"
  verificationStatus: string;           // "verified" | "pending" | "unverified"
  isVerified: boolean;                  // true
  consultationFee: number;              // 500.00
  distance?: number;                    // Only for nearby (km)
}
```

---

## 🎯 Common Specializations

```typescript
const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Other',
]
```

---

## 🔄 Filter Combinations Examples

### Example 1: Top Rated Cardiologists in Cairo

```javascript
const filters = {
  specialization: 'Cardiology',
  location: 'Cairo',
  minRating: 4.5,
  verificationStatus: 'verified',
  sortBy: 'rating',
  sortDirection: 'desc',
  page: 0,
  size: 20,
}
```

### Example 2: Available Psychiatrists

```javascript
const filters = {
  specialization: 'Psychiatry',
  availabilityStatus: 'online',
  sortBy: 'totalReviews',
  sortDirection: 'desc',
  page: 0,
  size: 20,
}
```

### Example 3: Most Experienced Doctors

```javascript
const filters = {
  minRating: 4.0,
  verificationStatus: 'verified',
  sortBy: 'yearsOfExperience',
  sortDirection: 'desc',
  page: 0,
  size: 20,
}
```

### Example 4: Affordable Options

```javascript
const filters = {
  minRating: 3.5,
  sortBy: 'consultationFee',
  sortDirection: 'asc', // Low to high
  page: 0,
  size: 20,
}
```

---

## 🚀 Quick Implementation Checklist

### Setup Phase

- [ ] Create shared types file
- [ ] Set up API client with base URL
- [ ] Configure authentication headers

### Web Implementation

- [ ] Create doctor lobby service
- [ ] Build `useDoctorLobby` custom hook
- [ ] Implement URL state synchronization
- [ ] Create doctor card component
- [ ] Build filters component
- [ ] Add search bar with debouncing
- [ ] Implement pagination

### Mobile Implementation

- [ ] Create doctor lobby screen
- [ ] Build mobile doctor card
- [ ] Implement filters modal
- [ ] Add pull-to-refresh
- [ ] Implement infinite scroll
- [ ] Add loading states

### Advanced Features

- [ ] Add geolocation support
- [ ] Implement map view for nearby doctors
- [ ] Add favorites functionality
- [ ] Real-time availability (WebSocket)
- [ ] Doctor comparison feature

---

## 💡 Pro Tips

### Performance

1. **Cache API responses** - Spring Cache is enabled on backend
2. **Debounce search input** - Use 300ms delay
3. **Lazy load images** - Use thumbnails for cards
4. **Virtualize long lists** - For 100+ items on web

### UX Best Practices

1. **Show loading skeletons** - Better than spinners
2. **Preserve scroll position** - On back navigation
3. **Clear filter indicators** - Show active filters count
4. **Empty state guidance** - Helpful message when no results
5. **Optimistic updates** - For bookmarks/favorites

### Mobile Specific

1. **Pull to refresh** - Expected on mobile
2. **Infinite scroll** - Better than pagination buttons
3. **Swipe gestures** - For filters/actions
4. **Haptic feedback** - On important actions
5. **Offline support** - Cache last loaded data

### Accessibility

1. **Proper contrast ratios** - WCAG AA minimum
2. **Touch targets** - 44x44px minimum
3. **Screen reader labels** - All interactive elements
4. **Keyboard navigation** - Tab order matters
5. **Error announcements** - ARIA live regions

---

## 🐛 Common Issues & Solutions

### Issue: Filters not working

**Solution:** Check URL encoding of special characters

### Issue: Pagination not updating

**Solution:** Ensure page state resets to 0 on filter change

### Issue: Images not loading

**Solution:** Verify FileStorageService is returning public URLs

### Issue: Search too slow

**Solution:** Implement debouncing (300ms recommended)

### Issue: Nearby search returns nothing

**Solution:** Check lat/lng values are valid and within ranges

---

## 📱 Mobile Navigation Structure

```
DoctorLobby (Main List)
  ├── DoctorProfile (Detail View)
  │   ├── BookAppointment
  │   └── Reviews
  ├── DoctorSearch (Modal/Screen)
  ├── DoctorFilters (Modal)
  └── NearbyDoctors (Map View)
```

---

## 🌐 Web Routing Structure

```
/doctors                    → Doctor Lobby (with filters in URL)
/doctors?specialization=X   → Filtered view
/doctors/search?q=john      → Search results
/doctors/nearby?lat=X&lng=Y → Map view
/doctors/:id                → Doctor profile detail
```

---

## 🔐 Authentication

All endpoints require:

```javascript
headers: {
  'Authorization': 'Bearer <JWT_TOKEN>',
  'Content-Type': 'application/json'
}
```

Or if using HTTP-only cookies:

```javascript
credentials: 'include'
```

---

## 📊 Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   DoctorLobbyController                      │
│                     /doctors/*                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   DoctorLobbyService                         │
│    - getDoctorLobby(filters)                                 │
│    - searchDoctors(query)                                    │
│    - getNearbyDoctors(lat, lng, radius)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              DoctorProfileRepository                         │
│         JPA with Specifications Support                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         DoctorProfileSpecifications (Criteria API)           │
│    - buildFilters(filters)                                   │
│    - searchByQuery(query)                                    │
└─────────────────────────────────────────────────────────────┘

Supporting Services:
├── FileStorageService (Profile pictures)
├── DoctorMapper (Entity → DTO)
└── Spring Cache (Performance)
```

---

## 🎨 UI Components Hierarchy

### Web

```
DoctorLobby
├── DoctorSearch
│   └── SearchResultsDropdown
├── DoctorFilters (Sidebar)
│   ├── SpecializationFilter
│   ├── VerificationFilter
│   ├── AvailabilityFilter
│   ├── RatingFilter
│   ├── LocationFilter
│   └── SortControls
├── DoctorGrid
│   └── DoctorCard[] (Multiple)
│       ├── Avatar
│       ├── DoctorInfo
│       ├── Stats
│       └── ActionButtons
└── Pagination
```

### Mobile

```
DoctorLobbyScreen
├── Header
│   └── FilterButton
├── DoctorSearchBar
├── FlatList
│   └── DoctorCard[] (Multiple)
│       ├── Avatar
│       ├── DoctorInfo
│       ├── Stats
│       └── PriceTag
└── DoctorFiltersModal
    ├── FilterPicker (Specialization)
    ├── FilterPicker (Verification)
    ├── FilterPicker (Availability)
    ├── RatingSlider
    ├── LocationInput
    ├── SortPicker
    └── ApplyButton
```

---

## 📦 Required Dependencies

### Web (React)

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "lodash": "^4.x"
  },
  "devDependencies": {
    "typescript": "^5.x"
  }
}
```

### Mobile (React Native)

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-native": "^0.73.x",
    "@react-navigation/native": "^6.x",
    "@react-navigation/stack": "^6.x",
    "axios": "^1.x"
  },
  "devDependencies": {
    "typescript": "^5.x"
  }
}
```

---

## 🧪 Testing Examples

### Service Testing

```typescript
describe('DoctorLobbyService', () => {
  test('should fetch doctors with filters', async () => {
    const filters = {
      specialization: 'Cardiology',
      minRating: 4.0,
    }
    const result = await doctorLobbyService.getDoctorLobby(filters)
    expect(result.content).toBeDefined()
    expect(result.totalElements).toBeGreaterThan(0)
  })
})
```

### Component Testing

```typescript
describe('DoctorCard', () => {
  test('should render doctor information', () => {
    const doctor = mockDoctorData;
    render(<DoctorCard doctor={doctor} />);
    expect(screen.getByText(doctor.fullName)).toBeInTheDocument();
    expect(screen.getByText(doctor.specialization)).toBeInTheDocument();
  });
});
```

---

**Last Updated:** February 12, 2026
**Version:** 1.0
