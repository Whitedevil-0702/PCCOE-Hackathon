# ResQEdge demo script (2:30)

## Narration and timing

| Time | Narration and action |
| --- | --- |
| 0:00–0:15 | “ResQEdge is an offline first damage assessment and response triage prototype. It keeps field assessments on this device and queues them for synchronization when connectivity is available.” Show the dashboard and connectivity control. |
| 0:15–0:35 | “The command view summarizes this session’s assessments and queue. The values shown come from the local session and saved records; they are operational measures, not model accuracy claims.” Point to the metrics strip and priority counts. |
| 0:35–0:55 | “I’ll switch the network simulator to Offline and open Field. A field worker can select an image and enter location context such as population density, nearby infrastructure, and road access.” Set Offline, open Field, select a sample image, enter the context. |
| 0:55–1:20 | “The browser attempts local image classification. When the model is unavailable, the app uses its low confidence rule based fallback. Severity and confidence are estimates for triage support.” Run the assessment and show the result source and values. |
| 1:20–1:40 | “The assessment is saved locally with a UUID and display sequence. Triage combines the estimated severity with the entered context to suggest a response priority and a short reason.” Save it and point out the queued item and reason. |
| 1:40–2:00 | “The queue sorts Critical, High, Medium, then Low. Offline work stays on this device, and the progress view reports synchronization events as they happen.” Show the queue and progress panel. |
| 2:00–2:20 | “I’ll restore connectivity. The sync engine sends queued records in priority order, retries transient failures with increasing delays, and uses the assessment UUID to make repeated writes idempotent.” Switch Online and show queue progress. |
| 2:20–2:30 | “These results support response planning. They are not a structural safety judgment.” Show the decision support note and close. |

## Pre-recording checklist

- [ ] Start the app and open `/dashboard`; confirm the browser loads the app before disconnecting.
- [ ] Confirm the model is initialized once while online if demonstrating the model path. If it is unavailable, narrate the fallback honestly.
- [ ] Confirm at least one image exists in `/public/samples` and can be opened in Field.
- [ ] Start with a clear demo database, then check that the dashboard counts reflect the records actually present.
- [ ] Confirm the network simulator can switch between Offline and Online and that the local queue remains visible offline.
- [ ] If demonstrating `/central`, confirm the API is running; otherwise skip the cloud view.
- [ ] Keep the “Decision-support, not a structural safety judgment.” note visible for the result segment.
- [ ] Do not claim accuracy, guaranteed connectivity, or structural safety conclusions.
