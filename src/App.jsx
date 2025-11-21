import './App.css'
import { Navbar } from './Navbar'
import React from 'react'
import { ToDoList } from './Todolist'

function App() {

  return (
    <>
   
       <div className="h-screen w-full bg-neutral-900 text-neutral-50 flex flex-col">
      <div className="flex-1">
        <ToDoList />
      </div>
    </div>
    </>
  )
}

export default App
