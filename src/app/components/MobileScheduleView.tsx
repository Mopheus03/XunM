import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Stack, IconButton, Card, alpha, Dialog, DialogContent,
  TextField, Button, Checkbox, Slide, Snackbar, Alert, Paper, Drawer, Avatar, Divider,
} from '@mui/material';
import {
  Settings as SettingsIcon, Delete as DeleteIcon, AccessTime as TimeIcon,
  ChevronLeft, ChevronRight, CalendarToday as CalendarIcon, Info as InfoIcon,
  Close as CloseIcon, Menu as MenuIcon, Logout as LogoutIcon,
  CalendarMonth as CalendarMonthIcon, Psychology as PsychologyIcon, FitnessCenter as FitnessCenterIcon,
} from '@mui/icons-material';
import planDefaultIcon from '../../imports/1.png';
import strategyDefaultIcon from '../../imports/2.png';
import inspireDefaultIcon from '../../imports/3.png';
import trainingDefaultIcon from '../../imports/4.png';

// ---------- 图片编辑器（完整保留） ----------
function ImageEditor({ imageUrl, onUpdate, initialScale = 100, initialPosX = 50, initialPosY = 50, initialOpacity = 100 }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initialScale);
  const [posX, setPosX] = useState(initialPosX);
  const [posY, setPosY] = useState(initialPosY);
  const [opacity, setOpacity] = useState(initialOpacity);
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const w = canvas.width = container.clientWidth;
      const h = canvas.height = container.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = opacity / 100;
      const scaleVal = scale / 100;
      const drawW = w * scaleVal;
      const drawH = h * scaleVal;
      const dx = (posX / 100) * (w - drawW);
      const dy = (posY / 100) * (h - drawH);
      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.globalAlpha = 1;
    };
  }, [imageUrl, scale, posX, opacity]);

  const startDrag = (clientX, clientY) => {
    setIsDragging(true);
    lastPos.current = { x: clientX, y: clientY };
  };
  const onDrag = (clientX, clientY) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const deltaX = (clientX - lastPos.current.x) * scaleX;
    const deltaY = (clientY - lastPos.current.y) * scaleY;
    const w = canvas.width;
    const h = canvas.height;
    const scaleVal = scale / 100;
    const drawW = w * scaleVal;
    const drawH = h * scaleVal;
    const maxDeltaX = (w - drawW) / 2;
    const maxDeltaY = (h - drawH) / 2;
    let newPosX = posX + (deltaX / maxDeltaX) * 50;
    let newPosY = posY + (deltaY / maxDeltaY) * 50;
    newPosX = Math.min(100, Math.max(0, newPosX));
    newPosY = Math.min(100, Math.max(0, newPosY));
    setPosX(newPosX);
    setPosY(newPosY);
    lastPos.current = { x: clientX, y: clientY };
    onUpdate({ scale, posX: newPosX, posY: newPosY, opacity });
  };
  const endDrag = () => setIsDragging(false);

  const handleMouseDown = (e) => startDrag(e.clientX, e.clientY);
  const handleMouseMove = (e) => onDrag(e.clientX, e.clientY);
  const handleMouseUp = () => endDrag();
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };
  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    onDrag(touch.clientX, touch.clientY);
  };
  const handleTouchEnd = (e) => {
    e.preventDefault();
    endDrag();
  };

  const handleScaleSlider = (e) => {
    const newScale = Number(e.target.value);
    setScale(newScale);
    onUpdate({ scale: newScale, posX, posY, opacity });
  };
  const handleOpacitySlider = (e) => {
    const newOpacity = Number(e.target.value);
    setOpacity(newOpacity);
    onUpdate({ scale, posX, posY, opacity: newOpacity });
  };

  const handleChangeImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newUrl = ev.target?.result as string;
        setScale(100);
        setPosX(50);
        setPosY(50);
        setOpacity(100);
        onUpdate({ url: newUrl, scale: 100, posX: 50, posY: 50, opacity: 100 });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
      <Box ref={containerRef} sx={{ width: '100%', aspectRatio: '3/4', border: '1px solid #ccc', borderRadius: 2, overflow: 'hidden', touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </Box>
      <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
        手指拖动移动图片，下方滑块缩放/透明度
      </Typography>
      <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
        <Box>
          <Typography variant="caption">缩放 ({scale}%)</Typography>
          <input type="range" min={50} max={200} step={1} value={scale} onChange={handleScaleSlider} style={{ width: '100%' }} />
        </Box>
        <Box>
          <Typography variant="caption">透明度 ({opacity}%)</Typography>
          <input type="range" min={0} max={100} step={1} value={opacity} onChange={handleOpacitySlider} style={{ width: '100%' }} />
        </Box>
      </Stack>
      <Button variant="outlined" size="small" fullWidth sx={{ mt: 1 }} onClick={handleChangeImage}>
        更换图片
      </Button>
    </Box>
  );
}

interface Plan {
  id: string;
  startTime: string;
  endTime: string;
  content: string;
  completed: boolean;
}

export default function MobileScheduleView() {
  // ---------- 原有所有状态 ----------
  const [allPlans, setAllPlans] = useState<{ [date: string]: Plan[] }>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [newPlanStartTime, setNewPlanStartTime] = useState('09:00');
  const [newPlanEndTime, setNewPlanEndTime] = useState('10:00');
  const [newPlanContent, setNewPlanContent] = useState('');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [bgSnackbarOpen, setBgSnackbarOpen] = useState(false);
  const [bgSnackbarMsg, setBgSnackbarMsg] = useState('');
  const [headerBg, setHeaderBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  const [planBoxBg, setPlanBoxBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  const [tempHeaderBg, setTempHeaderBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  const [tempPlanBoxBg, setTempPlanBoxBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });

  // ---------- 新增：抽屉和用户信息、图标自定义 ----------
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPage, setDrawerPage] = useState<'profile' | 'icons'>('profile');
  const [userName, setUserName] = useState('用户');
  const [userAvatar, setUserAvatar] = useState('');
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

  // 加载用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.userName || user.email?.split('@')[0] || '用户');
        setUserAvatar(user.userAvatar || '');
      } catch(e) {}
    }
    loadIcons();
  }, []);

  const saveUserProfile = () => {
    const currentUser = {
      userName,
      userAvatar,
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('userName', userName);
    localStorage.setItem('userAvatar', userAvatar);
    window.dispatchEvent(new Event('storage'));
    setBgSnackbarMsg('资料已保存');
    setBgSnackbarOpen(true);
    setTimeout(() => setBgSnackbarOpen(false), 1500);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setUserAvatar(url);
      localStorage.setItem('userAvatar', url);
      const currentUser = {
        userName,
        userAvatar: url,
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      window.dispatchEvent(new Event('storage'));
      setBgSnackbarMsg('头像已更新');
      setBgSnackbarOpen(true);
      setTimeout(() => setBgSnackbarOpen(false), 1500);
    };
    reader.readAsDataURL(file);
  };

  const loadIcons = () => {
    setPlanIcon(localStorage.getItem(iconKeys.plan) || planDefaultIcon);
    setStrategyIcon(localStorage.getItem(iconKeys.strategy) || strategyDefaultIcon);
    setInspireIcon(localStorage.getItem(iconKeys.inspire) || inspireDefaultIcon);
    setTrainingIcon(localStorage.getItem(iconKeys.training) || trainingDefaultIcon);
  };

  useEffect(() => {
    window.addEventListener('storage', loadIcons);
    return () => window.removeEventListener('storage', loadIcons);
  }, []);

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
        profile: iconKeys.training,
      };
      localStorage.setItem(keyMap[type] || `${type}IconV2`, url);
      loadIcons();
      window.dispatchEvent(new Event('storage'));
      setBgSnackbarMsg('图标已更新');
      setBgSnackbarOpen(true);
      setTimeout(() => setBgSnackbarOpen(false), 1500);
    };
    reader.readAsDataURL(file);
  };

  const clearIcon = (type: string) => {
    const keyMap: Record<string, string> = {
      plan: iconKeys.plan,
      strategy: iconKeys.strategy,
      inspire: iconKeys.inspire,
      profile: iconKeys.training,
    };
    localStorage.removeItem(keyMap[type] || `${type}IconV2`);
    loadIcons();
    window.dispatchEvent(new Event('storage'));
    setBgSnackbarMsg('图标已清除');
    setBgSnackbarOpen(true);
    setTimeout(() => setBgSnackbarOpen(false), 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.reload();
  };

  // ---------- 原有 useEffect 和函数 ----------
  useEffect(() => {
    const savedPlans = localStorage.getItem('dailyPlansV2');
    const savedHeader = localStorage.getItem('planHeaderBg');
    const savedPlanBox = localStorage.getItem('planBoxBg');
    if (savedPlans) setAllPlans(JSON.parse(savedPlans));
    if (savedHeader) {
      const parsed = JSON.parse(savedHeader);
      setHeaderBg(parsed);
      setTempHeaderBg(parsed);
    }
    if (savedPlanBox) {
      const parsed = JSON.parse(savedPlanBox);
      setPlanBoxBg(parsed);
      setTempPlanBoxBg(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyPlansV2', JSON.stringify(allPlans));
  }, [allPlans]);

  const openSettings = () => {
    setTempHeaderBg({ ...headerBg });
    setTempPlanBoxBg({ ...planBoxBg });
    setSettingsOpen(true);
  };

  const updateTempHeader = (updates: any) => {
    setTempHeaderBg({ ...tempHeaderBg, ...updates });
  };
  const updateTempPlanBox = (updates: any) => {
    setTempPlanBoxBg({ ...tempPlanBoxBg, ...updates });
  };

  useEffect(() => {
    const handleOpenDialog = () => setDialogOpen(true);
    window.addEventListener('openAddPlanDialog', handleOpenDialog);
    return () => window.removeEventListener('openAddPlanDialog', handleOpenDialog);
  }, []);

  useEffect(() => {
    const handleOpenUserDrawer = () => {
      setDrawerPage('profile');
      setDrawerOpen(true);
    };
    window.addEventListener('openUserDrawerFromMain', handleOpenUserDrawer);
    return () => window.removeEventListener('openUserDrawerFromMain', handleOpenUserDrawer);
  }, []);

  const dateKey = selectedDate.toISOString().split('T')[0];
  const plans = allPlans[dateKey] || [];

  const addPlan = () => {
    if (!newPlanContent.trim()) return;
    const newPlan: Plan = {
      id: Date.now().toString(),
      startTime: newPlanStartTime,
      endTime: newPlanEndTime,
      content: newPlanContent,
      completed: false,
    };
    const updated = [...plans, newPlan].sort((a, b) => a.startTime.localeCompare(b.startTime));
    setAllPlans({ ...allPlans, [dateKey]: updated });
    setNewPlanContent('');
    setDialogOpen(false);
  };

  const togglePlan = (id: string) => {
    const plan = plans.find(p => p.id === id);
    if (plan && !plan.completed) {
      setSnackbarMsg('主人，你真棒，又完成了一个任务呢~(*ˊ˘ˋ*)');
      setSnackbarOpen(true);
      setTimeout(() => setSnackbarOpen(false), 2000);
    }
    setAllPlans({ ...allPlans, [dateKey]: plans.map(p => p.id === id ? { ...p, completed: !p.completed } : p) });
  };

  const deletePlan = (id: string) => setAllPlans({ ...allPlans, [dateKey]: plans.filter(p => p.id !== id) });

  const changeDate = (offset: number) => {
    setSlideDirection(offset > 0 ? 'left' : 'right');
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(newDate);
  };

  const selectSpecificDate = (date: Date) => {
    setSelectedDate(date);
    setDatePickerOpen(false);
  };

  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const currentDay = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
  const currentDateNum = selectedDate.getDate();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(selectedDate);
    date.setDate(currentDateNum + i - (currentDay - 1));
    return date;
  });

  return (
    <Box sx={{ position: 'relative', minHeight: '100%', bgcolor: '#FAFAFA' }}>
      {/* 头部区域 */}
      <Box sx={{ position: 'relative' }}>
        {headerBg.url && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${headerBg.url})`,
              backgroundSize: `${headerBg.scale}%`,
              backgroundPosition: `${headerBg.posX}% ${headerBg.posY}%`,
              backgroundRepeat: 'no-repeat',
              opacity: headerBg.opacity / 100,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
        )}
        <Box sx={{ position: 'relative', zIndex: 1, p: 2, borderBottom: '1px solid #f0f0f0', bgcolor: 'transparent' }}>
          {/* 修改：左侧菜单图标，右侧信息+设置 */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <IconButton size="small" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" onClick={() => setInfoOpen(true)}><InfoIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={openSettings}><SettingsIcon fontSize="small" /></IconButton>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton size="small" onClick={() => changeDate(-1)}><ChevronLeft /></IconButton>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={700} onClick={() => setDatePickerOpen(true)} sx={{ cursor: 'pointer' }}>
                {selectedDate.getFullYear()}年{selectedDate.getMonth()+1}月{selectedDate.getDate()}日
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => changeDate(1)}><ChevronRight /></IconButton>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="space-between" mt={2}>
            {dates.map((date, idx) => (
              <Box key={idx} onClick={() => selectSpecificDate(date)} sx={{ textAlign: 'center', cursor: 'pointer' }}>
                <Typography variant="caption">{weekDays[idx]}</Typography>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: date.toDateString() === selectedDate.toDateString() ? '#333' : 'transparent',
                  color: date.toDateString() === selectedDate.toDateString() ? 'white' : 'text.primary',
                }}>
                  {date.getDate()}
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* 目标和分类行 */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #f0f0f0' }}>
        <Typography variant="subtitle1" fontWeight={700}>≡ 目标和分类</Typography>
      </Box>

      {/* 计划列表区域 */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ position: 'relative' }}>
          {planBoxBg.url && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${planBoxBg.url})`,
                backgroundSize: `${planBoxBg.scale}%`,
                backgroundPosition: `${planBoxBg.posX}% ${planBoxBg.posY}%`,
                backgroundRepeat: 'no-repeat',
                opacity: planBoxBg.opacity / 100,
                borderRadius: 3,
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
          )}
          <Card sx={{
            position: 'relative',
            zIndex: 1,
            borderRadius: 3,
            p: 2,
            minHeight: 400,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            bgcolor: 'transparent',
          }}>
            <Stack spacing={1.5}>
              {plans.map(plan => (
                <Paper key={plan.id} sx={{ p: 1.5, bgcolor: plan.completed ? alpha('#4caf50',0.1) : 'rgba(255,255,255,0.9)', border: `1px solid ${plan.completed ? '#4caf50' : '#e0e0e0'}` }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Checkbox checked={plan.completed} onChange={() => togglePlan(plan.id)} size="small" />
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ bgcolor: alpha('#6366f1',0.1), px: 1, py: 0.5, borderRadius: 2 }}>
                      <TimeIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                      <Typography variant="caption" fontWeight={600}>{plan.startTime} - {plan.endTime}</Typography>
                    </Stack>
                    <Typography sx={{ flex: 1, textDecoration: plan.completed ? 'line-through' : 'none', opacity: plan.completed ? 0.6 : 1 }}>{plan.content}</Typography>
                    <IconButton size="small" onClick={() => deletePlan(plan.id)}><DeleteIcon fontSize="small" color="error" /></IconButton>
                  </Stack>
                </Paper>
              ))}
              {plans.length === 0 && (
                <Box sx={{ py: 8, textAlign: 'center', opacity: 0.5 }}>
                  <Typography variant="body2">点击底部加号添加计划</Typography>
                </Box>
              )}
            </Stack>
          </Card>
        </Box>
      </Box>

      {/* 添加计划对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" fontWeight={700} mb={3}>📅 添加计划</Typography>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                type="time"
                label="开始时间"
                value={newPlanStartTime}
                onChange={(e) => setNewPlanStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <Typography variant="body2" color="text.secondary">—</Typography>
              <TextField
                type="time"
                label="结束时间"
                value={newPlanEndTime}
                onChange={(e) => setNewPlanEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Stack>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="计划内容"
              placeholder="输入计划内容..."
              value={newPlanContent}
              onChange={(e) => setNewPlanContent(e.target.value)}
            />
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={addPlan} disabled={!newPlanContent.trim()} sx={{ flex: 1, textTransform: 'none' }}>确定</Button>
              <Button variant="outlined" onClick={() => setDialogOpen(false)} sx={{ flex: 1, textTransform: 'none' }}>取消</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* 日期选择对话框 */}
      <Dialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent>
          <Typography variant="h6" mb={2}>选择日期</Typography>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => selectSpecificDate(new Date(e.target.value))}
            style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
          />
          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={() => setDatePickerOpen(false)}>确定</Button>
        </DialogContent>
      </Dialog>

      {/* 背景设置对话框 */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700}>⚙️ 背景设置</Typography>
            <IconButton size="small" onClick={() => setSettingsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* 顶部区域背景区块 */}
          <Box sx={{ mb: 4, borderBottom: '1px solid #eee', pb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>顶部区域背景</Typography>
            {tempHeaderBg.url ? (
              <ImageEditor
                imageUrl={tempHeaderBg.url}
                onUpdate={updateTempHeader}
                initialScale={tempHeaderBg.scale}
                initialPosX={tempHeaderBg.posX}
                initialPosY={tempHeaderBg.posY}
                initialOpacity={tempHeaderBg.opacity}
              />
            ) : (
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
                上传图片
                <input type="file" hidden accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const url = ev.target?.result as string;
                    updateTempHeader({ url, scale: 100, posX: 50, posY: 50, opacity: 100 });
                  };
                  reader.readAsDataURL(file);
                }} />
              </Button>
            )}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => {
                setHeaderBg(tempHeaderBg);
                localStorage.setItem('planHeaderBg', JSON.stringify(tempHeaderBg));
                setBgSnackbarMsg('已成功设置喵(๑˃ᴗ˂)ﻭ♡');
                setBgSnackbarOpen(true);
                setTimeout(() => setBgSnackbarOpen(false), 1500);
              }} sx={{ flex: 1 }}>确定</Button>
              <Button variant="outlined" onClick={() => {
                setTempHeaderBg({ ...headerBg });
                setBgSnackbarMsg('已取消了~嘿嘿~(*ˊᗜˋ*)');
                setBgSnackbarOpen(true);
                setTimeout(() => setBgSnackbarOpen(false), 1500);
              }} sx={{ flex: 1 }}>取消</Button>
            </Stack>
          </Box>

          {/* 计划列表背景区块 */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>计划列表背景</Typography>
            {tempPlanBoxBg.url ? (
              <ImageEditor
                imageUrl={tempPlanBoxBg.url}
                onUpdate={updateTempPlanBox}
                initialScale={tempPlanBoxBg.scale}
                initialPosX={tempPlanBoxBg.posX}
                initialPosY={tempPlanBoxBg.posY}
                initialOpacity={tempPlanBoxBg.opacity}
              />
            ) : (
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
                上传图片
                <input type="file" hidden accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const url = ev.target?.result as string;
                    updateTempPlanBox({ url, scale: 100, posX: 50, posY: 50, opacity: 100 });
                  };
                  reader.readAsDataURL(file);
                }} />
              </Button>
            )}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => {
                setPlanBoxBg(tempPlanBoxBg);
                localStorage.setItem('planBoxBg', JSON.stringify(tempPlanBoxBg));
                setBgSnackbarMsg('已成功设置喵(๑˃ᴗ˂)ﻭ♡');
                setBgSnackbarOpen(true);
                setTimeout(() => setBgSnackbarOpen(false), 1500);
              }} sx={{ flex: 1 }}>确定</Button>
              <Button variant="outlined" onClick={() => {
                setTempPlanBoxBg({ ...planBoxBg });
                setBgSnackbarMsg('已取消了~嘿嘿~(*ˊᗜˋ*)');
                setBgSnackbarOpen(true);
                setTimeout(() => setBgSnackbarOpen(false), 1500);
              }} sx={{ flex: 1 }}>取消</Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>

      {/* 功能介绍 */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)}>
        <DialogContent>
          <Typography variant="h6" fontWeight={700}>📝 做计划</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>记录每日任务，点击底部加号添加计划。勾选完成任务时有鼓励提示。</Typography>
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setInfoOpen(false)}>知道啦</Button>
        </DialogContent>
      </Dialog>

      {/* 完成任务反馈 Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert severity="success" sx={{ bgcolor: '#4caf50', color: 'white' }}>{snackbarMsg}</Alert>
      </Snackbar>

      {/* 背景操作反馈 Snackbar */}
      <Snackbar
        open={bgSnackbarOpen}
        autoHideDuration={1500}
        onClose={() => setBgSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert severity="success" sx={{ bgcolor: '#6366f1', color: 'white' }}>
          {bgSnackbarMsg}
        </Alert>
      </Snackbar>

      {/* ========== 新增侧边抽屉 ========== */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => { setDrawerOpen(false); setDrawerPage('profile'); }}>
        <Box sx={{ width: 280, p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {drawerPage === 'profile' ? (
            <>
              <Stack alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Avatar src={userAvatar} sx={{ width: 72, height: 72 }}>
                  {userName.charAt(0).toUpperCase()}
                </Avatar>
                <Button variant="outlined" component="label" size="small">
                  更换头像
                  <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                </Button>
              </Stack>

              <TextField
                label="名字"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 1.5 }}
              />

              <Button variant="contained" onClick={saveUserProfile} fullWidth sx={{ mb: 1.5, textTransform: 'none' }}>
                保存名字和头像
              </Button>

              <Divider sx={{ my: 1.5 }} />

              <Stack spacing={1}>
                <Button variant="outlined" fullWidth onClick={() => setDrawerPage('icons')} sx={{ textTransform: 'none' }}>
                  更换图标
                </Button>
                <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} fullWidth sx={{ textTransform: 'none' }}>
                  退出登录
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Button size="small" onClick={() => setDrawerPage('profile')} sx={{ textTransform: 'none' }}>
                  返回
                </Button>
                <Typography variant="subtitle1" fontWeight={600}>图标更换</Typography>
              </Stack>

              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                上传图片替换底部导航栏图标（建议 48x48 透明 PNG）
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Button variant="outlined" size="small" component="label" fullWidth startIcon={<CalendarMonthIcon />}>
                    做计划图标
                    <input type="file" hidden accept="image/*" onChange={handleIconUpload('plan')} />
                  </Button>
                  {planIcon && <Button size="small" color="error" onClick={() => clearIcon('plan')} sx={{ mt: 0.5 }}>清除</Button>}
                </Box>
                <Box>
                  <Button variant="outlined" size="small" component="label" fullWidth startIcon={<PsychologyIcon />}>
                    策略图标
                    <input type="file" hidden accept="image/*" onChange={handleIconUpload('strategy')} />
                  </Button>
                  {strategyIcon && <Button size="small" color="error" onClick={() => clearIcon('strategy')} sx={{ mt: 0.5 }}>清除</Button>}
                </Box>
                <Box>
                  <Button variant="outlined" size="small" component="label" fullWidth startIcon={<span>💡</span>}>
                    灵感图标
                    <input type="file" hidden accept="image/*" onChange={handleIconUpload('inspire')} />
                  </Button>
                  {inspireIcon && <Button size="small" color="error" onClick={() => clearIcon('inspire')} sx={{ mt: 0.5 }}>清除</Button>}
                </Box>
                <Box>
                  <Button variant="outlined" size="small" component="label" fullWidth startIcon={<FitnessCenterIcon />}>
                    训练图标
                    <input type="file" hidden accept="image/*" onChange={handleIconUpload('profile')} />
                  </Button>
                  {trainingIcon && <Button size="small" color="error" onClick={() => clearIcon('profile')} sx={{ mt: 0.5 }}>清除</Button>}
                </Box>
              </Stack>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}