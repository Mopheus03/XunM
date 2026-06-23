// 注册 Service Worker 以实现 PWA 功能
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker 注册成功:', registration.scope);

          // 检查更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 新版本可用，请刷新页面');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('❌ Service Worker 注册失败:', error);
        });
    });
  }
}

// 添加安装提示
export function promptInstall() {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    // 阻止默认的安装提示
    e.preventDefault();
    // 保存事件，稍后使用
    deferredPrompt = e;

    console.log('💡 应用可以安装到主屏幕');

    // 你可以在这里显示自定义的安装按钮
    // 例如：showInstallButton();
  });

  // 返回触发安装的函数
  return () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ 用户接受了安装');
        } else {
          console.log('❌ 用户拒绝了安装');
        }
        deferredPrompt = null;
      });
    }
  };
}
