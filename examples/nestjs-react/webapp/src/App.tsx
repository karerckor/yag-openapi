import { PetInfoView } from './components/PetInfo'
import { TaskManager } from './components/TaskManager'

function App() {

  return (
    <>
      <TaskManager />
      <hr />
      <p>Data from: https://petstore.swagger.io/v2</p>
      <PetInfoView petId="2" />
    </>
  )
}

export default App
