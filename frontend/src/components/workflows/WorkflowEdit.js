// src/components/workflows/WorkflowEdit.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const WorkflowEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    steps: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const response = await axios.get(`/api/workflows/${id}`);
        setFormData({
          name: response.data.name,
          description: response.data.description,
          steps: response.data.steps || []
        });
        setLoading(false);
      } catch (err) {
        setError('ワークフローの取得に失敗しました');
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value
    };
    setFormData({
      ...formData,
      steps: updatedSteps
    });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { name: '', action: '', order: formData.steps.length }]
    });
  };

  const removeStep = (index) => {
    const updatedSteps = formData.steps.filter((_, i) => i !== index);
    const reorderedSteps = updatedSteps.map((step, i) => ({
      ...step,
      order: i
    }));
    setFormData({
      ...formData,
      steps: reorderedSteps
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.put(`/api/workflows/${id}`, formData);
      navigate(`/workflows/${id}`);
    } catch (err) {
      setError('ワークフローの更新に失敗しました');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">読み込み中...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="workflow-edit">
      <h2>ワークフロー編集</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>名前</label>
          <input
            type="text"
            name="name"
            value={formData.name}
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
        
        <h3>ステップ</h3>
        {formData.steps.map((step, index) => (
          <div key={index} className="step-item">
            <div className="form-group">
              <label>ステップ名</label>
              <input
                type="text"
                value={step.name}
                onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>アクション</label>
              <input
                type="text"
                value={step.action}
                onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                required
              />
            </div>
            <button type="button" className="remove-btn" onClick={() => removeStep(index)}>
              削除
            </button>
          </div>
        ))}
        
        <button type="button" className="add-btn" onClick={addStep}>
          ステップを追加
        </button>
        
        <div className="form-actions">
          <button type="submit" className="save-btn">保存</button>
          <button type="button" className="cancel-btn" onClick={() => navigate(`/workflows/${id}`)}>
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkflowEdit;
