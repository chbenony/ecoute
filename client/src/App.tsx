import {useState} from 'react'
import axios from 'axios'
import './App.css'

const API = 'http://localhost:3000'

interface Recommendation {
    rank: number
    title: string
    artist: string
    reasoning: string
}

interface HistoryRound {
    id: number
    theme: string
    submitted_song: string | null
    submitted_artist: string | null
    score: number | null
    vibes: string | null
    created_at: string
}

const VIBES = [
    {label: 'lateral thinking', color: 'pink'},
    {label: 'deep cuts', color: 'cyan'},
    {label: 'obvious banger', color: 'yellow'},
    {label: 'emotional gut punch', color: 'pink'},
    {label: 'genre blend', color: 'cyan'},
    {label: 'subversive pick', color: 'yellow'},
]

export default function App(){
    const [theme, setTheme] = useState('')
    const [context, setContext] = useState('')
    const [selectedVibes, setSelectedVibes] = useState<string[]>([])
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [history, setHistory] = useState<HistoryRound[]>([])
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'recommend' | 'history'>('recommend')
    const [currentRoundId, setCurrentRoundId] = useState<number | null>(null)
    const [submittedSong, setSubmittedSong] = useState('')
    const [submittedArtist, setSubmittedArtist] = useState('')
    const [score, setScore] = useState('') 
    
    const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev =>
        prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    )
}

const getRecommendations = async () => {
    if (!theme.trim()) return
    setLoading(true)
    try {
        const res = await axios.post(`${API}/recommend`, {
            theme,
            context: context || undefined,
            vibes: selectedVibes.length ? selectedVibes : undefined,
        })
        setRecommendations(res.data.recommendations)
        setCurrentRoundId(res.data.roundId)
    } catch(err) {
        console.error(err)
    } finally {
        setLoading(false)
    }
}

const loadHistory = async () => {
    try {
        const res = await axios.get(`${API}/recommend/history`)
        setHistory(res.data.history)
    } catch(err) {
        console.error(err)
    }
}

const submitScore = async () => {
    if (!currentRoundId || !submittedSong || !score) return
    try {
        await axios.patch(`${API}/recommend/${currentRoundId}/score`, {
            submittedSong,
            submittedArtist,
            score: parseInt(score),
        })
        setSubmittedSong('')
        setSubmittedArtist('')
        setScore('')
        alert('score saved! 🎉')
    } catch (err){
        console.error(err)
    }
    }

    return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          background: 'linear-gradient(90deg, #f97aff, #7af6ff, #ffe07a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.25rem'
        }}>écoute</h1>
        <p style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          music league · song recommender · powered by Claude
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {(['recommend', 'history'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'history') loadHistory() }}
            style={{
              padding: '6px 16px',
              borderRadius: 999,
              border: `1px solid ${activeTab === tab ? '#f97aff' : '#2a2a2e'}`,
              background: activeTab === tab ? '#1e121f' : 'transparent',
              color: activeTab === tab ? '#f97aff' : '#555',
              fontFamily: 'DM Mono',
              fontSize: 11,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'recommend' && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>
            this round's theme
          </p>
          <input
            value={theme}
            onChange={e => setTheme(e.target.value)}
            placeholder="e.g. songs about running away..."
            style={{
              width: '100%', background: '#17171a', border: '1px solid #2a2a2e',
              borderRadius: 12, padding: '1rem 1.25rem', fontFamily: 'Syne',
              fontSize: '1rem', color: '#f0eee8', boxSizing: 'border-box',
              outline: 'none', marginBottom: '1.25rem'
            }}
          />

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>
            league context (optional)
          </p>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="e.g. my league leans indie, they sleep on kpop..."
            style={{
              width: '100%', background: '#17171a', border: '1px solid #2a2a2e',
              borderRadius: 12, padding: '0.875rem 1.25rem', fontFamily: 'DM Mono',
              fontSize: '0.8rem', color: '#aaa', boxSizing: 'border-box',
              outline: 'none', resize: 'none', height: 80, marginBottom: '1.25rem'
            }}
          />

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>
            strategy vibe
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {VIBES.map(({ label, color }) => {
              const active = selectedVibes.includes(label)
              const colors: Record<string, { border: string, text: string, bg: string }> = {
                pink: { border: '#f97aff', text: '#f97aff', bg: '#1e121f' },
                cyan: { border: '#7af6ff', text: '#7af6ff', bg: '#101e1f' },
                yellow: { border: '#ffe07a', text: '#ffe07a', bg: '#1e1b0f' },
              }
              return (
                <button key={label} onClick={() => toggleVibe(label)}
                  style={{
                    background: active ? colors[color].bg : '#17171a',
                    border: `1px solid ${active ? colors[color].border : '#2a2a2e'}`,
                    borderRadius: 999, padding: '5px 14px', fontSize: 11,
                    fontFamily: 'DM Mono', color: active ? colors[color].text : '#666',
                    cursor: 'pointer'
                  }}>
                  {label}
                </button>
              )
            })}
          </div>

          <button onClick={getRecommendations} disabled={loading || !theme.trim()}
            style={{
              width: '100%', padding: '1rem',
              background: 'linear-gradient(90deg, #f97aff22, #7af6ff22)',
              border: '1px solid #f97aff55', borderRadius: 12,
              fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem',
              color: loading ? '#555' : '#f97aff', cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em', marginBottom: '1.5rem'
            }}>
            {loading ? 'asking écoute...' : 'get recommendations ↗'}
          </button>

          {recommendations.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>
                recommendations
              </p>
              {recommendations.map(rec => (
                <div key={rec.rank} style={{
                  background: '#17171a', border: '1px solid #2a2a2e',
                  borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#f97aff' }}>#{rec.rank}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rec.title}</span>
                    <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#555' }}>— {rec.artist}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.6, fontFamily: 'DM Mono' }}>
                    {rec.reasoning}
                  </p>
                </div>
              ))}

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #1e1e22', paddingTop: '1.5rem' }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>
                  log your pick + score
                </p>
                <input value={submittedSong} onChange={e => setSubmittedSong(e.target.value)}
                  placeholder="song you submitted"
                  style={{
                    width: '100%', background: '#17171a', border: '1px solid #2a2a2e',
                    borderRadius: 12, padding: '0.75rem 1.25rem', fontFamily: 'Syne',
                    fontSize: '0.9rem', color: '#f0eee8', boxSizing: 'border-box',
                    outline: 'none', marginBottom: 8
                  }} />
                <input value={submittedArtist} onChange={e => setSubmittedArtist(e.target.value)}
                  placeholder="artist"
                  style={{
                    width: '100%', background: '#17171a', border: '1px solid #2a2a2e',
                    borderRadius: 12, padding: '0.75rem 1.25rem', fontFamily: 'Syne',
                    fontSize: '0.9rem', color: '#f0eee8', boxSizing: 'border-box',
                    outline: 'none', marginBottom: 8
                  }} />
                <input value={score} onChange={e => setScore(e.target.value)}
                  placeholder="your score" type="number"
                  style={{
                    width: '100%', background: '#17171a', border: '1px solid #2a2a2e',
                    borderRadius: 12, padding: '0.75rem 1.25rem', fontFamily: 'Syne',
                    fontSize: '0.9rem', color: '#f0eee8', boxSizing: 'border-box',
                    outline: 'none', marginBottom: 8
                  }} />
                <button onClick={submitScore}
                  style={{
                    width: '100%', padding: '0.75rem',
                    background: 'linear-gradient(90deg, #ffe07a22, #f97aff22)',
                    border: '1px solid #ffe07a55', borderRadius: 12,
                    fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem',
                    color: '#ffe07a', cursor: 'pointer'
                  }}>
                  save score ↗
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>
            past rounds
          </p>
          {history.length === 0 ? (
            <p style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#2e2e32', textAlign: 'center', padding: '2rem 0' }}>
              no rounds yet
            </p>
          ) : (
            history.map(round => (
              <div key={round.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 0', borderBottom: '1px solid #17171a'
              }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ddd', marginBottom: 2 }}>{round.theme}</p>
                  <p style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#555' }}>
                    {round.submitted_song ? `${round.submitted_song} — ${round.submitted_artist}` : 'no submission logged'}
                  </p>
                </div>
                {round.score !== null ? (
                  <span style={{
                    fontFamily: 'DM Mono', fontSize: 12, padding: '3px 10px', borderRadius: 999,
                    background: round.score >= 8 ? '#0f2e1a' : round.score >= 5 ? '#2a1e08' : '#2a0f0f',
                    color: round.score >= 8 ? '#4dff91' : round.score >= 5 ? '#ffe07a' : '#ff7a7a',
                    border: `1px solid ${round.score >= 8 ? '#1a5a30' : round.score >= 5 ? '#5a3e10' : '#5a1a1a'}`
                  }}>
                    +{round.score}
                  </span>
                ) : (
                  <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#333' }}>no score</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
