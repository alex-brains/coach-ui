import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
})

export const getNextCard = (params?: Record<string, string>) =>
    api.get('/api/v1/study/next', { params }).then(r => r.data)

export const markCorrect = (reviewId: number) =>
    api.post(`/api/v1/study/${reviewId}/correct`).then(r => r.data)

export const markIncorrect = (reviewId: number) =>
    api.post(`/api/v1/study/${reviewId}/incorrect`).then(r => r.data)

export const getStudyStats = () =>
    api.get('/api/v1/study/stats').then(r => r.data)

export const getQuestions = (topicId?: number) =>
    api.get('/api/v1/questions', { params: topicId ? { topicId } : {} }).then(r => r.data)

export const getQuestion = (id: number) =>
    api.get(`/api/v1/questions/${id}`).then(r => r.data)

export const createQuestion = (data: { topicId?: number; questionText: string; answerText: string }) =>
    api.post('/api/v1/questions', data).then(r => r.data)

export const updateQuestion = (id: number, data: { topicId?: number; questionText: string; answerText: string }) =>
    api.put(`/api/v1/questions/${id}`, data).then(r => r.data)

export const deleteQuestion = (id: number) =>
    api.delete(`/api/v1/questions/${id}`)

export const getTopics = (type?: string) =>
    api.get('/api/v1/topics', { params: type ? { type } : {} }).then(r => r.data)

export const createTopic = (data: { name: string; parentId?: number }) =>
    api.post('/api/v1/topics', data).then(r => r.data)

export const getLanguageItems = (topicId?: number) =>
    api.get('/api/v1/language-items', { params: topicId ? { topicId } : {} }).then(r => r.data)

export const createLanguageItem = (data: {
    topicId?: number; language: string; type: string
    word: string; translation: string; example?: string
}) => api.post('/api/v1/language-items', data).then(r => r.data)

export const uploadMedia = (file: File, itemType: string, itemId: number) => {
    const form = new FormData()
    form.append('file', file)
    form.append('itemType', itemType)
    form.append('itemId', String(itemId))
    return api.post('/api/media/upload', form).then(r => r.data)
}

export const getMediaByItem = (itemType: string, itemId: number) =>
    api.get('/api/media', { params: { itemType, itemId } }).then(r => r.data)

export const deleteMedia = (id: number) =>
    api.delete(`/api/media/${id}`)

export default api
