# API Services

This directory contains API client implementations.

## Files

### `api.ts` (Original)
The original hand-written API client that is currently used throughout the application.

### `typedApi.ts` (OpenAPI Generated Types)
A new type-safe API client that uses types generated from the OpenAPI specification.

## Migration Guide

To migrate from the original API client to the typed version:

1. Replace imports:
   ```typescript
   // Old
   import { apiClient } from '../services/api';
   
   // New
   import { typedApiClient } from '../services/typedApi';
   ```

2. Update method calls to use generated types:
   ```typescript
   // Old
   await apiClient.login({ user_id: 'john', password: 'pass' });
   
   // New
   await typedApiClient.login({ user_id: 'john', password: 'pass' });
   ```

3. The typed client provides better autocomplete and type safety from the OpenAPI spec.

## Generating Types

To regenerate types when the backend API changes:

```bash
npm run generate-types
```

This command:
1. Converts the Swagger 2.0 spec to OpenAPI 3.0
2. Generates TypeScript types in `app/types/generated.ts`
3. The `typedApi.ts` client automatically uses these updated types