# Publish GitHub Release Artifacts
This GitHub Action will publish artifacts from a build pipeline to a GitHub Release.
It is a lightweight wrapper around the `oktokit` library and strives to be as simple
as possible such that it may be easily audited by teams who may otherwise be cautious
about how they publish artifacts.

## Usage

```yaml
uses: SierraSoftworks/gh-releases@v1.0.3
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  overwrite: 'true'
  files: |
    foo.txt
    bar.txt
    fizz.txt | buzz.txt
```