import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/components/ui/use-toast";

const MonitorsRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({ title: "Acesso restrito", description: "Crie um monitor antes de acessar /monitores." });
    navigate("/criar-monitores", { replace: true });
  }, [navigate, toast]);

  return (
    <>
      <Helmet>
        <title>Redirecionando…</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    </>
  );
};

export default MonitorsRedirect;
