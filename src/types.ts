export type SrsStage =
    | 'NEW'
    | 'HOURS_8'
    | 'DAY_1'
    | 'DAY_2'
    | 'DAY_4'
    | 'DAY_8'
    | 'DAY_16'
    | 'MONTH_1'
    | 'MONTH_2'
    | 'ARCHIVED'

export interface CardResponse {
    reviewId: number
    itemType: 'QUESTION' | 'LANGUAGE_ITEM'
    stage: SrsStage
    dueCount: number
    question?: {
        id: number
        questionText: string
        answerText: Array<{ content: string; code: boolean }>
        topicName: string
    }
    item?: {
        id: number
        word: string
        translation: string
        example: string
        language: string
        type: string
    }
    media: Array<{ id: number; url: string; filename: string }>
}

export interface QuestionListItem {
    id: number
    question: string
    topicName: string
    createdAt: string
}

export interface TopicView {
    id: number
    label: string
}
