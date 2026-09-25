# Supabase Row Level Security (RLS) Hardening Checklist

**Status**: Critical security gate to verify before considering site hardening complete.

---

## Overview

The public Supabase `anonKey` in [index_24/site-config.json](index_24/site-config.json) is intentionally public. It is **not a secret** by design — the real security layer is **Row Level Security (RLS)** enforced at the database level.

If RLS is not properly configured, the database is unprotected despite correct deployment headers.

---

## Access the Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Log in with your Supabase account
3. Select the Frontline Hardware project
4. Navigate to **Authentication** > **Policies** (or **SQL Editor** for manual verification)

---

## Phase 1: Verify RLS is Enabled on Core Tables

### Step 1.1: Check that RLS is ON for each table

Go to **Editor** > **Tables** and confirm each table has RLS enabled:

- [ ] `public.products` — RLS enabled (toggle ON, right panel)
- [ ] `public.offers` — RLS enabled
- [ ] `public.leads` — RLS enabled

**If RLS is not enabled**, click the **Edit** button for the table and toggle "Enable RLS" ON.

---

## Phase 2: Apply Core RLS Policies

### Step 2.1: Run the RLS policy script

1. Go to **SQL Editor** in the Supabase dashboard
2. Copy the entire contents of [index_24/rls_policies.sql](index_24/rls_policies.sql)
3. Paste into a new SQL query
4. Click **Run**

**Expected output:**
```
Query executed successfully
```

This script creates:
- **products**: Public read, staff/manager insert/update, admin delete
- **offers**: Public read, staff/manager insert/update, admin delete
- **leads**: Public insert (with validation), admin/manager read/delete

---

## Phase 3: Apply Security Hardening Policies

### Step 3.1: Run the security hardening script

1. Go to **SQL Editor** again
2. Copy the entire contents of [admin2/security_hardening.sql](admin2/security_hardening.sql)
3. Paste into a new SQL query
4. Click **Run**

**Expected output:**
```
Query executed successfully
```

This script creates:
- **admin_audit_logs**: Audit trail table for admin actions
- **Media bucket policies**: Restrict upload/delete to authenticated staff

---

## Phase 4: Verify Policies are Installed

### Step 4.1: Check policies exist via dashboard

1. Go to **Authentication** > **Policies**
2. For each table, expand the section and verify all expected policies are present:

| Table | Expected Policies |
|-------|------------------|
| `products` | `products_public_read`, `products_staff_insert`, `products_staff_update`, `products_admin_delete` |
| `offers` | `offers_public_read`, `offers_staff_insert`, `offers_staff_update`, `offers_admin_delete` |
| `leads` | `leads_public_insert`, `leads_admin_read`, `leads_admin_delete` |

**Check each policy** by clicking on it and verifying:
- The condition matches the SQL file
- The correct roles are referenced (admin, manager, staff)
- No typos or missing conditions

### Step 4.2: Verify policies in SQL Editor (optional but recommended)

Run this query to list all active RLS policies:

```sql
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

**Expected output** should show ~13 rows (3 policies per main table + audit + storage).

---

## Phase 5: Test Access Control (Optional but Recommended)

### Step 5.1: Test public read access

Using your browser console or curl:

```javascript
// This should succeed (anon key has public read)
const { data, error } = await supabase
  .from('products')
  .select('*')
  .limit(1);

console.log(data, error);  // Should show 1 product, no error
```

### Step 5.2: Test public write rejection

Using your browser console:

```javascript
// This should FAIL (anon key cannot write)
const { data, error } = await supabase
  .from('products')
  .insert([{ name: 'Hacked Product', price: 0.01 }]);

console.log(error.message);  // Should show "new row violates row-level security policy"
```

### Step 5.3: Test authenticated write access

1. Create a test admin user in Supabase **Authentication** > **Users**
2. Log in as that user
3. Run the insert again with the authenticated session
4. It should **succeed** (assuming the user has role='admin' in custom claims)

---

## Phase 6: Configure Admin User Roles

### Step 6.1: Set up custom claims for admin users

For each admin/manager user, add the role to their custom claims:

1. Go to **Authentication** > **Users**
2. Click on an admin user
3. Under **User Metadata** (or **App Metadata**), add or edit:

```json
{
  "role": "admin"
}
```

For managers:
```json
{
  "role": "manager"
}
```

For staff (if applicable):
```json
{
  "role": "staff"
}
```

4. Click **Save**

**Repeat for all admin/manager accounts.**

---

## Phase 7: Final Verification Checklist

- [ ] RLS is enabled on `products`, `offers`, `leads`
- [ ] All 13+ policies are installed and visible in the dashboard
- [ ] Public read queries work (SELECT)
- [ ] Public write queries fail (INSERT, UPDATE, DELETE)
- [ ] Authenticated admin users have `role: "admin"` in metadata
- [ ] All admin/manager users have appropriate role set
- [ ] No errors in SQL Editor when running policies
- [ ] Admin audit log table exists and can be queried by admin/manager

---

## Security Model Summary

| Table | Anon (Public) | Authenticated (with role) |
|-------|--------------|--------------------------|
| **products** | READ only | READ, INSERT (staff+), UPDATE (staff+), DELETE (admin+) |
| **offers** | READ only | READ, INSERT (staff+), UPDATE (staff+), DELETE (admin+) |
| **leads** | INSERT only (validated fields) | READ (admin/manager), DELETE (admin/manager) |
| **admin_audit_logs** | — | INSERT (any staff), READ (admin/manager) |

---

## Troubleshooting

### Issue: "new row violates row-level security policy"
✅ **Expected** when public users try to write. This is the RLS gate working.

### Issue: Admin user can't insert products
❌ **Problem**: User lacks role in metadata.
- [ ] Go to **Authentication** > **Users**, find the user
- [ ] Add `"role": "admin"` to **App Metadata**
- [ ] Have the user log out and log back in (JWT is cached)

### Issue: Policies don't appear in dashboard
❌ **Problem**: Script may have failed.
- [ ] Go to **SQL Editor**
- [ ] Run the policy script again
- [ ] Check for error messages at the bottom

### Issue: Can read/write public data but don't see new rows
❌ **Problem**: May be a caching issue.
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Open an incognito/private window
- [ ] Verify in SQL Editor: `select count(*) from products;`

---

## Deployment Confirmation

Once ALL checks in Phase 7 pass:

1. ✅ The site is protected by both:
   - Browser security headers (in [netlify.toml](netlify.toml))
   - Database-level access control (RLS in Supabase)

2. ✅ Public users can browse products/offers but cannot modify data
3. ✅ Admin area requires authentication + role check
4. ✅ All writes are logged in admin_audit_logs

**Site hardening is complete and verified.**

---

## Next Steps

If issues arise:
1. Check the Supabase logs: **Logs** > **Query Performance** or **Auth**
2. Run diagnostic SQL queries from the SQL Editor
3. Review error messages in browser console (F12)
4. Contact Supabase support if policies fail to apply

