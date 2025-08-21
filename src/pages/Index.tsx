import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Monitor, BarChart3, Lightbulb } from "lucide-react";
import awsLogo from "@/assets/aws.svg";
const Index = () => {
  const navigate = useNavigate();
  const handleStart = () => {
    navigate("/criar-monitor");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleSuggestions = () => {
    navigate("/boas-praticas");
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Libs de Monitoração",
    url: typeof window !== "undefined" ? window.location.origin + "/" : "",
    description: "Ferramenta para criar monitores Datadog, Dynatrace e triggers Zabbix automaticamente."
  };
  return <>
      <Helmet>
        <title>Libs de Monitoração — Datadog, Zabbix e Dynatrace</title>
        <meta name="description" content="Crie monitores para Datadog, Dynatrace e triggers/alertas Zabbix de forma rápida e automática." />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : "/"} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="sr-only">
          <h1>Libs de Monitoração — Datadog, Zabbix e Dynatrace</h1>
        </header>

        <main className="container py-12">
          <section aria-labelledby="intro" className="mx-auto max-w-4xl text-center">
            <h2 id="intro" className="text-4xl font-bold tracking-tight text-foreground">
              Bem-vindo à Libs de Monitoração
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Esta ferramenta permite criar monitores para Datadog e Dynatrace, além de triggers e alertas para Zabbix — tudo automaticamente.
            </p>
          </section>

          <section aria-label="Ferramentas" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 group isolate">
            <article className="transition-opacity group-hover:opacity-80 hover:opacity-100">
              <Card className="h-full relative transform-gpu transition-all duration-200 ease-out will-change-transform ring-1 ring-border/50 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:ring-ring/30 hover:z-10">
                <CardHeader className="items-center">
                  <img loading="lazy" width={64} height={64} alt="Datadog logo monitoramento" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/datadog/datadog-original.svg" />
                  <CardTitle className="mt-2">Datadog</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-4">
                  <div>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Observabilidade completa</li>
                      <li>Interface intuitiva</li>
                      <li>Automação e alertas avançados</li>
                      <li>Integrações com diversas tecnologias</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Tecnologias suportadas:</h4>
                    <ul className="list-none space-y-2">
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="Kubernetes logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" />
                        <span>Kubernetes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="Node.js logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-plain.svg" />
                        <span>Node.js</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="Java logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-plain.svg" />
                        <span>Java</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="PostgreSQL logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-plain.svg" />
                        <span>PostgreSQL</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="NGINX logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg" />
                        <span>NGINX</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </article>

            <article className="transition-opacity group-hover:opacity-80 hover:opacity-100">
              <Card className="h-full relative transform-gpu transition-all duration-200 ease-out will-change-transform ring-1 ring-border/50 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:ring-ring/30 hover:z-10">
                <CardHeader className="items-center rounded-none py-[46px]">
                  <img loading="lazy" width={80} height={24} alt="Zabbix logo" src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Zabbix_logo.svg" />
                  <CardTitle className="mt-2">Zabbix</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-4">
                  <div>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Solução de código aberto</li>
                      <li>Monitoramento robusto e escalável</li>
                      <li>Configurações altamente personalizáveis</li>
                      <li>Comunidade ativa e suporte técnico</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Tecnologias suportadas:</h4>
                    <ul className="list-none space-y-2">
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="Linux logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" />
                        <span>Linux</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="Windows logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg" />
                        <span>Windows</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="MySQL logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" />
                        <span>MySQL</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="NGINX logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg" />
                        <span>NGINX</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="Docker logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" />
                        <span>Docker</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </article>

            <article className="transition-opacity group-hover:opacity-80 hover:opacity-100">
              <Card className="h-full relative transform-gpu transition-all duration-200 ease-out will-change-transform ring-1 ring-border/50 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:ring-ring/30 hover:z-10">
                <CardHeader className="items-center">
                  <img loading="lazy" width={64} height={64} alt="Dynatrace logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dynatrace/dynatrace-original.svg" />
                  <CardTitle className="mt-2">Dynatrace</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-4">
                  <div>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Monitoramento Full‑Stack</li>
                      <li>Análise de causa raiz automática</li>
                      <li>IA integrada</li>
                      <li>Visualização de topologia de serviço</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Tecnologias suportadas:</h4>
                    <ul className="list-none space-y-2">
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="Kubernetes logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" />
                        <span>Kubernetes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="Java logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-plain.svg" />
                        <span>Java</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="NGINX logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg" />
                        <span>NGINX</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt="AWS logo" src={awsLogo} />
                        <span>AWS Lambda</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <img loading="lazy" width={16} height={16} alt=".NET logo" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-plain.svg" />
                        <span>.NET</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </article>
          </section>


          <aside className="mt-10 flex justify-center gap-4 flex-wrap">
            <Button onClick={handleStart} size="lg" className="w-full sm:w-auto sm:min-w-[240px] flex-1 sm:flex-none">
              <Monitor className="mr-2 h-4 w-4 flex-shrink-0" />
              Iniciar criação do monitor
            </Button>
            <Button onClick={handleDashboard} size="lg" className="w-full sm:w-auto sm:min-w-[240px] flex-1 sm:flex-none">
              <BarChart3 className="mr-2 h-4 w-4 flex-shrink-0" />
              Dashboards de monitores
            </Button>
            <Button onClick={handleSuggestions} size="lg" className="w-full sm:w-auto sm:min-w-[240px] flex-1 sm:flex-none">
              <Lightbulb className="mr-2 h-4 w-4 flex-shrink-0" />
              Boas Práticas de Observabilidade
            </Button>
          </aside>
        </main>
      </div>
    </>;
};
export default Index;