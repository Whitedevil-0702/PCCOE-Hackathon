# UI requests for core

- `Assessment` does not expose a retry delay or next retry timestamp. Queue rows therefore show the true attempt count and "Retry scheduled" without inventing a countdown.
- `SyncEvent` has no event timestamp or assessment sequence number. The event log labels event times as "Live" and identifies records by UUID prefix.
- The hooks do not provide storage usage, last sync time for the local database, or geocoding. The UI omits storage and last-sync figures and leaves map records without coordinates unplotted; location labels remain editable in Field Upload.
- `useQueue` contains queued and syncing records only; failed records are currently omitted from the queue view.
- `useCentral` returns cloud records without a synced timestamp, so Central displays status and assessment details without a fabricated sync time.
