import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";

export default function useAdminGuard(options = {}) {
  const {
    redirectTo = "/admin",
    profileSelect = "role,name,email",
    signOutOnUnauthorized = false,
  } = options;

  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const verify = useCallback(async () => {
    setChecking(true);

    try {
      const {
        data: { session: nextSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!nextSession) {
        setAuthorized(false);
        setSession(null);
        setProfile(null);
        navigate(redirectTo, { replace: true });
        return { ok: false };
      }

      const { data: nextProfile, error: profileError } = await supabase
        .from("users")
        .select(profileSelect)
        .eq("id", nextSession.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (nextProfile?.role !== "admin") {
        if (signOutOnUnauthorized) {
          try {
            await supabase.auth.signOut();
          } catch {
            /* noop */
          }
        }

        setAuthorized(false);
        setSession(nextSession);
        setProfile(nextProfile || null);
        navigate(redirectTo, { replace: true });

        return { ok: false, session: nextSession, profile: nextProfile || null };
      }

      setAuthorized(true);
      setSession(nextSession);
      setProfile(nextProfile || null);

      return { ok: true, session: nextSession, profile: nextProfile || null };
    } catch (err) {
      setAuthorized(false);
      setSession(null);
      setProfile(null);
      navigate(redirectTo, { replace: true });
      return { ok: false, error: err };
    } finally {
      setChecking(false);
    }
  }, [navigate, profileSelect, redirectTo, signOutOnUnauthorized]);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!active) return;
      await verify();
    })();

    return () => {
      active = false;
    };
  }, [verify]);

  return {
    checking,
    authorized,
    session,
    profile,
    refreshGuard: verify,
  };
}
