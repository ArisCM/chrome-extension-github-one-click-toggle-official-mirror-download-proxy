// 动态创建DNR规则的核心函数
const createDynamicRules = (proxyUrl, enabled) => {
  // 清空现有动态规则
  return chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3, 4, 5], // 移除旧规则（ID对应之前的静态规则）
    addRules: enabled ? [
      // 规则1：匹配bgithub.xyz/releases/download
      {
        "id": 1,
        "priority": 30,
        "action": {
          "type": "redirect",
          "redirect": {
            "regexSubstitution": `${proxyUrl}/https://github.com/\\1`
          }
        },
        "condition": {
          "regexFilter": "^https://bgithub\\.xyz/(.*/releases/download/.*)$",
          "resourceTypes": ["main_frame", "sub_frame", "other", "xmlhttprequest", "script", "stylesheet"]
        }
      },
      // 规则2：匹配github.com/releases/download
      {
        "id": 2,
        "priority": 20,
        "action": {
          "type": "redirect",
          "redirect": {
            "regexSubstitution": `${proxyUrl}/https://github.com/\\1`
          }
        },
        "condition": {
          "regexFilter": "^https://github\\.com/(.*/releases/download/.*)$",
          "resourceTypes": ["main_frame", "sub_frame", "other", "xmlhttprequest", "script", "stylesheet"]
        }
      },
      // 规则3：匹配bgithub.xyz/archive
      {
        "id": 3,
        "priority": 30,
        "action": {
          "type": "redirect",
          "redirect": {
            "regexSubstitution": `${proxyUrl}/https://github.com/\\1`
          }
        },
        "condition": {
          "regexFilter": "^https://bgithub\\.xyz/(.*/archive/.*)$",
          "resourceTypes": ["main_frame", "sub_frame", "other", "xmlhttprequest", "script", "stylesheet"]
        }
      },
      // 规则4：匹配github.com/archive
      {
        "id": 4,
        "priority": 20,
        "action": {
          "type": "redirect",
          "redirect": {
            "regexSubstitution": `${proxyUrl}/https://github.com/\\1`
          }
        },
        "condition": {
          "regexFilter": "^https://github\\.com/(.*/archive/.*)$",
          "resourceTypes": ["main_frame", "sub_frame", "other", "xmlhttprequest", "script", "stylesheet"]
        }
      }
    ] : [] // 开关关闭时不添加规则
  });
};

// 初始化规则（Service Worker激活时）
const initProxyRule = async () => {
  try {
    // 读取存储的配置
    const result = await chrome.storage.local.get(['proxyEnabled', 'selectedProxyUrl']);
    const isEnabled = result.proxyEnabled ?? true;
    const proxyUrl = result.selectedProxyUrl ?? "https://gh-proxy.org";
    
    // 创建动态规则
    await createDynamicRules(proxyUrl, isEnabled);
    console.log(`初始化代理规则：${isEnabled ? '开启' : '关闭'}，代理地址：${proxyUrl}`);
  } catch (e) {
    console.error('初始化代理规则失败：', e);
  }
};

// 监听popup的消息，更新规则
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'updateProxyRule') {
    try {
      const proxyUrl = message.proxyUrl || "https://gh-proxy.org";
      await createDynamicRules(proxyUrl, message.enabled);
      console.log(`更新代理规则：${message.enabled ? '开启' : '关闭'}，代理地址：${proxyUrl}`);
      sendResponse({ success: true });
    } catch (e) {
      console.error('更新代理规则失败：', e);
      sendResponse({ success: false, error: e.message });
    }
  }
  return true; // 保持消息通道开放
});

// Service Worker激活时初始化
self.addEventListener('activate', async () => {
  console.log('Service Worker 激活成功（动态DNR模式）');
  await initProxyRule();
  // 验证当前动态规则
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    console.log('当前动态规则数量：', rules.length);
  });
});

// 监听storage变化（备用：防止直接修改storage时规则未更新）
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'local' && (changes.proxyEnabled || changes.selectedProxyUrl)) {
    const proxyEnabled = changes.proxyEnabled?.newValue ?? true;
    const selectedProxyUrl = changes.selectedProxyUrl?.newValue ?? "https://gh-proxy.org";
    await createDynamicRules(selectedProxyUrl, proxyEnabled);
  }
});