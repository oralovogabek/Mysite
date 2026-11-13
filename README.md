# Ogabek Developer Portfolio

Responsive personal portfolio + admin CMS built with HTML, CSS, Vanilla JavaScript and Supabase.

## 1. Run locally

1. Extract the ZIP.
2. Open the `ogabek-developer-portfolio` folder in VS Code.
3. Recommended: install the **Live Server** extension.
4. Right-click `index.html` -> **Open with Live Server**.
5. Open `admin.html` to access the admin panel.

### Demo admin login (local demo mode)
- Email: `admin@portfolio.local`
- Password: `Portfolio123!`

Demo mode uses browser `localStorage` and `sessionStorage`. It is for preview/testing only. It is not secure authentication and data is stored only in the current browser.

## 2. Connect Supabase (real shared data + secure admin)

1. Create a project at https://supabase.com.
2. Open **Project Settings -> API**.
3. Copy the Project URL and the `anon` / publishable key.
4. Open `js/config.js` and set:

```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://YOUR_PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY",
  DEMO_MODE: false
};
```

5. Open Supabase **SQL Editor**, paste the full contents of `supabase/schema.sql`, and run it.
6. Open Supabase **Authentication -> Users**, create your admin user with a strong password.
7. Copy that user's UUID from the Users table.
8. In SQL Editor, run:

```sql
insert into public.admins (user_id)
values ('PASTE-YOUR-AUTH-USER-UUID-HERE');
```

9. Open `admin.html` and sign in with the email/password you created in Supabase.

Do not use the `service_role` key in browser JavaScript. The anon/publishable key is intended for frontend use when Row Level Security policies are configured.

## 3. Add / edit projects

Admin -> Loyihalar -> Yangi loyiha. Fill in the title, category, description, technologies, optional image URL, GitHub URL and demo/Telegram URL. Choose whether it is published. The public site updates from Supabase.

Categories: `frontend`, `backend`, `bot`, `game`.

## 4. Deploy

You can deploy this static site to Netlify or GitHub Pages. Upload the extracted project folder (or connect its GitHub repository). Before publishing, configure Supabase and run the SQL setup above. For Netlify, publish directory is the project root; no build command is needed.

## 5. Notes

- Existing 26 projects are preloaded in `js/seed-data.js` for demo mode.
- The repository URLs are prefilled using the GitHub username and repository names supplied in the project brief; verify each URL and add demo links in Admin.
- Feedback form is functional in demo mode locally and shared via Supabase in live mode.
- The Supabase public feedback insert policy validates basic lengths. For a production public site, consider adding CAPTCHA / rate limiting (e.g. Edge Function) to reduce spam.
- The project uses CDN-hosted Supabase JS and Lucide icons, so internet access is needed for those libraries.
