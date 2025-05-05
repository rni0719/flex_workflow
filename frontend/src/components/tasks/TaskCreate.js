// src/components/tasks/TaskCreate.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TaskCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workflow_id: '',
    status: 'pending',
    assigned_to: ''
  });
  const [workflows, setWorkflows] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workflowsResponse, usersResponse] = await Promise.all([
          axios.get('/api/workflows'),
          axios.get('/api/users')
        ]);
        setWorkflows(workflowsResponse.data);
        setUsers(usersResponse.data);
      } catch (err) {
        setError('データの取得に失敗しました');
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/tasks', formData);
      navigate(`/tasks/${response.data.id}`);
    } catch (err) {
      setError('タスクの作成に失敗しました');
      setLoading(false);
    }
  };

  return (
    <div className="task-create">
      <h2>新規タスク作成</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>タイトル</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>説明</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group">
          <label>ワークフロー</label>
          <select
            name="workflow_id"
            value={formData.workflow_id}
            onChange={handleInputChange}
            required
          >
            <option value="">ワークフローを選択</option>
            {workflows.map(workflow => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>ステータス</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="pending">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="completed">完了</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>担当者</label>
          <select
            name="assigned_to"
            value={formData.assigned_to}
            onChange={handleInputChange}
          >
            <option value="">担当者を選択</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </button>
          <button type="button" className="cancel-btn" onClick={() => navigate('/tasks')}>
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskCreate;
