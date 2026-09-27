# RUNLU IndexNow activation

The workflow at `.github/workflows/indexnow.yml` is safe to merge before a key exists. Without the secret it exits successfully and sends nothing.

To activate it once:

1. Generate an IndexNow key using a random hexadecimal string of at least 32 characters.
2. Create a root file named `<KEY>.txt` containing exactly that same key.
3. Add a GitHub Actions repository secret named `INDEXNOW_KEY` with the same value.
4. Merge/push a change to a tracked Foresight page or run the workflow manually.
5. Confirm the workflow receives a successful IndexNow HTTP response.

The public `<KEY>.txt` file is intentionally public because IndexNow uses it to verify site ownership. The GitHub Actions secret prevents the workflow configuration from hard-coding the key.

Current submission source: `guanshi-zh-urls.txt`.
