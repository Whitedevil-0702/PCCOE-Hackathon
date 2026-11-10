import { seedDemo } from './seed'
import { startSync } from './syncEngine'

const captions = [
  'Preparing local response examples…',
  'Assessments are stored on this device first.',
  'Triage priorities use reported damage and local context.',
  'Attempting to sync queued assessments when connectivity allows.',
]

export async function runDemo(opts: { onCaption: (text: string) => void }): Promise<void> {
  for (const caption of captions.slice(0, 3)) {
    opts.onCaption(caption)
    await new Promise((resolve) => setTimeout(resolve, 700))
  }
  await seedDemo(5)
  opts.onCaption(captions[3])
  await startSync()
}
