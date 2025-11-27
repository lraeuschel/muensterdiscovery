import { createClient } from '@supabase/supabase-js';

// TODO: Konfiguriere Supabase-Umgebungsvariablen in .env
// VITE_SUPABASE_URL=deine-url
// VITE_SUPABASE_PUBLISHABLE_KEY=dein-key

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key'
);