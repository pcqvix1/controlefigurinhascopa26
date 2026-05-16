export type Sticker = {
  id: string;
  codigo: string;
  nome: string;
  grupo: string;
  secao: string;
  ordem: number;
};

export type ProgressState = {
  ownedIds: string[];
};
