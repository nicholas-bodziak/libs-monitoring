import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useMonitorStorage } from "@/hooks/useMonitorStorage";

interface LinkItem { label: string; url: string }
interface LocationState { 
  serviceName?: string; 
  links?: LinkItem[];
  monitorData?: any;
}

const DatadogMonitors: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { serviceName = "", links = [], monitorData } = (state as LocationState) || {};
  const { toast } = useToast();
  const { saveMonitor } = useMonitorStorage();

  useEffect(() => {
    if (!serviceName || links.length === 0) {
      toast({ title: "Acesso restrito", description: "Crie o monitor Datadog primeiro." });
      navigate("/criar-monitor", { replace: true });
    } else if (monitorData) {
      // Save monitor to session storage only once
      saveMonitor(monitorData);
    }
  }, [serviceName, links, navigate, toast, monitorData, saveMonitor]);

  // Map the incoming links (expected order) to the PT-BR labels/subtitles used in the design
  const items = [
    { title: "Latência", subtitle: "Latência de requisições", url: links[0]?.url },
    { title: "Tráfego", subtitle: "Contagem de requisições", url: links[1]?.url },
    { title: "Erros", subtitle: "Taxa de erros", url: links[2]?.url },
    { title: "Saturação", subtitle: "Saturação da CPU do Pod", url: links[3]?.url },
  ].filter(i => !!i.url);

  return (
    <>
      <Helmet>
        <title>Monitores Datadog — Libs de Monitoração</title>
        <meta name="description" content="Parabéns! Monitores Datadog criados com sucesso para seu serviço." />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : "/monitores/datadog"} />
      </Helmet>

      <div className="min-h-screen bg-muted/30 py-10">
        <main className="container">
          <section className="mx-auto max-w-2xl">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <h1 className="text-3xl font-semibold tracking-tight">Libs de Monitoração</h1>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md border border-success/20 bg-success/10 p-5 text-center">
                  <p className="text-lg font-semibold text-success-foreground">Parabéns! 🎉</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Monitor criado com sucesso para o serviço: <span className="font-medium text-foreground">{serviceName || "seu-serviço"}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="font-medium">Links dos monitores:</p>
                  <div className="space-y-3">
                    {items.map((it) => (
                      <div key={it.title} className="flex items-center justify-between rounded-md border bg-card p-4 shadow-sm">
                        <div>
                          <p className="font-medium">{it.title}</p>
                          <p className="text-sm text-muted-foreground">{it.subtitle}</p>
                        </div>
                        <a href={it.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">Ver monitor</Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-4 justify-center">
                <Button className="flex-1 max-w-[200px]" size="default" onClick={() => navigate("/criar-monitor")}>Criar novo monitor</Button>
                <Button className="flex-1 max-w-[200px]" size="default" onClick={() => navigate("/dashboard")}>Dashboards monitores</Button>
              </CardFooter>
            </Card>
          </section>
        </main>
      </div>
    </>
  );
};

export default DatadogMonitors;
