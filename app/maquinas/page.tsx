import CategoryPage from '../components/CategoryPage';

export const metadata = {
  title: 'Máquinas de Tatuar | Tattoo Shop Colombia',
  description: 'Máquinas de tatuar profesionales. Coil, rotary y más. Envío a todo Colombia.',
};

export default function MaquinasPage() {
  return <CategoryPage category="Máquinas" slug="maquinas" />;
}
