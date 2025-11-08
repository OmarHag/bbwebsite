'use client'

import { useMemo, useState } from 'react'

// -----------------------------
// Types + Mock Data (same file)
// -----------------------------
type Load = {
  id: string
  origin: string
  destination: string
  distance: number
  weight: number
  rate: number
  pickupWindow: string
  deliveryWindow: string
  shipperRating: number
  status: 'available' | 'in_progress' | 'upcoming' | 'completed'
}

type ChatMessage = { id: string; sender: 'me' | 'them'; text: string; ts: string }

const loadsSeed: Load[] = [
  { id: 'L1', origin: 'Seattle, WA', destination: 'Boise, ID', distance: 498, weight: 32000, rate: 2.9, pickupWindow: 'Nov 9, 8–10am', deliveryWindow: 'Nov 10, 1–4pm', shipperRating: 4.8, status: 'available' },
  { id: 'L2', origin: 'Portland, OR', destination: 'Sacramento, CA', distance: 580, weight: 40000, rate: 2.6, pickupWindow: 'Nov 10, 7–9am', deliveryWindow: 'Nov 11, 9–12pm', shipperRating: 4.7, status: 'available' },
  { id: 'L3', origin: 'Tacoma, WA', destination: 'Spokane, WA', distance: 284, weight: 27000, rate: 3.1, pickupWindow: 'Nov 9, 12–2pm', deliveryWindow: 'Nov 9, 6–8pm', shipperRating: 4.9, status: 'in_progress' },
  { id: 'L4', origin: 'Seattle, WA', destination: 'Yakima, WA', distance: 142, weight: 22000, rate: 3.4, pickupWindow: 'Nov 12, 9–11am', deliveryWindow: 'Nov 12, 1–3pm', shipperRating: 4.6, status: 'upcoming' },
]

const chatSeed: ChatMessage[] = [
  { id: 'C1', sender: 'them', text: 'Hi driver, can you confirm arrival?', ts: new Date().toISOString() },
  { id: 'C2', sender: 'me', text: 'On the way, ETA 12:45.', ts: new Date().toISOString() },
]

const user = {
  name: 'Alex Driver',
  weeklyGoal: 3000,
  earningsToDate: 18750,
  tripsCompleted: 42,
  tripsGoal: 60,
  stepsCompleted: 3,
}

// -----------------------------
// Tab type (define ONCE)
// -----------------------------
type Tab = 'landing' | 'dashboard' | 'loads' | 'messages' | 'profile'

// -----------------------------
// Inline Components (same file)
// -----------------------------
function TopNav({ active, onNav }: { active: Tab; onNav: (key: Tab) => void }) {
  const links: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'loads',     label: 'Loads' },
    { key: 'messages',  label: 'Messages' },
    { key: 'profile',   label: 'Profile' },
  ]
  return (
    <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-40">
      <nav className="container h-14 flex items-center gap-6">
        <button onClick={() => onNav('landing')} className="font-bold text-lg">
          Broker <span className="text-brand-600">Breakers</span>
        </button>
        <div className="flex items-center gap-3 text-sm">
          {links.map(l => (
            <button
              key={l.key}
              onClick={() => onNav(l.key)}
              className={`px-3 py-1.5 rounded-full hover:bg-gray-100 ${active === l.key ? 'bg-brand-50 text-brand-700' : ''}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
}

function SideNav({ onNav }: { onNav: (key: Tab) => void }) {
  return (
    <aside className="hidden md:block w-56 shrink-0 p-4">
      <div className="sticky top-20 space-y-2">
        <button className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100" onClick={() => onNav('dashboard')}>Overview</button>
        <button className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100" onClick={() => onNav('loads')}>Loads</button>
        <button className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100" onClick={() => onNav('messages')}>Messages</button>
        <button className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100" onClick={() => onNav('profile')}>Profile</button>
      </div>
    </aside>
  )
}

function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
    </div>
  )
}

function LoadCard({ load, onAccept }: { load: Load; onAccept?: (l: Load) => void }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border flex items-start justify-between gap-4">
      <div>
        <div className="text-lg font-semibold">{load.origin} → {load.destination}</div>
        <div className="text-sm text-gray-600">{load.distance} mi • {load.weight} lbs • ${load.rate}/mi</div>
        <div className="text-xs text-gray-500 mt-1">Pickup {load.pickupWindow} • Delivery {load.deliveryWindow}</div>
      </div>
      <div className="text-right">
        <div className="text-xl font-bold">${(load.distance * load.rate).toLocaleString()}</div>
        {onAccept && (
          <button onClick={() => onAccept(load)} className="mt-2 inline-flex items-center rounded-full px-4 py-1.5 bg-brand-600 text-white text-sm hover:bg-brand-700">
            Accept
          </button>
        )}
      </div>
    </div>
  )
}

function FilterBar({ onFilter }: { onFilter: (f: { maxDistance?: number; minRate?: number; maxWeight?: number }) => void }) {
  const [maxDistance, setMaxDistance] = useState('')
  const [minRate, setMinRate] = useState('')
  const [maxWeight, setMaxWeight] = useState('')

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm border flex flex-wrap gap-3 items-end">
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Max distance (mi)</label>
        <input value={maxDistance} onChange={e => setMaxDistance(e.target.value)} className="input" placeholder="e.g. 500" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Min rate ($/mi)</label>
        <input value={minRate} onChange={e => setMinRate(e.target.value)} className="input" placeholder="e.g. 2.5" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Max weight (lbs)</label>
        <input value={maxWeight} onChange={e => setMaxWeight(e.target.value)} className="input" placeholder="e.g. 42000" />
      </div>
      <button
        onClick={() =>
          onFilter({
            maxDistance: maxDistance ? Number(maxDistance) : undefined,
            minRate: minRate ? Number(minRate) : undefined,
            maxWeight: maxWeight ? Number(maxWeight) : undefined,
          })
        }
        className="ml-auto rounded-full px-4 py-2 bg-gray-900 text-white text-sm"
      >
        Apply
      </button>
      <style jsx>{`
        .input { @apply rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300; }
      `}</style>
    </div>
  )
}

function ChatThread({ initial }: { initial: ChatMessage[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial)
  const [input, setInput] = useState('')

  const send = (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'me', text, ts: new Date().toISOString() }])
    setInput('')
  }

  const QUICK = ['Arrived at pickup', 'Running 15 minutes late', 'Departed facility', 'Delivered — POD uploaded']

  return (
    <div className="rounded-2xl bg-white border shadow-sm p-3 h-[540px] flex flex-col">
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)} className="rounded-full bg-gray-100 hover:bg-gray-200 px-3 py-1 text-xs">{q}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map(m => (
          <div key={m.id} className={`max-w-[70%] px-3 py-2 rounded-2xl ${m.sender === 'me' ? 'ml-auto bg-brand-600 text-white' : 'bg-gray-100'} `}>
            <div className="text-xs opacity-80 mb-0.5">{new Date(m.ts).toLocaleString()}</div>
            <div className="text-sm">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 rounded-xl border px-3 py-2" placeholder="Type a message…" />
        <button onClick={() => send(input)} className="rounded-xl bg-gray-900 text-white px-4 py-2">Send</button>
      </div>
    </div>
  )
}

function VerificationSteps({ stepsCompleted }: { stepsCompleted: number }) {
  const steps = [
    { title: 'DOT / MC number validation' },
    { title: 'Driver license + insurance' },
    { title: 'Vehicle inspection upload' },
    { title: 'ID & background check' },
    { title: 'Rating system after delivery' },
  ]
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const done = i < stepsCompleted
        return (
          <li key={s.title} className={`p-3 rounded-xl border ${done ? 'border-green-300 bg-green-50' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{i + 1}</span>
              <span className="text-sm font-medium">{s.title}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// -----------------------------
// Single-file App
// -----------------------------
export default function SingleFileApp() {
  const [tab, setTab] = useState<Tab>('landing')
  const [filters, setFilters] = useState<{ maxDistance?: number; minRate?: number; maxWeight?: number }>({})
  const [accepted, setAccepted] = useState<Load[]>([])
  const [allLoads] = useState<Load[]>(loadsSeed)

  const inProgress = allLoads.filter(l => l.status === 'in_progress')
  const upcoming = allLoads.filter(l => l.status === 'upcoming')
  const completedPct = Math.round((user.tripsCompleted / user.tripsGoal) * 100)

  const filteredLoads = useMemo(() => {
    return allLoads.filter(l => {
      if (filters.maxDistance && l.distance > filters.maxDistance) return false
      if (filters.minRate && l.rate < filters.minRate) return false
      if (filters.maxWeight && l.weight > filters.maxWeight) return false
      return l.status === 'available'
    })
  }, [allLoads, filters])

  return (
    <main>
      <TopNav active={tab} onNav={setTab} />

      {/* L A N D I N G */}
      {tab === 'landing' && (
        <section className="container grid lg:grid-cols-2 gap-10 items-center py-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Direct shipper–driver connection
              <span className="block text-brand-600">No brokers. Better margins.</span>
            </h1>
            <p className="mt-4 text-gray-600">
              Find, accept, and deliver loads with a clean, modern dashboard. Track earnings, chat per-load, and
              verify your profile to build trust.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setTab('dashboard')} className="rounded-xl bg-gray-900 text-white px-5 py-3">Open App</button>
              <button onClick={() => setTab('loads')} className="rounded-xl bg-white border px-5 py-3">Browse Loads</button>
            </div>
            <ul className="mt-8 grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <li className="p-3 rounded-xl bg-white border">Earnings & goals at a glance</li>
              <li className="p-3 rounded-xl bg-white border">Loads page for discovery & management</li>
              <li className="p-3 rounded-xl bg-white border">Per-load messaging threads</li>
              <li className="p-3 rounded-xl bg-white border">Profile verification with visual steps</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-white border p-4 shadow-sm">
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-brand-100 to-white grid place-items-center">
              <div className="text-center">
                <div className="text-6xl">🚚</div>
                <div className="mt-2 font-medium text-gray-700">Broker Breakers Demo</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* D A S H B O A R D */}
      {tab === 'dashboard' && (
        <div className="container py-6 flex gap-6">
          <SideNav onNav={setTab} />
          <div className="flex-1 space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total earnings" value={`$${user.earningsToDate.toLocaleString()}`} hint={`Weekly goal $${user.weeklyGoal.toLocaleString()}`} />
              <StatCard title="Trips completed" value={`${user.tripsCompleted}`} hint={`${completedPct}% of goal`} />
              <StatCard title="Active loads" value={`${inProgress.length}`} />
              <StatCard title="Upcoming" value={`${upcoming.length}`} />
            </div>
            <section className="rounded-2xl bg-white border p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Progress</h2>
                <div className="text-sm text-gray-600">Goal {user.tripsGoal} trips</div>
              </div>
              <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500" style={{ width: `${completedPct}%` }} />
              </div>
            </section>
            <section className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white border p-4">
                <h3 className="font-semibold mb-2">In Progress Loads</h3>
                <ul className="space-y-3">
                  {inProgress.map(l => (
                    <li key={l.id} className="text-sm text-gray-700">{l.origin} → {l.destination} • Delivery {l.deliveryWindow}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-white border p-4">
                <h3 className="font-semibold mb-2">Upcoming Loads</h3>
                <ul className="space-y-3">
                  {upcoming.map(l => (
                    <li key={l.id} className="text-sm text-gray-700">{l.origin} → {l.destination} • Pickup {l.pickupWindow}</li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* L O A D S */}
      {tab === 'loads' && (
        <div className="container py-6 flex gap-6">
          <SideNav onNav={setTab} />
          <div className="flex-1 space-y-4">
            <FilterBar onFilter={setFilters} />
            <div className="grid gap-3">
              {filteredLoads.map(l => (
                <LoadCard key={l.id} load={l} onAccept={(ld) => setAccepted(prev => [...prev, ld])} />
              ))}
            </div>
            {accepted.length > 0 && (
              <div className="rounded-2xl bg-green-50 border border-green-300 p-4">
                <div className="font-semibold mb-1">Accepted loads</div>
                <ul className="list-disc pl-4 text-sm text-gray-700">
                  {accepted.map(a => <li key={a.id}>{a.origin} → {a.destination} (${(a.distance * a.rate).toLocaleString()})</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* M E S S A G E S */}
      {tab === 'messages' && (
        <div className="container py-6 flex gap-6">
          <SideNav onNav={setTab} />
          <div className="flex-1 grid lg:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white border p-3 h-[540px] overflow-y-auto">
              <div className="font-semibold mb-2">Conversations</div>
              <ul className="space-y-2 text-sm">
                {loadsSeed.slice(0, 2).map(t => (
                  <li key={t.id} className="p-2 rounded-lg hover:bg-gray-100">
                    <div className="font-medium">{t.origin} → {t.destination}</div>
                    <div className="text-gray-600">Shipper ★ {t.shipperRating}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-2">
              <ChatThread initial={chatSeed} />
            </div>
          </div>
        </div>
      )}

      {/* P R O F I L E */}
      {tab === 'profile' && (
        <div className="container py-6 flex gap-6">
          <SideNav onNav={setTab} />
          <div className="flex-1 grid lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl bg-white border p-4">
                <h2 className="font-semibold">Verification</h2>
                <p className="text-sm text-gray-600">Complete the steps to build trust and unlock faster payouts.</p>
                <div className="mt-3"><VerificationSteps stepsCompleted={user.stepsCompleted} /></div>
              </div>
              <div className="rounded-2xl bg-white border p-4">
                <h2 className="font-semibold">Account Details</h2>
                <div className="grid sm:grid-cols-2 gap-3 mt-2 text-sm">
                  <div>
                    <label className="text-gray-600">Full name</label>
                    <input className="w-full rounded-xl border px-3 py-2 mt-1" defaultValue={user.name} />
                  </div>
                  <div>
                    <label className="text-gray-600">Email</label>
                    <input className="w-full rounded-xl border px-3 py-2 mt-1" defaultValue="alex@example.com" />
                  </div>
                </div>
              </div>
            </section>
            <section className="space-y-4">
              <div className="rounded-2xl bg-white border p-4">
                <h2 className="font-semibold">Billing & Payouts</h2>
                <p className="text-sm text-gray-600">Connect a bank for instant deposits after delivery.</p>
                <button className="mt-3 rounded-xl bg-gray-900 text-white px-4 py-2">Connect Bank</button>
              </div>
              <div className="rounded-2xl bg-white border p-4">
                <h2 className="font-semibold">Documents</h2>
                <ul className="text-sm list-disc pl-5 text-gray-700">
                  <li>Driver License.pdf — <button className="underline">Upload</button></li>
                  <li>Insurance.pdf — <button className="underline">Upload</button></li>
                  <li>Vehicle Inspection.pdf — <button className="underline">Upload</button></li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  )
}
