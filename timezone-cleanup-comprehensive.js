// Comprehensive timezone cleanup script
// This will clean up incorrect August 16th tasks and localStorage entries
// Run with: node timezone-cleanup-comprehensive.js

import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase credentials
const supabaseUrl = 'https://zguwzdunujonwjbpbxfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndXd6ZHVudWpvbndqYnBieGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTM4MTYsImV4cCI6MjA3MDgyOTgxNn0.zO5TRlw-prsyHZf8MTqDhAa2GUZB-qnX2ps81vrDa8Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function comprehensiveTimezoneCleanup() {
  console.log('🧹 Starting comprehensive timezone cleanup...');
  
  try {
    // Step 1: Identify tasks created on August 16, 2024 (the problematic date)
    console.log('\n📊 Analyzing August 16, 2024 tasks...');
    const { data: aug16Tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('date_created', '2024-08-16')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching August 16 tasks:', fetchError);
      return;
    }

    console.log(`📋 Found ${aug16Tasks?.length || 0} tasks for August 16, 2024`);
    
    if (aug16Tasks && aug16Tasks.length > 0) {
      console.log('\n📝 Tasks to be cleaned up:');
      aug16Tasks.forEach((task, index) => {
        console.log(`  ${index + 1}. "${task.content}" (ID: ${task.id})`);
        console.log(`     - User: ${task.user_id}`);
        console.log(`     - Completed: ${task.completed}`);
        console.log(`     - Carry over count: ${task.carry_over_count}`);
        console.log(`     - Created at: ${task.created_at}`);
        console.log('');
      });

      // Step 2: Check if these tasks have duplicates on August 15
      console.log('\n🔍 Checking for duplicate tasks on August 15...');
      const userIds = [...new Set(aug16Tasks.map(task => task.user_id))];
      
      for (const userId of userIds) {
        const userAug16Tasks = aug16Tasks.filter(task => task.user_id === userId);
        
        const { data: aug15Tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .eq('date_created', '2024-08-15');

        console.log(`\n👤 User ${userId}:`);
        console.log(`   - Aug 15 tasks: ${aug15Tasks?.length || 0}`);
        console.log(`   - Aug 16 tasks: ${userAug16Tasks.length}`);
        
        if (aug15Tasks && aug15Tasks.length > 0) {
          // Look for potential duplicates based on content similarity
          const potentialDuplicates = userAug16Tasks.filter(aug16Task => 
            aug15Tasks.some(aug15Task => 
              aug15Task.content.toLowerCase().trim() === aug16Task.content.toLowerCase().trim()
            )
          );
          
          if (potentialDuplicates.length > 0) {
            console.log(`   ⚠️  Found ${potentialDuplicates.length} potential duplicates`);
            potentialDuplicates.forEach(task => {
              console.log(`      - "${task.content}"`);
            });
          }
        }
      }
    }

    // Step 3: Show what would be deleted (DRY RUN)
    console.log('\n🎯 CLEANUP PLAN:');
    console.log('================');
    
    if (!aug16Tasks || aug16Tasks.length === 0) {
      console.log('✅ No August 16 tasks found - database is already clean!');
    } else {
      console.log(`📋 Will delete ${aug16Tasks.length} tasks from August 16, 2024`);
      console.log('📱 Will clean up localStorage entries for affected users');
      
      // Group by user for clarity
      const tasksByUser = aug16Tasks.reduce((acc, task) => {
        if (!acc[task.user_id]) acc[task.user_id] = [];
        acc[task.user_id].push(task);
        return acc;
      }, {});
      
      Object.entries(tasksByUser).forEach(([userId, tasks]) => {
        console.log(`\n👤 User ${userId}: ${tasks.length} tasks`);
        tasks.forEach(task => {
          console.log(`   - "${task.content}" ${task.completed ? '✅' : '⏸️'}`);
        });
      });
    }

    console.log('\n⚠️  This was a DRY RUN - no data was actually deleted.');
    console.log('💡 To execute the cleanup, uncomment the deletion code below and run again.');
    
    // ACTUAL CLEANUP CODE (commented out for safety)
    /*
    console.log('\n🗑️  Executing cleanup...');
    
    if (aug16Tasks && aug16Tasks.length > 0) {
      // Delete the August 16 tasks
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('date_created', '2024-08-16');

      if (deleteError) {
        console.error('❌ Error deleting tasks:', deleteError);
      } else {
        console.log(`✅ Successfully deleted ${aug16Tasks.length} August 16 tasks`);
      }
    }
    
    console.log('✅ Cleanup completed!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Clear browser localStorage for affected users');
    console.log('2. Ask users to refresh their browsers');
    console.log('3. Re-enable automatic carry-over in the code');
    */

    // Step 4: Provide localStorage cleanup instructions
    console.log('\n🧹 LOCALSTORAGE CLEANUP INSTRUCTIONS:');
    console.log('=====================================');
    console.log('Run this in the browser console for each affected user:');
    console.log('');
    
    if (aug16Tasks && aug16Tasks.length > 0) {
      const affectedUsers = [...new Set(aug16Tasks.map(task => task.user_id))];
      affectedUsers.forEach(userId => {
        console.log(`// For user ${userId}:`);
        console.log(`localStorage.removeItem('carryOver_${userId}');`);
        console.log(`localStorage.removeItem('daily-tasks');`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the cleanup
comprehensiveTimezoneCleanup();
