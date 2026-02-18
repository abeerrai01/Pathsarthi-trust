import React from "react";
import { Link } from "react-router-dom";

// Mock data for blog articles
const articles = [
  {
    id: "feminism-ngos",
    slug: "feminism-and-the-expanding-role-of-ngos",
    title: "FROM IDEOLOGY TO IMPLEMENTATION: FEMINISM AND THE EXPANDING ROLE OF NGOs",
    author: "Swati Saurabh, BA.LLB- 4th Year",
    excerpt:
      "Feminism, at its core, is the belief in social, political, and economic equality of the sexes. In this journey, non-governmental organizations (NGOs) have emerged as powerful catalysts, transforming feminist ideals into real-world action...",
    image: "",
  },
  {
    id: "path-sarthi-trust",
    slug: "path-sarthi-trust-walking-together",
    title: "Path Sarthi Trust: Walking Together Towards a Better Society",
    author: "Shreyansh Rai, BA-LLB 2nd year Student",
    excerpt:
      "In today's fast-moving world, many people still struggle for basic needs like education, health, safety, and awareness. Path Sarthi Trust is an NGO that works with a strong belief no one should be left behind. Path Sarthi Trust acts as a true 'Sarthi' (guide) for those who need support the most...",
    image: "",
  },
  {
    id: "stray-dog",
    slug: "stray-animals",
    title: "Stray Animals",
    author: "Supriya Baranwal",
    excerpt:
      "The Strays Need To Feel At Home Too. Often in the constant fight between the stray animals and the human population the later seems to be more humane to take care of first, knowing their voices are heard, but what about those who can't voice their grief? ...",
    image: "",
  },
];

const Blog = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-extrabold mb-8 text-center font-serif bg-gradient-to-r from-blue-300 via-blue-400 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
        Featured Articles
      </h1>
      <div className="space-y-6">
        {articles.map((article) => (
          <Link
            to={`/blog/${article.slug}`}
            key={article.slug}
            className="block bg-gradient-to-br from-blue-50 via-orange-50 to-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 p-6 border-l-4 border-orange-300 group"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-orange-400 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-orange-500 font-cute mb-1">
              {article.title}
            </h2>
            <p className="text-md text-blue-700 mb-2 font-cute">
              by {article.author}
            </p>
            <p className="text-gray-500 italic font-cute">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blog;
