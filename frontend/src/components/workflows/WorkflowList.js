import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  Typography,
  LinearProgress,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { getWorkflows, getWorkflowTasks } from '../../api';

// ステータスに応じた色を返す関数
const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'info';
    case 'not_started':
      return 'warning';
    default:
      return 'default';
  }
};

// ステータスの日本語表示
const statusLabels = {
  'completed': '完了',
  'in_progress': '進行中',
  'not_started': '未開始',
};

function WorkflowList() {
  const [workflows, setWorkflows] = useState([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        const response = await getWorkflows();
        const workflowData = response.data;
        
        // 各ワークフローのタスク情報を取得
        const workflowsWithTasks = await Promise.all(workflowData.map(async (wf) => {
          try {
            const tasksResponse = await getWorkflowTasks(wf.id);
            const tasks = tasksResponse.data;
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            
            return {
              ...wf,
              totalTasks,
              completedTasks,
              progress: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
            };
          } catch (err) {
            console.error(`Error fetching tasks for workflow ${wf.id}:`, err);
            return {
              ...wf,
              totalTasks: 0,
              completedTasks: 0,
              progress: 0
            };
          }
        }));
        
        setWorkflows(workflowsWithTasks);
        setFilteredWorkflows(workflowsWithTasks);
      } catch (err) {
        console.error('Error fetching workflows:', err);
        setError('ワークフローの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  // 検索とフィルタリングのロジック
  useEffect(() => {
    let result = [...workflows];
    
    // 検索語でフィルタリング
    if (searchTerm) {
      result = result.filter(wf => 
        wf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wf.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // ステータスでフィルタリング
    if (statusFilter !== 'all') {
      result = result.filter(wf => wf.status === statusFilter);
    }
    
    setFilteredWorkflows(result);
  }, [searchTerm, statusFilter, workflows]);

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          再読み込み
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">ワークフロー一覧</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/workflows/new"
        >
          新規ワークフロー
        </Button>
      </Box>
      
      {/* 検索とフィルター */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="ワークフローを検索..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>ステータス</InputLabel>
          <Select
            value={statusFilter}
            label="ステータス"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">すべて</MenuItem>
            <MenuItem value="not_started">未開始</MenuItem>
            <MenuItem value="in_progress">進行中</MenuItem>
            <MenuItem value="completed">完了</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* ワークフローリスト */}
      {filteredWorkflows.length > 0 ? (
        <Grid container spacing={3}>
          {filteredWorkflows.map((workflow) => (
            <Grid item key={workflow.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div" noWrap>
                      {workflow.name}
                    </Typography>
                    <Chip 
                      label={statusLabels[workflow.status] || workflow.status} 
                      color={getStatusColor(workflow.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2, 
                      height: '60px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: '-webkit-box', 
                      WebkitLineClamp: 3, 
                      WebkitBoxOrient: 'vertical' 
                    }}
                  >
                    {workflow.description || '説明はありません'}
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      進捗状況: {workflow.completedTasks}/{workflow.totalTasks} タスク
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={workflow.progress} />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {`${workflow.progress}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    作成日: {new Date(workflow.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to={`/workflows/${workflow.id}`}
                  >
                    詳細
                  </Button>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to={`/workflows/${workflow.id}/edit`}
                  >
                    編集
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            表示するワークフローがありません
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/workflows/new"
            sx={{ mt: 2 }}
          >
            新規ワークフローを作成
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default WorkflowList;
