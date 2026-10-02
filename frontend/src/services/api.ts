const API_BASE = '/api/v1';

export class ApiError extends Error {
  errorCode: string;
  errors?: string[];
  status: number;

  constructor(message: string, errorCode: string = 'ERROR', errors?: string[], status: number = 400) {
    super(message);
    this.name = 'ApiError';
    this.errorCode = errorCode;
    this.errors = errors;
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('apsrtc_token');
  
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Do not set Content-Type if uploading FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    const blob = await response.blob();
    return blob as unknown as T;
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new ApiError(`Server Error: ${response.statusText}`, 'SERVER_ERROR', undefined, response.status);
    }
    return {} as T;
  }

  if (!response.ok || data.success === false) {
    throw new ApiError(
      data.message || 'An error occurred',
      data.error_code || 'ERROR',
      data.errors,
      response.status
    );
  }

  return data.data;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) => 
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body?: any) => 
    request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
