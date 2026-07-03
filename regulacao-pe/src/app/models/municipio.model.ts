export interface Municipio {
  id: string;
  nome: string;
  geresId: string;
  geresNome: string;
  habitantes: number;
  consultasMes: number;
  indicadorAbsenteismo: number; // %
  indicadorOcupacao: number; // %
  alertasAtivos: number;
  latitude: number;
  longitude: number;
}
