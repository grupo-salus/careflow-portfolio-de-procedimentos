import React from 'react';
import { 
  Sparkles, Heart, Eye, Smile, Droplets, Zap, Shield, Clock,
  Scissors, Palette, Star, Sun, Moon, Flower, Gem, Leaf
} from 'lucide-react';

interface LabelIconProps {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getLabelIcon = (label: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'rejuvenescimento': <Sparkles />,
    'rugas': <Eye />,
    'linhas de expressão': <Smile />,
    'rosto': <Smile />,
    'testa': <Eye />,
    'olhos': <Eye />,
    'beleza': <Heart />,
    'agulha': <Zap />,
    'volume': <Droplets />,
    'lábios': <Smile />,
    'contorno labial': <Smile />,
    'hidratação': <Droplets />,
    'ácido hialurônico': <Droplets />,
    'boca': <Smile />,
    'renovação celular': <Sparkles />,
    'manchas': <Sun />,
    'acne': <Shield />,
    'cicatrizes': <Shield />,
    'pele lisa': <Sparkles />,
    'química': <Palette />,
    'limpeza': <Droplets />,
    'cravos': <Shield />,
    'poros': <Shield />,
    'pele oleosa': <Droplets />,
    'bem-estar': <Heart />,
    'extração': <Scissors />,
    'flacidez': <Zap />,
    'colágeno': <Sparkles />,
    'lifting': <Sparkles />,
    'tecnologia': <Zap />,
    'anti-aging': <Clock />,
    'firmeza': <Shield />,
    'não invasivo': <Leaf />,
    'textura': <Star />,
    'microagulhas': <Zap />,
    'penetração': <Droplets />
  };

  return iconMap[label.toLowerCase()] || <Gem />;
};

const LabelIcon: React.FC<LabelIconProps> = ({ label, size = 'sm', className = '' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {getLabelIcon(label)}
    </div>
  );
};

export default LabelIcon;