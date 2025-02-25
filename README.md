# seekinmonky

## View Counter Setup

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
