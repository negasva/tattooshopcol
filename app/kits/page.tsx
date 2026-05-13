import CategoryPage from '../components/CategoryPage';

export const metadata = {
  title: 'Kits de Tatuaje | Tattoo Shop Colombia',
  description: 'Kits completos para tatuar. Equipos profesionales a tu puerta en todo Colombia.',
};

export default function KitsPage() {
  return <CategoryPage category="Kits" slug="kits" />;
}
