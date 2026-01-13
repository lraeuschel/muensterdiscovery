import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../SupabaseClient";
import { Center, Spinner } from "@chakra-ui/react";

export default function ProtectedRouting() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false); // Ensure loading stops on change
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <Center h="100vh" bg="orange.50">
        <Spinner size="xl" color="orange.500" />
      </Center>
    );
  }

  // If not authenticated, redirect to welcome
  if (!session) {
    return <Navigate to="/welcome" replace />;
  }

  // Render the child route
  return <Outlet />;
}
