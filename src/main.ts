import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import {getReleaseTag} from './release'
import {parseFileSpec} from './parser'
import {readFile} from 'fs/promises'
import {getSignatures} from './vault'

async function run(): Promise<void> {
  try {
    const files = core
      .getMultilineInput('files', {required: true})
      .map(parseFileSpec)

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
      tag: releaseTag
    })

    core.debug(
      `Found release ${release.data.tag_name} with ID ${release.data.id}`
    )

    const overwrite = core.getBooleanInput('overwrite', {required: false})
    if (overwrite) {
      const filesToUpload = files.map(f => f.target)
      const assetsToOverwrite = release.data.assets.filter(asset =>
        filesToUpload.includes(asset.name)
      )

      if (assetsToOverwrite.length) {
        core.debug(`Removing ${assetsToOverwrite.length} existing assets`)
        await Promise.all(
          assetsToOverwrite.map(
            async asset =>
              await octokit.rest.repos.deleteReleaseAsset({
                owner: context.repo.owner,
                repo: context.repo.repo,
                asset_id: asset.id
              })
          )
        )
      }
    }

    await Promise.all(
      files.map(async file => {
        core.debug(`Reading file ${file.source}`)
        const data = await readFile(file.source)

        core.debug(`Uploading file ${file.target} (${data.length} bytes)`)

        const upload = await octokit.rest.repos.uploadReleaseAsset({
          owner: context.repo.owner,
          repo: context.repo.repo,
          release_id: release.data.id,
          name: file.target,
          data: data as unknown as string
        })
        core.info(
          `Uploaded file ${file.target}, permalink is: ${upload.data.browser_download_url}`
        )
      })
    )

    const signatures = await getSignatures(files)
    core.debug(`Received ${signatures.length} signatures from Vault`)

    await Promise.all(
      signatures.map(async signature => {
        core.debug(`Uploading signature ${signature.file}.sig`)

        const upload = await octokit.rest.repos.uploadReleaseAsset({
          owner: context.repo.owner,
          repo: context.repo.repo,
          release_id: release.data.id,
          name: `${signature.file}.sig`,
          data: signature.signature
        })
        core.info(
          `Uploaded signature ${signature.file}, permalink is: ${upload.data.browser_download_url}`
        )
      })
    )
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
      error.stack && core.error(error.stack)
    }
  }
}

run()
