// 极致延迟初始化，避免同步DOM事件触发
setTimeout(async () => {
  await new Promise(resolve => {
    if (document.readyState === 'complete') resolve();
    else document.addEventListener('DOMContentLoaded', resolve);
  });

  // DOM元素
  const currentUrlEl = document.getElementById('currentUrl');
  const switchBtn = document.getElementById('switchBtn');
  const statusEl = document.getElementById('status');
  const proxySwitch = document.getElementById('proxySwitch');
  const proxyStatus = document.getElementById('proxyStatus');
  const proxyUrlSelect = document.getElementById('proxyUrlSelect'); // 新增：下拉菜单

  // 代理地址列表（与下拉菜单选项一致）
  const proxyUrlList = [
    "https://gh-proxy.org",
    "https://hk.gh-proxy.org",
    "https://cdn.gh-proxy.org",
    "https://edgeone.gh-proxy.org",
    "https://v6.gh-proxy.org"
  ];

  // 辅助函数：解析错误页面URL
  const getOriginalGithubUrl = (tabUrl) => {
    if (!tabUrl) return '';
    if (tabUrl.startsWith('chrome://errorpage/')) {
      try {
        const params = new URLSearchParams(tabUrl.split('?')[1]);
        const lastUrl = params.get('lasturl');
        return lastUrl ? decodeURIComponent(lastUrl) : tabUrl;
      } catch (e) {
        return tabUrl;
      }
    }
    return tabUrl;
  };

  // 更新域名切换按钮
  const updateBtnText = (realUrl) => {
    if (!realUrl) {
      switchBtn.textContent = 'URL解析失败';
      switchBtn.disabled = true;
      return;
    }
    try {
      const urlObj = new URL(realUrl);
      switchBtn.disabled = false;
      if (urlObj.hostname === 'github.com') {
        switchBtn.textContent = '切换为镜像站（bgithub.xyz）';
      } else if (urlObj.hostname === 'bgithub.xyz') {
        switchBtn.textContent = '切换为官方站（github.com）';
      } else {
        switchBtn.textContent = '当前非GitHub域名';
        switchBtn.disabled = true;
      }
    } catch (e) {
      switchBtn.textContent = 'URL解析失败';
      switchBtn.disabled = true;
      statusEl.textContent = `❌ ${e.message}`;
      statusEl.style.color = '#f44336';
    }
  };

  // 初始化代理地址下拉菜单
  const initProxyUrlSelect = async () => {
    try {
      // 读取存储的代理地址（默认https://gh-proxy.org）
      const result = await chrome.storage.local.get('selectedProxyUrl');
      const selectedUrl = result.selectedProxyUrl || "https://gh-proxy.org";
      
      // 设置下拉菜单选中项
      proxyUrlSelect.value = selectedUrl;
      
      // 下拉菜单切换事件
      proxyUrlSelect.addEventListener('change', async (e) => {
        const newProxyUrl = e.target.value;
        // 保存选中的代理地址
        await chrome.storage.local.set({ selectedProxyUrl: newProxyUrl });
        // 通知background更新DNR规则
        chrome.runtime.sendMessage({
          type: 'updateProxyRule',
          enabled: proxySwitch.checked,
          proxyUrl: newProxyUrl
        });
        // 提示更新成功
        proxyStatus.textContent = `✅ 下载代理站地址已切换为：${newProxyUrl}`;
        proxyStatus.style.color = '#009688';
      });
    } catch (e) {
      proxyStatus.textContent = `❌ 下载代理站地址加载失败：${e.message}`;
      proxyStatus.style.color = '#f44336';
    }
  };

  // 初始化代理开关
  const initProxySwitch = async () => {
    try {
      const { proxyEnabled = true } = await chrome.storage.local.get('proxyEnabled');
      proxySwitch.checked = proxyEnabled;
      proxyStatus.textContent = proxyEnabled ? '✅ 下载代理站已启用' : '❌ 下载代理站已关闭';
      proxyStatus.style.color = proxyEnabled ? '#009688' : '#f44336';

      // 开关点击事件
      proxySwitch.addEventListener('change', async (e) => {
        const isChecked = e.target.checked;
        await chrome.storage.local.set({ proxyEnabled: isChecked });
        // 获取当前选中的代理地址
        const { selectedProxyUrl = "https://gh-proxy.org" } = await chrome.storage.local.get('selectedProxyUrl');
        // 通知background更新规则
        chrome.runtime.sendMessage({
          type: 'updateProxyRule',
          enabled: isChecked,
          proxyUrl: selectedProxyUrl
        });
        // 更新状态提示
        proxyStatus.textContent = isChecked ? `✅ 下载代理站已启用（${selectedProxyUrl}）` : '❌ 下载代理站已关闭';
        proxyStatus.style.color = isChecked ? '#009688' : '#f44336';
      });
    } catch (e) {
      proxyStatus.textContent = `❌ 开关加载失败：${e.message}`;
      proxyStatus.style.color = '#f44336';
    }
  };

  // 主逻辑初始化
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const realUrl = getOriginalGithubUrl(tab.url);
    
    // 显示URL
    const displayUrl = realUrl.substring(0, 50) + (realUrl.length > 50 ? '...' : '');
    currentUrlEl.textContent = displayUrl;
    
    // 更新域名切换按钮
    updateBtnText(realUrl);

    // 域名切换点击事件
    switchBtn.addEventListener('click', async () => {
      if (switchBtn.disabled || !realUrl) return;
      try {
        const urlObj = new URL(realUrl);
        let targetUrl = '';
        if (urlObj.hostname === 'github.com') {
          targetUrl = realUrl.replace('github.com', 'bgithub.xyz');
        } else if (urlObj.hostname === 'bgithub.xyz') {
          targetUrl = realUrl.replace('bgithub.xyz', 'github.com');
        } else {
          throw new Error('非GitHub域名');
        }
        await chrome.tabs.update(tab.id, { url: targetUrl });
        statusEl.textContent = `✅ 已切换：${targetUrl.substring(0, 50)}...`;
        statusEl.style.color = '#009688';
        currentUrlEl.textContent = targetUrl.substring(0, 50) + (targetUrl.length > 50 ? '...' : '');
        updateBtnText(targetUrl);
      } catch (e) {
        statusEl.textContent = `❌ 切换失败：${e.message}`;
        statusEl.style.color = '#f44336';
      }
    });

    // 初始化代理地址下拉菜单
    await initProxyUrlSelect();
    // 初始化代理开关
    await initProxySwitch();

  } catch (error) {
    currentUrlEl.textContent = '获取失败';
    statusEl.textContent = `❌ ${error.message}`;
    statusEl.style.color = '#f44336';
    switchBtn.textContent = '加载失败';
    switchBtn.disabled = true;
    proxyStatus.textContent = `❌ 初始化失败：${error.message}`;
    proxyStatus.style.color = '#f44336';
  }
}, 0);