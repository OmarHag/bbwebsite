'use client'

import { useMemo, useState } from 'react'

/* ===========================
   Types + Mock Data
=========================== */
type Role = 'driver' | 'shipper'
type Tab =
  | 'landing'
  | 'signup'
  | 'dashboard'
  | 'loads'
  | 'messages'
  | 'profile'
  | 'support'

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

// simple mock “earnings by month”
const earningsByMonth = [
  { month: 'May', amount: 4200 },
  { month: 'Jun', amount: 6100 },
  { month: 'Jul', amount: 5300 },
  { month: 'Aug', amount: 7200 },
  { month: 'Sep', amount: 6800 },
  { month: 'Oct', amount: 7550 },
]

/* ===========================
   UI Building Blocks
=========================== */
function TopNav({ active, onNav }: { active: Tab; onNav: (key: Tab) => void }) {
  const links: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'loads',     label: 'Loads' },
    { key: 'messages',  label: 'Messages' },
    { key: 'profile',   label: 'Profile' },
    { key: 'support',   label: 'Support' },
  ]
  return (
    <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-40">
      <nav className="container h-14 flex items-center gap-6">
        <button onClick={() => onNav('landing')} className="font-bold text-lg flex items-center gap-2">
          <span className="text-2xl">🚛</span>
          <span>Broker <span className="text-brand-600">Breakers</span></span>
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
        <button className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100" onClick={() => onNav('support')}>Support</button>
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

function EarningsSpark({ data }: { data: { month: string; amount: number }[] }) {
  const max = Math.max(...data.map(d => d.amount))
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Earnings by month</h3>
        <div className="text-sm text-gray-600">Last 6 months</div>
      </div>
      <div className="mt-4 grid grid-cols-6 gap-3 items-end h-32">
        {data.map(d => (
          <div key={d.month} className="text-center">
            <div className="mx-auto w-8 rounded-md bg-brand-500" style={{ height: `${Math.max(8, (d.amount / max) * 100)}%` }} />
            <div className="mt-1 text-xs text-gray-600">{d.month}</div>
            <div className="text-[11px] text-gray-500">${d.amount.toLocaleString()}</div>
          </div>
        ))}
      </div>
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

function FilterBar({
  onFilter
}: {
  onFilter: (f: { q?: string; origin?: string; destination?: string; maxDistance?: number; minRate?: number; maxWeight?: number }) => void
}) {
  const [q, setQ] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [maxDistance, setMaxDistance] = useState('')
  const [minRate, setMinRate] = useState('')
  const [maxWeight, setMaxWeight] = useState('')

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm border flex flex-wrap gap-3 items-end">
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Search</label>
        <input value={q} onChange={e => setQ(e.target.value)} className="input" placeholder="text, city, state…" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Origin</label>
        <input value={origin} onChange={e => setOrigin(e.target.value)} className="input" placeholder="e.g. Seattle, WA" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Destination</label>
        <input value={destination} onChange={e => setDestination(e.target.value)} className="input" placeholder="e.g. Boise, ID" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Max distance (mi)</label>
        <input value={maxDistance} onChange={e => setMaxDistance(e.target.value)} className="input" placeholder="500" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Min rate ($/mi)</label>
        <input value={minRate} onChange={e => setMinRate(e.target.value)} className="input" placeholder="2.5" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Max weight (lbs)</label>
        <input value={maxWeight} onChange={e => setMaxWeight(e.target.value)} className="input" placeholder="42000" />
      </div>
      <button
        onClick={() =>
          onFilter({
            q: q || undefined,
            origin: origin || undefined,
            destination: destination || undefined,
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

function SignupCard({
  role,
  onSubmit
}: {
  role: Role
  onSubmit: (payload: { role: Role; name: string; email: string; company?: string }) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')

  return (
    <div className="rounded-2xl bg-white border p-4 shadow-sm">
      <h3 className="font-semibold mb-1 capitalize">{role} sign up</h3>
      <p className="text-sm text-gray-600 mb-3">
        Create your account and start the {role === 'driver' ? 'verification' : 'load posting'} process.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-600">Full name</label>
          <input className="w-full rounded-xl border px-3 py-2 mt-1" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <label className="text-xs text-gray-600">Email</label>
          <input className="w-full rounded-xl border px-3 py-2 mt-1" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        {role === 'shipper' && (
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-600">Company (optional)</label>
            <input className="w-full rounded-xl border px-3 py-2 mt-1" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company LLC" />
          </div>
        )}
      </div>
      <button
        onClick={() => onSubmit({ role, name, email, company: company || undefined })}
        className="mt-4 rounded-xl bg-gray-900 text-white px-4 py-2"
      >
        Continue
      </button>
    </div>
  )
}

/* ===========================
   App (single file)
=========================== */
export default function App() {
  const [tab, setTab] = useState<Tab>('landing')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [filters, setFilters] = useState<{ q?: string; origin?: string; destination?: string; maxDistance?: number; minRate?: number; maxWeight?: number }>({})
  const [accepted, setAccepted] = useState<Load[]>([])
  const [allLoads] = useState<Load[]>(loadsSeed)
  const [verificationStepsDone, setVerificationStepsDone] = useState(user.stepsCompleted)

  const inProgress = allLoads.filter(l => l.status === 'in_progress')
  const upcoming = allLoads.filter(l => l.status === 'upcoming')
  const completedPct = Math.round((user.tripsCompleted / user.tripsGoal) * 100)

  const filteredLoads = useMemo(() => {
    return allLoads.filter(l => {
      if (filters.q) {
        const q = filters.q.toLowerCase()
        const hay = `${l.origin} ${l.destination}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filters.origin && !l.origin.toLowerCase().includes(filters.origin.toLowerCase())) return false
      if (filters.destination && !l.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false
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
              Sign up as a <strong>Driver</strong> to find and deliver loads, or as a <strong>Shipper</strong> to post loads and book trusted drivers.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white border p-4">
                <h3 className="font-semibold">For Drivers</h3>
                <p className="text-sm text-gray-600">Browse loads, chat per-load, track earnings, and complete a quick verification checklist.</p>
                <button
                  onClick={() => { setSelectedRole('driver'); setTab('signup') }}
                  className="mt-3 rounded-xl bg-gray-900 text-white px-4 py-2"
                >
                  Sign up as Driver
                </button>
              </div>
              <div className="rounded-2xl bg-white border p-4">
                <h3 className="font-semibold">For Shippers</h3>
                <p className="text-sm text-gray-600">Post loads, review driver verification, and manage deliveries end-to-end.</p>
                <button
                  onClick={() => { setSelectedRole('shipper'); setTab('signup') }}
                  className="mt-3 rounded-xl bg-white border px-4 py-2"
                >
                  Sign up as Shipper
                </button>
              </div>
            </div>
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

      {/* S I G N U P  +  V E R I F Y */}
      {tab === 'signup' && (
        <div className="container py-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <SignupCard
              role={selectedRole ?? 'driver'}
              onSubmit={() => {
                // mimic step progress after "submit"
                setVerificationStepsDone(2)
                setTab('profile')
              }}
            />
            <div className="rounded-2xl bg-white border p-4">
              <h3 className="font-semibold">Why verify?</h3>
              <p className="text-sm text-gray-600">
                Verification builds trust and unlocks faster payouts and priority bookings.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border p-4">
              <h3 className="font-semibold">Verification checklist</h3>
              <VerificationSteps stepsCompleted={verificationStepsDone} />
              <button className="mt-3 rounded-xl bg-gray-900 text-white px-4 py-2" onClick={() => setTab('dashboard')}>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
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

            <EarningsSpark data={earningsByMonth} />

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

      {/* L O A D S  (with search + filters) */}
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
                <div className="mt-3"><VerificationSteps stepsCompleted={verificationStepsDone} /></div>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-xl bg-gray-900 text-white px-4 py-2" onClick={() => setVerificationStepsDone(v => Math.min(5, v + 1))}>Mark next step done</button>
                  <button className="rounded-xl bg-white border px-4 py-2" onClick={() => setVerificationStepsDone(0)}>Reset</button>
                </div>
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

      {/* S U P P O R T */}
      {tab === 'support' && (
        <div className="container py-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-white border p-4">
              <h2 className="font-semibold">Support Center</h2>
              <p className="text-sm text-gray-600">We’re here to help drivers and shippers succeed on Broker Breakers.</p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border p-3">
                  <div className="font-medium">Account & Verification</div>
                  <div className="text-gray-600 mt-1">How to complete DOT/MC checks, insurance, and background verification.</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="font-medium">Loads & Booking</div>
                  <div className="text-gray-600 mt-1">Posting loads, filtering, accepting, delivery confirmation, and POD.</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="font-medium">Payouts</div>
                  <div className="text-gray-600 mt-1">Connecting a bank and payment timelines.</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="font-medium">Safety</div>
                  <div className="text-gray-600 mt-1">Ratings, disputes, and community guidelines.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border p-4">
              <h3 className="font-semibold">Contact support</h3>
              <div className="mt-2 grid gap-2 text-sm">
                <input className="rounded-xl border px-3 py-2" placeholder="Your email" />
                <textarea className="rounded-xl border px-3 py-2" rows={4} placeholder="Tell us what you need help with…" />
                <button className="rounded-xl bg-gray-900 text-white px-4 py-2">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
