import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Zap, AlertTriangle, Activity, Lightbulb, Home, Target, Settings, Database, BarChart3, Eye, Timer } from "lucide-react";

const GenericMonitorSuggestions: React.FC = () => {
  const navigate = useNavigate();

  const goldenSignals = [
    {
      name: "Latência",
      icon: <Timer className="h-5 w-5" />,
      description: "Tempo de resposta das requisições e operações",
      significance: "Mede diretamente a experiência do usuário. Alta latência impacta a satisfação e pode indicar gargalos de performance.",
      metrics: ["Response time P50, P95, P99", "Database query time", "External API calls", "Time to First Byte (TTFB)"],
      thresholds: "P95 < 500ms, P99 < 1000ms",
      implementation: "Instrumentar pontos críticos de entrada e saída de requests, medir tempo de DB queries e chamadas externas."
    },
    {
      name: "Tráfego",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Volume de requisições e demanda no sistema",
      significance: "Indica o crescimento do negócio e ajuda a planejar capacidade. Variações súbitas podem indicar problemas ou campanhas.",
      metrics: ["Requests per second", "Concurrent users", "Throughput", "Page views", "Transaction volume"],
      thresholds: "Baseline + 50% spike detection",
      implementation: "Contar requisições HTTP, sessões ativas, transações de negócio e métricas de uso por funcionalidade."
    },
    {
      name: "Erros",
      icon: <AlertTriangle className="h-5 w-5" />,
      description: "Taxa de erros e falhas no sistema",
      significance: "Impacta diretamente a confiabilidade. Erros frequentes degradam a experiência e podem causar perda de receita.",
      metrics: ["Error rate %", "HTTP 4xx/5xx errors", "Exception count", "Failed transactions", "Timeout errors"],
      thresholds: "< 1% error rate, < 0.1% critical errors",
      implementation: "Capturar exceções, códigos HTTP de erro, timeouts e falhas de transações críticas de negócio."
    },
    {
      name: "Saturação",
      icon: <Activity className="h-5 w-5" />,
      description: "Utilização de recursos e capacidade",
      significance: "Previne problemas antes que afetem usuários. Recursos saturados causam degradação de performance.",
      metrics: ["CPU usage %", "Memory usage %", "Disk I/O", "Network utilization", "Connection pools"],
      thresholds: "CPU < 80%, Memory < 85%, Disk < 90%",
      implementation: "Monitorar recursos de sistema, pools de conexão, filas e limitadores de taxa."
    }
  ];

  const toolSpecificPractices = {
    datadog: {
      name: "Datadog",
      icon: <img loading="lazy" width={20} height={20} alt="Datadog logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/datadog/datadog-original.svg" className="h-5 w-5" />,
      practices: [
        "Use tags padronizados para filtragem (env, service, version)",
        "Configure APM traces para visibilidade de transações",
        "Implemente custom metrics para métricas de negócio",
        "Use Synthetic Monitoring para testes proativos",
        "Configure alertas compostos para reduzir ruído"
      ],
      instrumentation: [
        "Adicionar bibliotecas dd-trace para linguagens suportadas",
        "Configurar environment variables (DD_SERVICE, DD_ENV, DD_VERSION)",
        "Instrumentar chamadas de database e serviços externos",
        "Adicionar custom spans para operações críticas"
      ]
    },
    zabbix: {
      name: "Zabbix",
      icon: <img loading="lazy" width={24} height={16} alt="Zabbix logo" src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Zabbix_logo.svg" className="h-5 w-5" />,
      practices: [
        "Organize hosts em grupos lógicos",
        "Use templates para padronizar monitoração",
        "Configure auto-discovery para novos recursos",
        "Implemente escalation chains para alertas",
        "Use macros para configurações dinâmicas"
      ],
      instrumentation: [
        "Instalar e configurar Zabbix Agent nos hosts",
        "Criar items personalizados via UserParameter",
        "Configurar SNMP para devices de rede",
        "Implementar Zabbix Sender para métricas customizadas"
      ],
      triggerDetails: [
        "Expression: Define condição lógica para disparo",
        "Severity: Classifica criticidade (Not classified → Disaster)",
        "Recovery expression: Condição para resolução automática",
        "Correlation mode: Agrupa eventos relacionados",
        "Manual close: Permite fechamento manual",
        "Dependencies: Evita alertas em cascata",
        "URL: Link para runbook ou dashboard relacionado"
      ]
    },
    dynatrace: {
      name: "Dynatrace",
      icon: <img loading="lazy" width={20} height={20} alt="Dynatrace logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dynatrace/dynatrace-original.svg" className="h-5 w-5" />,
      practices: [
        "Aproveitar AI-powered anomaly detection",
        "Configurar management zones para segmentação",
        "Use service flow para mapear dependências",
        "Implemente business events para KPIs",
        "Configure alerting profiles personalizados"
      ],
      instrumentation: [
        "Deploy OneAgent para auto-instrumentação",
        "Configurar process groups e service detection rules",
        "Adicionar custom metrics via API ou extensions",
        "Usar RUM para monitoração de frontend",
        "Implementar synthetic monitoring"
      ],
      features: [
        "Smartscape: Mapeamento automático de topologia",
        "Davis AI: IA para detecção de anomalias e root cause",
        "Purepath: Rastreamento distribuído automático",
        "Session Replay: Replay de sessões de usuário",
        "Code-level visibility: Visibilidade até código fonte"
      ]
    }
  };

  const observabilityLevels = [
    {
      level: "Básico",
      description: "Monitoração essencial para operação",
      items: ["Health checks", "CPU/Memory/Disk", "Log errors", "Uptime monitoring"]
    },
    {
      level: "Intermediário",
      description: "Observabilidade para troubleshooting",
      items: ["APM traces", "Custom metrics", "Alerting rules", "Basic dashboards"]
    },
    {
      level: "Avançado",
      description: "Observabilidade proativa e analytics",
      items: ["Anomaly detection", "Predictive alerts", "Business metrics", "SLO monitoring"]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Boas Práticas de Observabilidade — Libs de Monitoração</title>
        <meta name="description" content="Guia completo de boas práticas de observabilidade, Golden Signals e instrumentalização para Datadog, Zabbix e Dynatrace." />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : "/boas-praticas"} />
      </Helmet>

      <div className="min-h-screen bg-muted/30 py-10">
        <main className="container max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold tracking-tight mb-4">Boas Práticas de Observabilidade</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Guia completo de instrumentalização, Golden Signals e melhores práticas para monitoração moderna
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/")} size="default" className="min-w-[140px]">
                <Home className="w-4 h-4 mr-2" />
                Página Inicial
              </Button>
            </div>
          </div>

          <Tabs defaultValue="golden-signals" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="golden-signals">Golden Signals</TabsTrigger>
              <TabsTrigger value="datadog">Datadog</TabsTrigger>
              <TabsTrigger value="zabbix">Zabbix</TabsTrigger>
              <TabsTrigger value="dynatrace">Dynatrace</TabsTrigger>
              <TabsTrigger value="levels">Níveis</TabsTrigger>
            </TabsList>

            {/* Golden Signals Tab */}
            <TabsContent value="golden-signals" className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Target className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Golden Signals do SRE</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {goldenSignals.map((signal) => (
                    <Card key={signal.name} className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {signal.icon}
                          {signal.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{signal.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 text-primary">Significado:</h4>
                          <p className="text-sm text-muted-foreground">{signal.significance}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Métricas recomendadas:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {signal.metrics.map((metric) => (
                              <li key={metric}>• {metric}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Implementação:</h4>
                          <p className="text-sm text-muted-foreground">{signal.implementation}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Thresholds sugeridos:</h4>
                          <Badge variant="outline" className="text-xs">
                            {signal.thresholds}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </TabsContent>

            {/* Datadog Tab */}
            <TabsContent value="datadog" className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-6">
                  {toolSpecificPractices.datadog.icon}
                  <h2 className="text-2xl font-semibold">{toolSpecificPractices.datadog.name}</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Boas Práticas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        {toolSpecificPractices.datadog.practices.map((practice, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{practice}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Instrumentalização</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        {toolSpecificPractices.datadog.instrumentation.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>

            {/* Zabbix Tab */}
            <TabsContent value="zabbix" className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-6">
                  {toolSpecificPractices.zabbix.icon}
                  <h2 className="text-2xl font-semibold">{toolSpecificPractices.zabbix.name}</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Boas Práticas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        {toolSpecificPractices.zabbix.practices.map((practice, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{practice}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Instrumentalização</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        {toolSpecificPractices.zabbix.instrumentation.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Detalhes do Trigger</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        {toolSpecificPractices.zabbix.triggerDetails.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>

            {/* Dynatrace Tab */}
            <TabsContent value="dynatrace" className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-6">
                  {toolSpecificPractices.dynatrace.icon}
                  <h2 className="text-2xl font-semibold">{toolSpecificPractices.dynatrace.name}</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Boas Práticas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        {toolSpecificPractices.dynatrace.practices.map((practice, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{practice}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Instrumentalização</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        {toolSpecificPractices.dynatrace.instrumentation.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recursos Avançados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        {toolSpecificPractices.dynatrace.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>

            {/* Observability Levels Tab */}
            <TabsContent value="levels" className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Lightbulb className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Níveis de Maturidade em Observabilidade</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {observabilityLevels.map((level, idx) => (
                    <Card key={level.level}>
                      <CardHeader>
                        <CardTitle>{level.level}</CardTitle>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm space-y-2">
                          {level.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Implementation Tips */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Dicas de Implementação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p><strong>1. Comece pelos Golden Signals:</strong> Implemente primeiro Latência, Tráfego, Erros e Saturação</p>
                  <p><strong>2. Use instrumentalização automática:</strong> Aproveite agents e bibliotecas que fazem auto-discovery</p>
                  <p><strong>3. Evite alert fatigue:</strong> Configure thresholds realistas baseados em dados históricos</p>
                  <p><strong>4. Contextualize alertas:</strong> Inclua links para runbooks, dashboards e próximos passos</p>
                  <p><strong>5. Monitore a experiência do usuário:</strong> Use Real User Monitoring (RUM) e synthetic monitoring</p>
                  <p><strong>6. Implemente SLOs:</strong> Defina Service Level Objectives baseados em necessidades de negócio</p>
                  <p><strong>7. Teste regularmente:</strong> Valide se alertas funcionam através de chaos engineering</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default GenericMonitorSuggestions;