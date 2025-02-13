/**
 * Twitter 高级搜索插件 - 后台脚本
 * @version 1.0.0
 * @description 处理搜索请求并在当前标签页打开搜索结果
 */

// 常量定义
const TWITTER_SEARCH_BASE_URL = 'https://twitter.com/search?q=';
const ERROR_MESSAGES = {
    TAB_UPDATE_FAILED: '更新标签页失败',
    TAB_QUERY_FAILED: '获取当前标签页失败',
    SEARCH_ERROR: '搜索过程中发生错误'
};

/**
 * 执行 Twitter 搜索
 * @param {string} query - 搜索查询字符串
 * @returns {Promise<Object>} - 包含搜索结果的Promise
 */
async function performTwitterSearch(query) {
    try {
        const searchUrl = `${TWITTER_SEARCH_BASE_URL}${encodeURIComponent(query)}&f=top`;
        const tabs = await chrome.tabs.query({active: true, currentWindow: true});
        
        if (!tabs || !tabs.length) {
            throw new Error(ERROR_MESSAGES.TAB_QUERY_FAILED);
        }
        
        const tab = await chrome.tabs.update(tabs[0].id, { url: searchUrl });
        return { success: true, tabId: tab.id };
    } catch (error) {
        console.error(ERROR_MESSAGES.SEARCH_ERROR, error);
        return { success: false, error: error.message };
    }
}

// 初始化扩展
chrome.runtime.onInstalled.addListener(() => {
    console.log('Twitter 高级搜索插件已成功安装');
});

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'performSearch') {
        performTwitterSearch(request.query)
            .then(sendResponse)
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // 保持消息通道打开以进行异步响应
    }
});

