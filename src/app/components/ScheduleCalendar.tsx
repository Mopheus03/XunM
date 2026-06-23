import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Chip,
  alpha,
  TextField,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Popover,
  Grid,
  Card,
  Button,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccessTime as TimeIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface SubTask {
  id: string;
  content: string;
  startTime: string;
  endTime: string;
}

interface Task {
  id: string;
  content: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  subTasks: SubTask[];
  expanded: boolean;
}

export default function ScheduleCalendar() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '10:00',
  });
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [calendarAnchorEl, setCalendarAnchorEl] = useState<HTMLElement | null>(null);
  const calendarOpen = Boolean(calendarAnchorEl);
  const [cardBackground, setCardBackground] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('scheduleTasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scheduleTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const saved = localStorage.getItem('cardBackgroundImage');
    if (saved) {
      setCardBackground(saved);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('cardBackgroundImage');
      setCardBackground(saved || '');
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleOpenCalendar = (event: React.MouseEvent<HTMLElement>) => {
    setCalendarAnchorEl(event.currentTarget);
  };

  const handleCloseCalendar = () => {
    setCalendarAnchorEl(null);
  };

  const getTasksForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(task => {
      const taskStart = task.startDate;
      const taskEnd = task.endDate;
      return dateStr >= taskStart && dateStr <= taskEnd;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
    handleCloseCalendar();
  };

  const openDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        content: task.content,
        startDate: task.startDate,
        endDate: task.endDate,
        startTime: task.startTime,
        endTime: task.endTime,
      });
      setSubTasks(task.subTasks);
    } else {
      setEditingTask(null);
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      setFormData({
        content: '',
        startDate: dateStr,
        endDate: dateStr,
        startTime: '09:00',
        endTime: '10:00',
      });
      setSubTasks([]);
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
    setSubTasks([]);
  };

  const saveTask = () => {
    if (!formData.content.trim()) return;

    if (editingTask) {
      setTasks(tasks.map(t =>
        t.id === editingTask.id
          ? { ...t, ...formData, subTasks, expanded: false }
          : t
      ));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
        subTasks,
        expanded: false,
      };
      setTasks([...tasks, newTask]);
    }

    closeDialog();
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addSubTask = () => {
    const newSubTask: SubTask = {
      id: Date.now().toString(),
      content: '',
      startTime: formData.startTime,
      endTime: formData.endTime,
    };
    setSubTasks([...subTasks, newSubTask]);
  };

  const updateSubTask = (id: string, field: keyof SubTask, value: string) => {
    setSubTasks(subTasks.map(st =>
      st.id === id ? { ...st, [field]: value } : st
    ));
  };

  const deleteSubTask = (id: string) => {
    setSubTasks(subTasks.filter(st => st.id !== id));
  };

  const toggleTaskExpanded = (id: string) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, expanded: !t.expanded } : t
    ));
  };

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedDateTasks = tasks.filter(task => {
    return selectedDateStr >= task.startDate && selectedDateStr <= task.endDate;
  });

  return (
    <Box>

      <Paper elevation={2} sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 的任务
          </Typography>
          <IconButton
            size="small"
            onClick={handleOpenCalendar}
            sx={{
              bgcolor: alpha('#6366f1', 0.1),
              '&:hover': {
                bgcolor: alpha('#6366f1', 0.2),
              },
            }}
          >
            <CalendarIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => openDialog()}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>
            <Stack spacing={2.5}>
              {selectedDateTasks.length > 0 ? (
                selectedDateTasks
                  .sort((a, b) => {
                    const timeA = a.startTime.replace(':', '');
                    const timeB = b.startTime.replace(':', '');
                    return parseInt(timeA) - parseInt(timeB);
                  })
                  .map(task => (
                    <Box
                      key={task.id}
                      sx={{
                        display: 'flex',
                        gap: 3,
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        backgroundImage: cardBackground ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${cardBackground})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 3,
                          borderColor: 'primary.main',
                          bgcolor: 'rgba(255, 255, 255, 1)',
                        },
                      }}
                    >
                      {/* Left: Time Column */}
                      <Box
                        sx={{
                          minWidth: 140,
                          pt: 0.5,
                        }}
                      >
                        <Stack spacing={1}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: 1.5,
                              py: 0.75,
                              borderRadius: 1.5,
                              bgcolor: alpha('#6366f1', 0.1),
                              border: '1px solid',
                              borderColor: alpha('#6366f1', 0.3),
                            }}
                          >
                            <TimeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: 'primary.main',
                                fontFamily: 'monospace',
                              }}
                            >
                              {task.startTime}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: 1.5,
                              py: 0.75,
                              borderRadius: 1.5,
                              bgcolor: alpha('#9ca3af', 0.1),
                              border: '1px solid',
                              borderColor: alpha('#9ca3af', 0.3),
                            }}
                          >
                            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: 'text.secondary',
                                fontFamily: 'monospace',
                              }}
                            >
                              {task.endTime}
                            </Typography>
                          </Box>
                          {task.startDate !== task.endDate && (
                            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
                              跨日至 {task.endDate}
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      {/* Vertical Divider */}
                      <Box
                        sx={{
                          width: 3,
                          bgcolor: 'primary.main',
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />

                      {/* Right: Content Column */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack spacing={1.5}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                flex: 1,
                                wordBreak: 'break-word',
                              }}
                            >
                              {task.content || '未命名任务'}
                            </Typography>
                            <Stack direction="row" spacing={0.5} flexShrink={0}>
                              <IconButton
                                size="small"
                                onClick={() => openDialog(task)}
                                sx={{
                                  bgcolor: alpha('#6366f1', 0.1),
                                  '&:hover': {
                                    bgcolor: alpha('#6366f1', 0.2),
                                  },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => deleteTask(task.id)}
                                sx={{
                                  bgcolor: alpha('#f44336', 0.1),
                                  '&:hover': {
                                    bgcolor: alpha('#f44336', 0.2),
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>

                          {task.subTasks.length > 0 && (
                            <>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Chip
                                  label={`${task.subTasks.length} 个子任务`}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha('#ec4899', 0.1),
                                    color: '#ec4899',
                                    fontWeight: 600,
                                    border: '1px solid',
                                    borderColor: alpha('#ec4899', 0.3),
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => toggleTaskExpanded(task.id)}
                                  sx={{
                                    bgcolor: task.expanded ? 'primary.main' : alpha('#000', 0.05),
                                    color: task.expanded ? 'white' : 'text.secondary',
                                    '&:hover': {
                                      bgcolor: task.expanded ? 'primary.dark' : alpha('#000', 0.1),
                                    },
                                  }}
                                >
                                  {task.expanded ? (
                                    <ExpandLessIcon fontSize="small" />
                                  ) : (
                                    <ExpandMoreIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Stack>
                              <Collapse in={task.expanded}>
                                <Stack
                                  spacing={1.5}
                                  sx={{
                                    mt: 1,
                                    pl: 2,
                                    borderLeft: '2px solid',
                                    borderColor: alpha('#ec4899', 0.3),
                                  }}
                                >
                                  {task.subTasks.map(subTask => (
                                    <Box
                                      key={subTask.id}
                                      sx={{
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        bgcolor: alpha('#ec4899', 0.05),
                                        border: '1px solid',
                                        borderColor: alpha('#ec4899', 0.2),
                                      }}
                                    >
                                      <Stack direction="row" spacing={2} alignItems="center">
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                          <Chip
                                            label={subTask.startTime}
                                            size="small"
                                            sx={{
                                              fontFamily: 'monospace',
                                              fontSize: '0.75rem',
                                              height: 24,
                                            }}
                                          />
                                          <Typography variant="caption" color="text.disabled">
                                            -
                                          </Typography>
                                          <Chip
                                            label={subTask.endTime}
                                            size="small"
                                            sx={{
                                              fontFamily: 'monospace',
                                              fontSize: '0.75rem',
                                              height: 24,
                                            }}
                                          />
                                        </Stack>
                                        <Typography variant="body2" sx={{ flex: 1 }}>
                                          {subTask.content || '未命名子任务'}
                                        </Typography>
                                      </Stack>
                                    </Box>
                                  ))}
                                </Stack>
                              </Collapse>
                            </>
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  ))
              ) : (
                <Paper
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    bgcolor: alpha('#6366f1', 0.02),
                    border: '2px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <CalendarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    当天暂无任务
                  </Typography>
                </Paper>
              )}
            </Stack>
      </Paper>

      {/* Calendar Popover */}
      <Popover
        open={calendarOpen}
        anchorEl={calendarAnchorEl}
        onClose={handleCloseCalendar}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 320 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <IconButton size="small" onClick={prevMonth}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {year}年 {monthNames[month]}
            </Typography>
            <IconButton size="small" onClick={nextMonth}>
              <ChevronRightIcon />
            </IconButton>
          </Stack>

          <Grid container spacing={0.5} sx={{ mb: 1 }}>
            {dayNames.map(day => (
              <Grid item xs={12 / 7} key={day}>
                <Typography
                  variant="caption"
                  align="center"
                  sx={{ fontWeight: 600, color: 'text.secondary', display: 'block' }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={0.5}>
            {days.map((day, index) => (
              <Grid item xs={12 / 7} key={index}>
                {day ? (
                  <Card
                    variant="outlined"
                    onClick={() => handleDateClick(day)}
                    sx={{
                      minHeight: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      bgcolor: isSelected(day)
                        ? 'primary.main'
                        : isToday(day)
                        ? alpha('#6366f1', 0.1)
                        : 'background.paper',
                      borderColor: isSelected(day)
                        ? 'primary.main'
                        : isToday(day)
                        ? 'primary.main'
                        : 'divider',
                      borderWidth: isToday(day) || isSelected(day) ? 2 : 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 2,
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isToday(day) || isSelected(day) ? 700 : 500,
                        color: isSelected(day)
                          ? 'white'
                          : isToday(day)
                          ? 'primary.main'
                          : 'text.primary',
                      }}
                    >
                      {day}
                    </Typography>
                  </Card>
                ) : (
                  <Box sx={{ minHeight: 40 }} />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Popover>

      {/* Add/Edit Task Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingTask ? '编辑任务' : '添加任务'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                时间区域
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <TextField
                  type="date"
                  label="开始日期"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ minWidth: 180 }}
                />
                <TextField
                  type="time"
                  label="开始时间"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ minWidth: 150 }}
                />
                <TextField
                  type="date"
                  label="结束日期"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ minWidth: 180 }}
                />
                <TextField
                  type="time"
                  label="结束时间"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ minWidth: 150 }}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                内容区域
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="输入任务内容..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </Box>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  子任务
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addSubTask}
                  sx={{ textTransform: 'none' }}
                >
                  添加子任务
                </Button>
              </Stack>
              <Stack spacing={2}>
                {subTasks.map(subTask => (
                  <Paper key={subTask.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2}>
                        <TextField
                          type="time"
                          label="开始时间"
                          value={subTask.startTime}
                          onChange={(e) => updateSubTask(subTask.id, 'startTime', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          sx={{ minWidth: 150 }}
                        />
                        <TextField
                          type="time"
                          label="结束时间"
                          value={subTask.endTime}
                          onChange={(e) => updateSubTask(subTask.id, 'endTime', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          sx={{ minWidth: 150 }}
                        />
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          placeholder="输入子任务内容..."
                          value={subTask.content}
                          onChange={(e) => updateSubTask(subTask.id, 'content', e.target.value)}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteSubTask(subTask.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} sx={{ textTransform: 'none' }}>
            取消
          </Button>
          <Button
            onClick={saveTask}
            variant="contained"
            disabled={!formData.content.trim()}
            sx={{ textTransform: 'none' }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
