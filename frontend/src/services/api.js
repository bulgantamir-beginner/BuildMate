import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
})

export const getParts = (category, filters = {}) =>
  api.get('/parts', { params: { category, ...filters } }).then(r => r.data.data)
export const getPartById = id => api.get(`/parts/${id}`).then(r => r.data.data)
export const getCategories = () => api.get('/categories').then(r => r.data.data)

export const createPart = formData =>
  api.post('/parts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data)
export const updatePart = (id, formData) =>
  api.put(`/parts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data)
export const deletePart = id => api.delete(`/parts/${id}`).then(r => r.data)

export const checkBuild = build => api.post('/build/check', { build }).then(r => r.data.data)
export const saveBuild = (build, name, description) =>
  api.post('/build/save', { build, name, description }).then(r => r.data.data)
export const getSavedBuilds = () => api.get('/build/saved').then(r => r.data.data)
export const getSavedBuild = id => api.get(`/build/saved/${id}`).then(r => r.data.data)
export const deleteSavedBuild = id => api.delete(`/build/saved/${id}`).then(r => r.data)
export const getRecommendations = (useCase, budget) =>
  api.get('/build/recommend', { params: { useCase, budget } }).then(r => r.data.data)
export const compareBuilds = (build1, build2, name1, name2) =>
  api.post('/build/compare', { build1, build2, name1, name2 }).then(r => r.data.data)

export const sendAiMessage = (message, sessionId, currentBuild, history) =>
  api.post('/ai/chat', { message, sessionId, currentBuild, history }).then(r => r.data.data)
export const getAiHistory = sessionId => api.get(`/ai/history/${sessionId}`).then(r => r.data.data)

export const adminLogin = (username, password) =>
  api.post('/admin/login', { username, password }).then(r => r.data)
