// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import WorkflowList from './components/workflows/WorkflowList';
import WorkflowDetail from './components/workflows/WorkflowDetail';
import WorkflowCreate from './components/workflows/WorkflowCreate';
import WorkflowEdit from './components/workflows/WorkflowEdit';
import TaskList from './components/tasks/TaskList';
import TaskCreate from './components/tasks/TaskCreate';
import TaskEdit from './components/tasks/TaskEdit';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="workflows" element={<WorkflowList />} />
        <Route path="workflows/:id" element={<WorkflowDetail />} />
        <Route path="workflows/create" element={<WorkflowCreate />} />
        <Route path="workflows/:id/edit" element={<WorkflowEdit />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="tasks/create" element={<TaskCreate />} />
        <Route path="tasks/:id/edit" element={<TaskEdit />} />
      </Route>
    </Routes>
  );
}

export default App;
