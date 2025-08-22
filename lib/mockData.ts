export interface MockRecord {
  id: string;
  cultura: string;
  ruas?: number;
  comp_rua_m?: number;
  dose_ml_m?: number;
  area_ha: number;
  dose_l_ha?: number;
  chuva_mm: number;
  produto: string;
}

export const mockRecords: MockRecord[] = [
  {
    id: "A1",
    cultura: "Café",
    ruas: 120,
    comp_rua_m: 80,
    dose_ml_m: 500,
    area_ha: 4.2,
    chuva_mm: 28,
    produto: "Fosfato"
  },
  {
    id: "B2",
    cultura: "Soja",
    area_ha: 12.0,
    dose_l_ha: 2.5,
    chuva_mm: 35,
    produto: "Herbicida"
  },
  {
    id: "C3",
    cultura: "Milho",
    area_ha: 7.5,
    dose_l_ha: 2.0,
    chuva_mm: 22,
    produto: "Inseticida"
  }
];

export const mockStatsValues = [28, 35, 22];