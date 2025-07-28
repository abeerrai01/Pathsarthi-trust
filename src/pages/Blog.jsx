import React from 'react';
import { Link } from 'react-router-dom';

// Mock data for blog articles
const articles = [
  {
    id: 'stray-dog',
    title: 'Stray Animals',
    author: 'Supriya Baranwal',
    excerpt: 'The Strays Need To Feel At Home Too. Often in the constant fight between the stray animals and the human population the later seems to be more humane to take care of first, knowing their voices are heard, but what about those who can’t voice their grief? ...',
  },
  {
    id: 'childhood-memories',
    title: 'Childhood Memories',
    author: 'Amit Kumar',
    excerpt: 'Reminiscing about the golden days of childhood and the lessons learned...',
  },
  // Add more articles as needed
];

const Blog = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-extrabold text-green-700 mb-8 text-center font-serif">Interns' Featured Articles</h1>
      <div className="space-y-6">
        {articles.map(article => (
          <Link
            to={`/blog/${article.id}`}
            key={article.id}
            className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 p-6 border-l-4 border-green-400 group"
          >
            <h2 className="text-2xl font-bold text-green-800 group-hover:text-green-900 font-cute mb-1">{article.title}</h2>
            <p className="text-md text-gray-600 mb-2 font-cute">by {article.author}</p>
            <p className="text-gray-500 italic font-cute">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blog; 