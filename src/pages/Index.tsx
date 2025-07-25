import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { PositionInput } from '@/components/PositionInput';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetPosition, setTargetPosition] = useState('');
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    toast({
      title: "Arquivo carregado",
      description: `${file.name} foi carregado com sucesso.`,
    });
  };

  const handleAnalyze = () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, faça o upload do seu currículo antes de analisar.",
        variant: "destructive",
      });
      return;
    }

    if (!targetPosition.trim()) {
      toast({
        title: "Erro", 
        description: "Por favor, digite seu cargo alvo.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Análise iniciada",
      description: "Sua carreira está sendo analisada por IA...",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-foreground tracking-wider">
            IMPULSO
          </h1>
          <p className="text-xl text-muted-foreground">
            Seu próximo passo de carreira, desenhado por IA.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* File Upload */}
          <FileUpload onFileSelect={handleFileSelect} />

          {/* Position Input */}
          <PositionInput 
            value={targetPosition}
            onChange={setTargetPosition}
          />

          {/* Analyze Button */}
          <Button 
            variant="analyze"
            size="lg"
            className="w-full h-14 text-lg"
            onClick={handleAnalyze}
          >
            Analisar Carreira
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
