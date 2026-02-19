// Types pour les données du Coran

export interface Sourate {
  id: string;
  numero: number;
  nomArabe: string;
  nomTranslitteration: string;
  nomTraduction: string;
  nombreVersets: number;
  revelation: string;
  createdAt: string;
  updatedAt: string;
}

export interface Verset {
  id: string;
  sourateNumero: number;
  versetNumero: number;
  texteArabe: string;
  translitteration: string | null;
  traduction: string | null;
  audioUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSave {
  id: string;
  userId: string;
  sourateNumero: number;
  versetNumero: number;
  lastReadAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserMemorization {
  id: string;
  userId: string;
  versetId: string;
  sourateNumero: number;
  versetNumero: number;
  statut: 'en_cours' | 'memorise' | 'a_reviser';
  niveauMaitrise: number;
  exercicesTotal: number;
  exercicesReussis: number;
  derniereRevision: string | null;
  prochaineRevision: string | null;
  createdAt: string;
  updatedAt: string;
}
