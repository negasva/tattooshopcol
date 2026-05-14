import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  published_at: string;
  read_time?: number;
  category?: string;
  author?: string;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true).single();
  return data ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Artículo no encontrado' };
  return { title: `${post.title} — Blog TattooShop Colombia`, description: post.excerpt };
}

const accent = '#FFD400';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 700, background: 'rgba(18,18,18,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 clamp(20px,5vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <Link href="/" style={{ color: accent, textDecoration: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', letterSpacing: '2px' }}>TattooShop Colombia</Link>
        <Link href="/blog" style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1.5px', textDecoration: 'none', textTransform: 'uppercase' }}>← Blog</Link>
      </nav>

      {/* COVER */}
      {post.cover_image && (
        <div style={{ width: '100%', maxHeight: '420px', overflow: 'hidden' }}>
          <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '420px', objectFit: 'cover' }} />
        </div>
      )}

      {/* ARTICLE */}
      <article style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(32px,5vw,64px) clamp(20px,5vw,40px)' }}>
        {post.category && (
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: accent, letterSpacing: '3px', marginBottom: '12px', textTransform: 'uppercase' }}>{post.category}</div>
        )}
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,5vw,64px)', color: 'var(--text)', margin: '0 0 16px', lineHeight: 0.95 }}>{post.title}</h1>
        <div style={{ display: 'flex', gap: '20px', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '32px', flexWrap: 'wrap' }}>
          {post.author && <span>Por {post.author}</span>}
          <span>{new Date(post.published_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          {post.read_time && <span>{post.read_time} min lectura</span>}
        </div>
        {post.excerpt && (
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.7, borderLeft: `3px solid ${accent}`, paddingLeft: '16px', marginBottom: '32px' }}>
            {post.excerpt}
          </p>
        )}
        {/* Content rendered as HTML — stored as HTML in DB */}
        <div
          style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text)', lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* CTA */}
      <div style={{ borderTop: '1px solid var(--border)', padding: 'clamp(32px,4vw,48px) clamp(20px,5vw,80px)', textAlign: 'center' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: accent, letterSpacing: '3px', marginBottom: '12px' }}>TIENDA</div>
        <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(28px,4vw,48px)', color: 'var(--text)', margin: '0 0 20px' }}>¿LISTO PARA EQUIPARTE?</h2>
        <Link href="/#productos" style={{ display: 'inline-block', background: accent, color: '#111', fontFamily: '"Bebas Neue", sans-serif', fontSize: '20px', letterSpacing: '1.5px', padding: '14px 36px', textDecoration: 'none' }}>
          VER PRODUCTOS
        </Link>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px clamp(20px,5vw,80px)', display: 'flex', justifyContent: 'space-between', background: 'var(--surface)' }}>
        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)' }}>TattooShop Colombia ©2026</span>
        <Link href="/blog" style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, textDecoration: 'none' }}>← Más artículos</Link>
      </footer>
    </div>
  );
}
