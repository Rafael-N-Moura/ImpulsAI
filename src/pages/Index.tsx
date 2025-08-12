import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '@/components/FileUpload';
import { PositionInput } from '@/components/PositionInput';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetPosition, setTargetPosition] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    toast({
      title: "Arquivo carregado",
      description: `${file.name} foi carregado com sucesso.`,
    });
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !targetPosition) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo e informe o cargo almejado.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('cv', selectedFile);
      formData.append('cargoAlmejado', targetPosition);

      const response = await fetch('http://localhost:4000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro na análise');
      }

      const resultado = await response.json();

      // Navegar para a página de resultados com os dados
      navigate('/results', {
        state: {
          resultado: resultado,
          cargoAlmejado: targetPosition
        }
      });
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro ao analisar o currículo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
          >
            {loading ? 'Analisando...' : 'Analisar Carreira'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
