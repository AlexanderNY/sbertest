import { useMemo, useState } from 'react'

type Deployment = {
  name: string
  labels: string
  pods: string
  autoscaling: number
  restarts: number
  failed: number
}

const deploymentsData: Deployment[] = [
  { name: 'ingressgateway-uamc-core', labels: 'bistr-D-13.001.001-003-UAMCDELTA-5-728-CORE', pods: '1 / 1', autoscaling: 0, restarts: 0, failed: 0 },
  { name: 'ingressgateway-umc-core', labels: 'bistr-D-13.001.001-003-UAMCDELTA-6-728-CORE', pods: '1 / 1', autoscaling: 0, restarts: 0, failed: 0 },
  { name: 'test-ingress-depl-service', labels: 'bistr-D-06.000.001-266-UAMCDELTA-394-CORE', pods: '0 / 0', autoscaling: 0, restarts: 0, failed: 0 },
  { name: 'uamc-udf-service', labels: 'bistr-D-13.001.001-003-UAMCDELTA-6-728', pods: '1 / 1', autoscaling: 0, restarts: 0, failed: 0 },
  { name: 'uamc-core-task-service', labels: 'bistr-D-13.001.001-003-UAMCDELTA-6-728', pods: '1 / 1', autoscaling: 0, restarts: 2, failed: 0 },
  { name: 'uamc-events-consumer-service', labels: 'bistr-D-13.001.001-003-UAMCDELTA-6-728', pods: '1 / 1', autoscaling: 0, restarts: 3, failed: 0 },
  { name: 'uamc-healthcheck-service', labels: 'bistr-D-13.001.001-003-UAMCDELTA-6-728', pods: '1 / 1', autoscaling: 0, restarts: 2, failed: 0 },
  { name: 'uamc-metrics-consumer-service', labels: 'bistr-D-13.001.001-003-UAMCDELTA-5-728', pods: '1 / 1', autoscaling: 0, restarts: 4, failed: 0 },
  { name: 'uamc-udir-sync-service', labels: 'bistr-D-13.001.001-003-UAMCDELTA-6-728', pods: '1 / 1', autoscaling: 0, restarts: 1, failed: 0 },
  { name: 'uamc-v-service', labels: 'bistr-D-13.000.002-023-UAMCDELTA-6-195', pods: '1 / 1', autoscaling: 0, restarts: 0, failed: 0 },
]

const sidebar = [
  { title: 'Workspace', items: ['Overview', 'Deployments', 'StatefulSets', 'Pods'] },
  { title: 'Monitoring', items: ['Events', 'Metrics', 'Log Levels'] },
  { title: 'Networking', items: ['Gateways', 'Routes', 'Policies'] },
]

function MetricBar({ label, req, lim }: { label: string; req: string; lim: string }) {
  return (
    <div className="space-y-1 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="flex items-center gap-2 text-[11px]">
        <span className="w-8 text-slate-500">Req</span>
        <div className="h-1.5 flex-1 rounded bg-slate-100">
          <div className="h-1.5 w-[62%] rounded bg-sky-500" />
        </div>
        <span className="w-12 text-right text-slate-700">{req}</span>
      </div>
      <div className="flex items-center gap-2 text-[11px]">
        <span className="w-8 text-slate-500">Lim</span>
        <div className="h-1.5 flex-1 rounded bg-slate-100">
          <div className="h-1.5 w-[74%] rounded bg-indigo-500" />
        </div>
        <span className="w-12 text-right text-slate-700">{lim}</span>
      </div>
    </div>
  )
}

function SideBar() {
  return (
    <aside className="w-64 shrink-0 bg-slate-950 px-3 py-4 text-slate-200">
      <div className="mb-5 rounded-2xl border border-slate-700/60 bg-slate-900/60 px-3 py-3">
        <div className="text-xs uppercase tracking-[0.22em] text-sky-300">KUPK</div>
        <div className="mt-1 text-sm font-semibold text-white">Deployment Console</div>
        <div className="text-[11px] text-slate-400">Modern operations workspace</div>
      </div>
      {sidebar.map((group) => (
        <div key={group.title} className="mb-4">
          <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{group.title}</div>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = item === 'Deployments'
              return (
                <button
                  key={item}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                    active ? 'bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/40' : 'text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </aside>
  )
}

function TopBar() {
  return (
    <header className="border-b border-slate-200 bg-white/85 px-5 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-sm">
            <option>R13 d ieriepb.k8s.delta</option>
          </select>
          <select className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-sm">
            <option>ci04877241-usmc-core</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden gap-2 xl:flex">
            <MetricBar label="CPU" req="28.3%" lim="44.3%" />
            <MetricBar label="MEM" req="33.8%" lim="41.2%" />
          </div>
          <button className="h-9 rounded-xl border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-50">UI Console</button>
          <button className="h-9 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800">????????</button>
          <div className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-600">11146555 ?????? ?. ?.</div>
        </div>
      </div>
    </header>
  )
}

function DeploymentsPage({
  deployments,
  onOpenDetails,
}: {
  deployments: Deployment[]
  onOpenDetails: (deployment: Deployment) => void
}) {
  return (
    <section className="space-y-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Deployments</h1>
          <p className="text-sm text-slate-500">?????????? ????????? ? ?????????? ????????? ????????.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">10 ?? 10 ???????</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 grid gap-2 xl:grid-cols-[140px_140px_1fr_90px_90px]">
          <select className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-sm">
            <option>??????????</option>
          </select>
          <select className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-sm">
            <option>Name</option>
          </select>
          <input className="h-9 rounded-xl border border-slate-300 px-3 text-sm" placeholder="????? ?? name" />
          <button className="h-9 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50">?????</button>
          <button className="h-9 rounded-xl bg-sky-500 text-sm font-medium text-white hover:bg-sky-600">?????</button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Labels</th>
                <th className="px-3 py-2 font-semibold">Pods</th>
                <th className="px-3 py-2 font-semibold">Autoscaling</th>
                <th className="px-3 py-2 font-semibold">Restarts</th>
                <th className="px-3 py-2 font-semibold">Failed</th>
                <th className="px-3 py-2 font-semibold">YAML</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map((d, i) => (
                <tr
                  key={d.name}
                  className={`cursor-pointer border-t border-slate-200 transition hover:bg-sky-50 ${i % 2 === 1 ? 'bg-slate-50/40' : ''}`}
                  onClick={() => onOpenDetails(d)}
                >
                  <td className="px-3 py-2 font-medium text-slate-900">{d.name}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{d.labels}</td>
                  <td className="px-3 py-2 text-slate-700">{d.pods}</td>
                  <td className="px-3 py-2 text-slate-700">{d.autoscaling}</td>
                  <td className="px-3 py-2 font-medium text-amber-600">{d.restarts}</td>
                  <td className="px-3 py-2 text-slate-700">{d.failed}</td>
                  <td className="px-3 py-2 text-sky-600">YAML</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function DeploymentDetailsPage({
  selectedDeployment,
  onBack,
}: {
  selectedDeployment: Deployment
  onBack: () => void
}) {
  return (
    <section className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" onClick={onBack}>
            Back to Deployments
          </button>
          <span className="text-xs text-slate-500">Deployment details</span>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-sm">
            <option>Actions</option>
          </select>
          <button className="h-9 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800">Refresh</button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{selectedDeployment.name}</h2>
          <div className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Healthy</div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          {['Details', 'YAML', 'Environment', 'Endpoints', 'Events', 'Metrics', 'Logs'].map((tab) => {
            const active = tab === 'Details'
            return (
              <button
                key={tab}
                className={`rounded-xl px-3 py-1.5 ${active ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {tab}
              </button>
            )
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-[180px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
            <div className="mx-auto mb-2 flex h-24 w-24 items-center justify-center rounded-full border-[8px] border-sky-500 bg-white">
              <div>
                <div className="text-3xl font-semibold text-slate-900">1</div>
                <div className="text-xs text-slate-500">Pod</div>
              </div>
            </div>
            <button className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">??????????</button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">CPU</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between"><span className="text-slate-500">Request</span><span className="font-medium">250m</span></div>
                  <div className="h-2 rounded bg-slate-100"><div className="h-2 w-1/2 rounded bg-sky-500" /></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Limit</span><span className="font-medium">500m</span></div>
                  <div className="h-2 rounded bg-slate-100"><div className="h-2 w-4/5 rounded bg-indigo-500" /></div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Memory</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between"><span className="text-slate-500">Request</span><span className="font-medium">800Mi</span></div>
                  <div className="h-2 rounded bg-slate-100"><div className="h-2 w-2/3 rounded bg-sky-500" /></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Limit</span><span className="font-medium">800Mi</span></div>
                  <div className="h-2 rounded bg-slate-100"><div className="h-2 w-2/3 rounded bg-indigo-500" /></div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Container / Image</div>
              <div className="grid gap-2 text-sm xl:grid-cols-[160px_1fr_80px]">
                <div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2">istio-proxy</div>
                <div className="truncate rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs">
                  docker-release.registry.ci.delta.sbrf.ru/cd5041375c/cd5041375/proxyv2:7gsha7526b7b8ffe
                </div>
                <div className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sky-600">v.1</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const deployments = useMemo(() => deploymentsData, [])
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment>(deploymentsData[0])
  const [page, setPage] = useState<'deployments' | 'details'>('deployments')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-100 to-sky-50 text-slate-900">
      <div className="flex min-h-screen">
        <SideBar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-w-0">
            {page === 'deployments' ? (
              <DeploymentsPage
                deployments={deployments}
                onOpenDetails={(deployment) => {
                  setSelectedDeployment(deployment)
                  setPage('details')
                }}
              />
            ) : (
              <DeploymentDetailsPage selectedDeployment={selectedDeployment} onBack={() => setPage('deployments')} />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
