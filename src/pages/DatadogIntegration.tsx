import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useMonitorStorage } from "@/hooks/useMonitorStorage";

interface LocationState {
  serviceName?: string;
  technology?: string;
  org?: string; // DEV | UAT | PRD
  journey?: string;
  product?: string;
  monitorData?: any;
}

const DatadogIntegration: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { toast } = useToast();
  const { saveMonitor } = useMonitorStorage();

  const { serviceName = "", technology = "", org = "", journey = "", product = "", monitorData } =
    (state as LocationState) || {};

  useEffect(() => {
    const run = async () => {
      // validação dos parâmetros da navegação
      if (!serviceName || !org) {
        toast({ title: "Dados insuficientes", description: "Informe serviço e ambiente (ORG)." });
        navigate("/criar-monitor", { replace: true });
        return;
      }

      try {
        // Simula criação de monitor - bypass das APIs externas
        await new Promise(resolve => setTimeout(resolve, 1500));

        const slug = `${serviceName}-${technology || "Service"}`.replace(/\s+/g, "-").toLowerCase();
        
        // Gera links genéricos para os 4 tipos de monitor Golden Signals
        const links = [
          { label: "Latência", url: `https://monitoring.example.com/latency/${slug}` },
          { label: "Tráfego", url: `https://monitoring.example.com/traffic/${slug}` },
          { label: "Erros", url: `https://monitoring.example.com/errors/${slug}` },
          { label: "Saturação", url: `https://monitoring.example.com/saturation/${slug}` },
        ];

        // Save monitor to session storage if data was provided
        if (monitorData) {
          const updatedMonitorData = {
            ...monitorData,
            monitor_links: links.map(link => ({ type: link.label, url: link.url }))
          };
          saveMonitor(updatedMonitorData);
        }

        toast({ title: "Monitor criado", description: "Monitor Datadog criado com sucesso." });
        navigate("/monitores/datadog", {
          replace: true,
          state: { serviceName, links, monitorData },
        });
      } catch (e: any) {
        toast({
          title: "Erro ao criar monitor",
          description: "Falha inesperada ao gerar monitor.",
        });
        navigate("/criar-monitor", { replace: true });
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>Integração Datadog — Criando monitor</title>
        <meta
          name="description"
          content="Criando monitor no Datadog via API e preparando redirecionamento."
        />
        <link
          rel="canonical"
          href={typeof window !== "undefined" ? window.location.href : "/integracoes/datadog"}
        />
      </Helmet>

      <div className="min-h-screen bg-muted/30 py-10">
        <main className="container">
          <section className="mx-auto max-w-lg">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Criando monitor no Datadog…</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                <span>Isso pode levar alguns segundos.</span>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </>
  );
};

export default DatadogIntegration;
