import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to increment view count
export async function incrementViewCount() {
  try {
    // Get the current view count
    const { data, error } = await supabase
      .from('ib_views')
      .select('view_count')
      .single();
    
    if (error) {
      console.error('Error fetching view count:', error);
      return null;
    }
    
    // Increment the view count
    const newCount = (data?.view_count || 0) + 1;
    
    // Update the view count in the database
    const { error: updateError } = await supabase
      .from('ib_views')
      .update({ view_count: newCount })
      .eq('id', 1); // Assuming there's only one row with id=1
    
    if (updateError) {
      console.error('Error updating view count:', updateError);
      return null;
    }
    
    return newCount;
  } catch (error) {
    console.error('Error in incrementViewCount:', error);
    return null;
  }
}

// Function to get the current view count
export async function getViewCount() {
  try {
    const { data, error } = await supabase
      .from('ib_views')
      .select('view_count')
      .single();
    
    if (error) {
      console.error('Error fetching view count:', error);
      return null;
    }
    
    return data?.view_count || 0;
  } catch (error) {
    console.error('Error in getViewCount:', error);
    return null;
  }
} 