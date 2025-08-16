# Deployment Guide: My Diary Task Manager

This guide will help you deploy your Daily Task Manager app to Vercel.

## Prerequisites

1. A Vercel account (free at [vercel.com](https://vercel.com))
2. A Supabase project (free at [supabase.com](https://supabase.com))
3. Your app code ready for deployment

## Step 1: Set up Supabase

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key

### 1.2 Set up the Database
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the schema from `supabase-schema.sql`
4. If you have an existing database, also run the migration from `migration-add-onboarding.sql`

### 1.3 Configure Authentication
1. In your Supabase dashboard, go to Authentication > Settings
2. Add your Vercel deployment URL to the Site URL (you'll get this after deployment)
3. Add `http://localhost:3000` for local development

## Step 2: Prepare Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase project URL and anon key.

## Step 3: Deploy to Vercel

### 3.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository (or use the Vercel CLI)

### 3.2 Configure the Project
1. Set the framework preset to "Next.js"
2. Set the root directory to `my-diary` (if your app is in a subdirectory)
3. Set the build command to: `npm run build`
4. Set the output directory to: `.next`

### 3.3 Add Environment Variables
In the Vercel project settings, add these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

### 3.4 Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at the provided URL

## Step 4: Update Supabase Settings

After deployment:
1. Go back to your Supabase dashboard
2. Navigate to Authentication > Settings
3. Add your Vercel deployment URL to the Site URL list
4. Save the changes

## Step 5: Test Your Deployment

1. Visit your deployed app URL
2. Try creating an account and logging in
3. Test the core functionality:
   - Adding tasks
   - Completing tasks
   - Creating projects
   - Using the onboarding flow

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check that your Supabase URL and anon key are correct
   - Verify that your Vercel URL is added to Supabase Site URLs
   - Check the browser console for errors

2. **Database errors**
   - Ensure you've run the schema migration
   - Check that RLS policies are properly set up
   - Verify your database connection

3. **Build failures**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation passes locally
   - Check the build logs in Vercel

### Environment Variables Check

Make sure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Local Development

To test locally before deploying:
```bash
cd my-diary
npm install
npm run dev
```

## Post-Deployment

1. **Monitor your app**: Check Vercel analytics and Supabase logs
2. **Set up custom domain** (optional): Configure a custom domain in Vercel
3. **Enable monitoring**: Set up error tracking with services like Sentry
4. **Backup strategy**: Set up regular database backups in Supabase

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables for all sensitive data
- Regularly rotate your Supabase keys
- Monitor your app for unusual activity

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Review Supabase logs in the dashboard
3. Check the browser console for client-side errors
4. Verify all environment variables are set correctly

Your app should now be live and ready for users! 🎉

