import { useEffect, useMemo, useState } from 'react'

type EnvironmentInfo = {
  branch: string
  repository: string
  domain: string
}

const REPOSITORY = 'hello-world-frontend'
const DEFAULT_DOMAIN = 'main-hello-world-frontend.cog.rpotential.dev'

function parseEnvironmentFromHostname(hostname: string): EnvironmentInfo {
  const fallback: EnvironmentInfo = {
    branch: 'main',
    repository: REPOSITORY,
    domain: DEFAULT_DOMAIN,
  }

  if (!hostname) {
    return fallback
  }

  if (!hostname.includes('cog.rpotential.dev')) {
    return { ...fallback, domain: hostname }
  }

  const [subdomain] = hostname.split('.')
  if (!subdomain || !subdomain.includes('-')) {
    return { ...fallback, domain: hostname }
  }

  const firstDashIndex = subdomain.indexOf('-')
  const branch = subdomain.slice(0, firstDashIndex).trim()
  const repo = subdomain.slice(firstDashIndex + 1).trim()

  return {
    branch: branch || fallback.branch,
    repository: repo || fallback.repository,
    domain: hostname,
  }
}

export function HomePage() {
  const [deployedAt, setDeployedAt] = useState('')

  useEffect(() => {
    setDeployedAt(new Date().toISOString())
  }, [])

  const environment = useMemo(() => {
    if (typeof window === 'undefined') {
      return parseEnvironmentFromHostname('')
    }

    return parseEnvironmentFromHostname(window.location.hostname)
  }, [])

  return (
    <main className="page-root">
      <section className="container-card">
        <header className="card-header">
          <h1>rPotential Example Frontend</h1>
          <p>rPotential Azure Static Web App style template in the Vite reference stack</p>
          <span className="badge badge-success">Public Access</span>
          <span className="badge">rPotential</span>
        </header>

        <article className="info-card info-card-environment">
          <h2>Environment Information</h2>
          <p>
            <strong>Branch:</strong> <code>{environment.branch}</code>
          </p>
          <p>
            <strong>Repository:</strong> <code>{environment.repository}</code>
          </p>
          <p>
            <strong>Domain:</strong> <code>{environment.domain}</code>
          </p>
          <p>
            <strong>Deployed at:</strong> <code>{deployedAt || 'loading...'}</code>
          </p>
        </article>

        <article className="info-card">
          <h2>Deployment Features</h2>
          <ul>
            <li>Automatic deployment from CI/CD</li>
            <li>Branch-based custom domains</li>
            <li>Static asset hosting with SPA fallback</li>
            <li>Environment-specific domain patterns</li>
            <li>Public access by default</li>
          </ul>
        </article>

        <article className="info-card">
          <h2>Technical Stack</h2>
          <ul>
            <li>
              <strong>Frontend:</strong> React + TypeScript
            </li>
            <li>
              <strong>Bundler:</strong> Vite
            </li>
            <li>
              <strong>Hosting Pattern:</strong> Static assets + Worker entrypoint
            </li>
            <li>
              <strong>Runtime:</strong> Cloudflare Workers
            </li>
          </ul>
        </article>

        <article className="info-card">
          <h2>Available Domain Examples</h2>
          <ul>
            <li>
              <strong>Main:</strong>{' '}
              <a href="https://main-hello-world-frontend.cog.rpotential.dev" target="_blank" rel="noreferrer">
                main-hello-world-frontend.cog.rpotential.dev
              </a>
            </li>
            <li>
              <strong>Develop:</strong>{' '}
              <a href="https://develop-hello-world-frontend.cog.rpotential.dev" target="_blank" rel="noreferrer">
                develop-hello-world-frontend.cog.rpotential.dev
              </a>
            </li>
          </ul>
        </article>

        <article className="info-card">
          <h2>How to Use This Template</h2>
          <ol>
            <li>Update the page content for your product or project.</li>
            <li>Adjust domain parsing logic for your own naming convention.</li>
            <li>Deploy and verify branch-specific URL behavior.</li>
          </ol>
        </article>

        <article className="info-card">
          <h2>Template Origin</h2>
          <p>
            This starter is preconfigured with rPotential domain and Azure Static Web Apps workflow patterns.
          </p>
        </article>
      </section>
    </main>
  )
}
