import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WorkflowDetail.css';

const WorkflowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active', // バックエンドがstatusフィールドを必要とする
    steps: []
  });
  
  // 新規作成モードかどうかを判定
  const isNewMode = id === 'new';

  useEffect(() => {
    const fetchWorkflow = async () => {
      // 新規作成モードの場合はAPIを呼び出さない
      if (isNewMode) {
        setWorkflow({
          id: null,
          name: '',
          description: '',
          status: 'active',
          steps: []
        });
        setFormData({
          name: '',
          description: '',
          status: 'active',
          steps: []
        });
        setLoading(false);
        // 新規作成モードは編集状態で開始
        setEditMode(true);
        return;
      }
      
      try {
        const response = await axios.get(`/api/workflows/${id}`);
        const workflowData = response.data;
        
        // タスクを取得してstepsとしてマッピング
        const tasksResponse = await axios.get(`/api/workflows/${id}/tasks`);
        const steps = tasksResponse.data.map(task => ({
          id: task.id,
          name: task.name,
          action: task.description,
          order: task.id
        }));
        
        // ワークフローデータにstepsを追加
        workflowData.steps = steps;
        
        setWorkflow(workflowData);
        setFormData({
          name: workflowData.name,
          description: workflowData.description,
          status: workflowData.status,
          steps: steps || []
        });
        setLoading(false);
      } catch (err) {
        setError('ワークフローの取得に失敗しました');
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [id, isNewMode]);

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
    try {
      if (isNewMode) {
        // 新規作成の場合はPOSTリクエスト
        const workflowResponse = await axios.post('/api/workflows', {
          name: formData.name,
          description: formData.description,
          status: formData.status
        });
        
        const newWorkflowId = workflowResponse.data.id;
        
        // ステップをタスクとして保存
        for (const step of formData.steps) {
          await axios.post('/api/tasks', {
            workflow_id: newWorkflowId,
            name: step.name,
            description: step.action,
            status: 'active'
          });
        }
        
        navigate(`/workflows/${newWorkflowId}`);
      } else {
        // 更新の場合はPUTリクエスト
        await axios.put(`/api/workflows/${id}`, {
          name: formData.name,
          description: formData.description,
          status: formData.status
        });
        
        // 既存のタスクを更新または新規作成
        for (const step of formData.steps) {
          if (step.id) {
            // 既存のステップを更新
            await axios.put(`/api/tasks/${step.id}`, {
              workflow_id: parseInt(id),
              name: step.name,
              description: step.action,
              status: 'active'
            });
          } else {
            // 新規ステップを作成
            await axios.post('/api/tasks', {
              workflow_id: parseInt(id),
              name: step.name,
              description: step.action,
              status: 'active'
            });
          }
        }
        
        setWorkflow({
          ...workflow,
          name: formData.name,
          description: formData.description,
          status: formData.status,
          steps: formData.steps
        });
        setEditMode(false);
      }
    } catch (err) {
      setError(isNewMode ? 'ワークフローの作成に失敗しました' : 'ワークフローの更新に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('このワークフローを削除してもよろしいですか？')) {
      try {
        await axios.delete(`/api/workflows/${id}`);
        navigate('/workflows');
      } catch (err) {
        setError('ワークフローの削除に失敗しました');
      }
    }
  };

  if (loading) return <div className="loading">読み込み中...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!workflow && !isNewMode) return <div className="not-found">ワークフローが見つかりません</div>;

  return (
    <div className="workflow-detail">
      {editMode ? (
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
          <div className="form-group">
            <label>ステータス</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="draft">下書き</option>
              <option value="active">有効</option>
              <option value="inactive">無効</option>
            </select>
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
            {!isNewMode && (
              <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>
                キャンセル
              </button>
            )}
          </div>
        </form>
      ) : (
        <>
          <div className="workflow-header">
            <h2>{workflow.name}</h2>
            <div className="action-buttons">
              <button className="edit-btn" onClick={() => setEditMode(true)}>
                編集
              </button>
              <button className="delete-btn" onClick={handleDelete}>
                削除
              </button>
            </div>
          </div>
          
          <p className="description">{workflow.description}</p>
          <p className="status">ステータス: {workflow.status}</p>
          
          <h3>ワークフローステップ</h3>
          {workflow.steps && workflow.steps.length > 0 ? (
            <div className="steps-container">
              {workflow.steps.map((step, index) => (
                <div key={index} className="step">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">
                    <h4>{step.name}</h4>
                    <p>{step.action}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-steps">ステップがありません</p>
          )}
          
          <button className="back-btn" onClick={() => navigate('/workflows')}>
            一覧に戻る
          </button>
        </>
      )}
    </div>
  );
};

export default WorkflowDetail;
