// Re-export from api.ts for backward compatibility
export { ApiClient, useApiClient } from './api';
export type { ApiConfig, ApiError } from './api';

// Create a default instance for use in non-component code
import { ApiClient } from './api';

export const apiClient = new ApiClient();