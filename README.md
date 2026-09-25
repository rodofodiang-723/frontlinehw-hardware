# Frontline Hardware

Frontline Hardware is a responsive hardware and construction-supply storefront for Nairobi, Kenya, with a Supabase-backed staff dashboard for products, offers, enquiries, and storefront settings.

## Project Structure

- `index_24/` - public storefront and product pages
- `admin2/` - staff dashboard and admin migrations
- `netlify.toml` - Netlify publish directory and security headers
- `SECURITY_HARDENING_SUMMARY.md` - deployment and database security notes
- `SUPABASE_RLS_HARDENING_CHECKLIST.md` - Supabase setup and verification checklist

## Run Locally

This is a static site. Serve the repository root over HTTP so local assets, JSON configuration, and browser requests work correctly.

```powershell
npx serve .
```

Then open:

- Storefront: `http://localhost:3000/index_24/`
- Admin dashboard: `http://localhost:3000/admin2/admin_2.html`

The project also includes a `package.json` with the frontend dependency manifest and an `npm run audit` security audit command.

## Deployment

The included `netlify.toml` configures Netlify to publish `index_24/`:

```text
Publish directory: index_24
```

The configuration also adds browser security headers and disables indexing and caching for the `/admin2/` area.

## Supabase Setup

Runtime configuration is stored in:

- `index_24/site-config.json`
- `admin2/admin-config.json`

Before using the admin dashboard in a new environment:

1. Configure the Supabase URL and publishable/anon key.
2. Apply the SQL migrations in `index_24/` and `admin2/` as appropriate.
3. Apply and verify the RLS policies using `SUPABASE_RLS_HARDENING_CHECKLIST.md`.
4. Create a user with the required staff, manager, or admin role.

Never place a Supabase service-role key or other private secret in browser-facing files.

## Main Features

- Responsive storefront for phones, tablets, and desktop monitors
- Product catalogue and category pages
- Offers and deals
- Quote list and WhatsApp enquiry flows
- Delivery request form
- Product search and filtering
- Dark mode
- Staff product, offer, enquiry, and storefront settings management
- Security headers and Supabase row-level security support
