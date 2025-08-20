import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { MonitorData } from './useMonitorStorage';

// Updated interface to match database schema
interface SupabaseMonitorData {
  id: string;
  user_id: string;
  user_email: string;
  tool: string;
  service_name: string;
  impact_description?: string;
  monitor_types: string[];
  monitor_links: { type: string; url: string }[];
  created_at: string;
  updated_at: string;
  host_group?: string;
  condition?: string;
  condition_name?: string;
  org?: string;
  technology?: string;
}

export const useSupabaseMonitors = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch monitors for current user
  const { data: monitors = [], isLoading: isLoadingMonitors, error } = useQuery({
    queryKey: ['monitors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as SupabaseMonitorData[];
    },
    enabled: true // Will be disabled if user is not authenticated via RLS
  });

  // Save monitor mutation
  const saveMonitorMutation = useMutation({
    mutationFn: async (monitor: Omit<MonitorData, 'id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const monitorToSave = {
        user_id: user.id,
        user_email: monitor.user_email || user.email || '',
        tool: monitor.tool,
        service_name: monitor.service_name,
        impact_description: monitor.impact_description,
        monitor_types: monitor.monitor_types,
        monitor_links: monitor.monitor_links,
        host_group: monitor.hostGroup,
        condition: monitor.condition,
        condition_name: monitor.conditionName,
        org: monitor.org,
        technology: monitor.technology,
      };

      const { data, error } = await supabase
        .from('monitors')
        .insert([monitorToSave])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      toast({
        title: "Monitor salvo",
        description: "Monitor foi salvo com sucesso!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar monitor",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  // Delete monitor mutation
  const deleteMonitorMutation = useMutation({
    mutationFn: async (monitorId: string) => {
      const { error } = await supabase
        .from('monitors')
        .delete()
        .eq('id', monitorId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      toast({
        title: "Monitor removido",
        description: "Monitor foi removido com sucesso!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover monitor",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  const saveMonitor = useCallback((monitor: Omit<MonitorData, 'id' | 'created_at'>) => {
    return saveMonitorMutation.mutate(monitor);
  }, [saveMonitorMutation]);

  const deleteMonitor = useCallback((monitorId: string) => {
    return deleteMonitorMutation.mutate(monitorId);
  }, [deleteMonitorMutation]);

  const clearMonitors = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('monitors')
        .delete()
        .neq('id', ''); // This will delete all user's monitors due to RLS

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      toast({
        title: "Monitores limpos",
        description: "Todos os monitores foram removidos!"
      });
    } catch (error: any) {
      toast({
        title: "Erro ao limpar monitores",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, queryClient]);

  return {
    monitors,
    loading: loading || isLoadingMonitors || saveMonitorMutation.isPending || deleteMonitorMutation.isPending,
    error,
    saveMonitor,
    deleteMonitor,
    clearMonitors,
  };
};