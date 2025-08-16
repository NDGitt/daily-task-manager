// One-time cleanup script for timezone-related task issues
// This will clean up incorrect August 16th tasks and localStorage entries

console.log('🧹 Starting timezone cleanup...');

// Clean up localStorage entries
function cleanupLocalStorage() {
  console.log('📱 Cleaning up localStorage...');
  
  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  
  // Find and remove carry-over tracking keys for future dates
  keys.forEach(key => {
    if (key.startsWith('carryOver_')) {
      const date = localStorage.getItem(key);
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      console.log(`Found carry-over entry: ${key} = ${date}`);
      console.log(`Today (local): ${todayStr}`);
      
      if (date && date > todayStr) {
        console.log(`❌ Removing incorrect future date: ${key}`);
        localStorage.removeItem(key);
      }
    }
  });
  
  console.log('✅ localStorage cleanup complete');
}

// Run the cleanup
cleanupLocalStorage();

console.log('🎉 Timezone cleanup completed!');
console.log('');
console.log('Next steps:');
console.log('1. Delete August 16th tasks from your Supabase database');
console.log('2. Refresh the app');
console.log('3. The automatic carry-over is temporarily disabled');
console.log('4. You can still manually carry over tasks using the "Carry over tasks" button');
