import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FacebookShareButton, WhatsappShareButton, TwitterShareButton, FacebookIcon, WhatsappIcon, TwitterIcon } from 'react-share';

const FALLBACK_IMAGE = "https://pathsarthi.in/default-blog-image.jpg";
const ORG_NAME = "Pathsarthi Trust";
const BASE_URL = "https://pathsarthi.in";

const articles = [
  {
    id: 'feminism-ngos',
    slug: 'feminism-and-the-expanding-role-of-ngos',
    title: 'FROM IDEOLOGY TO IMPLEMENTATION: FEMINISM AND THE EXPANDING ROLE OF NGOs',
    author: 'Swati Saurabh, BA.LLB- 4th Year',
    content: `Feminism, at its core, is the belief in social, political, and economic equality of the sexes. Over the decades, it has evolved from a movement demanding basic civil right to a broader struggle addressing structural inequalities, cultural norms, and intersectional identities. In this journey, non-governmental organizations (NGOs) have emerged as powerful catalysts, transforming feminist ideals into real-world action.

UNDERSTANDING FEMINISM IN THE MODERN CONTEXT

Modern feminism is no longer limited to advocating voting rights or workplace inclusion. It now encompasses issues such as: Gender based violence, access to education and healthcare, economic empowerment, political participation, reproductive rights, digital and cyber safety. This expanded scope requires sustained grassroot engagement, policy advocacy, and community-driven solutions- roles that NGOs are uniquely positioned to perform.

NGOs AS AGENTS OF SOCIAL CHANGE

NGOs function as a bridge between marginalized communities and institutional frameworks. Unlike state machinery, they often work directly at the grassroot level, identifying problems that remain invisible in policy corridors. Their flexibility allows them to respond quickly to emerging challenges faced by women and gender minorities.
Through awareness campaigns, legal aid, vocational training, and shelter homes, NGOs translate feminist ideology into practical empowerment. They do not merely highlight injustice; they create pathways out of it.

LEGAL AWARENESS AND ADVOCACY

One of the most significant contributions of the NGOs to feminism is in the domain of legal empowerment. Many women are unaware of their rights related to domestic violence, sexual harassment, property and inheritance, marriage and divorce. NGOs conduct legal literacy workshops, provide counseling, and facilitate access to justice. They also engage in public interest litigation and policy advocacy, ensuring that feminist perspectives are reflected in legislative reforms.

EDUCATIONAL AND ECONOMIC INDEPENDENCE

Education remains the foundation of feminist progress. NGOs work to reduce female dropout rates, promote girl-child education, provide scholarships and mentorship, offer skill development programs. Economic independence strengthens women’s bargaining power within families and societies. Microfinance initiatives, self-help groups, and entrepreneurship programs led by NGOs enable women to move from dependency to decision-making roles.

ADDRESSING VIOLENCE AND TRAUMA

Gender-based violence remains one of the most pressing challenges to feminist goals. NGOs operate crisis helplines, shelter homes, and trauma recovery programs for survivors of abuse and trafficking. By combining psychological support with legal assistance, they adopt a holistic approach to justice and rehabilitation. These interventions redefine feminism not just as resistance, but as recovery and resilience.

DIGITAL FEMINISM AND NEW FRONTIERS

With the rise of social media and digital platforms, NGOs are now embracing digital feminism- using technology to amplify women’s voices. Online campaigns challenge stereotypes, expose abuse, and mobilize support across borders. NGOs also work on cyber safety, teaching women how to navigate digital spaces securely. This technological engagement has expanded feminism from physical protest to virtual advocacy, making it more inclusive and far-reaching. Despite their contributions, NGOs face numerous obstacles such as: Limited funding, political resistance, social backlash, cultural stigma. In many regions, feminist NGOs are branded as disruptive or “anti-traditional.” This highlights the need for stronger institutional support and societal acceptance of gender justice as a collective responsibility rather than a confrontational ideology.

However, the expanding role of NGOs in feminist implementation is not without challenges. Critics argue that some NGOs risk becoming dependent on external funding, which may dilute their commitment to grassroots concerns. Others point out that excessive reliance on NGOs can allow the state to evade its responsibility toward women’s welfare. Furthermore, the diversity of feminist perspectives sometimes leads to fragmented approaches, making coordination difficult. These limitations highlight the need for accountability, transparency, and sustained collaboration between NGOs, governments, and communities. Despite these challenges, the impact of NGOs in advancing feminist goals remains undeniable. They have transformed feminism from a largely intellectual discourse into a lived social practice. By engaging directly with women at the local level, NGOs ensure that feminist ideology does not remain confined to academic debates or urban activism but reaches rural and marginalized populations. Their work illustrates how theory and practice can complement each other in the pursuit of social justice.

CONCLUSION

Feminism provides the vision of equality; NGOs provide the vehicle to achieve it. Together, they represent a dynamic partnership between ideology and implementation. As societies grapple with changing gender roles and emerging inequalities, NGOs will continue to play an indispensable role in shaping an inclusive feminist future.
True feminism is not merely about protest—it is about participation, policy, protection, and progress. NGOs ensure that this progress reaches the last woman standing at the margins, transforming feminism from a theory into lived reality.

Path Sarthi Trust works with the commitment to uphold dignity, compassion, and equality for all vulnerable lives. Guided by feminist principles of justice and inclusion, the Trust recognizes that silence does not negate suffering and that the inability to articulate pain must never become a reason for neglect. Every being has an equal right to survival, care, and humane treatment. Through awareness, advocacy, and community engagement, Path Sarthi Trust strives to challenge indifference, address systemic neglect, and affirm that protection and empathy are not privileges, but fundamental rights.
    
    THANK YOU`,
    image: '',
    published: '2026-02-18',
  },
  {
    id: 'path-sarthi-trust',
    slug: 'path-sarthi-trust-walking-together',
    title: 'Path Sarthi Trust: Walking Together Towards a Better Society',
    author: 'Shreyansh Rai, BA-LLB 2nd year Student',
    content: `In today's fast-moving world, many people still struggle for basic needs like education, health, safety, and awareness. Children miss school, women face challenges every day, and many families do not get proper medical care. Path Sarthi Trust is an NGO that works with a strong belief no one should be left behind. Path Sarthi Trust acts as a true "Sarthi" (guide) for those who need support the most.

Helping Children Build a Bright Future

Children are the future of our society, but many children do not get equal opportunities. Path Sarthi Trust works actively for the education, care, and development of children, especially those from poor and underprivileged backgrounds.

The NGO helps children by:
• Supporting basic education and learning
• Creating awareness about the importance of schooling
• Encouraging moral values, confidence, and self-belief
• Helping children grow in a safe and positive environment

By guiding children on the right path, Path Sarthi Trust helps them dream big and work towards a better life.

Empowering Women, Strengthening Society

Women are the backbone of every family and society. However, many women still face inequality, lack of awareness, and health issues. Path Sarthi Trust strongly believes that empowered women lead to a stronger nation.

The NGO works for women by:
• Creating awareness about women's rights and safety
• Supporting women's health and well-being
• Encouraging self-confidence and independence
• Spreading knowledge about education, hygiene, and social issues

Through its efforts, Path Sarthi Trust helps women raise their voices, stand strong, and live with dignity.

Free Medical Checkups for a Healthy Life

Good health is a basic right, not a luxury. Many people cannot afford regular medical checkups. Understanding this problem, Path Sarthi Trust organizes free medical check-up camps for people in need.

These medical camps help by:
• Providing free health check-ups
• Creating awareness about diseases and prevention
• Promoting cleanliness, hygiene, and healthy habits
• Guiding people towards timely treatment

These initiatives help save lives and improve the quality of life for many families.

Spreading Awareness for Positive Change

Awareness is the first step towards change. Path Sarthi Trust regularly conducts awareness programs on:
• Education and literacy
• Health and hygiene
• Women empowerment
• Social responsibility and human values

By spreading awareness, the NGO helps people understand their rights, duties, and the importance of a united society.

A Mission of Hope and Humanity

Path Sarthi Trust is not just an NGO; it is a movement of kindness, care, and responsibility. With dedicated volunteers and supporters, the Trust continues to work selflessly for children, women, and the health of society.

Every small step taken by Path Sarthi Trust brings a big change in someone's life.

Join Hands with Path Sarthi Trust

Change becomes stronger when we walk together. You can support Path Sarthi Trust by:
• Volunteering your time
• Spreading awareness
• Supporting their social initiatives
• Encouraging others to help

Together, we can create a society where children are educated, women are empowered, and everyone lives a healthy life.

Path Sarthi Trust — Guiding lives, spreading hope, and building a better tomorrow.

So Let's Come Together and Join Our Hand Towards a better Society.

Thank you.`,
    image: '',
    published: '2024-12-29',
  },
  {
    id: 'stray-dog',
    slug: 'stray-animals',
    title: 'Stray Animals',
    author: 'Supriya Baranwal',
    content: `The Strays Need To Feel At Home Too

Often in the constant fight between the stray animals and the human population the later seems to be more humane to take care of first, knowing their voices are heard, but what about those who can't voice their grief? 
During the recent Supreme Court proceedings, the top court said that if people want to feed the stray animals, they should do so in their own homes. Even though, such comments passed during judgments don't make up to be the final law it makes us think how less the options lie for those who actually commit to saving the little rights the stray animals have.
The government says to be making efforts to find a middle ground for the stray animals to survive while keeping the common man safe to move on the streets with no fear of animal attacks. Punjab Local Government would bring together various departments and experts to formulate a comprehensive strategy to address the stray animal menace in the state. Alongwith that ten additional cow shelters are being managed by the Urban Local Bodies (ULBs). Ravjot Singh said that Urban Local Bodies regularly secure stray animals and shift them to government and private 'gaushalas'. He said that financial assistance is provided to 'gaushalas' based on the availability of Cow Cess Funds and ULBs' resources. Also, the Bruhat Bengaluru Mahanagara Palike (BBMP) has announced a ₹2.9 crore daily feeding programme for the city's stray dog population. The initiative will provide chicken and rice meals to stray dogs across all 243 municipal wards. The civic body will allocate ₹95 per dog per day for a meal that includes cooked rice and chicken waste, with an estimated daily reach of over 50,000 dogs in the initial phase. 
These moves contribute to the betterment but often fall short of it. The rescuers face problems beyond the state provides to fix. The shelters lack funds, there is shortage of resources and the growing animal population requires for the funds to increase so that the number of shelters could be increased. And the problems do not come to an end here. The rescuers of stray animals complains that the rescuing comes at a great cost sometimes, especially if it's a large animal, the cost of transportation to the shelter exceeds what they could provide, leaving them no choice but to rescue the selective animals and leading the tragic road for other animals in need. 
There are laws for this but they do not seem to be adequate in finding the balance between care and cruelty. Rule 20 of the Animal Birth Control Rules deals with feeding of community animals, including dogs, and puts the onus on resident welfare associations or apartment owners associations. RWAs and/or AOAs are expected to designate areas in the colony to feed the animals and to do so at specified times only. There are various other laws which fails to have the effect that it was made to follow through because the state is not willing just as much to care for, leaving the animals just as much helpless.
At such times, even the smallest step counts. There comes Dali, the rescue dog who paints and raise funds for the stray dogs by selling those paintings. She is a two-year-old Labrador and is India's first  known K9 artist  went viral for her abstract paintings, which help raise money for injured strays. 
Just as Dali making efforts to help the stray animals, you can do it too and even the smallest effort counts. The people at Path Sarthi Trust are here to acknowledge you and make up more aware. As those helpless souls have the right to breathe the same air as you and they need not be starved to death and grieve the endless loss. 
Just because they can't speak their pains out doesn't mean they need not be helped.`,
    image: '/dog_feeding.png',
    published: '2024-06-01',
  },
];

export default function BlogPost() {
  const { id, slug } = useParams();
  // Support both id and slug for now
  const article = articles.find(a => a.slug === slug || a.id === id);

  if (!article) return <div>Not found</div>;

  const {
    title,
    author,
    content,
    image,
    published = "2024-06-01",
  } = article;

  const description = content.slice(0, 150).replace(/\n/g, " ");
  const url = `${BASE_URL}/blog/${article.slug}`;
  const img = image || FALLBACK_IMAGE;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "author": { "@type": "Person", "name": author },
    "datePublished": published,
    "image": img,
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": ORG_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": "https://pathsarthi.in/PathSarthi%20logo.png"
      }
    },
    "description": description
  };

  // Special formatting for 'Stray Animals' article
  let formattedContent = content;
  if (article.slug === 'stray-animals') {
    const [firstLine, ...rest] = content.split('\n');
    const paragraphs = rest.join('\n').split(/\n{2,}/).filter(Boolean);
    formattedContent = (
      <>
        <div className="font-bold text-xl md:text-2xl text-center mb-4 text-orange-600 drop-shadow-sm">{firstLine}</div>
        <div className="space-y-6">
          {paragraphs.map((para, idx) => {
            let node = null;
            if (para.includes('Dali, the rescue dog')) {
              node = (
                <div key={idx} className="bg-orange-50 border-l-4 border-orange-300 px-4 py-2 italic text-orange-800 rounded-md shadow-sm">
                  {para}
                </div>
              );
            } else if (para.includes('Just as Dali making efforts')) {
              node = (
                <div key={idx} className="bg-blue-50 border-l-4 border-blue-300 px-4 py-2 font-semibold text-blue-800 rounded-md shadow-sm">
                  {para}
                </div>
              );
            } else {
              node = (
                <p key={idx} className="text-lg md:text-xl text-gray-800 leading-relaxed font-cute drop-shadow-sm">
                  {para}
                </p>
              );
            }
            return node;
          })}
        </div>
      </>
    );
  } else if (article.slug === 'feminism-and-the-expanding-role-of-ngos') {
    const paragraphs = content.split(/\n{2,}/).filter(Boolean);
    formattedContent = (
      <div className="space-y-6">
        {paragraphs.map((para, idx) => {
          const isHeader = /^[A-Z\s]+$/.test(para.trim()) && para.trim().length >= 10;
          if (isHeader) {
            return (
              <h2 key={idx} className="text-xl md:text-2xl font-bold text-orange-600 mt-8 mb-4 border-b-2 border-orange-100 pb-2">
                {para}
              </h2>
            );
          }
          if (para.includes('THANK YOU')) {
            return (
              <p key={idx} className="text-center font-bold text-blue-700 text-2xl mt-8">
                {para}
              </p>
            );
          }
          return (
            <p key={idx} className="text-lg md:text-xl text-gray-800 leading-relaxed font-cute">
              {para}
            </p>
          );
        })}
      </div>
    );
  }



  return (
    <article className="max-w-2xl mx-auto py-16 px-4" itemScope itemType="https://schema.org/BlogPosting">
      <Helmet>
        <title>{title} | {ORG_NAME}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={img} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={ORG_NAME} />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={img} />
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <div className="bg-gradient-to-br from-blue-50 via-orange-50 to-white rounded-3xl shadow-2xl p-10 border-4 border-orange-200 relative">
        <header>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 font-cute text-center bg-gradient-to-r from-blue-500 to-orange-400 bg-clip-text text-transparent drop-shadow-lg" itemProp="headline">{title}</h1>
          <p className="text-lg text-blue-700 mb-6 font-cute text-center" itemProp="author">by {author}</p>
          {image && <img src={img} alt={title} className="mx-auto mb-6 rounded-xl max-h-72 object-cover" itemProp="image" />}
        </header>
        <section className="text-lg md:text-xl text-gray-700 leading-relaxed font-cute text-center md:text-left whitespace-pre-line" itemProp="articleBody">
          {formattedContent}
        </section>
        <div className="flex gap-2 mt-6 justify-center">
          <FacebookShareButton url={url} quote={title}>
            <FacebookIcon size={32} round />
          </FacebookShareButton>
          <WhatsappShareButton url={url} title={title}>
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
          <TwitterShareButton url={url} title={title}>
            <TwitterIcon size={32} round />
          </TwitterShareButton>
        </div>
        <Link to="/blog" className="absolute top-4 left-4 text-orange-500 hover:text-blue-700 font-cute text-sm underline">&larr; Back</Link>
      </div>
    </article>
  );
}