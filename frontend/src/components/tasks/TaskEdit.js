// src/components/tasks/TaskEdit.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TaskEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workflow_id: '',
    status: '',
    assigned_to: ''
  });
  const [workflows, setWorkflows] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskResponse, workflowsResponse, usersResponse] = await Promise.all([
          axios.get(`/api/tasks/${id}`),
          axios.get('/api/workflows'),
          axios.get('/api/users')
        ]);
        
        setFormData({
          title: taskResponse.data.title,
          description: taskResponse.data.description,
          workflow_id: taskResponse.data.workflow_id,
          status: taskResponse.data.status,
          assigned_to: taskResponse.data.assigned_to
        });
        setWorkflows(workflowsResponse.data);
        setUsers(usersResponse.data);
        setLoading(false);
      } catch (err) {
        setError('データの取得に失敗しました');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
    
    try {
      await axios.put(`/api/tasks/${id}`, formData);
      navigate(`/tasks/${id}`);
    } catch (err) {
      setError('タスクの更新に失敗しました');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">読み込み中...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="task-edit">
      <h2>タスク編集</h2>
      
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
          <button type="submit" className="save-btn">保存</button>
          <button type="button" className="cancel-btn" onClick={() => navigate(`/tasks/${id}`)}>
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskEdit;
