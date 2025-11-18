/**
 * Reaction Test Utility
 * 
 * This utility helps test the reaction functionality end-to-end.
 * Run this in the browser console when the chat is open.
 */

export const ReactionTest = {
  // Test clicking a reaction button
  testReactionClick: (messageId: number, emoji: string = '❤️') => {
    console.log('🧪 [ReactionTest] Testing reaction click:', { messageId, emoji });
    
    // Find the message element
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) {
      console.error('❌ [ReactionTest] Message element not found:', messageId);
      return false;
    }
    
    // Find the reaction button (try multiple selectors)
    const reactionButton = messageElement.querySelector(`button[title*="${emoji}"]`) ||
                          messageElement.querySelector(`button:has(span:contains("${emoji}"))`) ||
                          Array.from(messageElement.querySelectorAll('button')).find(btn => 
                            btn.textContent?.includes(emoji)
                          );
    
    if (!reactionButton) {
      console.error('❌ [ReactionTest] Reaction button not found for emoji:', emoji);
      
      // Try to find the emoji picker button first
      const emojiPickerButton = messageElement.querySelector('.emoji-picker-button, [title*="emoji"], [title*="react"]');
      if (emojiPickerButton) {
        console.log('🎯 [ReactionTest] Found emoji picker button, clicking it first');
        emojiPickerButton.click();
        
        // Wait a bit for the picker to appear
        setTimeout(() => {
          const pickerButton = document.querySelector(`.emoji-picker button[title*="${emoji}"]`) ||
                              Array.from(document.querySelectorAll('.emoji-picker button')).find(btn => 
                                btn.textContent?.includes(emoji)
                              );
          
          if (pickerButton) {
            console.log('🎯 [ReactionTest] Found picker button, clicking it');
            pickerButton.click();
          } else {
            console.error('❌ [ReactionTest] Still could not find reaction button in picker');
          }
        }, 100);
      }
      return false;
    }
    
    console.log('🎯 [ReactionTest] Found reaction button, clicking it');
    reactionButton.click();
    return true;
  },

  // Test double-tap for heart reaction
  testDoubleTap: (messageId: number) => {
    console.log('🧪 [ReactionTest] Testing double-tap for heart reaction:', messageId);
    
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) {
      console.error('❌ [ReactionTest] Message element not found:', messageId);
      return false;
    }
    
    // Simulate double tap
    messageElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    setTimeout(() => {
      messageElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }, 100);
    
    return true;
  },

  // Monitor WebSocket events
  monitorWebSocketEvents: () => {
    console.log('🧪 [ReactionTest] Starting WebSocket event monitoring');
    
    // Store original console.log
    const originalLog = console.log;
    
    // Override console.log to capture reaction events
    console.log = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('reaction:added') || 
          message.includes('reaction:removed') ||
          message.includes('Reaction added') ||
          message.includes('Reaction removed') ||
          message.includes('Adding reaction') ||
          message.includes('Quick reaction')) {
        console.log('🔍 [ReactionTest] REACTION EVENT:', ...args);
      }
      
      // Call original log
      originalLog.apply(console, args);
    };
    
    return () => {
      console.log = originalLog;
      console.log('🧪 [ReactionTest] Stopped WebSocket event monitoring');
    };
  },

  // Get current message reactions
  getMessageReactions: (messageId: number) => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) {
      console.error('❌ [ReactionTest] Message element not found:', messageId);
      return null;
    }
    
    const reactionsElement = messageElement.querySelector('.reactions-bar, [class*="reaction"]');
    if (!reactionsElement) {
      console.log('ℹ️ [ReactionTest] No reactions found for message:', messageId);
      return [];
    }
    
    const reactions = Array.from(reactionsElement.querySelectorAll('[class*="reaction"]')).map(el => ({
      emoji: el.querySelector('span')?.textContent,
      count: el.querySelector('[class*="count"]')?.textContent,
      element: el
    }));
    
    console.log('📊 [ReactionTest] Current reactions for message', messageId, ':', reactions);
    return reactions;
  },

  // Run complete test suite
  runTestSuite: (messageId: number) => {
    console.log('🧪 [ReactionTest] Starting complete reaction test suite for message:', messageId);
    
    const stopMonitoring = ReactionTest.monitorWebSocketEvents();
    
    // Test 1: Get initial state
    console.log('📊 Test 1: Getting initial reaction state');
    ReactionTest.getMessageReactions(messageId);
    
    // Test 2: Click heart reaction
    setTimeout(() => {
      console.log('💖 Test 2: Clicking heart reaction');
      ReactionTest.testReactionClick(messageId, '❤️');
    }, 1000);
    
    // Test 3: Check reactions after click
    setTimeout(() => {
      console.log('📊 Test 3: Checking reactions after heart click');
      ReactionTest.getMessageReactions(messageId);
    }, 2000);
    
    // Test 4: Click another reaction
    setTimeout(() => {
      console.log('😂 Test 4: Clicking laugh reaction');
      ReactionTest.testReactionClick(messageId, '😂');
    }, 3000);
    
    // Test 5: Check reactions after second click
    setTimeout(() => {
      console.log('📊 Test 5: Checking reactions after laugh click');
      ReactionTest.getMessageReactions(messageId);
    }, 4000);
    
    // Test 6: Double tap test
    setTimeout(() => {
      console.log('💖 Test 6: Testing double-tap for heart');
      ReactionTest.testDoubleTap(messageId);
    }, 5000);
    
    // Test 7: Final check
    setTimeout(() => {
      console.log('📊 Test 7: Final reaction state check');
      ReactionTest.getMessageReactions(messageId);
      
      console.log('🧪 [ReactionTest] Test suite completed! Stopping monitoring.');
      stopMonitoring();
    }, 6000);
  }
};

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).ReactionTest = ReactionTest;
  console.log('🧪 [ReactionTest] ReactionTest utility loaded. Use ReactionTest.runTestSuite(messageId) to test.');
}
