import { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Card,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  PersonAdd as PersonAddIcon,
  Login as LoginIcon,
} from '@mui/icons-material';

interface AuthViewProps {
  onLoginSuccess: () => void;
  loginBgImage?: string;
}

export default function AuthView({ onLoginSuccess, loginBgImage }: AuthViewProps) {
  const [activeTab, setActiveTab] = useState(0);

  // 登录表单独立状态
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 注册表单独立状态
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 发送验证码（使用注册邮箱）
  const sendVerificationCode = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3001/api/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setCodeSent(true);
        setSuccess(data.message);
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || '发送失败');
      }
    } catch (error) {
      console.error('发送验证码请求失败:', error);
      setError('无法连接服务器，请确认后端已启动（http://localhost:3001）');
    }
  };

  // 注册
  const handleRegister = async () => {
    setError('');
    setSuccess('');

    if (!regEmail || !regPassword || !verifyCode) {
      setError('请填写所有必填项');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    if (regPassword.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword, verifyCode }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('注册成功！请登录');
        // 清空注册表单
        setRegEmail('');
        setRegPassword('');
        setVerifyCode('');
        setCodeSent(false);
        setCountdown(0);
        // 切换到登录 tab
        setActiveTab(0);
        // 可选：清空登录表单（避免残留）
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setError(data.message || '注册失败');
      }
    } catch (error) {
      console.error('注册请求失败:', error);
      setError('网络错误，请稍后重试');
    }
  };

  // 登录
  const handleLogin = async () => {
    setError('');
    setSuccess('');

    if (!loginEmail || !loginPassword) {
      setError('请填写邮箱和密码');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setSuccess('登录成功！');
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      } else {
        setError(data.message || '邮箱或密码错误');
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      setError('网络错误，请稍后重试');
    }
  };

  // 切换 tab 时清空通用错误和成功消息（可选）
  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#FAFAFA',
        backgroundImage: loginBgImage ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${loginBgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 3,
          boxShadow: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          主人你来啦~(≧∀≦)ゞ
        </Typography>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          variant="fullWidth"
        >
          <Tab label="登录" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="注册" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* 登录表单 */}
        {activeTab === 0 && (
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="邮箱"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              fullWidth
              label="密码"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleLogin}
              sx={{ textTransform: 'none', py: 1.5 }}
            >
              登录
            </Button>
          </Stack>
        )}

        {/* 注册表单 */}
        {activeTab === 1 && (
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="邮箱"
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              fullWidth
              label="密码"
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              helperText="密码至少6个字符"
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                label="验证码"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="请输入邮箱验证码"
              />
              <Button
                variant="outlined"
                onClick={sendVerificationCode}
                disabled={countdown > 0}
                sx={{ minWidth: 120, textTransform: 'none' }}
              >
                {countdown > 0 ? `${countdown}秒` : '发送验证码'}
              </Button>
            </Stack>
            {codeSent && (
              <Typography variant="caption" color="text.secondary">
                💡 验证码已发送，请查看邮箱（若未收到，控制台可能显示模拟码）
              </Typography>
            )}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PersonAddIcon />}
              onClick={handleRegister}
              sx={{ textTransform: 'none', py: 1.5 }}
            >
              注册
            </Button>
          </Stack>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
          使用真实后端服务，数据持久化存储
        </Typography>
      </Card>
    </Box>
  );
}