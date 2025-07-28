import React from 'react';
import { useParams, Link } from 'react-router-dom';

// Mock data for blog articles (should match Blog.jsx)
const articles = [
  {
    id: 'stray-dog',
    title: 'Stray Animals',
    author: 'Supriya Baranwal',
    content: `The Strays Need To Feel At Home Too

Often in the constant fight between the stray animals and the human population the later seems to be more humane to take care of first, knowing their voices are heard, but what about those who can’t voice their grief? 
During the recent Supreme Court proceedings, the top court said that if people want to feed the stray animals, they should do so in their own homes. Even though, such comments passed during judgments don’t make up to be the final law it makes us think how less the options lie for those who actually commit to saving the little rights the stray animals have.
The government says to be making efforts to find a middle ground for the stray animals to survive while keeping the common man safe to move on the streets with no fear of animal attacks. Punjab Local Government would bring together various departments and experts to formulate a comprehensive strategy to address the stray animal menace in the state. Alongwith that ten additional cow shelters are being managed by the Urban Local Bodies (ULBs). Ravjot Singh said that Urban Local Bodies regularly secure stray animals and shift them to government and private 'gaushalas'. He said that financial assistance is provided to 'gaushalas' based on the availability of Cow Cess Funds and ULBs’ resources. Also, the Bruhat Bengaluru Mahanagara Palike (BBMP) has announced a ₹2.9 crore daily feeding programme for the city’s stray dog population. The initiative will provide chicken and rice meals to stray dogs across all 243 municipal wards. The civic body will allocate ₹95 per dog per day for a meal that includes cooked rice and chicken waste, with an estimated daily reach of over 50,000 dogs in the initial phase. 
These moves contribute to the betterment but often fall short of it. The rescuers face problems beyond the state provides to fix. The shelters lack funds, there is shortage of resources and the growing animal population requires for the funds to increase so that the number of shelters could be increased. And the problems do not come to an end here. The rescuers of stray animals complains that the rescuing comes at a great cost sometimes, especially if it’s a large animal, the cost of transportation to the shelter exceeds what they could provide, leaving them no choice but to rescue the selective animals and leading the tragic road for other animals in need. 
There are laws for this but they do not seem to be adequate in finding the balance between care and cruelty. Rule 20 of the Animal Birth Control Rules deals with feeding of community animals, including dogs, and puts the onus on resident welfare associations or apartment owners associations. RWAs and/or AOAs are expected to designate areas in the colony to feed the animals and to do so at specified times only. There are various other laws which fails to have the effect that it was made to follow through because the state is not willing just as much to care for, leaving the animals just as much helpless.
At such times, even the smallest step counts. There comes Dali, the rescue dog who paints and raise funds for the stray dogs by selling those paintings. She is a two-year-old Labrador and is India’s first  known K9 artist  went viral for her abstract paintings, which help raise money for injured strays. 
Just as Dali making efforts to help the stray animals, you can do it too and even the smallest effort counts. The people at Path Sarthi Trust are here to acknowledge you and make up more aware. As those helpless souls have the right to breathe the same air as you and they need not be starved to death and grieve the endless loss. 
Just because they can’t speak their pains out doesn’t mean they need not be helped.`,
  },
  // Add more articles as needed
];

const BlogArticle = () => {
  const { id } = useParams();
  const article = articles.find(a => a.id === id);

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4 font-cute">Article Not Found</h2>
        <Link to="/blog" className="text-green-700 underline font-cute">Back to Blog</Link>
      </div>
    );
  }

  // Special formatting for 'Stray Animals' article
  let content = article.content;
  if (article.id === 'stray-dog') {
    const [firstLine, ...rest] = article.content.split('\n');
    // Split paragraphs for better styling
    const paragraphs = rest.join('\n').split(/\n{2,}/).filter(Boolean);
    content = (
      <>
        <div className="font-bold text-xl md:text-2xl text-center mb-4 text-orange-600 drop-shadow-sm">{firstLine}</div>
        <div className="space-y-6">
          {paragraphs.map((para, idx) => {
            // Highlight quotes or important lines
            if (para.includes('Dali, the rescue dog')) {
              return (
                <div key={idx} className="bg-orange-50 border-l-4 border-orange-300 px-4 py-2 italic text-orange-800 rounded-md shadow-sm">
                  {para}
                </div>
              );
            }
            if (para.includes('Just as Dali making efforts')) {
              return (
                <div key={idx} className="bg-blue-50 border-l-4 border-blue-300 px-4 py-2 font-semibold text-blue-800 rounded-md shadow-sm">
                  {para}
                </div>
              );
            }
            // Default paragraph style
            return (
              <p key={idx} className="text-lg md:text-xl text-gray-800 leading-relaxed font-cute drop-shadow-sm">
                {para}
              </p>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="bg-gradient-to-br from-blue-50 via-orange-50 to-white rounded-3xl shadow-2xl p-10 border-4 border-orange-200 relative">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 font-cute text-center bg-gradient-to-r from-blue-500 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">{article.title}</h1>
        <p className="text-lg text-blue-700 mb-6 font-cute text-center">by {article.author}</p>
        <div className="text-lg md:text-xl text-gray-700 leading-relaxed font-cute text-center md:text-left whitespace-pre-line">
          {content}
        </div>
        <Link to="/blog" className="absolute top-4 left-4 text-orange-500 hover:text-blue-700 font-cute text-sm underline">&larr; Back</Link>
      </div>
    </div>
  );
};

export default BlogArticle; 