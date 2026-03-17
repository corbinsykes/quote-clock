import { useState, useEffect, useCallback } from 'react'
import quotesData from './data/quotes.json'
import './App.css'

interface Quote {
  timeInQuote: string
  quote: string
  title: string
  author: string
}

type QuotesMap = Record<string, Quote[]>

const quotes: QuotesMap = quotesData as QuotesMap

function getTimeKey(): string {
  const now = new Date()
  let hours = now.getHours()
  const minutes = String(now.getMinutes()).padStart(2, '0')
  if (hours === 0) hours = 12
  else if (hours > 12) hours -= 12
  return `${hours}:${minutes}`
}

function pickQuote(timeKey: string): Quote | null {
  const options = quotes[timeKey]
  if (!options || options.length === 0) return null
  return options[Math.floor(Math.random() * options.length)]
}

function buildQuoteHtml(quote: string, timeInQuote: string): string {
  // Normalize <br/> tags to newlines
  const normalized = quote.replace(/<br\s*\/?>/gi, '\n')
  if (!timeInQuote) return normalized

  // Escape regex special chars in the time phrase
  const escaped = timeInQuote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'i')
  return normalized.replace(regex, '<mark>$1</mark>')
}

export default function App() {
  const [timeKey, setTimeKey] = useState(getTimeKey)
  const [quote, setQuote] = useState<Quote | null>(() => pickQuote(getTimeKey()))
  const [visible, setVisible] = useState(true)

  const transition = useCallback((newKey: string) => {
    setVisible(false)
    setTimeout(() => {
      setTimeKey(newKey)
      setQuote(pickQuote(newKey))
      setVisible(true)
    }, 700)
  }, [])

  useEffect(() => {
    // Sync to the next minute boundary
    const now = new Date()
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

    const timeout = setTimeout(() => {
      transition(getTimeKey())

      const interval = setInterval(() => {
        transition(getTimeKey())
      }, 60000)

      return () => clearInterval(interval)
    }, msUntilNextMinute)

    return () => clearTimeout(timeout)
  }, [transition])

  const [hours, minutes] = timeKey.split(':')

  return (
    <div className="clock">
      <div className={`content ${visible ? 'visible' : ''}`}>
        {quote ? (
          <>
            <blockquote
              className="quote"
              dangerouslySetInnerHTML={{
                __html: buildQuoteHtml(quote.quote, quote.timeInQuote),
              }}
            />
            <footer className="attribution">
              <em className="title">{quote.title}</em>
              <span className="separator">·</span>
              <span className="author">{quote.author}</span>
            </footer>
          </>
        ) : (
          <p className="no-quote">No quote found for this minute.</p>
        )}
      </div>

      <div className={`time-display ${visible ? 'visible' : ''}`}>
        <span className="time-hours">{hours}</span>
        <span className="time-colon">:</span>
        <span className="time-minutes">{minutes}</span>
      </div>
    </div>
  )
}
