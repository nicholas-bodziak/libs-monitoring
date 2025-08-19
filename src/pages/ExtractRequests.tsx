import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, ArrowLeft, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMonitorStorage } from "@/hooks/useMonitorStorage";
import { useToast } from "@/hooks/use-toast";
import { extractAllRequestData, generateExcelReport } from "@/utils/extractRequestData";

const ExtractRequests: React.FC = () => {
  const { monitors } = useMonitorStorage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionComplete, setExtractionComplete] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  useEffect(() => {
    // Auto-executar a extração quando a página carregar
    if (monitors.length > 0 && !isExtracting && !extractionComplete) {
      handleStartExtraction();
    }
  }, [monitors]);

  const handleStartExtraction = async () => {
    if (monitors.length === 0) {
      toast({
        title: "Nenhum dado para extrair",
        description: "Não há solicitações para serem extraídas."
      });
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(0);

    try {
      // Simular progresso da extração
      const progressSteps = [
        { progress: 20, message: "Analisando dados..." },
        { progress: 40, message: "Processando ferramentas..." },
        { progress: 60, message: "Organizando serviços..." },
        { progress: 80, message: "Compilando relatório..." },
        { progress: 100, message: "Finalizando..." }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setExtractionProgress(step.progress);
      }

      const data = extractAllRequestData(monitors);
      setExtractedData(data);
      setExtractionComplete(true);
      
      toast({
        title: "Extração concluída",
        description: `Dados de ${data.totalRequests} solicitação(ões) foram processados com sucesso.`
      });
    } catch (error) {
      console.error('Erro ao extrair dados:', error);
      toast({
        title: "Erro na extração",
        description: "Ocorreu um erro ao extrair os dados das solicitações.",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!extractedData) return;

    try {
      generateExcelReport(extractedData);
      toast({
        title: "Excel gerado com sucesso",
        description: "O arquivo foi baixado para sua pasta de downloads."
      });
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      toast({
        title: "Erro ao gerar Excel",
        description: "Ocorreu um erro ao gerar o arquivo Excel.",
        variant: "destructive"
      });
    }
  };

  if (monitors.length === 0) {
    return (
      <>
        <Helmet>
          <title>Extrair Solicitações — Libs de Monitoração</title>
          <meta name="description" content="Extrair dados de solicitações de monitores em formato Excel." />
        </Helmet>

        <div className="min-h-screen bg-background py-8">
          <main className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Extrair Solicitações</h1>
                <p className="text-muted-foreground mt-2">
                  Exporte dados de solicitações em formato Excel
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum dado disponível</h3>
                <p className="text-muted-foreground mb-4">
                  Não há solicitações para serem extraídas. Crie alguns monitores primeiro.
                </p>
                <Button onClick={() => navigate("/criar-monitor")}>
                  Criar primeiro monitor
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Extrair Solicitações — Libs de Monitoração</title>
        <meta name="description" content="Extrair dados de solicitações de monitores em formato Excel." />
      </Helmet>

      <div className="min-h-screen bg-background py-8">
        <main className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Extrair Solicitações</h1>
              <p className="text-muted-foreground mt-2">
                Exporte dados de solicitações em formato Excel
              </p>
            </div>
          </div>

          {/* Status da Extração */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {extractionComplete ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : isExtracting ? (
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                Status da Extração
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isExtracting && (
                <div className="space-y-4">
                  <Progress value={extractionProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Processando {extractionProgress}%...
                  </p>
                </div>
              )}

              {extractionComplete && extractedData && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Extração concluída com sucesso!</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{extractedData.totalRequests}</div>
                      <div className="text-xs text-muted-foreground">Solicitações</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{extractedData.monitorsCreated}</div>
                      <div className="text-xs text-muted-foreground">Monitores</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{extractedData.toolsUsed.length}</div>
                      <div className="text-xs text-muted-foreground">Ferramentas</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{extractedData.servicesMonitored.length}</div>
                      <div className="text-xs text-muted-foreground">Serviços</div>
                    </div>
                  </div>

                  <Button onClick={handleDownloadExcel} className="w-full" size="lg">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Relatório Excel
                  </Button>
                </div>
              )}

              {!isExtracting && !extractionComplete && (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Pronto para extrair dados de {monitors.length} solicitação(ões)
                  </p>
                  <Button onClick={handleStartExtraction} size="lg">
                    <Download className="w-4 h-4 mr-2" />
                    Iniciar Extração
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo dos Dados */}
          {extractedData && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo dos Dados Extraídos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Ferramentas Utilizadas</h4>
                    <div className="flex flex-wrap gap-2">
                      {extractedData.toolsUsed.map((tool: string) => (
                        <Badge key={tool} variant="outline">
                          {tool} ({extractedData.toolDistribution[tool]})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Tipos de Monitores</h4>
                    <div className="flex flex-wrap gap-2">
                      {extractedData.monitorTypes.slice(0, 5).map((type: string) => (
                        <Badge key={type} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                      {extractedData.monitorTypes.length > 5 && (
                        <Badge variant="outline">
                          +{extractedData.monitorTypes.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Período de Atividade</h4>
                    <p className="text-sm text-muted-foreground">
                      {extractedData.timeRange.totalDays} dia(s) de atividade
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Médias</h4>
                    <p className="text-sm text-muted-foreground">
                      {extractedData.averageMonitorsPerRequest} monitores por solicitação
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
};

export default ExtractRequests;