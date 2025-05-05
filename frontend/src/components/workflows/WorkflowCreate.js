import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const WorkflowCreate = () => {
  const navigate = useNavigate();
  // ワークフロー情報の状態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' // バックエンドが必要とするstatusフィールド
  });
  
  // ワークフローステップのサンプルデータ
  const [workflowSteps, setWorkflowSteps] = useState([
    { id: 1, type: 'start', title: '開始', description: 'ワークフローの開始ポイント', color: 'bg-green-500' },
    { id: 2, type: 'approval', title: '承認', description: '管理者による承認', color: 'bg-blue-500' },
    { id: 3, type: 'task', title: 'タスク', description: '担当者によるタスク実行', color: 'bg-yellow-500' },
    { id: 4, type: 'condition', title: '条件分岐', description: '条件に基づいて分岐', color: 'bg-purple-500' },
    { id: 5, type: 'notification', title: '通知', description: 'メール通知の送信', color: 'bg-pink-500' },
    { id: 6, type: 'end', title: '終了', description: 'ワークフローの終了', color: 'bg-red-500' }
  ]);

  // 現在のワークフロー（選択されたステップの配置）
  const [currentWorkflow, setCurrentWorkflow] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ドラッグ中のアイテム状態
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragSource, setDragSource] = useState(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // パレットからのドラッグ開始
  const handlePaletteDragStart = (e, step) => {
    setDraggedItem(step);
    setDragSource('palette');
    e.dataTransfer.setData('stepId', step.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // ワークフローからのドラッグ開始
  const handleWorkflowDragStart = (e, workflowItem, index) => {
    setDraggedItem(workflowItem);
    setDragSource('workflow');
    setDraggedOverIndex(index);
    e.dataTransfer.setData('workflowItemId', workflowItem.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // ドラッグオーバー処理
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedOverIndex !== index) {
      setDraggedOverIndex(index);
    }
  };

  // ドロップ処理
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (dragSource === 'palette' && draggedItem) {
      const stepId = parseInt(e.dataTransfer.getData('stepId'));
      const step = workflowSteps.find(s => s.id === stepId);
      
      if (step) {
        const newWorkflowItem = {
          id: Date.now(),
          stepId: step.id,
          position: dropIndex,
          title: step.title,
          action: step.description,
          color: step.color
        };
        
        const updatedWorkflow = [...currentWorkflow];
        updatedWorkflow.splice(dropIndex, 0, newWorkflowItem);
        
        const finalWorkflow = updatedWorkflow.map((item, idx) => ({
          ...item,
          position: idx
        }));
        
        setCurrentWorkflow(finalWorkflow);
      }
    } else if (dragSource === 'workflow' && draggedItem) {
      const draggedIndex = currentWorkflow.findIndex(item => item.id === draggedItem.id);
      if (draggedIndex !== -1) {
        const newWorkflow = [...currentWorkflow];
        const [draggedWorkflowItem] = newWorkflow.splice(draggedIndex, 1);
        newWorkflow.splice(dropIndex, 0, draggedWorkflowItem);
        
        const updatedWorkflow = newWorkflow.map((item, idx) => ({
          ...item,
          position: idx
        }));
        
        setCurrentWorkflow(updatedWorkflow);
      }
    }
    
    setDraggedItem(null);
    setDragSource(null);
    setDraggedOverIndex(null);
  };

  // ワークフローからアイテムを削除
  const handleRemoveFromWorkflow = (id) => {
    setCurrentWorkflow(currentWorkflow.filter(item => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. まずワークフローを作成
      const workflowResponse = await axios.post('/api/workflows', {
        name: formData.name,
        description: formData.description,
        status: formData.status
      });
      
      const workflowId = workflowResponse.data.id;
      
      // 2. 各ステップをタスクとして作成
      const stepPromises = currentWorkflow.map((step, index) => 
        axios.post('/api/tasks', {
          workflow_id: workflowId,
          name: step.title,
          description: step.action,
          status: 'active'
        })
      );
      
      await Promise.all(stepPromises);
      
      navigate(`/workflows/${workflowId}`);
    } catch (err) {
      console.error('Error creating workflow:', err);
      setError('ワークフローの作成に失敗しました: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  return (
    <div className="workflow-create p-4 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">新規ワークフロー作成</h2>
      
      {error && <div className="error bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* ワークフロー情報セクション */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3">ワークフロー情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              >
                <option value="active">有効</option>
                <option value="inactive">無効</option>
                <option value="draft">下書き</option>
              </select>
            </div>
            
            <div className="form-group md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
                rows="2"
              />
            </div>
          </div>
        </div>
        
        {/* ワークフローデザイナーセクション */}
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md p-4 mb-4">
          {/* 左側: ステップパレット */}
          <div className="w-full md:w-64 mb-4 md:mb-0 md:mr-4">
            <h3 className="text-lg font-semibold mb-3">利用可能なステップ</h3>
            <div className="space-y-2">
              {workflowSteps.map(step => (
                <div
                  key={step.id}
                  className={`${step.color} text-white p-3 rounded-md cursor-move shadow-sm hover:shadow-md transition-shadow`}
                  draggable
                  onDragStart={(e) => handlePaletteDragStart(e, step)}
                >
                  <div className="font-medium">{step.title}</div>
                  <div className="text-xs mt-1 text-white text-opacity-80">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 右側: ワークフロー設計エリア */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3">ワークフロー設計</h3>
            
            {currentWorkflow.length === 0 ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center text-gray-400"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDraggedOverIndex(0);
                }}
                onDrop={(e) => handleDrop(e, 0)}
              >
                ステップをここにドラッグして追加
              </div>
            ) : (
              <div className="space-y-2">
                {currentWorkflow.map((workflowItem, index) => (
                  <React.Fragment key={workflowItem.id}>
                    {/* ドロップ領域 */}
                    <div 
                      className={`h-2 ${draggedOverIndex === index ? 'bg-blue-200' : ''} rounded-full transition-colors duration-200`}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                    />
                    
                    {/* ワークフローアイテム */}
                    <div 
                      className={`${workflowItem.color} text-white p-3 rounded-md flex justify-between items-center shadow-sm`}
                      draggable
                      onDragStart={(e) => handleWorkflowDragStart(e, workflowItem, index)}
                    >
                      <div>
                        <div className="font-medium">{workflowItem.title}</div>
                        <div className="text-xs mt-1 text-white text-opacity-80">ステップ {index + 1}</div>
                      </div>
                      <button 
                        className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                        onClick={() => handleRemoveFromWorkflow(workflowItem.id)}
                      >
                        削除
                      </button>
                    </div>
                  </React.Fragment>
                ))}
                
                {/* 最後のドロップ領域 */}
                <div 
                  className={`h-2 ${draggedOverIndex === currentWorkflow.length ? 'bg-blue-200' : ''} rounded-full transition-colors duration-200`}
                  onDragOver={(e) => handleDragOver(e, currentWorkflow.length)}
                  onDrop={(e) => handleDrop(e, currentWorkflow.length)}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="form-actions flex justify-end">
          <button type="button" className="cancel-btn px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2 hover:bg-gray-300" onClick={() => navigate('/workflows')}>
            キャンセル
          </button>
          <button type="submit" className="save-btn px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkflowCreate;
