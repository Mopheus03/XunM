import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';

interface TimePickerDialogProps {
  open: boolean;
  title: string;
  initialTime: string;
  onClose: () => void;
  onConfirm: (time: string) => void;
}

export default function TimePickerDialog({
  open,
  title,
  initialTime,
  onClose,
  onConfirm,
}: TimePickerDialogProps) {
  const [hours, setHours] = React.useState(parseInt(initialTime.split(':')[0]) || 9);
  const [minutes, setMinutes] = React.useState(parseInt(initialTime.split(':')[1]) || 0);

  React.useEffect(() => {
    if (open) {
      const [h, m] = initialTime.split(':');
      setHours(parseInt(h) || 9);
      setMinutes(parseInt(m) || 0);
    }
  }, [open, initialTime]);

  const handleConfirm = () => {
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    onConfirm(timeString);
    onClose();
  };

  const incrementHours = () => setHours(h => (h + 1) % 24);
  const decrementHours = () => setHours(h => (h - 1 + 24) % 24);
  const incrementMinutes = () => setMinutes(m => (m + 15) % 60);
  const decrementMinutes = () => setMinutes(m => (m - 15 + 60) % 60);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          {title}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            p: 3,
            borderRadius: 3,
            bgcolor: alpha('#6366f1', 0.05),
            border: '2px solid',
            borderColor: alpha('#6366f1', 0.2),
          }}
        >
          {/* Hours */}
          <Stack alignItems="center" spacing={1}>
            <IconButton
              onClick={incrementHours}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <AddIcon />
            </IconButton>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: 'primary.main',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: 'primary.main',
                }}
              >
                {String(hours).padStart(2, '0')}
              </Typography>
            </Box>
            <IconButton
              onClick={decrementHours}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <RemoveIcon />
            </IconButton>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              小时
            </Typography>
          </Stack>

          {/* Separator */}
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            :
          </Typography>

          {/* Minutes */}
          <Stack alignItems="center" spacing={1}>
            <IconButton
              onClick={incrementMinutes}
              sx={{
                bgcolor: 'secondary.main',
                color: 'white',
                '&:hover': { bgcolor: alpha('secondary.main', 0.8) },
              }}
            >
              <AddIcon />
            </IconButton>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: 'secondary.main',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: 'secondary.main',
                }}
              >
                {String(minutes).padStart(2, '0')}
              </Typography>
            </Box>
            <IconButton
              onClick={decrementMinutes}
              sx={{
                bgcolor: 'secondary.main',
                color: 'white',
                '&:hover': { bgcolor: alpha('secondary.main', 0.8) },
              }}
            >
              <RemoveIcon />
            </IconButton>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              分钟
            </Typography>
          </Stack>
        </Box>

        {/* Time Preview */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha('#000', 0.04),
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            选择的时间
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontFamily: 'monospace',
              color: 'primary.main',
              mt: 1,
            }}
          >
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          取消
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{ textTransform: 'none' }}
        >
          确定
        </Button>
      </DialogActions>
    </Dialog>
  );
}
