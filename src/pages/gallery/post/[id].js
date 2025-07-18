import Head from 'next/head';
import admin from 'firebase-admin';
import { useState } from 'react';

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

export async function getServerSideProps(context) {
  const { id } = context.params;
  let post = null;
  try {
    const doc = await db.collection('galleryFeed').doc(id).get();
    if (doc.exists) {
      post = doc.data();
      post.id = doc.id;
    }
  } catch (e) {
    // handle error
  }
  if (!post) {
    return { notFound: true };
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  return {
    props: {
      post,
      fullUrl: `${baseUrl}/gallery/post/${id}`,
    },
  };
}

export default function GalleryPost({ post, fullUrl }) {
  const [clientLikes] = useState(post.reactions?.['❤️'] || 0);
  return (
    <>
      <Head>
        <title>{post.heading} | PathSarthi Gallery</title>
        <meta property="og:title" content={post.heading} />
        <meta property="og:description" content="Uploaded by PathSarthi Team" />
        <meta property="og:image" content={post.imageUrl} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:type" content="article" />
        {/* Twitter meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.heading} />
        <meta name="twitter:description" content="Uploaded by PathSarthi Team" />
        <meta name="twitter:image" content={post.imageUrl} />
        <meta name="twitter:url" content={fullUrl} />
      </Head>
      <main style={{ maxWidth: 600, margin: '2rem auto', padding: 16, background: '#fff', borderRadius: 16 }}>
        <img src={post.imageUrl} alt={post.heading} style={{ width: '100%', borderRadius: 12 }} />
        <h1 style={{ fontSize: 28, margin: '1rem 0', color: '#ff7300' }}>{post.heading}</h1>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <span>❤️ {clientLikes}</span>
          {/* Add comment/share UI as needed */}
        </div>
        {/* Optionally render comments, share, etc. */}
      </main>
    </>
  );
} 