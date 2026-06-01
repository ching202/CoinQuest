import { useEffect, useState } from 'react'
import { supabase } from './supabase'

function App() {
  const [profiles, setProfiles] = useState([])
  const [quests, setQuests] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetchProfiles()
    fetchQuests()
    fetchTransactions()
  }, [])

  async function fetchProfiles() {
    const { data, error } = await supabase.from('profiles').select('*')

    if (error) {
      console.error('Profiles error:', error)
    } else {
      setProfiles(data)
    }
  }

  async function fetchQuests() {
    const { data, error } = await supabase.from('quests').select('*')

    if (error) {
      console.error('Quests error:', error)
    } else {
      setQuests(data)
    }
  }

  async function fetchTransactions() {
    const { data, error } = await supabase.from('transactions').select('*')

    if (error) {
      console.error('Transactions error:', error)
    } else {
      setTransactions(data)
    }
  }

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial' }}>
      <h1>CoinQuest</h1>
      <p>Gamified student budgeting app using Supabase and PostgreSQL.</p>

      <h2>User Profiles</h2>
      {profiles.map((profile) => (
        <div key={profile.id}>
          <p>
            <strong>{profile.username}</strong> — Level {profile.level} — XP {profile.xp}
          </p>
        </div>
      ))}

      <h2>Quests</h2>
      {quests.map((quest) => (
        <div key={quest.id}>
          <p>
            <strong>{quest.title}</strong> — {quest.description} — {quest.xp_reward} XP
          </p>
        </div>
      ))}

      <h2>Transactions</h2>
      {transactions.map((transaction) => (
        <div key={transaction.id}>
          <p>
            <strong>{transaction.type}</strong> — {transaction.category} — ${transaction.amount} — {transaction.description}
          </p>
        </div>
      ))}
    </div>
  )
}

export default App
