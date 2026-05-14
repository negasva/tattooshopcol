import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — TattooShop Colombia',
  description: 'Tutoriales, guías y consejos sobre tatuajes profesionales.',
};

const accent = '#FFD400';

async function getPosts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, published_at, read_time, category')
    .eq('published', true)
    .order('published_at', { ascending: false });
  return data ?? [];
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 700, background: 'rgba(18,18,18,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 clamp(20px,5vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', color: accent, textDecoration: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', letterSpacing: '2px' }}>
          TattooShop Colombia
        </Link>
        <Link href="/" style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1.5px', textDecoration: 'none', textTransform: 'uppercase' }}>
          ← Tienda
        </Link>
      </nav>

      {/* HEADER */}
      <section style={{ padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,80px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: accent, letterSpacing: '3px', marginBottom: '12px', fontWeight: 700 }}>BLOG</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(40px,6vw,80px)', lineHeight: 0.92, color: 'var(--text)', margin: 0 }}>
          TUTORIALES<br /><span style={{ color: accent }}>Y CONSEJOS</span>
        </h1>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', marginTop: '16px', maxWidth: '560px' }}>
          Guías prácticas para tatuadores — técnicas, cuidado del equipo y selección de insumos.
        </p>
      </section>

      {/* POSTS GRID */}
      <section style={{ padding: 'clamp(32px,5vw,64px) clamp(20px,5vw,80px)' }}>
        {posts.length === 0 ? (
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '14px', color: 'var(--text-muted)', padding: '60px 0' }}>
            Próximamente — estamos preparando el contenido.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'var(--border)' }}>
            {posts.map((post: Record<string, string>) => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ background: 'var(--surface)', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
                {post.cover_image && (
                  <img src={post.cover_image} alt={post.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {post.category && (
                    <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: accent, letterSpacing: '2px', textTransform: 'uppercase' }}>{post.category}</span>
                  )}
                  <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', color: 'var(--text)', margin: 0, lineHeight: 1.1 }}>{post.title}</h2>
                  {post.excerpt && (
                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{post.excerpt}</p>
                  )}
                  <div style={{ display: 'flex', gap: '16px', marginTop: 'auto', paddingTop: '12px', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {post.published_at && <span>{new Date(post.published_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}</span>}
                    {post.read_time && <span>{post.read_time} min lectura</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px clamp(20px,5vw,80px)', display: 'flex', justifyContent: 'space-between', background: 'var(--surface)' }}>
        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)' }}>TattooShop Colombia ©2026</span>
        <Link href="/#productos" style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, textDecoration: 'none' }}>Ver productos →</Link>
      </footer>
    </div>
  );
}
