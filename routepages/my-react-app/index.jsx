import React from 'react'
import ReactDOM from 'react-dom/client'

function AddButton() {
  return <button>pp</button>
}

function MainPage() {
  return (
    <div>
      <h1>Where ya goin?</h1>
      <AddButton />
      <AddButton />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainPage />
  </React.StrictMode>
)