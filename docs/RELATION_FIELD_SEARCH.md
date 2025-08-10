# RelationField Search Implementation

## Overview

The RelationField component has been enhanced with debounced search functionality that allows users to search through directory records in real-time.

## Features

### 1. Debounced Search
- **Delay**: 300ms debounce delay to prevent excessive API calls
- **Minimum Length**: Search only triggers after 2 characters
- **Server-side Search**: All filtering is done on the backend for better performance

### 2. Backend API Enhancement
- Added `search` parameter support to the `getFullDirectoryData` endpoint
- Search is performed on directory values using case-insensitive LIKE queries
- Maintains compatibility with existing filtering and sorting functionality

### 3. Frontend Implementation
- Replaced TextField with Autocomplete component
- Custom `useDebouncedSearch` hook for managing search state
- Loading indicators during search
- Proper error handling and user feedback

## Implementation Details

### Backend Changes

#### `backend/controllers/directoryRecord.controller.js`
- Added `search` parameter extraction from query
- Implemented search functionality using Sequelize `Op.iLike`
- Search is performed on `DirectoryValue.value` field
- Maintains existing filtering and sorting capabilities

#### API Endpoint
```
GET /api/directory-records/full-data?directory_id=1&company_id=1&search=searchterm
```

### Frontend Changes

#### `frontend/src/hooks/useDebouncedSearch.ts`
- Custom hook for debounced search functionality
- Configurable delay and minimum length
- Proper error handling and loading states

#### `frontend/src/hooks/useDirectoryRecords.ts`
- Added `search` parameter support
- Updated query key to include search term for proper caching

#### `frontend/src/components/RelationField.tsx`
- Replaced TextField with Autocomplete
- Integrated debounced search hook
- Added loading indicators and error handling
- Maintains backward compatibility with existing props

## Usage

### Basic Usage
```tsx
<RelationField
  relationDirectoryId="1"
  companyId="1"
  value={selectedValue}
  onChange={handleChange}
  label="Select Record"
/>
```

### With Search
The search functionality is automatically enabled. Users can:
1. Type in the field to trigger search
2. See loading indicators during search
3. Get filtered results based on their input
4. Clear search by clearing the input

## API Response Format

The search API returns the same format as the regular full-data endpoint:

```json
{
  "directory": { ... },
  "companyDirectory": { ... },
  "directoryRecords": [...],
  "fields": [...]
}
```

## Performance Considerations

1. **Debouncing**: 300ms delay prevents excessive API calls
2. **Server-side Search**: All filtering happens on the backend
3. **Minimum Length**: Search only triggers after 2 characters
4. **Caching**: React Query caches results based on search terms

## Testing

A test component has been created at `frontend/src/components/RelationFieldTest.tsx` to verify the search functionality.

## Future Enhancements

1. **Advanced Search**: Support for searching specific fields
2. **Search History**: Remember recent searches
3. **Search Suggestions**: Auto-complete suggestions
4. **Search Filters**: Additional filtering options
5. **Search Analytics**: Track search patterns

## Migration Notes

- The component maintains backward compatibility
- Existing implementations will continue to work
- Search functionality is opt-in (automatically enabled)
- No breaking changes to the API interface 