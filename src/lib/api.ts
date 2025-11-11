const API_BASE = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

let authToken: string | null =
  typeof window !== 'undefined' ? window.localStorage.getItem('authToken') : null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem('authToken', token);
  } else {
    window.localStorage.removeItem('authToken');
  }
};

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
  auth?: boolean;
}

const buildUrl = (path: string, params?: Record<string, string | number | undefined>) => {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
};

export async function apiRequest<T = any>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { params, auth = true, headers, body, ...rest } = options;
  const url = buildUrl(path, params);
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(headers || {}),
  };
  if (auth && authToken) {
    requestHeaders['x-auth-token'] = authToken;
  }
  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    let message = text;
    try {
      const parsed = JSON.parse(text);
      message = parsed.msg || parsed.error || text;
    } catch {
      // ignore
    }
    throw new Error(message || response.statusText);
  }
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return (await response.text()) as unknown as T;
}

export const api = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; role: string }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),
  register: (payload: { name: string; email: string; password: string; role: string }) =>
    apiRequest<{ token: string }>('/api/auth/register', {
      method: 'POST',
      body: payload,
      auth: false,
    }),
  getCourses: (params?: { page?: number; limit?: number; instructor?: string }) =>
    apiRequest('/api/courses', { params }),
  getCourseById: (id: string) => apiRequest(`/api/courses/${id}`),
  getMyCourses: (params?: { page?: number; limit?: number }) =>
    apiRequest('/api/courses/my/enrolled', { params }),
  getNextLesson: (courseId: string) => apiRequest(`/api/courses/${courseId}/next`),
  getRecommendations: (courseId: string) => apiRequest(`/api/courses/${courseId}/recommendations`),
  getAssignments: (courseId: string, params?: { page?: number; limit?: number }) =>
    apiRequest(`/api/assignments/course/${courseId}`, { params }),
  getThreads: (courseId: string, params?: { page?: number; limit?: number }) =>
    apiRequest(`/api/forums/course/${courseId}`, { params }),
  createThread: (payload: { course: string; lessonId?: string; title: string; body: string }) =>
    apiRequest('/api/forums', { method: 'POST', body: payload }),
  replyToThread: (threadId: string, body: { body: string }) =>
    apiRequest(`/api/forums/${threadId}/reply`, { method: 'POST', body }),
  getAnalyticsStats: (courseId: string) =>
    apiRequest(`/api/analytics/course/${courseId}/stats`),
  getAtRisk: (courseId: string, params?: { limit?: number }) =>
    apiRequest(`/api/analytics/course/${courseId}/at-risk`, { params }),
  getAssignmentsForCourse: (courseId: string, params?: { page?: number; limit?: number }) =>
    apiRequest(`/api/assignments/course/${courseId}`, { params }),
  getOfflineManifest: (courseId: string) => apiRequest(`/api/offline/manifest/${courseId}`),
  getCaptionTracks: (contentId: string) => apiRequest(`/api/accessibility/captions/${contentId}`),
  getVideoQuiz: (contentId: string) => apiRequest(`/api/video/${contentId}/quiz`),
  getVideoContent: (contentId: string) => apiRequest(`/api/video/${contentId}`),
  getNotes: (lessonId: string) => apiRequest(`/api/video/notes/${lessonId}`),
  addNote: (contentId: string, payload: any) =>
    apiRequest(`/api/video/${contentId}/note`, { method: 'POST', body: payload }),
};


