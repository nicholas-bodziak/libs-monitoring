import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info as InfoIcon, Link as LinkIcon, RotateCcw, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import awsLogo from "@/assets/aws.svg";
// Removed Gemini integration - using generic bypass instead
import { useMonitorStorage } from "@/hooks/useMonitorStorage";

// Helper types
 type Tool = "datadog" | "dynatrace" | "zabbix" | "";

 const TECH_BY_TOOL: Record<Exclude<Tool, "">, string[]> = {
  datadog: ["Kubernetes", "Node.js", "Java", "PostgreSQL", "NGINX"],
  dynatrace: ["Kubernetes", "Java", "NGINX", "AWS Lambda", ".NET"],
  zabbix: ["Linux", "Windows", "MySQL", "NGINX", "Docker"],
};

 // Ícones por tecnologia
 const TECH_LOGOS: Record<string, string> = {
  "Kubernetes": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
  "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-plain.svg",
  "Java": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-plain.svg",
  "PostgreSQL": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-plain.svg",
  "NGINX": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg",
  "AWS Lambda": awsLogo,
  ".NET": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-plain.svg",
  "Linux": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  "Windows": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg",
  "MySQL": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  "Docker": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
};

 // Lista de Grupos de Hosts do Zabbix (comuns)
 const ZABBIX_HOST_GROUPS: string[] = [
   "Servidores Linux",
   "Servidores Windows",
   "Dispositivos de Rede",
   "Servidores Web",
   "Bancos de Dados",
   "Máquinas Virtuais",
   "Hipervisores",
   "Storage",
   "Firewalls",
   "Balanceadores de Carga",
   "Contêineres Docker",
   "Kubernetes",
   "Aplicações",
   "Zabbix Servers",
   "Zabbix Proxies",
 ];
 
  // Condições de acionamento por Grupo de Hosts (expressões Zabbix)
  const ZABBIX_CONDITIONS_BY_GROUP: Record<string, { label: string; value: string }[]> = {
    "Servidores Linux": [
      { label: "Uso de CPU > 80%", value: "avg(5m):system.cpu.util[,idle] < 20" },
      { label: "Uso de Memória > 90%", value: "avg(5m):vm.memory.utilization > 90" },
      { label: "Espaço em Disco / < 5% livre", value: "max(5m):vfs.fs.size[/,pfree] < 5" },
      { label: "Load average alto (1m)", value: "avg(5m):system.cpu.load[percpu,avg1] > 2" },
      { label: "Swap livre < 10%", value: "avg(5m):system.swap.size[,pfree] < 10" },
    ],
    "Servidores Windows": [
      { label: "Uso de CPU > 85%", value: "avg(5m):system.cpu.util[,idle] < 15" },
      { label: "Uso de Memória > 90%", value: "avg(5m):vm.memory.utilization > 90" },
      { label: "Disco C: < 10% livre", value: "max(5m):vfs.fs.size[C:,pfree] < 10" },
      { label: "Serviço crítico parado", value: "min(5m):service.info[Spooler,state] = 0" },
    ],
    "Dispositivos de Rede": [
      { label: "Perda de ICMP > 20%", value: "avg(5m):icmppingloss > 20" },
      { label: "Latência ICMP > 300ms", value: "avg(5m):icmppingsec > 0.3" },
      { label: "Interface down", value: "last(ifOperStatus[eth0]) = 2" },
      { label: "Utilização de interface > 85%", value: "avg(5m):net.if.util[eth0] > 85" },
    ],
    "Servidores Web": [
      { label: "Serviço HTTP indisponível", value: "last(/web.test.fail[http_service]) > 0" },
      { label: "Tempo de resposta > 5s", value: "avg(5m):web.test.time[http_service,resp] > 5" },
      { label: "Erros HTTP 5xx", value: "avg(5m):web.test.fail[http_service] > 0" },
      { label: "Certificado SSL a expirar", value: "min(5m):vfs.file.time[/etc/ssl/cert.pem,modify] > 2505600" },
    ],
    "Bancos de Dados": [
      { label: "Conexões acima do limite", value: "avg(5m):db.connections[*,used] > 90" },
      { label: "Consultas lentas", value: "avg(5m):db.qps.slow > 10" },
      { label: "Replicação atrasada", value: "avg(5m):db.replication.lag > 60" },
      { label: "Espaço de tablespace baixo", value: "max(5m):vfs.fs.size[/var/lib,pfree] < 10" },
    ],
    "Máquinas Virtuais": [
      { label: "CPU ready alto", value: "avg(5m):vm.cpu.ready > 10" },
      { label: "Ballooning de memória", value: "avg(5m):vm.memory.ballooned > 0" },
      { label: "Latência de disco elevada", value: "avg(5m):vm.disk.latency > 30" },
    ],
    "Hipervisores": [
      { label: "CPU do host > 85%", value: "avg(5m):system.cpu.util[,idle] < 15" },
      { label: "Memória do host > 90%", value: "avg(5m):vm.memory.utilization > 90" },
      { label: "Latência de datastore", value: "avg(5m):vfs.dev.read_latency[sda] > 30" },
    ],
    "Storage": [
      { label: "Pool de discos > 85%", value: "max(5m):vfs.fs.size[/data,pfree] < 15" },
      { label: "IOPS elevado", value: "avg(5m):vfs.dev.iops[sda] > 5000" },
      { label: "Latência de IO alta", value: "avg(5m):vfs.dev.read_latency[sda] > 30" },
    ],
    "Firewalls": [
      { label: "CPU > 85%", value: "avg(5m):system.cpu.util[,idle] < 15" },
      { label: "Sessões ativas muito altas", value: "avg(5m):net.sessions > 100000" },
      { label: "Pacotes descartados elevados", value: "avg(5m):net.if.dropped > 100" },
      { label: "Túnel VPN down", value: "last(vpn.tunnel.status) = 0" },
    ],
    "Balanceadores de Carga": [
      { label: "Membro do pool indisponível", value: "last(lb.pool.member.status) = 0" },
      { label: "Erros HTTP 5xx", value: "avg(5m):lb.http.5xx.rate > 5" },
      { label: "Latência alta", value: "avg(5m):lb.pool.latency > 1" },
    ],
    "Contêineres Docker": [
      { label: "Reinícios de contêiner", value: "sum(5m):docker.container.restarts > 0" },
      { label: "CPU do contêiner > 80%", value: "avg(5m):docker.cpu.utilization > 80" },
      { label: "Memória do contêiner > 90%", value: "avg(5m):docker.memory.utilization > 90" },
      { label: "Espaço overlay baixo", value: "max(5m):vfs.fs.size[/var/lib/docker,pfree] < 10" },
    ],
    "Kubernetes": [
      { label: "Pod reiniciando", value: "sum(5m):kube.pod.restart.count > 0" },
      { label: "Node NotReady", value: "last(kube.node.status) = 0" },
      { label: "CPU (node) > 85%", value: "avg(5m):system.cpu.util[,idle] < 15" },
      { label: "Memória (node) > 90%", value: "avg(5m):vm.memory.utilization > 90" },
    ],
    "Aplicações": [
      { label: "Erro (taxa) > 5%", value: "avg(5m):app.errors.rate > 5" },
      { label: "Tempo de resposta p95 > 1s", value: "avg(5m):app.response.time.p95 > 1" },
      { label: "Disponibilidade < 99%", value: "avg(5m):app.availability < 99" },
    ],
    "Zabbix Servers": [
      { label: "Poller busy > 75%", value: "avg(5m):zabbix[proxy,queue] > 0" },
      { label: "Queue crescente", value: "avg(5m):zabbix.queue > 100" },
      { label: "Housekeeper lento", value: "avg(5m):zabbix.housekeeper.utilization > 75" },
    ],
    "Zabbix Proxies": [
      { label: "Proxy offline", value: "last(zabbix[proxy,availability]) = 0" },
      { label: "Fila do proxy", value: "avg(5m):zabbix[proxy,queue] > 100" },
      { label: "Atraso de dados", value: "avg(5m):zabbix[proxy,values] > 600" },
    ],
  };

 
 function buildLinks(params: {
  tool: Tool;
  serviceName: string;
  technology?: string;
  alertName?: string;
 }) {
  const { tool, serviceName, technology, alertName } = params;
  const enc = (v: string) => encodeURIComponent(v.trim());

  if (tool === "datadog") {
    const tech = technology ? technology : "Service";
    const base = `https://app.datadoghq.com/metric/explorer?from_ts=now-1h&to_ts=now&query=`;
    const slug = `${serviceName}-${tech}`;
    const qs = (m: string) => enc(`avg:${m}{service:${slug}}`);

    const metricsByTech: Record<string, { label: string; m: string }[]> = {
      Kubernetes: [
        { label: "CPU (pod)", m: "kubernetes.pod.cpu.usage" },
        { label: "Memória (pod)", m: "kubernetes.pod.memory.working_set" },
        { label: "Reinícios de Pod", m: "kubernetes.pod.restart.count" },
      ],
      "Node.js": [
        { label: "Latência (p95)", m: "nodejs.http.request.duration.p95" },
        { label: "Tráfego (req/s)", m: "nodejs.http.requests_per_second" },
        { label: "Erros (%)", m: "nodejs.errors.rate" },
      ],
      Java: [
        { label: "CPU JVM", m: "jvm.cpu.usage" },
        { label: "Heap usado", m: "jvm.memory.heap.used" },
        { label: "Threads", m: "jvm.threads.count" },
      ],
      PostgreSQL: [
        { label: "Conexões", m: "postgresql.connections" },
        { label: "Consultas/s", m: "postgresql.qps" },
        { label: "Erros", m: "postgresql.errors" },
      ],
      NGINX: [
        { label: "Req/s", m: "nginx.net.requests_per_s" },
        { label: "Erros 5xx", m: "nginx.status.5xx" },
        { label: "Latência (p95)", m: "nginx.request.latency.p95" },
      ],
    };

    const defaultMetrics = [
      { label: "Latência (p95)", m: "latency.p95" },
      { label: "Tráfego (req/s)", m: "requests.per_second" },
      { label: "Erros (%)", m: "errors.rate" },
      { label: "Saturação", m: "resource.saturation" },
    ];

    const selected = (technology && metricsByTech[technology]) || defaultMetrics;
    return selected.map(({ label, m }) => ({ label, url: `${base}${qs(m)}` }));
  }

  if (tool === "dynatrace") {
    const tech = technology ? technology : "Service";
    const base = `https://live.dynatrace.com/ui`;
    const svc = enc(serviceName);

    const linksByTech: Record<string, { label: string; path: string }[]> = {
      Kubernetes: [
        { label: "Visão do serviço", path: `/service?name=${svc}` },
        { label: "CPU/Memory (K8s)", path: `/analysis?view=k8s&service=${svc}` },
        { label: "Reinícios de Pod", path: `/analysis?metric=pod.restarts&service=${svc}` },
      ],
      Java: [
        { label: "Visão do serviço", path: `/service?name=${svc}` },
        { label: "Latência (p95)", path: `/analysis?metric=response.time.p95&service=${svc}` },
        { label: "Erros", path: `/analysis?metric=errors.rate&service=${svc}` },
      ],
      "Node.js": [
        { label: "Visão do serviço", path: `/service?name=${svc}` },
        { label: "Latência (p95)", path: `/analysis?metric=response.time.p95&service=${svc}` },
        { label: "Event Loop", path: `/analysis?metric=eventloop.lag&service=${svc}` },
      ],
      NGINX: [
        { label: "Visão do serviço", path: `/service?name=${svc}` },
        { label: "Req/s", path: `/analysis?metric=requests.per_second&service=${svc}` },
        { label: "Erros 5xx", path: `/analysis?metric=http.5xx.rate&service=${svc}` },
      ],
      "AWS Lambda": [
        { label: "Visão da função", path: `/lambda/function?name=${svc}` },
        { label: "Duração (p95)", path: `/analysis?metric=lambda.duration.p95&function=${svc}` },
        { label: "Invocações/s", path: `/analysis?metric=lambda.invocations&function=${svc}` },
      ],
      ".NET": [
        { label: "Visão do serviço", path: `/service?name=${svc}` },
        { label: "Latência (p95)", path: `/analysis?metric=response.time.p95&service=${svc}` },
        { label: "Erros", path: `/analysis?metric=errors.rate&service=${svc}` },
      ],
      Service: [
        { label: "Visão do serviço no Dynatrace", path: `/service?name=${svc}` },
      ],
    };

    const selected = linksByTech[tech] || linksByTech["Service"];
    return selected.map(({ label, path }) => ({ label, url: `${base}${path}` }));
  }

  if (tool === "zabbix") {
    const name = enc(alertName || serviceName);
    const base = `https://zabbix.example.com`;

    const links = [
      { label: "Trigger no Zabbix", url: `${base}/triggers?search=${name}` },
      { label: "Últimos dados", url: `${base}/latest.php?filter_set=1&filter=${name}` },
      { label: "Gráficos", url: `${base}/charts.php?filter=${name}` },
    ];

    return links;
  }

  return [];
 }


 const CreateMonitor = () => {
  // SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Criar Monitor — Libs de Monitoração",
    description:
      "Formulário para criar monitores Datadog, Dynatrace e triggers Zabbix automaticamente.",
    url: typeof window !== "undefined" ? window.location.href : "/criar-monitor",
  };
 
  const navigate = useNavigate();
  const { saveMonitor } = useMonitorStorage();
  // Form state
  const [tool, setTool] = useState<Tool>("");
  const [journey, setJourney] = useState("");
  const [product, setProduct] = useState("");
  const [businessImpact, setBusinessImpact] = useState("");
  const [impactError, setImpactError] = useState<string | null>(null);
  const [isGeneratingImpact, setIsGeneratingImpact] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Common fields
  const [serviceName, setServiceName] = useState("");

  // Datadog / Dynatrace
  const techOptions = useMemo(() => (tool ? TECH_BY_TOOL[tool as Exclude<Tool, "">] : []), [tool]);
  const [technology, setTechnology] = useState("");
  const [org, setOrg] = useState(""); // DEV, UAT, PRD (only for datadog)

  // Zabbix
  const [alertName, setAlertName] = useState("");
  const [hostGroup, setHostGroup] = useState("");
  const [condition, setCondition] = useState("");
  const zabbixConditions = useMemo(
    () => (hostGroup ? ZABBIX_CONDITIONS_BY_GROUP[hostGroup] || [] : []),
    [hostGroup]
  );

  // Result
  const [created, setCreated] = useState(false);
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);

  // Derived rules
  const canGenerateImpact = journey.trim().length > 0 && product.trim().length > 0;

  const hasRequiredForCreate = useMemo(() => {
    if (!tool) return false;

    if (tool === "datadog") {
      return (
        serviceName.trim() !== "" &&
        technology.trim() !== "" &&
        org.trim() !== ""
      );
    }
    if (tool === "dynatrace") {
      return serviceName.trim() !== "" && technology.trim() !== "";
    }
    if (tool === "zabbix") {
      return (
        alertName.trim() !== "" &&
        hostGroup.trim() !== "" &&
        condition.trim() !== "" &&
        serviceName.trim() !== ""
      );
    }
    return false;
  }, [tool, serviceName, technology, org, alertName, hostGroup, condition]);

  const canCreate = hasRequiredForCreate && !isGeneratingImpact;

  // Auto-esconder mensagem de erro de geração de impacto
  useEffect(() => {
    if (!impactError) return;
    const t = setTimeout(() => setImpactError(null), 3500);
    return () => clearTimeout(t);
  }, [impactError]);

  // Handlers
  const handleToolChange = (value: Tool) => {
    setTool(value);
    setCreated(false);
    // Reset specifics when switching
    setTechnology("");
    setOrg("");

    setHostGroup("");
    setCondition("");
  };

  const generateImpactGeneric = async (
    journeyVal: string,
    productVal: string
  ): Promise<string> => {
    // Generic impact messages based on common scenarios
    const impactTemplates = [
      `Indisponibilidade do ${productVal} na jornada ${journeyVal} pode causar perda de receita e insatisfação dos clientes.`,
      `Falhas no ${productVal} impactam diretamente a experiência do cliente na jornada ${journeyVal}, comprometendo a competitividade.`,
      `Instabilidade no ${productVal} durante ${journeyVal} resulta em abandono de operações e potencial migração para concorrentes.`,
      `Problemas de performance no ${productVal} afetam a conclusão de transações na jornada ${journeyVal}, impactando os resultados financeiros.`,
      `Interrupções no ${productVal} durante ${journeyVal} prejudicam a confiança do cliente e podem gerar impactos regulatórios.`
    ];
    
    // Select a template based on simple hash of input
    const hash = (journeyVal + productVal).length % impactTemplates.length;
    return impactTemplates[hash];
  };

  const handleGenerateImpact = async () => {
    if (!canGenerateImpact || isGeneratingImpact) return;
    setImpactError(null);
    setIsGeneratingImpact(true);
    setBusinessImpact("");

    try {
      const result = await generateImpactGeneric(journey.trim(), product.trim());
      if (!result) {
        setImpactError(
          "Não foi possível gerar a sugestão de impacto. Tente novamente."
        );
        return;
      }
      setBusinessImpact(result);
    } catch (e: any) {
      setImpactError("Falha na geração de impacto. Tente novamente.");
    } finally {
      setIsGeneratingImpact(false);
    }
  };

  const handleCreate = () => {
    if (!canCreate) return;
    setIsCreating(true);
    const generatedLinks = buildLinks({
      tool,
      serviceName,
      technology,
      alertName,
    });

    // Prepare monitor data for session storage
    const monitorTypes = [];
    if (tool === "datadog") monitorTypes.push("APM", "Logs", "Infraestrutura");
    if (tool === "dynatrace") monitorTypes.push("Performance", "Disponibilidade", "Erros");
    if (tool === "zabbix") monitorTypes.push("Infraestrutura", "Rede", "Aplicação");

    const monitorData = {
      user_email: 'usuário@sessão.com',
      tool: tool,
      service_name: serviceName,
      impact_description: businessImpact.trim() || undefined,
      monitor_types: monitorTypes,
      monitor_links: generatedLinks.map(link => ({ type: link.label, url: link.url })),
      // Add Zabbix-specific fields
      ...(tool === "zabbix" && { 
        hostGroup: hostGroup,
        condition: condition,
        conditionName: zabbixConditions.find(c => c.value === condition)?.label || condition
      }),
      // Add Datadog-specific fields  
      ...(tool === "datadog" && {
        org: org,
        technology: technology
      })
    };

    if (tool === "datadog") {
      navigate("/integracoes/datadog", {
        state: { serviceName, technology, org, journey, product, monitorData },
      });
      return;
    }

    if (tool === "zabbix") {
      navigate("/monitores/zabbix", { state: { serviceName, links: generatedLinks, monitorData } });
      return;
    }

    if (tool === "dynatrace") {
      navigate("/monitores/dynatrace", { state: { serviceName, links: generatedLinks, monitorData } });
      return;
    }

    // Save monitor for tools handled directly here
    saveMonitor(monitorData);
    setLinks(generatedLinks);
    setCreated(true);
    setIsCreating(false);
  };
  const handleReset = () => {
    setTool("");
    setJourney("");
    setProduct("");
    setBusinessImpact("");
    setImpactError(null);
    setIsGeneratingImpact(false);
    setServiceName("");
    setTechnology("");
    setOrg("");
    setAlertName("");
    setHostGroup("");
    setCondition("");
    setCreated(false);
    setLinks([]);
  };

  // UI helpers
  const GenerateImpactButton: React.FC<{ showIcon: boolean }> = ({ showIcon }) => (
    <Button
      type="button"
      variant="default"
      size="lg"
      className="w-full"
      disabled={!canGenerateImpact || isGeneratingImpact}
      onClick={handleGenerateImpact}
    >
      {isGeneratingImpact && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
      {isGeneratingImpact ? "Gerando sugestão..." : "Gerar sugestão de Impacto"}
      {!isGeneratingImpact && showIcon && (
        <InfoIcon className="ml-2 h-4 w-4 opacity-70" aria-hidden />
      )}
    </Button>
  );
  return (
    <>
      <Helmet>
        <title>Criar Monitor — Libs de Monitoração</title>
        <meta
          name="description"
          content="Formulário para criar monitores Datadog, Dynatrace e triggers/alertas Zabbix."
        />
        <link
          rel="canonical"
          href={typeof window !== "undefined" ? window.location.href : "/criar-monitor"}
        />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-muted/30 py-10">
        <main className="container">
          <section className="mx-auto max-w-2xl">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <h1 className="text-3xl font-semibold tracking-tight">Libs de Monitoração</h1>
                <p className="mt-1 text-sm text-muted-foreground">Automatize a criação de monitores.</p>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate("/boas-praticas")}
                  >
                    <InfoIcon className="mr-2 h-4 w-4" />
                    Ver Boas Práticas
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Seletor de Ferramenta */}
                <div className="space-y-2">
                  <Label htmlFor="tool">
                    Ferramenta de monitoração <span aria-hidden>*</span>
                  </Label>
                  <Select value={tool} onValueChange={(v) => handleToolChange(v as Tool)}>
                    <SelectTrigger id="tool" aria-label="Selecione a ferramenta de monitoração">
                      <SelectValue placeholder="Selecione a ferramenta de monitoração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="datadog">
                        <div className="flex items-center gap-2">
                          <img
                            loading="lazy"
                            width={16}
                            height={16}
                            alt="Datadog logo"
                            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/datadog/datadog-original.svg"
                          />
                          <span>Datadog</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="zabbix">
                        <div className="flex items-center gap-2">
                          <img
                            loading="lazy"
                            width={18}
                            height={18}
                            alt="Zabbix logo"
                            src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Zabbix_logo.svg"
                          />
                          <span>Zabbix</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dynatrace">
                        <div className="flex items-center gap-2">
                          <img
                            loading="lazy"
                            width={16}
                            height={16}
                            alt="Dynatrace logo"
                            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dynatrace/dynatrace-original.svg"
                          />
                          <span>Dynatrace</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Detalhes condicionais */}
                {(tool === "datadog" || tool === "dynatrace") && (
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle>Detalhes do monitor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="serviceName">Nome do Serviço</Label>
                        <Input
                          id="serviceName"
                          placeholder="Ex: api-conta-corrente"
                          value={serviceName}
                          onChange={(e) => setServiceName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tecnologia</Label>
                        <Select value={technology} onValueChange={(v) => setTechnology(v)}>
                            <SelectTrigger aria-label="Selecione a tecnologia">
                              <SelectValue placeholder="Selecione a tecnologia" />
                            </SelectTrigger>
                          <SelectContent>
                            {techOptions.map((t) => (
                              <SelectItem key={t} value={t}>
                                <div className="flex items-center gap-2">
                                  {TECH_LOGOS[t] && (
                                    <img
                                      loading="lazy"
                                      width={16}
                                      height={16}
                                      alt={`${t} logo`}
                                      src={TECH_LOGOS[t]}
                                    />
                                  )}
                                  <span>{t}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {tool === "datadog" && (
                        <div className="space-y-2">
                          <Label>Org Datadog</Label>
                          <Select value={org} onValueChange={(v) => setOrg(v)}>
                            <SelectTrigger aria-label="Selecione a organização">
                              <SelectValue placeholder="Selecione a organização" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DEV">DEV</SelectItem>
                              <SelectItem value="UAT">UAT</SelectItem>
                              <SelectItem value="PRD">PRD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {tool === "zabbix" && (
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle>Detalhes do Trigger</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="alertName">Nome do Alerta</Label>
                        <Input
                          id="alertName"
                          placeholder="Ex: CPU alta no serviço X"
                          value={alertName}
                          onChange={(e) => setAlertName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hostGroup">Grupo de Hosts</Label>
                        <Select value={hostGroup} onValueChange={(v) => { setHostGroup(v); setCondition(""); }}>
                          <SelectTrigger aria-label="Selecione o grupo de hosts">
                            <SelectValue placeholder="Selecione o grupo de hosts" />
                          </SelectTrigger>
                          <SelectContent>
                            {ZABBIX_HOST_GROUPS.map((g) => (
                              <SelectItem key={g} value={g}>
                                {g}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Condição de Acionamento (Expressão Zabbix)</Label>
                        <Select value={condition} onValueChange={(v) => setCondition(v)}>
                          <SelectTrigger aria-label="Selecione a condição">
                            <SelectValue placeholder="Selecione a condição..." />
                          </SelectTrigger>
                          <SelectContent>
                            {zabbixConditions.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>


                      <div className="space-y-2">
                        <Label htmlFor="serviceNameZ">Nome do Serviço</Label>
                        <Input
                          id="serviceNameZ"
                          placeholder="Ex: api-conta-corrente"
                          value={serviceName}
                          onChange={(e) => setServiceName(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Geração de Impacto */}
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle>Geração de Impacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    <div className="space-y-2">
                      <Label htmlFor="journey">Jornada</Label>
                      <Input
                        id="journey"
                        placeholder="Ex: Conta Corrente; Investimentos"
                        value={journey}
                        onChange={(e) => setJourney(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product">Produto</Label>
                      <Input
                        id="product"
                        placeholder="Ex: Extrato; Pix"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                      />
                    </div>

                    {/* Button with tooltip when disabled */}
                    {canGenerateImpact ? (
                      <GenerateImpactButton showIcon={false} />
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block w-full">
                            <GenerateImpactButton showIcon />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          Preencha Jornada e Produto para habilitar.
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {impactError && (
                      <p role="alert" className="text-center text-destructive text-sm mt-2">
                        {impactError}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label htmlFor="businessImpact">Impacto ao negócio</Label>
                  <Textarea
                    id="businessImpact"
                    placeholder="Descreva o impacto ao negócio na visão do usuário."
                    className="min-h-[120px]"
                    value={businessImpact}
                    onChange={(e) => {
                      setImpactError(null);
                      setBusinessImpact(e.target.value);
                    }}
                    aria-invalid={!!impactError}
                  />
                </div>

              </CardContent>

              <CardFooter className="flex-col gap-3">
                {canCreate ? (
                  <Button className="w-full" size="lg" type="button" onClick={handleCreate} disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                    {isCreating ? "Criando monitor..." : "Criar Monitor"}
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block w-full">
                        <Button className="w-full" size="lg" type="button" disabled>
                          {isGeneratingImpact && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                          {isGeneratingImpact ? "Aguardando geração de impacto..." : "Criar Monitor"}
                          <InfoIcon className="ml-2 h-4 w-4 opacity-70" aria-hidden />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Esta ação só pode ser concluída quando os itens de Detalhes do monitor e/ou Detalhes do Trigger estiverem preenchidos.
                    </TooltipContent>
                  </Tooltip>
                )}

                {created && (
                  <Button variant="secondary" className="w-full" type="button" onClick={handleReset}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Criar novo monitor
                  </Button>
                )}
              </CardFooter>
            </Card>

            {created && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Links do monitor criado</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {links.map((l) => (
                      <li key={l.label} className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
                        <a className="story-link" href={l.url} target="_blank" rel="noopener noreferrer">
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default CreateMonitor;
