How to report progress from the pamięć game

This game registers a global function `window.reportGameProgress` when mounted. The game calls this function on game end.

The function sends progress to `/api/user/progress` with:
{
content_type: 'game',
content_id: 'pamiec',
progress: { completed: boolean, score: number, attempts: number, details: { found, total } }
}

If you have another game, follow the same pattern:

-   In the React component mount, set `window.reportGameProgress = (payload) => fetch('/api/user/progress', { method: 'POST', body: JSON.stringify({ content_type: 'game', content_id: 'yourGameId', progress: payload }) })`
-   Call `window.reportGameProgress(payload)` from non-React helper functions when the game ends.

Alternatively, import and use the `useReportProgress` hook (recommended) inside React components to report progress programmatically.
