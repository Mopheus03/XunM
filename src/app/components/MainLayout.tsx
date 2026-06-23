import { useEffect, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import {
  Add as AddIcon,
  CalendarMonth as CalendarMonthIcon,
  FitnessCenter as FitnessCenterIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import planDefaultIcon from '../../imports/1.png';
import strategyDefaultIcon from '../../imports/2.png';
import inspireDefaultIcon from '../../imports/3.png';
import trainingDefaultIcon from '../../imports/4.png';
import MobileScheduleView from './MobileScheduleView';
import StrategySettings from './StrategySettings';
import InspirationView from './InspirationView';
import TrainingView from './TrainingView';
import InstallPrompt from './InstallPrompt';

type ViewName = 'strategy' | 'schedule' | 'plan' | 'training';

export default function MainLayout() {
  const [selectedView, setSelectedView] = useState<ViewName>('plan');
  const [planIcon, setPlanIcon] = useState('');
  const [strategyIcon, setStrategyIcon] = useState('');
  const [inspireIcon, setInspireIcon] = useState('');
  const [trainingIcon, setTrainingIcon] = useState('');
  const iconKeys = {
    plan: 'planIconV2',
    strategy: 'strategyIconV2',
    inspire: 'inspireIconV2',
    training: 'trainingIconV2',
  } as const;

  useEffect(() => {
    const loadIcons = () => {
      setPlanIcon(localStorage.getItem(iconKeys.plan) || planDefaultIcon);
      setStrategyIcon(localStorage.getItem(iconKeys.strategy) || strategyDefaultIcon);
      setInspireIcon(localStorage.getItem(iconKeys.inspire) || inspireDefaultIcon);
      setTrainingIcon(localStorage.getItem(iconKeys.training) || trainingDefaultIcon);
    };

    loadIcons();
    window.addEventListener('storage', loadIcons);
    return () => window.removeEventListener('storage', loadIcons);
  }, []);

  useEffect(() => {
    const handleOpenUserDrawer = () => {
      window.dispatchEvent(new CustomEvent('openUserDrawerFromMain'));
    };

    window.addEventListener('openUserDrawer', handleOpenUserDrawer);
    return () => window.removeEventListener('openUserDrawer', handleOpenUserDrawer);
  }, []);

  const handleAddClick = () => {
    if (selectedView === 'plan') {
      window.dispatchEvent(new CustomEvent('openAddPlanDialog'));
    } else if (selectedView === 'strategy') {
      window.dispatchEvent(new CustomEvent('openAddStrategyDialog'));
    } else if (selectedView === 'schedule') {
      window.dispatchEvent(new CustomEvent('openAddInspirationItem'));
    } else if (selectedView === 'training') {
      window.dispatchEvent(new CustomEvent('openAddTrainingItem'));
    }
  };

  const navColor = (view: ViewName) => (selectedView === view ? '#333' : 'text.secondary');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#FAFAFA' }}>
      <Box sx={{ flex: 1, overflowY: 'auto', pb: 9 }}>
        <Box sx={{ display: selectedView === 'plan' ? 'block' : 'none', height: '100%' }}>
          <MobileScheduleView />
        </Box>
        {selectedView === 'schedule' && <InspirationView />}
        {selectedView === 'strategy' && <StrategySettings />}
        {selectedView === 'training' && <TrainingView />}
      </Box>

      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 70,
          bgcolor: 'rgba(255,255,255,0.98)',
          borderTop: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(20px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          px: 2,
        }}
      >
        <IconButton
          onClick={() => setSelectedView('plan')}
          sx={{ flexDirection: 'column', gap: 0.5, color: navColor('plan') }}
        >
          {planIcon ? <Box component="img" src={planIcon} sx={{ width: 24, height: 24 }} /> : <CalendarMonthIcon />}
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
            计划
          </Typography>
        </IconButton>

        <IconButton
          onClick={() => setSelectedView('strategy')}
          sx={{ flexDirection: 'column', gap: 0.5, color: navColor('strategy') }}
        >
          {strategyIcon ? <Box component="img" src={strategyIcon} sx={{ width: 24, height: 24 }} /> : <PsychologyIcon />}
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
            策略
          </Typography>
        </IconButton>

        <Box
          onClick={handleAddClick}
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#333',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <AddIcon sx={{ fontSize: 32 }} />
        </Box>

        <IconButton
          onClick={() => setSelectedView('schedule')}
          sx={{ flexDirection: 'column', gap: 0.5, color: navColor('schedule') }}
        >
          {inspireIcon ? <Box component="img" src={inspireIcon} sx={{ width: 24, height: 24 }} /> : <Box component="span" sx={{ fontSize: 24 }}>💡</Box>}
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
            灵感
          </Typography>
        </IconButton>

        <IconButton
          onClick={() => setSelectedView('training')}
          sx={{ flexDirection: 'column', gap: 0.5, color: navColor('training') }}
        >
          {trainingIcon ? <Box component="img" src={trainingIcon} sx={{ width: 24, height: 24 }} /> : <FitnessCenterIcon />}
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
            训练
          </Typography>
        </IconButton>
      </Box>

      <InstallPrompt />
    </Box>
  );
}
