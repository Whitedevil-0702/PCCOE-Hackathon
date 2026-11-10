import { useEffect, useRef, useState } from 'react'
import type { ContextInput } from '../lib/types'
import type { FieldAssessmentResult, PipelineStep } from '../components/_fixtures'
import { fixtureContext, fixtureFieldResult, fixtureImage } from '../components/_fixtures'

export function useFixtureCapture() {
  const [imageUrl, setImageUrl] = useState<string | null>(fixtureImage)
  const [running, setRunning] = useState(false)
  const [saved, setSaved] = useState(false)
  const [result, setResult] = useState<FieldAssessmentResult | null>(fixtureFieldResult)
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('saved')
  const [pipelineMs, setPipelineMs] = useState(1840)
  const [context, setContext] = useState<ContextInput>(fixtureContext)
  const [locationLabel, setLocationLabel] = useState('Riverside Clinic · Sector 7')
  const timersRef = useRef<number[]>([])
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay)
    timersRef.current.push(timer)
  }

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
  }

  const run = () => {
    clearTimers()
    setRunning(true)
    setSaved(false)
    setResult(null)
    setPipelineStep('preprocess')
    setPipelineMs(0)
    schedule(() => {
      setPipelineStep('inference')
      setPipelineMs(620)
    }, 400)
    schedule(() => {
      setPipelineStep('triage')
      setPipelineMs(1240)
    }, 900)
    schedule(() => {
      setResult(fixtureFieldResult)
      setPipelineStep('saved')
      setPipelineMs(1840)
      setRunning(false)
    }, 1500)
  }

  const selectFile = (file: File) => {
    clearTimers()
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const nextUrl = URL.createObjectURL(file)
    objectUrlRef.current = nextUrl
    setImageUrl(nextUrl)
    setResult(null)
    setSaved(false)
    setPipelineStep('idle')
    setPipelineMs(0)
    setRunning(false)
  }

  const selectSample = (src: string) => {
    clearTimers()
    setImageUrl(src)
    setResult(null)
    setSaved(false)
    setPipelineStep('idle')
    setPipelineMs(0)
    setRunning(false)
  }

  const clear = () => {
    clearTimers()
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setImageUrl(null)
    setResult(null)
    setSaved(false)
    setPipelineStep('idle')
    setPipelineMs(0)
    setRunning(false)
  }

  const save = () => setSaved(true)

  return {
    imageUrl,
    running,
    saved,
    result,
    pipelineStep,
    pipelineMs,
    context,
    setContext,
    locationLabel,
    setLocationLabel,
    run,
    selectFile,
    selectSample,
    clear,
    save,
  }
}
