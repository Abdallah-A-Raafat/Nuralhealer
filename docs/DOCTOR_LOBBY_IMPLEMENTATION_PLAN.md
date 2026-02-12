# 🏥 Doctor Lobby - Complete Implementation Plan

## 📋 Table of Contents

1. [Backend Architecture Summary](#backend-architecture-summary)
2. [API Endpoints Analysis](#api-endpoints-analysis)
3. [Data Models & DTOs](#data-models--dtos)
4. [Business Logic & Features](#business-logic--features)
5. [Frontend Implementation Plan](#frontend-implementation-plan)
6. [Implementation Phases](#implementation-phases)
7. [Technical Specifications](#technical-specifications)
8. [Testing Strategy](#testing-strategy)

---

## 🏗️ Backend Architecture Summary

### Controllers

- **DoctorLobbyController** (`/doctors`)
  - Handles all doctor browsing and discovery endpoints
  - Uses pagination for efficient data loading
  - Supports advanced filtering and search

### Services

- **DoctorLobbyService** (Interface)
- **DoctorLobbyServiceImpl** (Implementation)
  - Implements caching with Spring Cache (`@Cacheable`)
  - Integrates with FileStorageService for profile images
  - Uses JPA Specifications for dynamic filtering

### Repository

- **DoctorProfileRepository**
  - JPA repository with Specification support
  - Handles complex queries with joins

### Specifications

- **DoctorProfileSpecifications**
  - Dynamic query building based on filters
  - Search functionality across multiple fields

### Mappers

- **DoctorMapper**
  - Converts entities to DTOs
  - Handles profile picture URL generation
  - Builds location strings

---

## 🔌 API Endpoints Analysis

### 1. **Get Doctor Lobby** (Main Endpoint)

```http
GET /doctors/lobby?specialization=cardiology&verificationStatus=verified&availabilityStatus=online&minRating=4.0&location=Cairo&sortBy=rating&sortDirection=desc&page=0&size=20
```

**Purpose:** Fetch paginated list of doctors with advanced filtering

**Query Parameters:**

- `specialization` (optional): Filter by medical specialization
- `verificationStatus` (optional): `verified`, `pending`, `unverified`
- `availabilityStatus` (optional): `online`, `offline`, `busy`
- `minRating` (optional): Minimum rating (0.0 - 5.0)
- `location` (optional): City name (case-insensitive search)
- `sortBy` (optional, default: `rating`): Sort field
- `sortDirection` (optional, default: `desc`): `asc` or `desc`
- `page` (optional, default: `0`): Page number
- `size` (optional, default: `20`, max: `50`): Items per page

**Response:**

```json
{
  "content": [
    {
      "id": "uuid",
      "fullName": "Dr. John Smith",
      "title": "MD, FACC",
      "specialization": "Cardiology",
      "yearsOfExperience": 15,
      "rating": 4.8,
      "totalReviews": 234,
      "profilePictureThumbnailUrl": "https://...",
      "location": "Cairo, Egypt",
      "availabilityStatus": "online",
      "verificationStatus": "verified",
      "isVerified": true,
      "consultationFee": 500.0,
      "distance": null
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false
    }
  },
  "totalPages": 10,
  "totalElements": 200,
  "last": false,
  "first": true,
  "numberOfElements": 20,
  "empty": false
}
```

**Features:**

- ✅ Pagination support
- ✅ Multi-criteria filtering
- ✅ Flexible sorting
- ✅ Cached for performance
- ✅ Profile picture thumbnails optimized

---

### 2. **Search Doctors**

```http
GET /doctors/search?q=john&page=0&size=20
```

**Purpose:** Full-text search across doctor profiles

**Search Fields:**

- First Name
- Last Name
- Title (MD, PhD, etc.)
- Bio
- Specialization

**Query Parameters:**

- `q` (required): Search query
- `page` (optional, default: `0`)
- `size` (optional, default: `20`, max: `50`)

**Response:** Same structure as lobby endpoint

**Use Cases:**

- Quick doctor search by name
- Search by credentials/title
- Find doctors by keywords in bio

---

### 3. **Get Nearby Doctors**

```http
GET /doctors/nearby?lat=30.0444&lng=31.2357&radius=10
```

**Purpose:** Location-based doctor discovery

**Query Parameters:**

- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional, default: `10`, max: `100`): Radius in kilometers

**Response:** Array of `DoctorLobbyCardDTO` (not paginated)

**Algorithm:**

- Uses bounding box approximation
- Calculates lat/lng range based on radius
- ~111km per degree latitude
- Longitude adjusted by cosine of latitude

**Note:** Returns List (not Page) - suitable for map markers

---

## 📊 Data Models & DTOs

### DoctorLobbyCardDTO

**Frontend Display Model**

```typescript
interface DoctorLobbyCard {
  id: string // UUID
  fullName: string // First + Last name
  title: string // Professional title
  specialization: string // Medical specialty
  yearsOfExperience: number // Years practicing
  rating: number // 0.0 - 5.0
  totalReviews: number // Review count
  profilePictureThumbnailUrl: string // Optimized thumbnail
  location: string // "City, Country"
  availabilityStatus: string // "online" | "offline" | "busy"
  verificationStatus: string // "verified" | "pending" | "unverified"
  isVerified: boolean // Quick check flag
  consultationFee: number // Price in local currency
  distance?: number // Only for nearby search (km)
}
```

### DoctorLobbyFilterRequest

**Backend Filter Model**

```typescript
interface DoctorLobbyFilters {
  specialization?: string
  verificationStatus?: string
  availabilityStatus?: string
  minRating?: number
  location?: string
  sortBy: string // default: "rating"
  sortDirection: string // default: "desc"
  page: number // default: 0
  size: number // default: 20
}
```

### DoctorProfile Entity

**Backend Database Model**

Key fields:

- User relationship (one-to-one)
- Professional information (title, bio, specialization)
- Experience and credentials
- Location with coordinates
- Verification and availability status
- Rating metrics
- Social media (JSONB)
- Pricing information
- Audit timestamps

---

## 🎯 Business Logic & Features

### Filtering System

**JPA Specifications-based dynamic filtering**

1. **Specialization Filter**
   - Exact match on specialization field
   - Common values: Cardiology, Neurology, Psychiatry, etc.

2. **Verification Status Filter**
   - `verified`: Completed verification process
   - `pending`: Verification in progress
   - `unverified`: Not verified yet

3. **Availability Status Filter**
   - `online`: Currently available
   - `offline`: Not available
   - `busy`: In session

4. **Rating Filter**
   - Minimum rating threshold
   - Greater than or equal to condition

5. **Location Filter**
   - Case-insensitive LIKE search on city name
   - Partial matching supported

### Search System

**Multi-field text search**

Fields searched (OR condition):

- `user.firstName`
- `user.lastName`
- `profile.title`
- `profile.bio`
- `profile.specialization`

All searches are case-insensitive with partial matching.

### Geolocation System

**Proximity-based discovery**

Algorithm:

1. Calculate latitude range: `radius / 111.0` degrees
2. Calculate longitude range: `radius / (111.0 * cos(lat))` degrees
3. Filter doctors within bounding box
4. Return list with optional distance calculation

**Limitations:**

- Simplified bounding box (not Haversine)
- No PostGIS required for basic functionality
- Suitable for approximate proximity search

### Sorting System

**Flexible sorting with defaults**

Default: Rating (descending) + Total Reviews (descending)

Supported sort fields:

- `rating`
- `totalReviews`
- `yearsOfExperience`
- `consultationFee`
- `lastName` (via user join)

### Caching Strategy

**Spring Cache integration**

Cache name: `doctorLobbyCache`

Cached methods:

- `getDoctorLobby(filters)`
- `searchDoctors(query, pageable)`

Cache benefits:

- Reduced database load
- Faster response times
- Better scalability

**Cache invalidation should occur when:**

- Doctor profile updated
- Verification status changes
- Availability status changes

---

## 🎨 Frontend Implementation Plan

### Phase 1: Core Structure & API Integration

#### **1.1 Type Definitions**

**File:** `shared/types/doctor-lobby.types.ts`

```typescript
export interface DoctorLobbyCard {
  id: string
  fullName: string
  title: string
  specialization: string
  yearsOfExperience: number
  rating: number
  totalReviews: number
  profilePictureThumbnailUrl: string
  location: string
  availabilityStatus: AvailabilityStatus
  verificationStatus: VerificationStatus
  isVerified: boolean
  consultationFee: number
  distance?: number
}

export type AvailabilityStatus = 'online' | 'offline' | 'busy'
export type VerificationStatus = 'verified' | 'pending' | 'unverified'

export interface DoctorLobbyFilters {
  specialization?: string
  verificationStatus?: VerificationStatus
  availabilityStatus?: AvailabilityStatus
  minRating?: number
  location?: string
  sortBy?: 'rating' | 'totalReviews' | 'yearsOfExperience' | 'consultationFee'
  sortDirection?: 'asc' | 'desc'
  page?: number
  size?: number
}

export interface PaginatedResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      unsorted: boolean
    }
  }
  totalPages: number
  totalElements: number
  last: boolean
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface NearbyDoctorsRequest {
  lat: number
  lng: number
  radius?: number
}

export const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Other',
] as const

export type Specialization = (typeof SPECIALIZATIONS)[number]
```

#### **1.2 API Service**

**File:** `web/src/services/doctorLobbyService.ts` & `mobile/src/services/doctorLobbyService.ts`

```typescript
import apiClient from './apiClient'
import {
  DoctorLobbyCard,
  DoctorLobbyFilters,
  PaginatedResponse,
  NearbyDoctorsRequest,
} from '@shared/types/doctor-lobby.types'

class DoctorLobbyService {
  private readonly BASE_PATH = '/doctors'

  /**
   * Get doctor lobby with filters
   */
  async getDoctorLobby(
    filters: DoctorLobbyFilters = {}
  ): Promise<PaginatedResponse<DoctorLobbyCard>> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })

    const response = await apiClient.get(
      `${this.BASE_PATH}/lobby?${params.toString()}`
    )

    return response.data
  }

  /**
   * Search doctors by query
   */
  async searchDoctors(
    query: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<DoctorLobbyCard>> {
    const response = await apiClient.get(`${this.BASE_PATH}/search`, {
      params: { q: query, page, size },
    })

    return response.data
  }

  /**
   * Get nearby doctors
   */
  async getNearbyDoctors(
    request: NearbyDoctorsRequest
  ): Promise<DoctorLobbyCard[]> {
    const { lat, lng, radius = 10 } = request

    const response = await apiClient.get(`${this.BASE_PATH}/nearby`, {
      params: { lat, lng, radius },
    })

    return response.data
  }
}

export default new DoctorLobbyService()
```

---

### Phase 2: Web Application (React)

#### **2.1 State Management**

**File:** `web/src/hooks/useDoctorLobby.ts`

```typescript
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import doctorLobbyService from '../services/doctorLobbyService'
import {
  DoctorLobbyCard,
  DoctorLobbyFilters,
  PaginatedResponse,
} from '@shared/types/doctor-lobby.types'

interface UseDoctorLobbyReturn {
  doctors: DoctorLobbyCard[]
  loading: boolean
  error: string | null
  totalPages: number
  totalElements: number
  currentPage: number
  filters: DoctorLobbyFilters
  updateFilters: (filters: Partial<DoctorLobbyFilters>) => void
  resetFilters: () => void
  goToPage: (page: number) => void
  refresh: () => void
}

export const useDoctorLobby = (): UseDoctorLobbyReturn => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [doctors, setDoctors] = useState<DoctorLobbyCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
  })

  // Initialize filters from URL
  const getFiltersFromUrl = useCallback((): DoctorLobbyFilters => {
    return {
      specialization: searchParams.get('specialization') || undefined,
      verificationStatus:
        (searchParams.get('verificationStatus') as any) || undefined,
      availabilityStatus:
        (searchParams.get('availabilityStatus') as any) || undefined,
      minRating: searchParams.get('minRating')
        ? parseFloat(searchParams.get('minRating')!)
        : undefined,
      location: searchParams.get('location') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'rating',
      sortDirection: (searchParams.get('sortDirection') as any) || 'desc',
      page: parseInt(searchParams.get('page') || '0'),
      size: parseInt(searchParams.get('size') || '20'),
    }
  }, [searchParams])

  const [filters, setFilters] =
    useState<DoctorLobbyFilters>(getFiltersFromUrl())

  // Fetch doctors
  const fetchDoctors = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await doctorLobbyService.getDoctorLobby(filters)
      setDoctors(response.content)
      setPagination({
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        currentPage: response.pageable.pageNumber,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load doctors')
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value))
      }
    })
    setSearchParams(params)
  }, [filters, setSearchParams])

  // Fetch on mount and filter changes
  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  const updateFilters = useCallback(
    (newFilters: Partial<DoctorLobbyFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }))
    },
    []
  )

  const resetFilters = useCallback(() => {
    setFilters({
      sortBy: 'rating',
      sortDirection: 'desc',
      page: 0,
      size: 20,
    })
  }, [])

  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  return {
    doctors,
    loading,
    error,
    totalPages: pagination.totalPages,
    totalElements: pagination.totalElements,
    currentPage: pagination.currentPage,
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    refresh: fetchDoctors,
  }
}
```

#### **2.2 Main Lobby Component**

**File:** `web/src/pages/DoctorLobby/DoctorLobby.tsx`

```tsx
import React from 'react'
import { useDoctorLobby } from '../../hooks/useDoctorLobby'
import DoctorFilters from './components/DoctorFilters'
import DoctorCard from './components/DoctorCard'
import DoctorSearch from './components/DoctorSearch'
import Pagination from '../../components/Pagination'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'

const DoctorLobby: React.FC = () => {
  const {
    doctors,
    loading,
    error,
    totalPages,
    totalElements,
    currentPage,
    filters,
    updateFilters,
    resetFilters,
    goToPage,
  } = useDoctorLobby()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find Your Doctor
        </h1>
        <p className="text-gray-600">
          Browse {totalElements} verified healthcare professionals
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <DoctorSearch />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <DoctorFilters
            filters={filters}
            onFilterChange={updateFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {loading && <LoadingSpinner />}

          {error && <ErrorMessage message={error} />}

          {!loading && !error && doctors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No doctors found matching your criteria
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Reset Filters
              </button>
            </div>
          )}

          {!loading && !error && doctors.length > 0 && (
            <>
              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {doctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorLobby
```

#### **2.3 Doctor Card Component**

**File:** `web/src/pages/DoctorLobby/components/DoctorCard.tsx`

```tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { DoctorLobbyCard } from '@shared/types/doctor-lobby.types'
import { Star, MapPin, Clock, CheckCircle, Award } from 'lucide-react'

interface DoctorCardProps {
  doctor: DoctorLobbyCard
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'busy':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Available Now'
      case 'busy':
        return 'Busy'
      case 'offline':
        return 'Offline'
      default:
        return 'Unknown'
    }
  }

  return (
    <Link
      to={`/doctors/${doctor.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
    >
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          {/* Profile Picture */}
          <div className="relative">
            <img
              src={doctor.profilePictureThumbnailUrl || '/default-avatar.png'}
              alt={doctor.fullName}
              className="w-20 h-20 rounded-full object-cover"
            />
            {/* Availability Badge */}
            <div
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${getAvailabilityColor(doctor.availabilityStatus)}`}
            />
          </div>

          {/* Name and Title */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {doctor.fullName}
              </h3>
              {doctor.isVerified && (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">{doctor.title}</p>
            <p className="text-sm font-medium text-blue-600 mt-1">
              {doctor.specialization}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">
              {doctor.rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({doctor.totalReviews})
            </span>
          </div>

          {/* Experience */}
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {doctor.yearsOfExperience}+ years
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 col-span-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{doctor.location}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {/* Availability */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span
              className={`text-sm font-medium ${
                doctor.availabilityStatus === 'online'
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}
            >
              {getAvailabilityText(doctor.availabilityStatus)}
            </span>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-xs text-gray-500">Consultation Fee</p>
            <p className="text-lg font-bold text-gray-900">
              ${doctor.consultationFee}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default DoctorCard
```

#### **2.4 Filters Component**

**File:** `web/src/pages/DoctorLobby/components/DoctorFilters.tsx`

```tsx
import React from 'react'
import {
  DoctorLobbyFilters,
  SPECIALIZATIONS,
} from '@shared/types/doctor-lobby.types'

interface DoctorFiltersProps {
  filters: DoctorLobbyFilters
  onFilterChange: (filters: Partial<DoctorLobbyFilters>) => void
  onReset: () => void
}

const DoctorFilters: React.FC<DoctorFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      key !== 'page' &&
      key !== 'size' &&
      key !== 'sortBy' &&
      key !== 'sortDirection' &&
      filters[key as keyof DoctorLobbyFilters]
  )

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Specialization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialization
          </label>
          <select
            value={filters.specialization || ''}
            onChange={(e) =>
              onFilterChange({ specialization: e.target.value || undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Specializations</option>
            {SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification
          </label>
          <select
            value={filters.verificationStatus || ''}
            onChange={(e) =>
              onFilterChange({
                verificationStatus: (e.target.value as any) || undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        {/* Availability Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability
          </label>
          <select
            value={filters.availabilityStatus || ''}
            onChange={(e) =>
              onFilterChange({
                availabilityStatus: (e.target.value as any) || undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="online">Available Now</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Rating
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.minRating || 0}
              onChange={(e) =>
                onFilterChange({
                  minRating: parseFloat(e.target.value) || undefined,
                })
              }
              className="flex-1"
            />
            <span className="text-sm font-medium w-8 text-center">
              {filters.minRating?.toFixed(1) || '0.0'}
            </span>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            placeholder="City name"
            value={filters.location || ''}
            onChange={(e) =>
              onFilterChange({ location: e.target.value || undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy || 'rating'}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="rating">Rating</option>
            <option value="totalReviews">Reviews</option>
            <option value="yearsOfExperience">Experience</option>
            <option value="consultationFee">Price</option>
          </select>
        </div>

        {/* Sort Direction */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange({ sortDirection: 'desc' })}
              className={`flex-1 px-3 py-2 rounded-md ${
                filters.sortDirection === 'desc'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              High to Low
            </button>
            <button
              onClick={() => onFilterChange({ sortDirection: 'asc' })}
              className={`flex-1 px-3 py-2 rounded-md ${
                filters.sortDirection === 'asc'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low to High
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorFilters
```

#### **2.5 Search Component**

**File:** `web/src/pages/DoctorLobby/components/DoctorSearch.tsx`

```tsx
import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { debounce } from 'lodash'
import doctorLobbyService from '../../../services/doctorLobbyService'
import { DoctorLobbyCard } from '@shared/types/doctor-lobby.types'

const DoctorSearch: React.FC = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DoctorLobbyCard[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Debounced search
  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([])
        setShowResults(false)
        return
      }

      setLoading(true)
      try {
        const response = await doctorLobbyService.searchDoctors(
          searchQuery,
          0,
          5
        )
        setResults(response.content)
        setShowResults(true)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  const handleInputChange = (value: string) => {
    setQuery(value)
    performSearch(value)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  const handleSelectDoctor = (doctorId: string) => {
    navigate(`/doctors/${doctorId}`)
    handleClear()
  }

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Search by name, specialty, or credentials..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          )}

          {!loading && results.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No doctors found
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => handleSelectDoctor(doctor.id)}
                  className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-center gap-3 transition-colors"
                >
                  <img
                    src={
                      doctor.profilePictureThumbnailUrl || '/default-avatar.png'
                    }
                    alt={doctor.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {doctor.fullName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {doctor.specialization} • {doctor.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {doctor.rating.toFixed(1)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DoctorSearch
```

---

### Phase 3: Mobile Application (React Native)

#### **3.1 Doctor Lobby Screen**

**File:** `mobile/src/screens/DoctorLobby/DoctorLobbyScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import doctorLobbyService from '../../services/doctorLobbyService';
import DoctorCard from './components/DoctorCard';
import DoctorFiltersModal from './components/DoctorFiltersModal';
import DoctorSearchBar from './components/DoctorSearchBar';
import { DoctorLobbyCard, DoctorLobbyFilters } from '@shared/types/doctor-lobby.types';

const DoctorLobbyScreen: React.FC = () => {
  const navigation = useNavigation();
  const [doctors, setDoctors] = useState<DoctorLobbyCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<DoctorLobbyFilters>({
    sortBy: 'rating',
    sortDirection: 'desc',
    size: 20
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchDoctors = async (pageNum: number = 0, append: boolean = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await doctorLobbyService.getDoctorLobby({
        ...filters,
        page: pageNum
      });

      if (append) {
        setDoctors(prev => [...prev, ...response.content]);
      } else {
        setDoctors(response.content);
      }

      setHasMore(!response.last);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDoctors(0, false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchDoctors(page + 1, true);
    }
  };

  const handleFilterChange = (newFilters: Partial<DoctorLobbyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setShowFilters(false);
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No doctors found</Text>
        <TouchableOpacity
          onPress={() => setFilters({ sortBy: 'rating', sortDirection: 'desc', size: 20 })}
          style={styles.resetButton}
        >
          <Text style={styles.resetButtonText}>Reset Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Doctor</Text>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <DoctorSearchBar />

      {/* Doctor List */}
      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DoctorCard
            doctor={item}
            onPress={() => navigation.navigate('DoctorProfile', { doctorId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />

      {/* Filters Modal */}
      <DoctorFiltersModal
        visible={showFilters}
        filters={filters}
        onClose={() => setShowFilters(false)}
        onApply={handleFilterChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827'
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  listContent: {
    padding: 16
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  }
});

export default DoctorLobbyScreen;
```

#### **3.2 Mobile Doctor Card**

**File:** `mobile/src/screens/DoctorLobby/components/DoctorCard.tsx`

```typescript
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { DoctorLobbyCard } from '@shared/types/doctor-lobby.types';

interface DoctorCardProps {
  doctor: DoctorLobbyCard;
  onPress: () => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onPress }) => {
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'busy': return '#F59E0B';
      case 'offline': return '#9CA3AF';
      default: return '#9CA3AF';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: doctor.profilePictureThumbnailUrl || 'https://via.placeholder.com/80'
              }}
              style={styles.avatar}
            />
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getAvailabilityColor(doctor.availabilityStatus) }
              ]}
            />
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {doctor.fullName}
              </Text>
              {doctor.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {doctor.title}
            </Text>
            <Text style={styles.specialization}>{doctor.specialization}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={styles.statValue}>
              ⭐ {doctor.rating.toFixed(1)} ({doctor.totalReviews})
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Experience</Text>
            <Text style={styles.statValue}>{doctor.yearsOfExperience}+ years</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationSection}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{doctor.location}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.feeLabel}>Consultation Fee</Text>
            <Text style={styles.feeValue}>${doctor.consultationFee}</Text>
          </View>
          <View
            style={[
              styles.availabilityBadge,
              { backgroundColor: `${getAvailabilityColor(doctor.availabilityStatus)}20` }
            ]}
          >
            <Text
              style={[
                styles.availabilityText,
                { color: getAvailabilityColor(doctor.availabilityStatus) }
              ]}
            >
              {doctor.availabilityStatus === 'online' ? 'Available' :
               doctor.availabilityStatus === 'busy' ? 'Busy' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  content: {
    padding: 16
  },
  profileSection: {
    flexDirection: 'row',
    marginBottom: 16
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  infoContainer: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4
  },
  specialization: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600'
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12
  },
  statItem: {
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827'
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  feeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2
  },
  feeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827'
  },
  availabilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600'
  }
});

export default DoctorCard;
```

---

## 📅 Implementation Phases

### **Phase 1: Foundation (Week 1)**

- [ ] Create shared types in `/shared/types/doctor-lobby.types.ts`
- [ ] Implement API service for both web and mobile
- [ ] Set up basic routing and navigation
- [ ] Create skeleton UI components

### **Phase 2: Web Implementation (Week 2)**

- [ ] Implement `useDoctorLobby` hook
- [ ] Build main lobby page with filters
- [ ] Create doctor card component
- [ ] Implement search functionality
- [ ] Add pagination component
- [ ] Style with Tailwind CSS

### **Phase 3: Mobile Implementation (Week 3)**

- [ ] Create doctor lobby screen
- [ ] Implement mobile doctor card
- [ ] Build filters modal
- [ ] Add pull-to-refresh
- [ ] Implement infinite scroll
- [ ] Style with React Native StyleSheet

### **Phase 4: Advanced Features (Week 4)**

- [ ] Add geolocation support
- [ ] Implement nearby doctors map view
- [ ] Add favorites/bookmarks functionality
- [ ] Implement real-time availability updates (WebSocket)
- [ ] Add doctor comparison feature
- [ ] Implement advanced sorting options

### **Phase 5: Optimization & Testing (Week 5)**

- [ ] Optimize performance (memoization, lazy loading)
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Add analytics tracking
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Performance testing
- [ ] Accessibility improvements

---

## 🛠️ Technical Specifications

### State Management

- **Web:** React hooks (useState, useEffect, useCallback)
- **Mobile:** React hooks + Context API (optional for global state)
- **URL State Sync:** React Router `useSearchParams` for web
- **Cache:** Consider React Query or SWR for advanced caching

### Performance Optimizations

1. **Image Optimization**
   - Use thumbnail URLs for cards
   - Lazy load images
   - Add placeholder images

2. **List Virtualization**
   - Web: Consider `react-window` for large lists
   - Mobile: FlatList with optimized props

3. **Debouncing**
   - Search input debounced (300ms)
   - Filter changes debounced

4. **Memoization**
   - Memoize expensive calculations
   - Use React.memo for components
   - useCallback for event handlers

### Accessibility

- Semantic HTML (web)
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode support
- Touch target sizes (44x44px minimum)

### Internationalization

- Prepare for Arabic support
- Use i18n library (react-i18next)
- RTL layout support

---

## 🧪 Testing Strategy

### Unit Tests

- Service functions
- Utility functions
- Custom hooks
- Filter logic
- Search logic

### Component Tests

- Doctor card rendering
- Filter component behavior
- Search component
- Pagination
- Empty states

### Integration Tests

- Complete lobby flow
- Filter + sort combinations
- Search integration
- Navigation flow
- API integration

### E2E Tests

- Browse doctors
- Apply filters
- Search and select doctor
- Navigate to detail page
- Location-based search

---

## 🚀 Next Steps

1. **Review this plan** with the team
2. **Prioritize features** based on MVP requirements
3. **Create tickets/tasks** in your project management tool
4. **Set up shared types** first to ensure consistency
5. **Start with API service** implementation
6. **Build web version first**, then adapt to mobile
7. **Regular testing** after each phase

---

## 📝 Notes

### Backend Capabilities Confirmed

✅ Pagination support
✅ Advanced filtering
✅ Full-text search
✅ Geolocation (basic)
✅ Caching enabled
✅ Flexible sorting

### Frontend Requirements

- Modern React (Hooks-based)
- TypeScript for type safety
- Responsive design
- Mobile-first approach
- Performance optimized
- Accessible UI

### Integration Points

- Authentication (JWT in HTTP-only cookies)
- File storage service (profile pictures)
- WebSocket (for real-time availability - future)
- Booking system (separate endpoint)
- Reviews/ratings system (separate endpoint)

---

**Document Version:** 1.0
**Last Updated:** February 12, 2026
**Author:** AI Assistant
**Status:** Ready for Implementation
