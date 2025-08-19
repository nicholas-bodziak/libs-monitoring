import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DonutChart } from "@/components/ui/donut-chart";
import { ExternalLink, Monitor, User, Server, FileText, Home, BarChart3, Filter, CalendarIcon, Search, TrendingUp, Activity, Trash2, Download, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMonitorStorage } from "@/hooks/useMonitorStorage";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { extractAllRequestData, generateExcelReport } from "@/utils/extractRequestData";
const Dashboard: React.FC = () => {
  const {
    monitors,
    clearMonitors
  } = useMonitorStorage();
  const [loading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState<Date | undefined>();
  const [dateToFilter, setDateToFilter] = useState<Date | undefined>();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const getToolBadgeColor = (tool: string) => {
    switch (tool.toLowerCase()) {
      case 'datadog':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
      case 'zabbix':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      case 'dynatrace':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
    }
  };

  // Cálculo de estatísticas gerais (sem filtros) - primeiro
  const generalStats = useMemo(() => {
    const total = monitors.length;
    const toolCounts = monitors.reduce((acc, monitor) => {
      acc[monitor.tool] = (acc[monitor.tool] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcular contagem de serviços únicos
    const serviceCounts = monitors.reduce((acc, monitor) => {
      acc[monitor.service_name] = (acc[monitor.service_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcular contagem de usuários únicos
    const userCounts = monitors.reduce((acc, monitor) => {
      const userName = monitor.user_email || 'Usuário da sessão';
      acc[userName] = (acc[userName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      total,
      toolCounts,
      serviceCounts,
      userCounts,
      tools: Object.keys(toolCounts),
      services: Object.keys(serviceCounts),
      users: Object.keys(userCounts)
    };
  }, [monitors]);

  // Filtros aplicados - segundo
  const filteredMonitors = useMemo(() => {
    return monitors.filter(monitor => {
      const matchesTool = selectedTool === "all" || monitor.tool.toLowerCase() === selectedTool.toLowerCase();
      const matchesService = selectedService === "all" || monitor.service_name.toLowerCase() === selectedService.toLowerCase();
      const matchesUser = selectedUser === "all" || (monitor.user_email || 'Usuário da sessão').toLowerCase() === selectedUser.toLowerCase();
      const matchesSearch = searchTerm === "" || monitor.service_name.toLowerCase().includes(searchTerm.toLowerCase()) || monitor.tool.toLowerCase().includes(searchTerm.toLowerCase()) || (monitor.user_email || 'Usuário da sessão').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateFromFilter && !dateToFilter || (() => {
        const monitorDate = new Date(monitor.created_at);
        const from = dateFromFilter ? new Date(dateFromFilter.setHours(0, 0, 0, 0)) : null;
        const to = dateToFilter ? new Date(dateToFilter.setHours(23, 59, 59, 999)) : null;
        if (from && to) {
          return monitorDate >= from && monitorDate <= to;
        } else if (from) {
          return monitorDate >= from;
        } else if (to) {
          return monitorDate <= to;
        }
        return true;
      })();
      return matchesTool && matchesService && matchesUser && matchesSearch && matchesDate;
    });
  }, [monitors, selectedTool, selectedService, selectedUser, searchTerm, dateFromFilter, dateToFilter]);

  // Cálculo de estatísticas dos monitores filtrados - terceiro
  const filteredStats = useMemo(() => {
    const total = filteredMonitors.length;
    const toolCounts = filteredMonitors.reduce((acc, monitor) => {
      acc[monitor.tool] = (acc[monitor.tool] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcular contagem de serviços únicos
    const serviceCounts = filteredMonitors.reduce((acc, monitor) => {
      acc[monitor.service_name] = (acc[monitor.service_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcular contagem de usuários únicos para filtros
    const userCounts = filteredMonitors.reduce((acc, monitor) => {
      const userName = monitor.user_email || 'Usuário da sessão';
      acc[userName] = (acc[userName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcular contagem de tipos de monitores específicos
    const monitorTypeCounts = filteredMonitors.reduce((acc, monitor) => {
      monitor.monitor_types.forEach(type => {
        acc[type] = (acc[type] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    const recentMonitors = filteredMonitors.filter(monitor => {
      const created = new Date(monitor.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    });
    const avgMonitorTypes = total > 0 ? filteredMonitors.reduce((sum, monitor) => sum + monitor.monitor_types.length, 0) / total : 0;
    return {
      total,
      toolCounts,
      serviceCounts,
      userCounts,
      monitorTypeCounts,
      recentCount: recentMonitors.length,
      avgMonitorTypes: Math.round(avgMonitorTypes * 10) / 10,
      tools: Object.keys(toolCounts),
      services: Object.keys(serviceCounts),
      users: Object.keys(userCounts),
      monitorTypes: Object.keys(monitorTypeCounts)
    };
  }, [filteredMonitors]);

  // Preparar dados para os gráficos de rosca - quarto
  const toolChartData = useMemo(() => Object.entries(filteredStats.toolCounts).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round(value / filteredStats.total * 100)
  })), [filteredStats]);
  const serviceChartData = useMemo(() => Object.entries(filteredStats.serviceCounts).slice(0, 3) // Limitar a 3 principais
  .map(([name, value]) => ({
    name,
    value,
    percentage: Math.round(value / filteredStats.total * 100)
  })), [filteredStats]);
  const userChartData = useMemo(() => Object.entries(filteredStats.userCounts).slice(0, 3) // Limitar a 3 principais
  .map(([name, value]) => ({
    name,
    value,
    percentage: Math.round(value / filteredStats.total * 100)
  })), [filteredStats]);
  const monitorsByToolChartData = useMemo(() => {
    const toolLinksCount = filteredMonitors.reduce((acc, monitor) => {
      acc[monitor.tool] = (acc[monitor.tool] || 0) + monitor.monitor_links.length;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(toolLinksCount).map(([name, value]) => ({
      name: `${name} (${value})`,
      value,
      percentage: Math.round(value / Object.values(toolLinksCount).reduce((a, b) => a + b, 0) * 100)
    }));
  }, [filteredMonitors]);
  const handleExtractExcel = async () => {
    if (monitors.length === 0) {
      toast({
        title: "Nenhum dado para extrair",
        description: "Não há monitores para serem exportados."
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const data = extractAllRequestData(monitors);
      generateExcelReport(data);
      
      toast({
        title: "Excel exportado com sucesso",
        description: `Dados de ${data.totalRequests} monitor(es) foram exportados.`
      });
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar o arquivo Excel.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearMonitors = () => {
    if (monitors.length === 0) return;
    const confirmed = window.confirm(`Tem certeza que deseja limpar todos os ${monitors.length} monitores? Esta ação não pode ser desfeita.`);
    if (confirmed) {
      clearMonitors();
      toast({
        title: "Monitores limpos",
        description: "Todos os monitores foram removidos com sucesso."
      });
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-background py-10">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando monitores...</p>
          </div>
        </div>
      </div>;
  }
  return <>
      <Helmet>
        <title>Dashboard — Libs de Monitoração</title>
        <meta name="description" content="Dashboard com indicadores e filtros para análise completa dos monitores." />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : "/dashboard"} />
      </Helmet>

      <div className="min-h-screen bg-background py-8">
        <main className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard de Monitores</h1>
              <p className="text-muted-foreground mt-2">
                Análise completa e gerenciamento dos seus monitores
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/criar-monitor")} size="default" className="min-w-[140px]">
                <Monitor className="w-4 h-4 mr-2" />
                Criar Monitor
              </Button>
              <Button onClick={handleExtractExcel} size="default" className="min-w-[140px]" disabled={isExporting}>
                {isExporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exportando..." : "Extrair solicitação"}
              </Button>
              <Button onClick={() => navigate("/")} size="default" className="min-w-[140px]">
                <Home className="w-4 h-4 mr-2" />
                Página Inicial
              </Button>
            </div>
          </div>

          {/* Indicadores com Gráficos de Rosca */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
            {/* 1. Total de Solicitações */}
            <Card className="flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
                <CardTitle className="text-sm font-medium text-wrap">Total de Solicitações</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-4 flex-grow overflow-hidden">
                {filteredStats.total > 0 ? <div className="h-full flex flex-col items-center justify-center">
                    <DonutChart data={[{
                  name: "Solicitações",
                  value: filteredStats.total,
                  percentage: 100
                }]} total={filteredStats.total} centerLabel="Solicitações" centerValue={filteredStats.total} className="w-full h-full max-h-[200px]" />
                  </div> : <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs md:text-sm">Nenhum dado</p>
                    </div>
                  </div>}
              </CardContent>
            </Card>

            {/* 2. Monitores Criados */}
            <Card className="flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
                <CardTitle className="text-sm font-medium text-wrap">Monitores Criados</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-4 flex-grow overflow-hidden">
                {monitorsByToolChartData.length > 0 ? <div className="h-full flex flex-col items-center justify-center">
                    <DonutChart data={monitorsByToolChartData} total={monitorsByToolChartData.reduce((acc, item) => acc + item.value, 0)} centerLabel="Monitores" centerValue={filteredMonitors.reduce((acc, monitor) => acc + monitor.monitor_links.length, 0)} className="w-full h-full max-h-[200px]" />
                  </div> : <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs md:text-sm">Nenhum dado</p>
                    </div>
                  </div>}
              </CardContent>
            </Card>

            {/* 3. Por Ferramentas */}
            <Card className="flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
                <CardTitle className="text-sm font-medium text-wrap">Por Ferramentas</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-4 flex-grow overflow-hidden py-[50px] px-[16px]">
                {toolChartData.length > 0 ? <div className="h-full flex flex-col items-center justify-center">
                    <DonutChart data={toolChartData} total={filteredStats.total} centerLabel="Ferramentas" centerValue={filteredStats.tools.length} className="w-full h-full max-h-[200px]" />
                  </div> : <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Server className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs md:text-sm">Nenhum dado</p>
                    </div>
                  </div>}
              </CardContent>
            </Card>

            {/* 4. Top Serviços */}
            <Card className="flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
                <CardTitle className="text-sm font-medium text-wrap">Top Serviços</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-4 flex-grow overflow-hidden">
                {serviceChartData.length > 0 ? <div className="h-full flex flex-col items-center justify-center">
                    <DonutChart data={serviceChartData} total={filteredStats.total} centerLabel="Serviços" centerValue={filteredStats.services.length} className="w-full h-full max-h-[200px]" />
                  </div> : <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Monitor className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs md:text-sm">Nenhum dado</p>
                    </div>
                  </div>}
              </CardContent>
            </Card>

            {/* 5. Top Usuários */}
            <Card className="flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
                <CardTitle className="text-sm font-medium text-wrap">Top Usuários</CardTitle>
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-4 flex-grow overflow-hidden">
                {userChartData.length > 0 ? <div className="h-full flex flex-col items-center justify-center">
                    <DonutChart data={userChartData} total={filteredStats.total} centerLabel="Usuários" centerValue={filteredStats.users.length} className="w-full h-full max-h-[200px]" />
                  </div> : <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <User className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs md:text-sm">Nenhum dado</p>
                    </div>
                  </div>}
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
                {/* 1. Buscar */}
                <div className="xl:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar por nome, ferramenta ou usuário..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>

                {/* 2. Nome do usuário */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome do Usuário</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os usuários</SelectItem>
                      {generalStats.users.map(user => <SelectItem key={user} value={user}>
                          {user} ({generalStats.userCounts[user]})
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Ferramenta */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Ferramenta</label>
                  <Select value={selectedTool} onValueChange={setSelectedTool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as ferramentas</SelectItem>
                      {generalStats.tools.map(tool => <SelectItem key={tool} value={tool}>
                          {tool} ({generalStats.toolCounts[tool]})
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* 4. Data de criação - range */}
                <div className="xl:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Data de Criação</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-sm", !dateFromFilter && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFromFilter ? format(dateFromFilter, "dd/MM/yyyy") : "De"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dateFromFilter} onSelect={setDateFromFilter} initialFocus className="pointer-events-auto p-3" />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-sm", !dateToFilter && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateToFilter ? format(dateToFilter, "dd/MM/yyyy") : "Até"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dateToFilter} onSelect={setDateToFilter} initialFocus className="pointer-events-auto p-3" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" size="default" className="min-w-[120px]" onClick={() => {
                setSelectedTool("all");
                setSelectedService("all");
                setSelectedUser("all");
                setSearchTerm("");
                setDateFromFilter(undefined);
                setDateToFilter(undefined);
              }}>
                  Limpar Filtros
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  Exibindo {filteredMonitors.length} de {monitors.length} monitores
                </div>
              </div>

              {Object.keys(filteredStats.toolCounts).length > 0 && <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>Distribuição filtrada por ferramenta:</span>
                  {Object.entries(filteredStats.toolCounts).map(([tool, count]) => <Badge key={tool} variant="outline" className={getToolBadgeColor(tool)}>
                      {tool}: {count}
                    </Badge>)}
                </div>}
            </CardContent>
          </Card>

          {/* Lista de Monitores */}
          {filteredMonitors.length === 0 ? <Card>
              <CardContent className="text-center py-12">
                <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {monitors.length === 0 ? "Nenhum monitor encontrado" : "Nenhum monitor corresponde aos filtros"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {monitors.length === 0 ? "Comece criando seu primeiro monitor" : "Ajuste os filtros ou limpe-os para ver mais resultados"}
                </p>
                {monitors.length === 0 ? <Button onClick={() => navigate("/criar-monitor")}>
                    Criar primeiro monitor
                  </Button> : <Button variant="outline" onClick={() => {
              setSelectedTool("all");
              setSelectedService("all");
              setSelectedUser("all");
              setSearchTerm("");
              setDateFromFilter(undefined);
              setDateToFilter(undefined);
            }}>
                    Limpar filtros
                  </Button>}
              </CardContent>
            </Card> : <div className="space-y-3">
              {filteredMonitors.map(monitor => <Card key={monitor.id} className="shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      {/* Nome do serviço e ferramenta */}
                      <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-semibold text-lg text-foreground">{monitor.service_name}</span>
                        <Badge variant="outline" className={`${getToolBadgeColor(monitor.tool)} text-sm px-3 py-1`}>
                          {monitor.tool}
                        </Badge>
                      </div>

                      {/* ID */}
                      <div className="text-sm text-muted-foreground">
                        <span className="font-mono bg-muted px-3 py-1.5 rounded text-xs">
                          {monitor.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Informações do usuário */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          Informações do Usuário
                        </h4>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Email:</span>
                          </p>
                          <p className="text-sm text-foreground mt-1">
                            {monitor.user_email || 'Usuário da sessão'}
                          </p>
                        </div>
                      </div>

                      {/* Data de criação */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-primary" />
                          Data de Criação
                        </h4>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Criado em:</span>
                          </p>
                          <p className="text-sm text-foreground mt-1">
                            {new Date(monitor.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                          </p>
                        </div>
                      </div>

                      {/* Links dos monitores */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-primary" />
                          Links dos Monitores ({monitor.monitor_links.length})
                        </h4>
                        <div className="bg-muted/30 p-3 rounded-lg space-y-2 max-h-32 overflow-y-auto">
                          {monitor.monitor_links.length > 0 ? monitor.monitor_links.map((link, index) => <div key={index} className="flex items-center justify-between p-2 rounded border bg-background/50">
                                <span className="text-sm font-medium text-foreground">{link.type}</span>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex" title={`Ver monitor: ${link.type}`}>
                                  <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Acessar
                                  </Button>
                                </a>
                              </div>) : <p className="text-sm text-muted-foreground">Nenhum link disponível</p>}
                        </div>
                      </div>
                    </div>

                    {/* Tipos de monitores */}
                    {monitor.monitor_types.length > 0 && <div className="mt-6 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            Tipos de Monitores ({monitor.monitor_types.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {monitor.monitor_types.map((type, index) => <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                              {type}
                            </Badge>)}
                        </div>
                      </div>}

                    {/* Impacto - mostrar apenas se existir, de forma compacta */}
                    {monitor.impact_description && <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-foreground">Impacto:</span>
                            <span className="text-muted-foreground ml-2 line-clamp-1">
                              {monitor.impact_description}
                            </span>
                          </div>
                        </div>
                      </div>}
                  </CardContent>
                </Card>)}
            </div>}
        </main>
      </div>
    </>;
};
export default Dashboard;