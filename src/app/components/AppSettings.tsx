import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button, Avatar, TextField, IconButton, Paper } from '@mui/material';
import { Person as PersonIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import planDefaultIcon from '../../imports/1.png';
import strategyDefaultIcon from '../../imports/2.png';
import inspireDefaultIcon from '../../imports/3.png';
import profileDefaultIcon from '../../imports/4.png';

export default function AppSettings() {
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  
  // 四个图标的状态
  const [planIcon, setPlanIcon] = useState('');
  const [strategyIcon, setStrategyIcon] = useState('');
  const [inspireIcon, setInspireIcon] = useState('');
  const [profileIcon, setProfileIcon] = useState('');
  const iconKeys = {
    plan: 'planIconV2',
    strategy: 'strategyIconV2',
    inspire: 'inspireIconV2',
    profile: 'trainingIconV2',
  } as const;

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || '');
    setUserAvatar(localStorage.getItem('userAvatar') || '');
    setPlanIcon(localStorage.getItem(iconKeys.plan) || planDefaultIcon);
    setStrategyIcon(localStorage.getItem(iconKeys.strategy) || strategyDefaultIcon);
    setInspireIcon(localStorage.getItem(iconKeys.inspire) || inspireDefaultIcon);
    setProfileIcon(localStorage.getItem(iconKeys.profile) || profileDefaultIcon);
  }, []);

  const saveProfile = () => {
    localStorage.setItem('userName', userName);
    localStorage.setItem('userAvatar', userAvatar);
    window.dispatchEvent(new Event('storage'));
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setUserAvatar(url);
      localStorage.setItem('userAvatar', url);
      window.dispatchEvent(new Event('storage'));
    };
    reader.readAsDataURL(file);
  };

  // 图标上传通用函数
  const handleIconUpload = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const keyMap: Record<string, string> = {
        plan: iconKeys.plan,
        strategy: iconKeys.strategy,
        inspire: iconKeys.inspire,
        profile: iconKeys.profile,
      };
      localStorage.setItem(keyMap[type] || `${type}IconV2`, url);
      if (type === 'plan') setPlanIcon(url);
      else if (type === 'strategy') setStrategyIcon(url);
      else if (type === 'inspire') setInspireIcon(url);
      else if (type === 'profile') setProfileIcon(url);
      window.dispatchEvent(new Event('storage'));
    };
    reader.readAsDataURL(file);
  };

  // 清除图标
  const clearIcon = (type: string) => {
    const keyMap: Record<string, string> = {
      plan: iconKeys.plan,
      strategy: iconKeys.strategy,
      inspire: iconKeys.inspire,
      profile: iconKeys.profile,
    };
    localStorage.removeItem(keyMap[type] || `${type}IconV2`);
    if (type === 'plan') setPlanIcon(planDefaultIcon);
    else if (type === 'strategy') setStrategyIcon(strategyDefaultIcon);
    else if (type === 'inspire') setInspireIcon(inspireDefaultIcon);
    else if (type === 'profile') setProfileIcon(profileDefaultIcon);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Paper sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
      <Stack spacing={4} alignItems="center">
        {/* 个人资料区域 */}
        <Box sx={{ position: 'relative' }}>
          <Avatar src={userAvatar} sx={{ width: 120, height: 120, border: '4px solid', borderColor: 'primary.main' }}>
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <IconButton component="label" sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'primary.main', color: 'white' }}>
            <UploadIcon /><input type="file" hidden accept="image/*" onChange={handleAvatar} />
          </IconButton>
        </Box>
        <TextField label="用户名" value={userName} onChange={e => setUserName(e.target.value)} fullWidth />
        <Button variant="contained" onClick={saveProfile} size="large">保存个人资料</Button>

        {/* 自定义底部导航图标区域 */}
        <Box sx={{ width: '100%', mt: 2, textAlign: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>自定义底部图标</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            上传图片将替换底部导航栏图标（建议使用 48x48 透明背景 PNG）
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
            <Stack alignItems="center" spacing={0.5}>
              <Button variant="outlined" component="label" size="small">📅 做计划<input type="file" hidden accept="image/*" onChange={handleIconUpload('plan')} /></Button>
              {planIcon && <Button size="small" color="error" onClick={() => clearIcon('plan')}>清除</Button>}
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <Button variant="outlined" component="label" size="small">🧠 策略<input type="file" hidden accept="image/*" onChange={handleIconUpload('strategy')} /></Button>
              {strategyIcon && <Button size="small" color="error" onClick={() => clearIcon('strategy')}>清除</Button>}
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <Button variant="outlined" component="label" size="small">💡 灵感<input type="file" hidden accept="image/*" onChange={handleIconUpload('inspire')} /></Button>
              {inspireIcon && <Button size="small" color="error" onClick={() => clearIcon('inspire')}>清除</Button>}
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <Button variant="outlined" component="label" size="small">😊 我的<input type="file" hidden accept="image/*" onChange={handleIconUpload('profile')} /></Button>
              {profileIcon && <Button size="small" color="error" onClick={() => clearIcon('profile')}>清除</Button>}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
