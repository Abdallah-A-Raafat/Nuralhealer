# 📦 Shared Resources

This folder contains shared code and resources used across Web and Mobile applications.

## Structure

```
shared/
├── types/          # TypeScript type definitions
├── constants/      # Shared constants and enums
└── utils/          # Utility functions
```

## Types

Located in `types/index.ts`, contains TypeScript interfaces and types:

- **User Types**: `User`, `Patient`, `Doctor`
- **Auth Types**: `AuthTokens`, `LoginRequest`, `RegisterRequest`
- **Appointment Types**: `Appointment`, `DoctorAvailability`, `TimeSlot`
- **Chat Types**: `ChatSession`, `ChatMessage`, `SessionSummary`
- **Emotion Types**: `EmotionData`, `EmotionAnalysisResponse`
- **API Types**: `ApiResponse`, `PaginatedResponse`, `ApiError`

### Usage Example

```typescript
import { User, Appointment, ChatMessage } from '../shared/types';

const user: User = {
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'patient',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};
```

## Constants

Located in `constants/index.ts`, contains shared constants:

- **Error Codes**: `ERROR_CODES.INVALID_CREDENTIALS`
- **Status Constants**: `APPOINTMENT_STATUS.SCHEDULED`
- **Emotions**: `EMOTIONS.HAPPY`, `EMOTION_COLORS.happy`
- **API Routes**: `API_ROUTES.AUTH.LOGIN`
- **Storage Keys**: `STORAGE_KEYS.ACCESS_TOKEN`

### Usage Example

```typescript
import { ERROR_CODES, APPOINTMENT_STATUS, EMOTIONS } from '../shared/constants';

// Check error code
if (error.code === ERROR_CODES.INVALID_CREDENTIALS) {
  // Handle invalid credentials
}

// Set appointment status
appointment.status = APPOINTMENT_STATUS.SCHEDULED;

// Use emotion colors
const color = EMOTION_COLORS[emotion];
```

## Utils (Coming Soon)

Shared utility functions for:
- Date formatting
- Validation
- String manipulation
- Number formatting
- Error handling

## Usage in Projects

### Web (React)

```typescript
// In web/src/components/MyComponent.tsx
import { User, Appointment } from '../../../shared/types';
import { ERROR_CODES, API_ROUTES } from '../../../shared/constants';
```

### Mobile (React Native)

```typescript
// In mobile/src/components/MyComponent.tsx
import { User, Appointment } from '../../../shared/types';
import { ERROR_CODES, API_ROUTES } from '../../../shared/constants';
```

### Backend (Node.js)

```javascript
// In backend/src/controllers/userController.js
const { ERROR_CODES, APPOINTMENT_STATUS } = require('../../../shared/constants');
```

## Benefits

✅ **Type Safety**: Shared TypeScript types ensure consistency
✅ **Single Source of Truth**: Constants defined once, used everywhere
✅ **Easier Refactoring**: Change once, updates everywhere
✅ **Code Reusability**: No duplicate code between web and mobile
✅ **Better Collaboration**: Teams use same definitions

## Contributing

When adding new shared resources:

1. **Types**: Add to `types/index.ts` with proper JSDoc comments
2. **Constants**: Add to `constants/index.ts` with descriptive names
3. **Utils**: Create new file in `utils/` folder
4. **Documentation**: Update this README

## Best Practices

### Types
- Use descriptive names
- Add JSDoc comments
- Export all types
- Use `readonly` for immutable properties
- Use `?` for optional properties

### Constants
- Use SCREAMING_SNAKE_CASE for constant names
- Group related constants together
- Use `as const` for literal types
- Add comments explaining usage

### Utils
- Keep functions pure (no side effects)
- Add TypeScript types
- Write unit tests
- Export as named exports

## Examples

### Creating New Type

```typescript
// In types/index.ts

/**
 * Represents a notification sent to user
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType = 
  | 'appointment-reminder'
  | 'message-received'
  | 'system';
```

### Creating New Constant

```typescript
// In constants/index.ts

export const NOTIFICATION_TYPES = {
  APPOINTMENT_REMINDER: 'appointment-reminder',
  MESSAGE_RECEIVED: 'message-received',
  SYSTEM: 'system',
} as const;
```

### Creating New Util

```typescript
// In utils/dateFormatter.ts

/**
 * Formats a date string to human-readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
```

## Notes

- This folder should NOT contain platform-specific code
- Keep dependencies minimal (no React, React Native, etc.)
- Prefer TypeScript for better type safety
- Update both web and mobile when making changes
