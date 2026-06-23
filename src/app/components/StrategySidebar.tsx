import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  IconButton,
  Card,
  Checkbox,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  alpha,
  Paper,
  Tabs,
  Tab,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface Item {
  id: string;
  content: string;
  completed: boolean;
}

interface ListBox {
  id: string;
  name: string;
  items: Item[];
}

export default function InspirationView() {
  const [boxes, setBoxes] = useState<ListBox[]>([
    { id: 'default', name: '未命名', items: [] },
  ]);
  const [activeBoxId, setActiveBoxId] = useState('default');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inspirationBgImage, setInspirationBgImage] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingBoxId, setRenamingBoxId] = useState('');
  const [newBoxName, setNewBoxName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuBoxId, setMenuBoxId] = useState('');

  useEffect(() => {
    const savedBoxes = localStorage.getItem('inspirationBoxes');
    const savedActiveId = localStorage.getItem('inspirationActiveBoxId');
    const savedBg = localStorage.getItem('inspirationBgImage');
    if (savedBoxes) setBoxes(JSON.parse(savedBoxes));
    if (savedActiveId) setActiveBoxId(savedActiveId);
    if (savedBg) setInspirationBgImage(savedBg);
  }, []);

  useEffect(() => {
    localStorage.setItem('inspirationBoxes', JSON.stringify(boxes));
  }, [boxes]);

  useEffect(() => {
    localStorage.setItem('inspirationActiveBoxId', activeBoxId);
  }, [activeBoxId]);

  const handleBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setInspirationBgImage(result);
        localStorage.setItem('inspirationBgImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewBox = () => {
    const newId = Date.now().toString();
    const newBox: ListBox = {
      id: newId,
      name: '未命名',
      items: [],
    };
    setBoxes([...boxes, newBox]);
    setActiveBoxId(newId);
  };

  const deleteBox = (boxId: string) => {
    if (boxes.length === 1) return; // 至少保留一个框框
    const newBoxes = boxes.filter(b => b.id !== boxId);
    setBoxes(newBoxes);
    if (activeBoxId === boxId) {
      setActiveBoxId(newBoxes[0].id);
    }
    setAnchorEl(null);
  };

  const openRenameDialog = (boxId: string) => {
    const box = boxes.find(b => b.id === boxId);
    if (box) {
      setRenamingBoxId(boxId);
      setNewBoxName(box.name);
      setRenameDialogOpen(true);
    }
    setAnchorEl(null);
  };

  const saveRename = () => {
    if (!newBoxName.trim()) return;
    setBoxes(boxes.map(b =>
      b.id === renamingBoxId ? { ...b, name: newBoxName.trim() } : b
    ));
    setRenameDialogOpen(false);
    setNewBoxName('');
  };

  const addItem = () => {
    setBoxes(boxes.map(box => {
      if (box.id === activeBoxId) {
        return {
          ...box,
          items: [...box.items, { id: Date.now().toString(), content: '', completed: false }],
        };
      }
      return box;
    }));
  };

  const updateItem = (itemId: string, content: string) => {
    setBoxes(boxes.map(box => {
      if (box.id === activeBoxId) {
        return {
          ...box,
          items: box.items.map(item =>
            item.id === itemId ? { ...item, content } : item
          ),
        };
      }
      return box;
    }));
  };

  const toggleItem = (itemId: string) => {
    setBoxes(boxes.map(box => {
      if (box.id === activeBoxId) {
        return {
          ...box,
          items: box.items.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      }
      return box;
    }));
  };

  const deleteItem = (itemId: string) => {
    setBoxes(boxes.map(box => {
      if (box.id === activeBoxId) {
        return {
          ...box,
          items: box.items.filter(item => item.id !== itemId),
        };
      }
      return box;
    }));
  };

  const activeBox = boxes.find(b => b.id === activeBoxId) || boxes[0];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, boxId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuBoxId(boxId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuBoxId('');
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        p: 2,
        backgroundImage: inspirationBgImage ? `url(${inspirationBgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 半透遮罩 */}
      {inspirationBgImage && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(2px)',
            zIndex: 0,
          }}
        />
      )}

      <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
        {/* 头部：设置按钮 */}
        <Stack direction="row" justifyContent="flex-end">
          <IconButton
            onClick={() => setSettingsOpen(true)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(8px)',
              boxShadow: 1,
              '&:hover': { bgcolor: 'white' },
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Stack>

        {/* 框框选项卡区域 */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeBoxId}
              onChange={(_, val) => setActiveBoxId(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                flex: 1,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  minHeight: 56,
                },
                '& .Mui-selected': {
                  color: 'primary.main',
                },
              }}
            >
              {boxes.map(box => (
                <Tab
                  key={box.id}
                  value={box.id}
                  label={box.name}
                  sx={{
                    maxWidth: 'none',
                  }}
                />
              ))}
            </Tabs>
            <IconButton onClick={addNewBox} sx={{ mx: 1 }}>
              <AddIcon />
            </IconButton>
          </Box>

          {/* 当前框框的操作栏 */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 1.5, bgcolor: 'rgba(0,0,0,0.02)' }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {activeBox.name}
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" onClick={() => openRenameDialog(activeBoxId)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, activeBoxId)}
                disabled={boxes.length === 1}
              >
                <DeleteIcon fontSize="small" color={boxes.length === 1 ? 'disabled' : 'error'} />
              </IconButton>
            </Stack>
          </Stack>

          {/* 待办列表区域 */}
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addItem}
              fullWidth
              sx={{
                mb: 2,
                borderRadius: 40,
                textTransform: 'none',
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              添加待办项
            </Button>

            <Stack spacing={1.5}>
              {activeBox.items.length > 0 ? (
                activeBox.items.map((item) => (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 2,
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Checkbox
                        checked={item.completed}
                        onChange={() => toggleItem(item.id)}
                        size="medium"
                        sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
                      />
                      <TextField
                        fullWidth
                        value={item.content}
                        onChange={(e) => updateItem(item.id, e.target.value)}
                        placeholder="输入内容..."
                        variant="standard"
                        size="small"
                        sx={{
                          '& .MuiInput-root': {
                            fontSize: '0.95rem',
                            textDecoration: item.completed ? 'line-through' : 'none',
                            opacity: item.completed ? 0.6 : 1,
                          },
                          '& .MuiInput-root:before, & .MuiInput-root:after': {
                            borderBottom: 'none',
                          },
                        }}
                      />
                      <IconButton size="small" onClick={() => deleteItem(item.id)} sx={{ color: 'error.main' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Box
                  sx={{
                    py: 6,
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    暂无待办项，点击上方按钮添加
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Paper>
      </Stack>

      {/* 重命名对话框 */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            重命名框框
          </Typography>
          <TextField
            fullWidth
            label="名称"
            value={newBoxName}
            onChange={(e) => setNewBoxName(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={() => setRenameDialogOpen(false)} sx={{ textTransform: 'none' }}>
            取消
          </Button>
          <Button onClick={saveRename} variant="contained" disabled={!newBoxName.trim()} sx={{ textTransform: 'none' }}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认菜单 */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            deleteBox(menuBoxId);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> 删除此框框
        </MenuItem>
      </Menu>

      {/* 背景设置弹窗 */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="sm">
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            🎨 背景设置
          </Typography>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                灵感列表背景图片
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<AddIcon />}
                sx={{ textTransform: 'none', borderRadius: 40 }}
              >
                {inspirationBgImage ? '更换图片' : '上传图片'}
                <input type="file" hidden accept="image/*" onChange={handleBgUpload} />
              </Button>
              {inspirationBgImage && (
                <Box
                  sx={{
                    mt: 2,
                    height: 120,
                    borderRadius: 3,
                    backgroundImage: `url(${inspirationBgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid #e0e0e0',
                  }}
                />
              )}
            </Box>
            <Button
              variant="contained"
              onClick={() => setSettingsOpen(false)}
              sx={{ textTransform: 'none', borderRadius: 40 }}
            >
              完成
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
