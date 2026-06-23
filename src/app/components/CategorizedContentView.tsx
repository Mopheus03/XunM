import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
  alpha,
  Slider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Menu as MenuIcon,
  MoreHoriz as MoreHorizIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

type ViewKind = 'strategy' | 'inspiration' | 'training';

interface ContentItem {
  id: string;
  title?: string;
  content: string;
  done?: boolean;
}

interface ContentCategory {
  id: string;
  name: string;
  items: ContentItem[];
}

interface Props {
  kind: ViewKind;
  title: string;
  storageKey: string;
  addEventName: string;
  emptyText: string;
  addButtonText: string;
  defaultCategories: ContentCategory[];
  infoText?: string;
}

const legacyKeys: Record<ViewKind, string[]> = {
  strategy: ['strategies'],
  inspiration: ['inspirationBoxes'],
  training: ['trainingData'],
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeCategories(raw: unknown, fallback: ContentCategory[]): ContentCategory[] {
  if (!Array.isArray(raw)) return fallback;
  const categories = raw
    .map((category: any) => ({
      id: String(category?.id || createId()),
      name: String(category?.name || '未命名'),
      items: Array.isArray(category?.items)
        ? category.items.map((item: any) => ({
            id: String(item?.id || createId()),
            title: item?.title ? String(item.title) : undefined,
            content: String(item?.content || ''),
            done: Boolean(item?.done ?? item?.completed ?? item?.mastered),
          }))
        : [],
    }))
    .filter((category) => category.name);
  return categories.length ? categories : fallback;
}

function loadInitialCategories(kind: ViewKind, storageKey: string, fallback: ContentCategory[]) {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      return normalizeCategories(JSON.parse(saved), fallback);
    } catch {
      return fallback;
    }
  }

  for (const key of legacyKeys[kind]) {
    const legacy = localStorage.getItem(key);
    if (!legacy) continue;
    try {
      const parsed = JSON.parse(legacy);
      if (kind === 'strategy' && Array.isArray(parsed)) {
        return [
          {
            id: 'default',
            name: '默认分类',
            items: parsed.map((item: any) => ({
              id: String(item?.id || createId()),
              title: String(item?.title || '未命名策略'),
              content: String(item?.content || ''),
              done: false,
            })),
          },
        ];
      }
      return normalizeCategories(parsed, fallback);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

// 图片编辑器组件
function ImageEditor({
  imageUrl,
  onUpdate,
  initialScale = 100,
  initialPosX = 50,
  initialPosY = 50,
  initialOpacity = 100,
}: {
  imageUrl: string;
  onUpdate: (updates: any) => void;
  initialScale?: number;
  initialPosX?: number;
  initialPosY?: number;
  initialOpacity?: number;
}) {
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

  const startDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    lastPos.current = { x: clientX, y: clientY };
  };
  const onDrag = (clientX: number, clientY: number) => {
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

  const handleMouseDown = (e: React.MouseEvent) => startDrag(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => onDrag(e.clientX, e.clientY);
  const handleMouseUp = () => endDrag();
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    onDrag(touch.clientX, touch.clientY);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    endDrag();
  };

  const handleScaleSlider = (_: Event, newValue: number | number[]) => {
    const newScale = newValue as number;
    setScale(newScale);
    onUpdate({ scale: newScale, posX, posY, opacity });
  };
  const handleOpacitySlider = (_: Event, newValue: number | number[]) => {
    const newOpacity = newValue as number;
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
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          aspectRatio: '3/4',
          border: '1px solid #ccc',
          borderRadius: 2,
          overflow: 'hidden',
          touchAction: 'none',
        }}
      >
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
          <Slider
            min={50}
            max={200}
            step={1}
            value={scale}
            onChange={handleScaleSlider}
            size="small"
            sx={{ width: '100%' }}
          />
        </Box>
        <Box>
          <Typography variant="caption">透明度 ({opacity}%)</Typography>
          <Slider
            min={0}
            max={100}
            step={1}
            value={opacity}
            onChange={handleOpacitySlider}
            size="small"
            sx={{ width: '100%' }}
          />
        </Box>
      </Stack>
      <Button variant="outlined" size="small" fullWidth sx={{ mt: 1 }} onClick={handleChangeImage}>
        更换图片
      </Button>
    </Box>
  );
}

function CategorizedContentView({
  kind,
  title,
  storageKey,
  addEventName,
  emptyText,
  addButtonText,
  defaultCategories,
  infoText = '管理您的分类内容',
}: Props) {
  const [categories, setCategories] = useState<ContentCategory[]>(() =>
    loadInitialCategories(kind, storageKey, defaultCategories),
  );
  const [activeCategoryId, setActiveCategoryId] = useState(() => categories[0]?.id || 'default');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [itemForm, setItemForm] = useState({ title: '', content: '' });
  const [bgImage, setBgImage] = useState('');
  const [listBg, setListBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  const [tempListBg, setTempListBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  const [bgSnackbarOpen, setBgSnackbarOpen] = useState(false);
  const [bgSnackbarMsg, setBgSnackbarMsg] = useState('');

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) || categories[0],
    [activeCategoryId, categories],
  );
  const hasTopBarImage = Boolean(bgImage);

  // 加载背景图片和列表背景
  useEffect(() => {
    const savedBg = localStorage.getItem(`${storageKey}_bg`);
    if (savedBg) {
      setBgImage(savedBg);
    }
    const savedListBg = localStorage.getItem(`${storageKey}_listBg`);
    if (savedListBg) {
      try {
        const parsed = JSON.parse(savedListBg);
        setListBg(parsed);
        setTempListBg(parsed);
      } catch {
        // ignore
      }
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(categories));
  }, [categories, storageKey]);

  useEffect(() => {
    if (!categories.some((category) => category.id === activeCategoryId) && categories[0]) {
      setActiveCategoryId(categories[0].id);
    }
  }, [activeCategoryId, categories]);

  useEffect(() => {
    const handler = () => openItemDialog();
    window.addEventListener(addEventName, handler);
    return () => window.removeEventListener(addEventName, handler);
  }, [addEventName, activeCategoryId]);

  const openItemDialog = (item?: ContentItem) => {
    setEditingItem(item || null);
    setItemForm({
      title: item?.title || '',
      content: item?.content || '',
    });
    setItemDialogOpen(true);
  };

  const saveItem = () => {
    if (kind === 'strategy' && !itemForm.title.trim()) return;
    if (kind !== 'strategy' && !itemForm.content.trim()) return;

    setCategories((prev) =>
      prev.map((category) => {
        if (category.id !== activeCategoryId) return category;
        if (editingItem) {
          return {
            ...category,
            items: category.items.map((item) =>
              item.id === editingItem.id
                ? { ...item, title: itemForm.title.trim(), content: itemForm.content.trim() }
                : item,
            ),
          };
        }
        return {
          ...category,
          items: [
            ...category.items,
            {
              id: createId(),
              title: kind === 'strategy' ? itemForm.title.trim() : undefined,
              content: itemForm.content.trim(),
              done: false,
            },
          ],
        };
      }),
    );
    setItemDialogOpen(false);
  };

  const deleteItem = (itemId: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === activeCategoryId
          ? { ...category, items: category.items.filter((item) => item.id !== itemId) }
          : category,
      ),
    );
  };

  const openCategoryDialog = (category?: ContentCategory) => {
    setEditingCategoryId(category?.id || '');
    setCategoryName(category?.name || '');
    setCategoryDialogOpen(true);
  };

  const saveCategory = () => {
    const name = categoryName.trim();
    if (!name) return;
    if (editingCategoryId) {
      setCategories((prev) =>
        prev.map((category) => (category.id === editingCategoryId ? { ...category, name } : category)),
      );
    } else {
      const next = { id: createId(), name, items: [] };
      setCategories((prev) => [...prev, next]);
      setActiveCategoryId(next.id);
    }
    setCategoryDialogOpen(false);
  };

  const deleteCategory = (categoryId: string) => {
    if (categories.length === 1) return;
    setCategories((prev) => prev.filter((category) => category.id !== categoryId));
  };

  const selectCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setDrawerOpen(false);
  };

  // 背景图片上传
  const handleBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBgImage(result);
      localStorage.setItem(`${storageKey}_bg`, result);
    };
    reader.readAsDataURL(file);
  };

  const clearBgImage = () => {
    setBgImage('');
    localStorage.removeItem(`${storageKey}_bg`);
  };

  // 列表背景设置
  const openSettings = () => {
    setTempListBg({ ...listBg });
    setSettingsDialogOpen(true);
  };

  const updateTempListBg = (updates: any) => {
    setTempListBg({ ...tempListBg, ...updates });
  };

  const saveListBg = () => {
    setListBg(tempListBg);
    localStorage.setItem(`${storageKey}_listBg`, JSON.stringify(tempListBg));
    setBgSnackbarMsg('列表背景已更新 ✨');
    setBgSnackbarOpen(true);
    setTimeout(() => setBgSnackbarOpen(false), 2000);
  };

  const cancelListBg = () => {
    setTempListBg({ ...listBg });
    setBgSnackbarMsg('已取消');
    setBgSnackbarOpen(true);
    setTimeout(() => setBgSnackbarOpen(false), 1500);
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        bgcolor: '#FAFAFA',
        display: 'flex',
        flexDirection: 'column',
        pb: 0,
      }}
    >
      {/* 顶部区域 */}
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'transparent',
            backgroundImage: bgImage
              ? `linear-gradient(180deg, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.26)), url(${bgImage})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: bgImage ? 1 : 0,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        {hasTopBarImage && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(15, 23, 42, 0.08))',
              pointerEvents: 'none',
            }}
          />
        )}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            p: 2,
            borderBottom: '1px solid #f0f0f0',
            bgcolor: 'transparent',
            minHeight: 180,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                size="small"
                onClick={() => window.dispatchEvent(new CustomEvent('openUserDrawer'))}
                sx={{
                  bgcolor: 'transparent',
                  color: bgImage ? 'white' : 'text.primary',
                  border: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.06)' },
                }}
              >
                <MenuIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setDrawerOpen(true)}
                sx={{
                  bgcolor: 'transparent',
                  color: bgImage ? 'white' : 'text.primary',
                  border: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.06)' },
                }}
              >
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                onClick={() => setInfoDialogOpen(true)}
                sx={{
                  bgcolor: 'transparent',
                  color: bgImage ? 'white' : 'text.primary',
                  border: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.06)' },
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={openSettings}
                sx={{
                  bgcolor: 'transparent',
                  color: bgImage ? 'white' : 'text.primary',
                  border: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.06)' },
                }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          <Stack sx={{ minHeight: 112, justifyContent: 'flex-end' }} spacing={0.5}>
            <Typography variant="h6" fontWeight={700} sx={{ color: bgImage ? 'white' : 'text.primary' }}>
              {activeCategory?.name || '未分类'}
            </Typography>
            <Typography variant="body2" sx={{ color: bgImage ? 'rgba(255,255,255,0.78)' : 'text.secondary' }}>
              {infoText}
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* 内容列表 - 大框背景，始终填满剩余空间 */}
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1.5, flex: 1, display: 'flex' }}>
        <Card
          variant="outlined"
          sx={{
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            borderColor: 'divider',
            bgcolor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minHeight: 200,
          }}
        >
          {/* 列表大框背景图片 */}
          {listBg.url && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${listBg.url})`,
                backgroundSize: `${listBg.scale}%`,
                backgroundPosition: `${listBg.posX}% ${listBg.posY}%`,
                backgroundRepeat: 'no-repeat',
                opacity: listBg.opacity / 100,
                zIndex: 0,
              }}
            />
          )}
          {/* 内容 */}
          <Box sx={{ position: 'relative', zIndex: 1, p: 2, flex: 1 }}>
            <Stack spacing={1.25}>
              {activeCategory?.items.map((item) => (
                <Card
                  key={item.id}
                  variant="outlined"
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: item.done ? alpha('#6366f1', 0.05) : 'rgba(255,255,255,0.35)',
                    backdropFilter: 'blur(12px)',
                    borderColor: item.done ? alpha('#6366f1', 0.2) : 'rgba(255,255,255,0.5)',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {kind === 'strategy' && (
                        <Typography variant="subtitle2" fontWeight={800} sx={{ wordBreak: 'break-word' }}>
                          {item.title}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: kind === 'strategy' ? 0.5 : 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          textDecoration: item.done ? 'line-through' : 'none',
                          color: item.done ? alpha('#000', 0.4) : alpha('#000', 0.7),
                        }}
                      >
                        {item.content}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.25}>
                      <IconButton size="small" onClick={() => openItemDialog(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => deleteItem(item.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Card>
              ))}

              {(!activeCategory || activeCategory.items.length === 0) && (
                <Box
                  sx={{
                    py: 6,
                    px: 2,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {emptyText}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Card>
      </Box>

      {/* 分类抽屉 */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            maxWidth: '82%',
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
          },
        }}
      >
        <Stack sx={{ height: '100%', p: 2 }} spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                分类
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {title}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setDrawerOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => openCategoryDialog()}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            添加新类别
          </Button>

          <Stack spacing={0.75} sx={{ overflowY: 'auto', flex: 1 }}>
            {categories.map((category) => {
              const active = category.id === activeCategoryId;
              return (
                <Box
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: active ? alpha('#6366f1', 0.12) : 'transparent',
                    border: '1px solid',
                    borderColor: active ? alpha('#6366f1', 0.35) : 'divider',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={active ? 800 : 600} noWrap>
                        {category.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {category.items.length} 条内容
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        openCategoryDialog(category);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={categories.length === 1}
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteCategory(category.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Stack>
      </Drawer>

      {/* 类别对话框 */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingCategoryId ? '编辑类别' : '添加类别'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="类别名称"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={saveCategory} disabled={!categoryName.trim()}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 内容对话框 */}
      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingItem ? '编辑内容' : addButtonText}</DialogTitle>
        <DialogContent>
          {kind === 'strategy' && (
            <TextField
              autoFocus
              fullWidth
              label="策略名称"
              value={itemForm.title}
              onChange={(event) => setItemForm((prev) => ({ ...prev, title: event.target.value }))}
              margin="dense"
            />
          )}
          <TextField
            autoFocus={kind !== 'strategy'}
            fullWidth
            multiline
            minRows={3}
            label={kind === 'strategy' ? '策略内容' : '内容'}
            value={itemForm.content}
            onChange={(event) => setItemForm((prev) => ({ ...prev, content: event.target.value }))}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={saveItem}
            disabled={kind === 'strategy' ? !itemForm.title.trim() : !itemForm.content.trim()}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 信息对话框 */}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            📝 {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {infoText}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            点击底部加号添加内容，左侧菜单切换分类。
          </Typography>
          <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={() => setInfoDialogOpen(false)}>
            知道啦
          </Button>
        </DialogContent>
      </Dialog>

      {/* 设置对话框 */}
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            🎨 背景设置
          </Typography>
          <Stack spacing={3}>
            {/* 顶部背景设置 */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                {title} 顶部背景图片
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<AddIcon />}
                sx={{ textTransform: 'none', borderRadius: 40 }}
              >
                {bgImage ? '更换图片' : '上传图片'}
                <input type="file" hidden accept="image/*" onChange={handleBgUpload} />
              </Button>
              {bgImage && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      height: 120,
                      borderRadius: 3,
                      backgroundImage: `url(${bgImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '1px solid #e0e0e0',
                    }}
                  />
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    onClick={clearBgImage}
                    sx={{ mt: 1, textTransform: 'none' }}
                  >
                    清除背景图片
                  </Button>
                </Box>
              )}
            </Box>

            {/* 列表大框背景设置 */}
            <Box sx={{ borderTop: '1px solid #eee', pt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                {title} 列表大框背景图片
              </Typography>
              {tempListBg.url ? (
                <ImageEditor
                  imageUrl={tempListBg.url}
                  onUpdate={updateTempListBg}
                  initialScale={tempListBg.scale}
                  initialPosX={tempListBg.posX}
                  initialPosY={tempListBg.posY}
                  initialOpacity={tempListBg.opacity}
                />
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<AddIcon />}
                  sx={{ textTransform: 'none', borderRadius: 40 }}
                >
                  上传列表大框背景图片
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const url = ev.target?.result as string;
                        updateTempListBg({ url, scale: 100, posX: 50, posY: 50, opacity: 100 });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </Button>
              )}
              {tempListBg.url && (
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={saveListBg}
                    sx={{ flex: 1, textTransform: 'none', borderRadius: 40 }}
                  >
                    确定
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={cancelListBg}
                    sx={{ flex: 1, textTransform: 'none', borderRadius: 40 }}
                  >
                    取消
                  </Button>
                </Stack>
              )}
            </Box>

            <Button
              variant="contained"
              onClick={() => setSettingsDialogOpen(false)}
              sx={{ textTransform: 'none', borderRadius: 40 }}
            >
              完成
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* 反馈 Snackbar */}
      <Snackbar
        open={bgSnackbarOpen}
        autoHideDuration={2000}
        onClose={() => setBgSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert severity="success" sx={{ bgcolor: '#6366f1', color: 'white' }}>
          {bgSnackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CategorizedContentView;