import type { SVGProps } from 'react';
import PlasticIcon from './icons/PlasticIcon';
import PaperIcon from './icons/PaperIcon';
import MetalIcon from './icons/MetalIcon';
import GlassIcon from './icons/GlassIcon';
import ElectronicWasteIcon from './icons/ElectronicWasteIcon'; // Added
import { HelpCircle } from 'lucide-react'; // Fallback icon

interface MaterialIconProps extends SVGProps<SVGSVGElement> {
  materialType: string;
}

export default function MaterialIcon({ materialType, ...props }: MaterialIconProps) {
  switch (materialType.toLowerCase()) {
    case 'plastic':
      return <PlasticIcon {...props} />;
    case 'paper':
      return <PaperIcon {...props} />;
    case 'metal':
      return <MetalIcon {...props} />;
    case 'glass':
      return <GlassIcon {...props} />;
    case 'electronic waste': // Added
      return <ElectronicWasteIcon {...props} />;
    default:
      return <HelpCircle {...props} />; // Default icon for unknown types
  }
}
