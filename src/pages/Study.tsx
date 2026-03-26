import { useState, useEffect, useCallback } from 'react'
import { getNextCard, markCorrect, markIncorrect, getTopics } from '../api/client'
import type { CardResponse, NextCardResponse, SrsStage, TopicView } from '../types'

const STAGE_LABELS: Record<SrsStage, string> = {
    NEW:      'Новая',
    HOURS_8:  '8 часов',
    DAY_1:    '1 день',
    DAY_2:    '2 дня',
    DAY_4:    '4 дня',
    DAY_8:    '8 дней',
    DAY_16:   '16 дней',
    MONTH_1:  '1 месяц',
    MONTH_2:  '2 месяца',
    ARCHIVED: 'Архив',
}

const STAGE_ORDER: SrsStage[] = [
    'NEW','HOURS_8','DAY_1','DAY_2','DAY_4','DAY_8','DAY_16','MONTH_1','MONTH_2','ARCHIVED'
]

type ItemTypeFilter = 'ALL' | 'QUESTION' | 'LANGUAGE_ITEM'

export default function Study() {
    const [card, setCard] = useState<CardResponse | null>(null)
    const [dueCount, setDueCount] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)
    const [loading, setLoading] = useState(true)
    const [answering, setAnswering] = useState(false)
    const [itemTypeFilter, setItemTypeFilter] = useState<ItemTypeFilter>('ALL')
    const [topicId, setTopicId] = useState<number | undefined>(undefined)
    const [topics, setTopics] = useState<TopicView[]>([])
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

    // Загружаем топики в зависимости от раздела
    useEffect(() => {
        if (itemTypeFilter === 'ALL') {
            setTopics([])
            setTopicId(undefined)
            return
        }
        const type = itemTypeFilter === 'QUESTION' ? 'GENERAL' : 'LANGUAGE'
        getTopics(type).then((data: TopicView[]) => setTopics(data))
        setTopicId(undefined)
    }, [itemTypeFilter])

    const loadNext = useCallback(async () => {
        setLoading(true)
        setShowAnswer(false)
        try {
            const params: Record<string, string> = {}
            if (itemTypeFilter !== 'ALL') params['itemType'] = itemTypeFilter
            if (topicId !== undefined) params['topicId'] = String(topicId)

            const data: NextCardResponse = await getNextCard(params)

            setDueCount(data.dueCount)

            if (!data.reviewId) {
                setCard(null)
            } else {
                setCard(data as CardResponse)
            }
        } finally {
            setLoading(false)
        }
    }, [itemTypeFilter, topicId])

    useEffect(() => { loadNext() }, [loadNext])

    const handleCorrect = async () => {
        if (!card || answering) return
        setAnswering(true)
        await markCorrect(card.reviewId)
        setAnswering(false)
        loadNext()
    }

    const handleIncorrect = async () => {
        if (!card || answering) return
        setAnswering(true)
        await markIncorrect(card.reviewId)
        setAnswering(false)
        loadNext()
    }

    const stageIndex = card ? STAGE_ORDER.indexOf(card.stage) : 0

    return (
        <div className="study">

            {/* Lightbox */}
            {lightboxUrl && (
                <div className="lightbox" onClick={() => setLightboxUrl(null)}>
                    <div className="lightbox__close">✕</div>
                    <img src={lightboxUrl} alt="preview" onClick={e => e.stopPropagation()} />
                </div>
            )}

            {/* Фильтры */}
            <div className="study__filters">
                <div className="filter-tabs">
                    {(['ALL', 'QUESTION', 'LANGUAGE_ITEM'] as ItemTypeFilter[]).map(t => (
                        <button
                            key={t}
                            className={`filter-tab ${itemTypeFilter === t ? 'filter-tab--active' : ''}`}
                            onClick={() => setItemTypeFilter(t)}
                        >
                            {t === 'ALL' ? 'Все' : t === 'QUESTION' ? 'Программирование' : 'Языки'}
                        </button>
                    ))}
                </div>

                {/* Топики только в Вопросах и Словах */}
                {itemTypeFilter !== 'ALL' && topics.length > 0 && (
                    <select
                        className="filter-select"
                        value={topicId ?? ''}
                        onChange={e => setTopicId(e.target.value ? Number(e.target.value) : undefined)}
                    >
                        <option value="">— все топики —</option>
                        {topics.map((t: TopicView) => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Прогресс-бар */}
            {card && (
                <>
                    <div className="study__stages">
                        {STAGE_ORDER.filter(s => s !== 'ARCHIVED').map((s, i) => (
                            <div
                                key={s}
                                className={`study__stage ${i < stageIndex ? 'study__stage--done' : ''} ${i === stageIndex ? 'study__stage--current' : ''}`}
                                title={STAGE_LABELS[s]}
                            />
                        ))}
                    </div>
                    <div className="study__meta">
                        <span className="study__stage-label">{STAGE_LABELS[card.stage]}</span>
                        <span className="study__due-count">{dueCount} в очереди</span>
                    </div>
                </>
            )}

            {loading && <div className="study-empty">Загрузка...</div>}

            {!loading && !card && (
                <div className="study-empty">
                    <div className="study-empty__icon">🎉</div>
                    <h2>Все карточки повторены!</h2>
                    <p>Карточек в очереди: {dueCount}</p>
                </div>
            )}

            {!loading && card && (
                <div className="study__card">

                    {card.itemType === 'QUESTION' && card.question && (
                        <>
                            {card.question.topicName && (
                                <div className="study__topic">{card.question.topicName}</div>
                            )}
                            <div className="study__question">{card.question.questionText}</div>

                            {!showAnswer ? (
                                <button className="btn btn--show" onClick={() => setShowAnswer(true)}>
                                    Показать ответ
                                </button>
                            ) : (
                                <div className="study__answer">
                                    {card.media.length > 0 && (
                                        <div className="study__media">
                                            {card.media.map(m => (
                                                <img
                                                    key={m.id}
                                                    src={`http://localhost:8080${m.url}`}
                                                    alt={m.filename}
                                                    className="study__media-img"
                                                    onClick={() => setLightboxUrl(`http://localhost:8080${m.url}`)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {card.question.answerText.map((block, i) =>
                                        block.code
                                            ? <pre key={i}><code>{block.content}</code></pre>
                                            : <p key={i}>{block.content}</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {card.itemType === 'LANGUAGE_ITEM' && card.item && (
                        <>
                            <div className="study__badges">
                                <span className="badge">{card.item.language}</span>
                                <span className="badge">{card.item.type}</span>
                            </div>
                            <div className="study__word">{card.item.word}</div>

                            {!showAnswer ? (
                                <button className="btn btn--show" onClick={() => setShowAnswer(true)}>
                                    Показать перевод
                                </button>
                            ) : (
                                <div className="study__answer">
                                    <div className="study__translation">{card.item.translation}</div>
                                    {card.item.example && (
                                        <div className="study__example">{card.item.example}</div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {!loading && card && showAnswer && (
                <div className="study__actions">
                    <button className="btn btn--incorrect" onClick={handleIncorrect} disabled={answering}>
                        ✗ Не знал
                    </button>
                    <button className="btn btn--correct" onClick={handleCorrect} disabled={answering}>
                        ✓ Знал
                    </button>
                </div>
            )}
        </div>
    )
}
