import Header from './components/layout/Header'
import './styles/App.css'

function App() {
  return (
    <div>
      <Header
        totalGames={42}
        inProgress={2}
        completed={15}
      />
    </div>
  )
}

export default App