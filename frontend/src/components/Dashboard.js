import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { getWorkflows, getWorkflowTasks } from '../api';

function Dashboard() {
  const [workflowStats, setWorkflowStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
  });
  
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // ワークフロー一覧を取得
        const response = await getWorkflows();
        const workflows = response.data;
        
        // 統計情報の計算
        const stats = {
          total: workflows.length,
          completed: workflows.filter(wf => wf.status === 'completed').length,
          inProgress: workflows.filter(wf => wf.status === 'in_progress').length,
          notStarted: workflows.filter(wf => wf.status === 'not_started').length,
        };
        
        setWorkflowStats(stats);
        
        // 最新の5件を取得
        const sortedWorkflows = [...workflows].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        ).slice(0, 5);
        
        // 各ワークフローのタスク情報を取得
        const workflowsWithTasks = await Promise.all(sortedWorkflows.map(async (wf) => {
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
        
        setRecentWorkflows(workflowsWithTasks);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('データの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <Typography variant="h4" gutterBottom>
        ダッシュボード
      </Typography>

      {/* 統計カード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                総ワークフロー数
              </Typography>
              <Typography variant="h3">
                {workflowStats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                完了
              </Typography>
              <Typography variant="h3" color="success.main">
                {workflowStats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                進行中
              </Typography>
              <Typography variant="h3" color="info.main">
                {workflowStats.inProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                未開始
              </Typography>
              <Typography variant="h3" color="warning.main">
                {workflowStats.notStarted}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 最近のワークフロー */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            最近のワークフロー
          </Typography>
          <Button component={RouterLink} to="/workflows" color="primary">
            すべて表示
          </Button>
        </Box>
        
        <List>
          {recentWorkflows.length > 0 ? (
            recentWorkflows.map((workflow, index) => (
              <React.Fragment key={workflow.id}>
                <ListItem 
                  button 
                  component={RouterLink} 
                  to={`/workflows/${workflow.id}`}
                >
                  <ListItemText 
                    primary={workflow.name} 
                    secondary={`${workflow.completedTasks}/${workflow.totalTasks} タスク完了`} 
                  />
                  <Box sx={{ width: '40%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={workflow.progress} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {workflow.progress}%
                  </Typography>
                </ListItem>
                {index < recentWorkflows.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="ワークフローがありません" />
            </ListItem>
          )}
        </List>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink} 
            to="/workflows/new"
          >
            新しいワークフローを作成
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Dashboard;
