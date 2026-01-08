
import { PredefinedMeasure } from '../types';

export const PREDEFINED_MEASURES: PredefinedMeasure[] = [
  {
    id: 'leak_repair',
    title: 'Deteção e Reparação de Fugas',
    description: 'Localização e eliminação de perdas na rede de distribuição.',
    impactType: 'flow',
    suggestedImpact: 'Reduz o caudal necessário entre 10% a 30%.',
    defaultBudgetTemplates: [
      { description: 'Levantamento técnico e auditoria ultrassónica de fugas', category: 'Serviço', chapter: '2. Trabalhos preparatórios e preliminares', quantity: 1, unitPrice: 750 },
      { description: 'Kit de reparação rápida e acessórios pneumáticos', category: 'Material', chapter: '6. Instalação mecânica', quantity: 1, unitPrice: 350 },
      { description: 'Mão de obra para reparação de pontos críticos', category: 'Mão de Obra', chapter: '6. Instalação mecânica', quantity: 8, unitPrice: 45 },
      { description: 'Limpeza e remoção de detritos de obra', category: 'Serviço', chapter: '10. Trabalhos finais e entrega da obra', quantity: 1, unitPrice: 150 }
    ]
  },
  {
    id: 'pressure_reduction',
    title: 'Redução da Pressão de Serviço',
    description: 'Ajuste da pressão para o mínimo necessário ao processo.',
    impactType: 'pressure',
    suggestedImpact: 'Poupa ~7% de energia por cada 1 bar de redução.',
    defaultBudgetTemplates: [
      { description: 'Estudo de compatibilidade de pressão nos pontos de consumo', category: 'Serviço', chapter: '2. Trabalhos preparatórios e preliminares', quantity: 1, unitPrice: 250 },
      { description: 'Transdutores de pressão de alta precisão', category: 'Equipamento', chapter: '7. Instalação elétrica', quantity: 2, unitPrice: 380 },
      { description: 'Parametrização e otimização de setpoints de rede', category: 'Serviço', chapter: '8. Ensaios, comissionamento e colocação em serviço', quantity: 1, unitPrice: 150 }
    ]
  },
  {
    id: 'vsd_install',
    title: 'Instalação de Compressor VSD',
    description: 'Substituição por tecnologia de velocidade variável.',
    impactType: 'unload',
    suggestedImpact: 'Elimina o tempo em vazio e ajusta o consumo ao caudal real.',
    defaultBudgetTemplates: [
      { description: 'Estudo de cargas elétricas e meios de elevação', category: 'Serviço', chapter: '2. Trabalhos preparatórios e preliminares', quantity: 1, unitPrice: 350 },
      { description: 'Desmontagem e desativação do compressor existente (LOTO)', category: 'Serviço', chapter: '3. Desmontagem e desativação do sistema existente', quantity: 1, unitPrice: 500 },
      { description: 'Compressor de Parafuso com Inversor de Frequência (VSD) OEM', category: 'Equipamento', chapter: '4. Fornecimento de novos equipamentos', quantity: 1, unitPrice: 18500 },
      { description: 'Execução de maciço de betão e reforço estrutural', category: 'Serviço', chapter: '5. Obras de adaptação civil', quantity: 1, unitPrice: 850 },
      { description: 'Instalação mecânica, ligações e by-pass pneumático', category: 'Serviço', chapter: '6. Instalação mecânica', quantity: 1, unitPrice: 1200 },
      { description: 'Alimentação elétrica e quadro de proteção', category: 'Material', chapter: '7. Instalação elétrica', quantity: 1, unitPrice: 850 },
      { description: 'Arranque assistido, ensaios e formação de operadores', category: 'Serviço', chapter: '8. Ensaios, comissionamento e colocação em serviço', quantity: 1, unitPrice: 650 },
      { description: 'Manual de operação e dossier técnico CE', category: 'Serviço', chapter: '9. Formação, documentação e garantias', quantity: 1, unitPrice: 200 },
      { description: 'Gestão de resíduos e limpeza final da central', category: 'Serviço', chapter: '10. Trabalhos finais e entrega da obra', quantity: 1, unitPrice: 450 }
    ]
  },
  {
    id: 'central_control',
    title: 'Sistema de Gestão Centralizado',
    description: 'Controlo sequencial de múltiplos compressores.',
    impactType: 'multi',
    suggestedImpact: 'Otimiza a cascata de pressão e reduz o funcionamento em vazio.',
    defaultBudgetTemplates: [
      { description: 'Controlador Mestre Inteligente de Compressores', category: 'Equipamento', chapter: '4. Fornecimento de novos equipamentos', quantity: 1, unitPrice: 4200 },
      { description: 'Cablagem de comunicação Modbus/Ethernet', category: 'Material', chapter: '7. Instalação elétrica', quantity: 1, unitPrice: 600 },
      { description: 'Programação de algoritmos de cascata de pressão', category: 'Serviço', chapter: '8. Ensaios, comissionamento e colocação em serviço', quantity: 1, unitPrice: 1500 }
    ]
  }
];
