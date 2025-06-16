# Shisha Log - Product Specification

## 1. Product Overview

### 1.1 Product Name
Shisha Log

### 1.2 Product Description
Shisha Log is a web application designed for hookah (shisha) enthusiasts to track and manage their smoking sessions. Users can record details about their sessions including location, flavors used, duration, and personal notes, building a comprehensive history of their shisha experiences.

### 1.3 Target Users
- Hookah/shisha enthusiasts who want to track their sessions
- Regular hookah bar visitors who want to remember their favorite combinations
- Social smokers who want to share experiences with friends

### 1.4 Key Value Propositions
- Track and remember favorite flavor combinations
- Discover new combinations based on past experiences
- Maintain a personal history of shisha sessions
- Simple and intuitive interface for quick logging

## 2. Core Features

### 2.1 User Management
- **User Registration**: Create account with username and password
- **User Login**: Secure authentication with JWT tokens
- **Password Reset**: Secure password recovery flow

### 2.2 Session Management
- **Create Session**: Log new shisha sessions with details
- **View Sessions**: Browse personal session history
- **Edit Session**: Modify existing session details
- **Delete Session**: Remove unwanted sessions
- **Session Details**:
  - Store/location name (optional)
  - Mix name (optional)
  - Creator/mixer name (optional)
  - Date and time
  - Multiple flavors per session
  - Personal notes
  - Order details (optional)

### 2.3 Data Organization
- **Chronological View**: Sessions displayed by date
- **Search**: Find sessions by store, flavor, or notes
- **Filtering**: Filter sessions by various criteria

## 3. Technical Specifications

### 3.1 Architecture
- **Frontend**: React SPA with TypeScript
- **Backend**: Go REST API
- **Database**: PostgreSQL (via Supabase)
- **Deployment**: AWS Lightsail with Docker

### 3.2 API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - User logout

#### User Management
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update current user
- `DELETE /api/v1/users/me` - Delete account

#### Sessions
- `GET /api/v1/sessions` - List user sessions
- `POST /api/v1/sessions` - Create new session
- `GET /api/v1/sessions/:id` - Get session details
- `PUT /api/v1/sessions/:id` - Update session
- `DELETE /api/v1/sessions/:id` - Delete session
- `GET /api/v1/sessions/calendar` - Get sessions for calendar view (month/year)
- `GET /api/v1/sessions/by-date` - Get sessions for a specific date

#### Flavors
- `GET /api/v1/flavors/stats` - Get flavor usage statistics

#### Stores
- `GET /api/v1/stores/stats` - Get store visit statistics

#### Creators
- `GET /api/v1/creators/stats` - Get creator/mixer statistics

### 3.3 Data Models

#### User
```typescript
interface User {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}
```

#### ShishaSession
```typescript
interface ShishaSession {
  id: string;
  user_id: string;
  store_name?: string;
  mix_name?: string;
  creator?: string;
  notes?: string;
  order_details?: string;
  created_at: Date;
  updated_at: Date;
  flavors?: SessionFlavor[];
}
```

#### SessionFlavor
```typescript
interface SessionFlavor {
  id: string;
  session_id: string;
  flavor_name?: string;
  brand?: string;
  flavor_order: number;
  created_at: Date;
}
```

#### FlavorCount
```typescript
interface FlavorCount {
  flavor_name: string;
  count: number;
}
```

#### FlavorStats
```typescript
interface FlavorStats {
  main_flavors: FlavorCount[];  // First flavors (flavor_order = 1)
  all_flavors: FlavorCount[];   // All flavors regardless of order
}
```

#### StoreCount
```typescript
interface StoreCount {
  store_name: string;
  count: number;
}
```

#### StoreStats
```typescript
interface StoreStats {
  stores: StoreCount[];  // Stores sorted by visit count
}
```

#### CreatorCount
```typescript
interface CreatorCount {
  creator: string;
  count: number;
}
```

#### CreatorStats
```typescript
interface CreatorStats {
  creators: CreatorCount[];  // Creators sorted by session count
}
```

## 4. User Interface

### 4.1 Pages
1. **Landing Page**: Welcome message and login/register options
2. **Login Page**: Username and password fields
3. **Register Page**: Account creation form
4. **Dashboard**: 
   - List of recent sessions
   - Total session count
   - Statistics tab with:
     - Flavor statistics with rankings and pie charts
     - Store statistics with rankings and pie charts
     - Creator statistics with rankings and pie charts
   - Calendar view with session indicators
   - Tabbed interface for Calendar/Statistics views
5. **Session List**: Full paginated list of sessions
6. **Session Detail**: View/edit individual session
7. **New Session**: Form to create new session

### 4.2 UI Components
- **Navigation Bar**: App logo, user menu, logout
- **Session Card**: Compact view of session details
- **Flavor Pills**: Visual representation of flavors
- **Date Picker**: For session date selection
- **Multi-select**: For flavor selection
- **Flavor Chart**: Pie chart visualization of flavor usage
- **Flavor Ranking**: List view of most popular flavors with progress bars
- **Store Chart**: Pie chart visualization of store visits
- **Store Ranking**: List view of most visited stores with progress bars
- **Creator Chart**: Pie chart visualization of creators/mixers
- **Creator Ranking**: List view of most frequent creators with progress bars
- **Session Calendar**: Monthly calendar view showing days with sessions
  - Visual indicators (dots) for days with sessions
  - Click on date to view sessions for that day
  - Modal popup showing daily session details
- **Daily Sessions Modal**: Displays all sessions for a selected date
  - Session time, store name, and flavors
  - Links to individual session details

### 4.3 Design Principles
- Mobile-first responsive design
- Dark mode support
- Minimalist and clean interface
- Fast loading and smooth interactions

## 5. Security Requirements

### 5.1 Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Token expiration and refresh
- CORS protection

### 5.2 Authorization
- Users can only access their own data
- API endpoints protected by authentication middleware
- Role-based access control (future enhancement)

### 5.3 Data Protection
- HTTPS encryption in transit
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 6. Performance Requirements

### 6.1 Response Times
- API responses: < 200ms (95th percentile)
- Page loads: < 1 second
- Database queries: < 100ms

### 6.2 Scalability
- Support 1000+ concurrent users
- Handle 10,000+ sessions per user
- Horizontal scaling capability

### 6.3 Availability
- 99.9% uptime target
- Graceful error handling
- Offline capability (future enhancement)

## 7. Future Enhancements

### 7.1 Social Features
- Share sessions with friends
- Follow other users
- Session recommendations

### 7.2 Analytics
- Personal statistics dashboard
- Flavor preference analysis
- Session frequency trends
- Cost tracking

### 7.3 Advanced Features
- Photo upload for sessions
- Barcode scanning for products
- Integration with hookah bar APIs
- Mobile applications (iOS/Android)

### 7.4 Gamification
- Achievement system
- Flavor exploration challenges
- Session streaks
- Leaderboards

## 8. Success Metrics

### 8.1 User Engagement
- Daily active users (DAU)
- Sessions logged per user per month
- User retention rate (30-day, 90-day)

### 8.2 Technical Metrics
- API response time
- Error rate
- System uptime
- Database performance

### 8.3 Business Metrics
- User growth rate
- Feature adoption rate
- User satisfaction score

## 9. Constraints and Assumptions

### 9.1 Constraints
- Initial deployment limited to single region
- PostgreSQL database dependency
- English language only (initial version)

### 9.2 Assumptions
- Users have stable internet connection
- Users are familiar with web applications
- Hookah terminology is understood by users

## 10. Glossary

- **Shisha/Hookah**: Water pipe used for smoking flavored tobacco
- **Session**: A single hookah smoking experience
- **Flavor**: The tobacco flavor(s) used in a session
- **JWT**: JSON Web Token for authentication
- **SPA**: Single Page Application