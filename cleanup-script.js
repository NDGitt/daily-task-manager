// Quick cleanup script to delete incorrect August 16th tasks
// Run this with: node cleanup-script.js

import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupIncorrectTasks() {
  try {
    // First, let's see what we're about to delete
    const { data: tasksToDelete, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('date_created', '2024-08-16');

    if (fetchError) {
      console.error('Error fetching tasks:', fetchError);
      return;
    }

    console.log('Tasks that will be deleted:', tasksToDelete);
    console.log(`Total tasks to delete: ${tasksToDelete?.length || 0}`);

    if (!tasksToDelete || tasksToDelete.length === 0) {
      console.log('No tasks found for August 16th');
      return;
    }

    // Uncomment the lines below to actually delete the tasks
    /*
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('date_created', '2024-08-16');

    if (deleteError) {
      console.error('Error deleting tasks:', deleteError);
    } else {
      console.log('Successfully deleted incorrect August 16th tasks');
    }
    */

    console.log('Uncomment the delete section to actually delete the tasks');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

cleanupIncorrectTasks();





