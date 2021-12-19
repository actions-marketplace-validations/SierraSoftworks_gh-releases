import * as core from '@actions/core'
import { context } from '@actions/github'
export function getReleaseTag(): string {
    const tag = core.getInput('release_tag') || getReleaseActionTag() || getRefTag()

    if (!tag) {
        throw new Error('No release tag found for this action, please specify it in the action input.')
    }

    return tag
}

function getReleaseActionTag(): string|undefined {
    if (context.eventName === 'release') {
        return context.payload.release.tag_name
    }

    return undefined
}

function getRefTag(): string|undefined {
    if (context.ref.startsWith('refs/tags/'))
    {
        return context.ref.substring('refs/tags/'.length)
    }

    return undefined
}