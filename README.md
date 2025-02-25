# seekinmonky

## Features

### View Counter Setup

This project includes a view counter feature that tracks and displays the number of visitors to your portfolio. The view counter uses Supabase as the backend database.

### Setup Instructions

1. Create a Supabase account at [supabase.com](https://supabase.com) if you don't have one already.

2. Create a new Supabase project.

3. In your Supabase project, create a new table called `ib_views` with the following columns:
   - `id` (type: int8, primary key)
   - `created_at` (type: timestamptz, default: now())
   - `view_count` (type: numeric, default: 0)

4. Insert an initial row into the table:
   ```sql
   INSERT INTO ib_views (id, view_count) VALUES (1, 0);
   ```

5. Copy your Supabase URL and anon key from the Supabase dashboard (Settings > API).

6. Create a `.env.local` file in the root of your project (you can copy from `.env.local.example`) and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

7. Restart your development server if it's running.

The view counter will now track and display the number of unique visitor sessions to your portfolio. The counter is displayed in the footer of your site.

### Collaborative Code Editor

This project includes a real-time collaborative code editor that allows multiple users to code together simultaneously, similar to Google Docs but for coding. The collaborative editor uses Supabase's Realtime feature for synchronization.

#### Setup Instructions

1. In your Supabase project, run the SQL migration in `supabase/migrations/20240225_collaborative_documents.sql` to create the necessary table and functions.

2. Make sure your Supabase URL and anon key are set in your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. Enable the Realtime feature in your Supabase project:
   - Go to the Supabase dashboard
   - Navigate to Database > Replication
   - Enable the "Realtime" option for the `collaborative_documents` table

4. Restart your development server if it's running.

The collaborative code editor is now ready to use. You can access it at `/playground` and create or join coding sessions. Share the URL with others to code together in real-time.
