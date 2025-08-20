import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: displayName ? { display_name: displayName } : {}
        }
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Cadastro realizado",
        description: "Verifique seu email para confirmar a conta."
      });
      
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: new Error(errorMessage) };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Login realizado",
        description: "Bem-vindo de volta!"
      });
      
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: new Error(errorMessage) };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Erro no logout",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Logout realizado",
        description: "Até logo!"
      });
      
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro no logout",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: new Error(errorMessage) };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };
};