import { Input } from '@/components/ui/input';

interface PositionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PositionInput = ({ value, onChange }: PositionInputProps) => {
  return (
    <div className="w-full">
      <Input
        type="text"
        placeholder="Digite seu cargo alvo (ex: Desenvolvedor Sênior)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 text-lg px-6 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-accent focus:border-accent"
      />
    </div>
  );
};