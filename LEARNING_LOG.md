### 20 October 2026 ###

1. Fixed the bugs with Claude Code on UseChatStore where there was a hook hiding below six early reruns. I then re-checked the website (no progress since a week ago) by testing generic numbers to find out how the website will respond if there is no data or no result, with a functional "go-back" button.

2. Implemented another code where loading state, clear message, and expand bio options are visible, allowing for more intuitiveness.

3. Removing something can break something else. Claude Code warned me about phone navigation before I found it, and now I know to ask ‘what did this change break?’ after every fix.

4. Verdict: I'm creating a website that is functional first, and aesthetics and distinctiveness second.

## 2026-10-20 · Person page
What broke: "Known for" row was empty.
Why: TMDB's person call doesn't include known_for. It comes from a different call (combined_credits).
Next time: read the API's answer before building the screen.

## 25 October 2026 ##
One error repeated 9 times can be a single cause. process is unknown means the Node types aren’t loaded, so first check that the package is really installed.

### Project entries:
Oct 11: Key file was named VITE_TMDB_API_KEY.env, but Vite only reads .env.local.
Oct 12: vite build doesn’t check types, so npx tsc --noEmit is a separate check.
Oct 13: Hooks go at the top, before any early return.
Oct 20: The 400 error came from the model setting, not the Wi-Fi.