import CategoryPage from '../components/CategoryPage';

export const metadata = {
  title: 'Insumos para Tatuar | Tattoo Shop Colombia',
  description: 'Insumos y materiales profesionales para tatuaje. Tintas, agujas y más. Envío a todo Colombia.',
};

export default function InsumosPage() {
  return <CategoryPage category="Insumos" slug="insumos" />;
}
