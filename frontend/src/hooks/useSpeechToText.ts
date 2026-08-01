import { useEffect, useRef, useState } from 'react'

// Minimal typing for the Web Speech API — not in TS's DOM lib since it's
// non-standard (Chrome/Edge only; no Safari/Firefox support as of writing).
interface SpeechRecognitionResultEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/** Browser-native speech-to-text (Web Speech API). Calls onResult with the final transcript once speech ends. */
export const useSpeechToText = (onResult: (transcript: string) => void) => {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  const supported = getSpeechRecognitionConstructor() !== null

  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  const start = () => {
    const Recognition = getSpeechRecognitionConstructor()
    if (!Recognition || listening) return

    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) onResultRef.current(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return { supported, listening, start, stop }
}
