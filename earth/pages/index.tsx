import MainView from '../components/MainView'
import {
  usePalantirManager,
  PalantirContextProvider,
  PalantirContext,
} from '../utils/PalantirContext'

function HomePage() {
  const palantirManager = usePalantirManager()

  return (
    <PalantirContext.Provider value={palantirManager}>
      <MainView />
    </PalantirContext.Provider>
  )
}

export default HomePage
