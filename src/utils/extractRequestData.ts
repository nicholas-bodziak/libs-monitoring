import { MonitorData } from '@/hooks/useMonitorStorage';
import * as XLSX from 'xlsx';

export interface DetailedMonitorRow {
  nomeUsuario: string;
  ferramenta: string;
  nomeServico: string;
  tecnologia: string;
  organizacao: string;
  tiposMonitor: string;
  informacaoJornada: string;
  informacaoImpacto: string;
  grupoHosts: string; // Específico para Zabbix
  condicaoAcionamento: string; // Específico para Zabbix
  linksMonitor: string;
  dataHoraCriacao: string;
}

export interface ExtractedRequestData {
  totalRequests: number;
  monitorsCreated: number;
  toolsUsed: string[];
  servicesMonitored: string[];
  users: string[];
  monitorTypes: string[];
  impactDescriptions: string[];
  timeRange: {
    earliest: string;
    latest: string;
    totalDays: number;
  };
  toolDistribution: Record<string, number>;
  serviceDistribution: Record<string, number>;
  userDistribution: Record<string, number>;
  monitorTypeDistribution: Record<string, number>;
  averageMonitorsPerRequest: number;
  averageTypesPerRequest: number;
  detailedRows: DetailedMonitorRow[];
}

const generateDetailedRows = (monitors: MonitorData[]): DetailedMonitorRow[] => {
  return monitors.map(monitor => {
    // Extrair tecnologia dos tipos de monitor
    const tecnologia = monitor.monitor_types.join(', ') || 'N/A';
    
    // Extrair organização (específico para Datadog)
    const organizacao = monitor.tool.toLowerCase() === 'datadog' ? 
      monitor.org || 'N/A' : 'N/A';
    
    // Preparar informações de jornada (baseado nos tipos de monitor)
    const informacaoJornada = monitor.monitor_types.filter(type => 
      type.toLowerCase().includes('synthetic') || 
      type.toLowerCase().includes('rum') || 
      type.toLowerCase().includes('user')
    ).join(', ') || 'N/A';
    
    // Extrair grupo de hosts (específico para Zabbix)
    const grupoHosts = monitor.tool.toLowerCase() === 'zabbix' ? 
      monitor.hostGroup || 'N/A' : 'N/A';
    
    // Extrair condição de acionamento (específico para Zabbix)
    const condicaoAcionamento = monitor.tool.toLowerCase() === 'zabbix' ? 
      monitor.conditionName || monitor.condition || 'N/A' : 'N/A';
    
    // Preparar links dos monitores
    const linksMonitor = monitor.monitor_links.map(link => 
      `${link.type}: ${link.url}`
    ).join(' | ') || 'Nenhum link';

    return {
      nomeUsuario: monitor.user_email || 'Usuário da sessão',
      ferramenta: monitor.tool,
      nomeServico: monitor.service_name,
      tecnologia,
      organizacao,
      tiposMonitor: monitor.monitor_types.join(', '),
      informacaoJornada,
      informacaoImpacto: monitor.impact_description || 'N/A',
      grupoHosts,
      condicaoAcionamento,
      linksMonitor,
      dataHoraCriacao: new Date(monitor.created_at).toLocaleString('pt-BR')
    };
  });
};

export const extractAllRequestData = (monitors: MonitorData[]): ExtractedRequestData => {
  if (monitors.length === 0) {
    return {
      totalRequests: 0,
      monitorsCreated: 0,
      toolsUsed: [],
      servicesMonitored: [],
      users: [],
      monitorTypes: [],
      impactDescriptions: [],
      timeRange: {
        earliest: '',
        latest: '',
        totalDays: 0,
      },
      toolDistribution: {},
      serviceDistribution: {},
      userDistribution: {},
      monitorTypeDistribution: {},
      averageMonitorsPerRequest: 0,
      averageTypesPerRequest: 0,
      detailedRows: [],
    };
  }

  // Extrair informações básicas
  const totalRequests = monitors.length;
  const monitorsCreated = monitors.reduce((acc, monitor) => acc + monitor.monitor_links.length, 0);

  // Extrair listas únicas
  const toolsUsed = [...new Set(monitors.map(m => m.tool))];
  const servicesMonitored = [...new Set(monitors.map(m => m.service_name))];
  const users = [...new Set(monitors.map(m => m.user_email || 'Usuário da sessão'))];
  const monitorTypes = [...new Set(monitors.flatMap(m => m.monitor_types))];
  const impactDescriptions = monitors
    .map(m => m.impact_description)
    .filter(desc => desc && desc.trim() !== '') as string[];

  // Calcular distribuições
  const toolDistribution = monitors.reduce((acc, monitor) => {
    acc[monitor.tool] = (acc[monitor.tool] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const serviceDistribution = monitors.reduce((acc, monitor) => {
    acc[monitor.service_name] = (acc[monitor.service_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userDistribution = monitors.reduce((acc, monitor) => {
    const user = monitor.user_email || 'Usuário da sessão';
    acc[user] = (acc[user] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monitorTypeDistribution = monitors.reduce((acc, monitor) => {
    monitor.monitor_types.forEach(type => {
      acc[type] = (acc[type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Calcular período de tempo
  const dates = monitors.map(m => new Date(m.created_at));
  const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
  const latest = new Date(Math.max(...dates.map(d => d.getTime())));
  const totalDays = Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Calcular médias
  const averageMonitorsPerRequest = monitorsCreated / totalRequests;
  const averageTypesPerRequest = monitors.reduce((acc, monitor) => acc + monitor.monitor_types.length, 0) / totalRequests;

  // Gerar linhas detalhadas
  const detailedRows = generateDetailedRows(monitors);

  return {
    totalRequests,
    monitorsCreated,
    toolsUsed,
    servicesMonitored,
    users,
    monitorTypes,
    impactDescriptions,
    timeRange: {
      earliest: earliest.toISOString(),
      latest: latest.toISOString(),
      totalDays,
    },
    toolDistribution,
    serviceDistribution,
    userDistribution,
    monitorTypeDistribution,
    averageMonitorsPerRequest: Math.round(averageMonitorsPerRequest * 100) / 100,
    averageTypesPerRequest: Math.round(averageTypesPerRequest * 100) / 100,
    detailedRows,
  };
};

export const generateExtractionReport = (data: ExtractedRequestData): string => {
  const report = `
RELATÓRIO DE EXTRAÇÃO DE SOLICITAÇÕES
=====================================

RESUMO GERAL:
- Total de Solicitações: ${data.totalRequests}
- Total de Monitores Criados: ${data.monitorsCreated}
- Período: ${data.timeRange.totalDays} dia(s)
- Média de Monitores por Solicitação: ${data.averageMonitorsPerRequest}
- Média de Tipos por Solicitação: ${data.averageTypesPerRequest}

FERRAMENTAS UTILIZADAS (${data.toolsUsed.length}):
${data.toolsUsed.map(tool => `- ${tool}: ${data.toolDistribution[tool]} solicitação(ões)`).join('\n')}

SERVIÇOS MONITORADOS (${data.servicesMonitored.length}):
${data.servicesMonitored.map(service => `- ${service}: ${data.serviceDistribution[service]} solicitação(ões)`).join('\n')}

USUÁRIOS (${data.users.length}):
${data.users.map(user => `- ${user}: ${data.userDistribution[user]} solicitação(ões)`).join('\n')}

TIPOS DE MONITORES (${data.monitorTypes.length}):
${data.monitorTypes.map(type => `- ${type}: ${data.monitorTypeDistribution[type]} ocorrência(s)`).join('\n')}

${data.impactDescriptions.length > 0 ? `DESCRIÇÕES DE IMPACTO (${data.impactDescriptions.length}):
${data.impactDescriptions.map((desc, i) => `${i + 1}. ${desc}`).join('\n')}` : 'DESCRIÇÕES DE IMPACTO: Nenhuma fornecida'}

PERÍODO DE ATIVIDADE:
- Data mais antiga: ${new Date(data.timeRange.earliest).toLocaleDateString('pt-BR')}
- Data mais recente: ${new Date(data.timeRange.latest).toLocaleDateString('pt-BR')}
- Total de dias: ${data.timeRange.totalDays}

Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
`.trim();

  return report;
};

export const generateExcelReport = (data: ExtractedRequestData): void => {
  // Criar workbook
  const workbook = XLSX.utils.book_new();

  // Aba 1: Dados Detalhados dos Monitores (primeira aba - mais importante)
  const detailedData = [
    [
      'Nome do Usuário',
      'Ferramenta',
      'Nome do Serviço',
      'Tecnologia',
      'Organização',
      'Tipos de Monitor',
      'Informação de Jornada',
      'Informação de Impacto',
      'Grupo de Hosts (Zabbix)',
      'Condição de Acionamento (Zabbix)',
      'Links dos Monitores',
      'Data/Hora de Criação'
    ],
    ...data.detailedRows.map(row => [
      row.nomeUsuario,
      row.ferramenta,
      row.nomeServico,
      row.tecnologia,
      row.organizacao,
      row.tiposMonitor,
      row.informacaoJornada,
      row.informacaoImpacto,
      row.grupoHosts,
      row.condicaoAcionamento,
      row.linksMonitor,
      row.dataHoraCriacao
    ])
  ];
  
  const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
  
  // Ajustar largura das colunas
  const columnWidths = [
    { wch: 20 }, // Nome do Usuário
    { wch: 15 }, // Ferramenta
    { wch: 25 }, // Nome do Serviço
    { wch: 20 }, // Tecnologia
    { wch: 15 }, // Organização
    { wch: 30 }, // Tipos de Monitor
    { wch: 25 }, // Informação de Jornada
    { wch: 35 }, // Informação de Impacto
    { wch: 20 }, // Grupo de Hosts (Zabbix)
    { wch: 25 }, // Condição de Acionamento (Zabbix)
    { wch: 50 }, // Links dos Monitores
    { wch: 20 }  // Data/Hora de Criação
  ];
  detailedSheet['!cols'] = columnWidths;
  
  XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Dados Detalhados');

  // Aba 2: Resumo Geral
  const resumoData = [
    ['RELATÓRIO DE EXTRAÇÃO DE SOLICITAÇÕES'],
    [''],
    ['Resumo Geral'],
    ['Total de Solicitações', data.totalRequests],
    ['Total de Monitores Criados', data.monitorsCreated],
    ['Período (dias)', data.timeRange.totalDays],
    ['Média de Monitores por Solicitação', data.averageMonitorsPerRequest],
    ['Média de Tipos por Solicitação', data.averageTypesPerRequest],
    [''],
    ['Data de Geração', new Date().toLocaleDateString('pt-BR')],
    ['Hora de Geração', new Date().toLocaleTimeString('pt-BR')]
  ];
  
  const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData);
  XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo Geral');

  // Aba 3: Distribuição por Ferramentas
  const toolsData = [
    ['Ferramenta', 'Quantidade de Solicitações'],
    ...Object.entries(data.toolDistribution).map(([tool, count]) => [tool, count])
  ];
  
  const toolsSheet = XLSX.utils.aoa_to_sheet(toolsData);
  XLSX.utils.book_append_sheet(workbook, toolsSheet, 'Ferramentas');

  // Aba 4: Distribuição por Serviços
  const servicesData = [
    ['Serviço', 'Quantidade de Solicitações'],
    ...Object.entries(data.serviceDistribution).map(([service, count]) => [service, count])
  ];
  
  const servicesSheet = XLSX.utils.aoa_to_sheet(servicesData);
  XLSX.utils.book_append_sheet(workbook, servicesSheet, 'Serviços');

  // Aba 5: Distribuição por Usuários
  const usersData = [
    ['Usuário', 'Quantidade de Solicitações'],
    ...Object.entries(data.userDistribution).map(([user, count]) => [user, count])
  ];
  
  const usersSheet = XLSX.utils.aoa_to_sheet(usersData);
  XLSX.utils.book_append_sheet(workbook, usersSheet, 'Usuários');

  // Aba 6: Tipos de Monitores
  const monitorTypesData = [
    ['Tipo de Monitor', 'Quantidade de Ocorrências'],
    ...Object.entries(data.monitorTypeDistribution).map(([type, count]) => [type, count])
  ];
  
  const monitorTypesSheet = XLSX.utils.aoa_to_sheet(monitorTypesData);
  XLSX.utils.book_append_sheet(workbook, monitorTypesSheet, 'Tipos de Monitores');

  // Aba 7: Descrições de Impacto
  if (data.impactDescriptions.length > 0) {
    const impactData = [
      ['Nº', 'Descrição de Impacto'],
      ...data.impactDescriptions.map((desc, index) => [index + 1, desc])
    ];
    
    const impactSheet = XLSX.utils.aoa_to_sheet(impactData);
    XLSX.utils.book_append_sheet(workbook, impactSheet, 'Descrições de Impacto');
  }

  // Gerar e baixar o arquivo
  const fileName = `relatorio-extracao-solicitacoes-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};