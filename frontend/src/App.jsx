import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './App.css'

function App() {
  const [profiles, setProfiles] = useState([])
  const [quests, setQuests] = useState([])
  const [transactions, setTransactions] = useState([])
  const [savingsGoals, setSavingsGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCoinQuestData() {
      setLoading(true)

      const [
        profilesResponse,
        questsResponse,
        transactionsResponse,
        savingsGoalsResponse,
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('quests').select('*'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('savings_goals').select('*').order('created_at', { ascending: false }),
      ])

      if (profilesResponse.error) console.error('Profiles error:', profilesResponse.error)
      if (questsResponse.error) console.error('Quests error:', questsResponse.error)
      if (transactionsResponse.error) console.error('Transactions error:', transactionsResponse.error)
      if (savingsGoalsResponse.error) console.error('Savings goals error:', savingsGoalsResponse.error)

      setProfiles(profilesResponse.data || [])
      setQuests(questsResponse.data || [])
      setTransactions(transactionsResponse.data || [])
      setSavingsGoals(savingsGoalsResponse.data || [])
      setLoading(false)
    }

    loadCoinQuestData()
  }, [])

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">CoinQuest Dashboard</p>
        <h1>Turn student budgeting into a game.</h1>
        <p className="heroText">
          CoinQuest uses quests, XP, savings goals, and transaction tracking to help
          students build better money habits.
        </p>
      </section>

      {loading ? (
        <p className="loading">Loading CoinQuest data...</p>
      ) : (
        <>
          <section className="statsGrid">
            <article className="statCard">
              <span>Total Income</span>
              <strong>${totalIncome.toFixed(2)}</strong>
            </article>

            <article className="statCard">
              <span>Total Expenses</span>
              <strong>${totalExpenses.toFixed(2)}</strong>
            </article>

            <article className="statCard">
              <span>Active Goals</span>
              <strong>{savingsGoals.length}</strong>
            </article>

            <article className="statCard">
              <span>Available Quests</span>
              <strong>{quests.length}</strong>
            </article>
          </section>

          <section className="section">
            <h2>User Profiles</h2>
            <div className="cardGrid">
              {profiles.map((profile) => (
                <article className="card" key={profile.id}>
                  <h3>{profile.username}</h3>
                  <p>{profile.email}</p>
                  <p>Level {profile.level} • {profile.xp} XP</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section">
            <h2>Quests</h2>
            <div className="cardGrid">
              {quests.map((quest) => (
                <article className="card" key={quest.id}>
                  <h3>{quest.title}</h3>
                  <p>{quest.description}</p>
                  <p className="reward">{quest.xp_reward} XP Reward</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section">
            <h2>Transactions</h2>
            <div className="list">
              {transactions.map((transaction) => (
                <article className="listItem" key={transaction.id}>
                  <div>
                    <h3>{transaction.category}</h3>
                    <p>{transaction.description}</p>
                  </div>
                  <strong className={transaction.type}>
                    {transaction.type === 'expense' ? '-' : '+'}${Number(transaction.amount).toFixed(2)}
                  </strong>
                </article>
              ))}
            </div>
          </section>

          <section className="section">
            <h2>Savings Goals</h2>
            <div className="cardGrid">
              {savingsGoals.map((goal) => {
                const progress = Math.min(
                  (Number(goal.current_amount) / Number(goal.target_amount)) * 100,
                  100
                )

                return (
                  <article className="card" key={goal.id}>
                    <h3>{goal.goal_name}</h3>
                    <p>
                      ${Number(goal.current_amount).toFixed(2)} saved of ${Number(goal.target_amount).toFixed(2)}
                    </p>
                    <div className="progressBar">
                      <div style={{ width: `${progress}%` }}></div>
                    </div>
                    <p>{progress.toFixed(0)}% complete</p>
                  </article>
                )
              })}
            </div>
          </section>
        </>
      )}
    </main>
  )
}

export default App
