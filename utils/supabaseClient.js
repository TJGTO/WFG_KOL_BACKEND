const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// service_role key — server-only, bypasses RLS. Never send this to a client.
// Built defensively: createClient() throws immediately if either value is
// missing, which would otherwise crash the entire server at boot just
// because this one optional key isn't set yet. `supabase` is null until
// both env vars are present — callers must check before using it.
const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

module.exports = { supabase };
