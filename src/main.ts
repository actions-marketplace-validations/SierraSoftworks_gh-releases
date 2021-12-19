import * as core from '@actions/core'
import {getOctokit, context} from '@actions/github'
import { readFile } from './files'
import { parseFileSpec } from './parser'
import { getReleaseTag } from './release'

async function run(): Promise<void> {
  try {
    const files = core.getMultilineInput('files', {required: true}).map(parseFileSpec)

    if (!files.length) {
      core.warning('No files were specified, nothing to do.')
      return
    }

    const token: string = core.getInput('token', {required: true})
    const octokit = getOctokit(token)

    const releaseTag = getReleaseTag()
    core.debug(`Resolved release tag to: ${releaseTag}`)

    core.debug('Getting release metadata from GitHub API')
    const release = await octokit.rest.repos.getReleaseByTag({
      owner: context.repo.owner,
      repo: context.repo.repo,
      tag: releaseTag,
    })

    core.debug(`Found release ${release.data.tag_name} with ID ${release.data.id}`)

    if (!files.length)
    {
      throw new Error('No files were specified in the action input.')
    }

    await Promise.all(files.map(async file => {
      core.debug(`Reading file ${file.source}`)
      const data = await readFile(file.source)

      core.debug(`Uploading file ${file.target} (${data.length} bytes)`)
      const upload = await octokit.rest.repos.uploadReleaseAsset({
        owner: context.repo.owner,
        repo: context.repo.repo,
        release_id: release.data.id,
        name: file.target,
        data: data,
      })
      core.info(`Uploaded file ${file.target}, permalink is: ${upload.data.browser_download_url}`)
    }))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
