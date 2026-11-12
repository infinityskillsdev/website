export interface Course {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  category: 'Business & Management' | 'International Foundation' | 'Business Administration';
  level: string;
  levelNumber: number;
  ageRequirement?: string;
  overview: string;
  targetAudience: string[];
  qualificationRef?: string;
  glh?: number | string;
  tqt?: number | string;
  credits?: number | string;
  awardingBody: string;
  specificationUrl?: string;
  highlight?: boolean;
}

export const courses: Course[] = [
  {
    id: 'ga-level-2-skills-for-business',
    slug: 'ga-level-2-diploma-skills-for-business',
    title: 'GA Level 2 Diploma in Skills for Business',
    shortTitle: 'Level 2 Skills for Business',
    category: 'Business & Management',
    level: 'Level 2',
    levelNumber: 2,
    ageRequirement: 'Age 16+',
    overview: 'The GA Level 2 Diploma in Skills for Business is designed to help learners establish a foundation in business knowledge and practical workplace skills. It offers an opportunity to explore essential business concepts while developing an understanding of enterprise and entrepreneurship. This qualification is suitable for individuals beginning their business education, considering employment opportunities or seeking to strengthen their existing knowledge.',
    targetAudience: [
      'Learners planning to continue their education or training in business-related subjects.',
      'Individuals interested in starting a business or pursuing employment in the sector.',
      'Those already working in a business environment who wish to develop their skills.',
      'Entrepreneurs looking to build their understanding of business operations.',
      'Professionals seeking formal recognition of existing knowledge.'
    ],
    qualificationRef: '610/5236/X',
    glh: 360,
    tqt: 480,
    credits: 48,
    awardingBody: 'Gatehouse Awards',
    specificationUrl: 'https://gatehouseawards.org/',
    highlight: false
  },
  {
    id: 'ga-level-3-business-innovation',
    slug: 'ga-level-3-diploma-business-innovation',
    title: 'GA Level 3 Diploma in Business Innovation',
    shortTitle: 'Level 3 Business Innovation',
    category: 'Business & Management',
    level: 'Level 3',
    levelNumber: 3,
    ageRequirement: 'Age 16+',
    overview: 'The GA Level 3 Diploma in Business Innovation provides learners with an opportunity to develop their understanding of business practices, enterprise and innovation. It is intended for individuals who want to strengthen their business knowledge and explore approaches to developing ideas within a commercial environment. The qualification supports learners seeking further study, professional development or opportunities within the business sector.',
    targetAudience: [
      'Students considering further qualifications in business or related disciplines.',
      'Individuals interested in entrepreneurship and innovative business ideas.',
      'Employees seeking to enhance their understanding of business operations.',
      'Existing business owners wishing to expand their knowledge.',
      'Learners looking to gain a recognised qualification for professional development.'
    ],
    qualificationRef: '610/4931/1',
    glh: 465,
    tqt: 600,
    credits: 60,
    awardingBody: 'Gatehouse Awards',
    specificationUrl: 'https://gatehouseawards.org/',
    highlight: true
  },
  {
    id: 'ga-level-3-business-innovation-entrepreneurial',
    slug: 'ga-level-3-diploma-business-innovation-entrepreneurial-skills',
    title: 'GA Level 3 Diploma in Business Innovation and Entrepreneurial Skills',
    shortTitle: 'Level 3 Innovation & Entrepreneurial Skills',
    category: 'Business & Management',
    level: 'Level 3',
    levelNumber: 3,
    ageRequirement: 'Age 16+',
    overview: 'The GA Level 3 Diploma in Business Innovation and Entrepreneurial Skills is designed for learners who want to build a broader understanding of business development, entrepreneurship and innovative thinking. The programme provides a foundation for exploring business opportunities, developing entrepreneurial knowledge and strengthening skills relevant to business environments. It may also support progression towards further education and professional development.',
    targetAudience: [
      'Aspiring entrepreneurs interested in establishing their own businesses.',
      'Students seeking to advance their knowledge of business and enterprise.',
      'Individuals preparing for business-related employment.',
      'Existing business owners looking to develop their capabilities.',
      'Working professionals wishing to formalise their experience through a qualification.'
    ],
    qualificationRef: '610/4593/7',
    glh: 930,
    tqt: '1,200',
    awardingBody: 'Gatehouse Awards',
    specificationUrl: 'https://gatehouseawards.org/',
    highlight: false
  },
  {
    id: 'ga-level-4-business-management',
    slug: 'ga-level-4-diploma-business-management',
    title: 'GA Level 4 Diploma in Business Management',
    shortTitle: 'Level 4 Business Management',
    category: 'Business & Management',
    level: 'Level 4',
    levelNumber: 4,
    overview: 'The GA Level 4 Diploma in Business Management focuses on developing an understanding of essential management practices and professional business operations. Learners explore areas such as workplace communication, organisational procedures, customer relationships, problem-solving and business decision-making. The qualification is intended to help individuals strengthen their management knowledge and prepare for further academic or professional development.',
    targetAudience: [
      'Learners wishing to progress to higher-level business studies.',
      'Employees seeking to develop supervisory and management knowledge.',
      'Individuals interested in business administration and organisational operations.',
      'Professionals looking to improve their communication and decision-making skills.',
      'Business owners seeking a more structured understanding of management practices.'
    ],
    qualificationRef: '610/2629/3',
    awardingBody: 'Gatehouse Awards',
    specificationUrl: 'https://gatehouseawards.org/',
    highlight: true
  },
  {
    id: 'ga-level-5-business-management',
    slug: 'ga-level-5-diploma-business-management',
    title: 'GA Level 5 Diploma in Business Management',
    shortTitle: 'Level 5 Business Management',
    category: 'Business & Management',
    level: 'Level 5',
    levelNumber: 5,
    overview: 'The GA Level 5 Diploma in Business Management is designed to deepen learners\' understanding of business leadership, management and organisational performance. The qualification explores business planning, strategic decision-making, team leadership, customer service, human resource management and marketing principles. It is particularly relevant for learners who want to strengthen their management capabilities or continue towards higher-level qualifications.',
    targetAudience: [
      'Individuals aspiring to management and leadership positions.',
      'Professionals seeking to advance their existing business knowledge.',
      'Business owners interested in improving organisational performance.',
      'Learners preparing for further higher education.',
      'Employees responsible for managing people, processes or business activities.'
    ],
    qualificationRef: '610/2630/X',
    awardingBody: 'Gatehouse Awards',
    specificationUrl: 'https://gatehouseawards.org/',
    highlight: true
  },
  {
    id: 'ga-level-5-extended-business-management',
    slug: 'ga-level-5-extended-diploma-business-management',
    title: 'GA Level 5 Extended Diploma in Business Management',
    shortTitle: 'Level 5 Extended Business Management',
    category: 'Business & Management',
    level: 'Level 5',
    levelNumber: 5,
    overview: 'The GA Level 5 Extended Diploma in Business Management offers a comprehensive programme covering a broad range of business and management principles. By bringing together learning associated with Levels 4 and 5, the qualification allows learners to develop a more extensive understanding of organisational management, leadership, business planning and operational practices. It is suitable for individuals seeking a substantial business qualification to support further study or professional progression.',
    targetAudience: [
      'Learners seeking comprehensive business and management education.',
      'Individuals planning to progress to advanced academic qualifications.',
      'Professionals preparing for greater management responsibilities.',
      'Business owners seeking to develop a broader understanding of organisational operations.'
    ],
    qualificationRef: 'Official reference to be confirmed before publication',
    awardingBody: 'Gatehouse Awards',
    specificationUrl: 'https://gatehouseawards.org/',
    highlight: false
  },
  {
    id: 'ga-level-3-foundation-business-management',
    slug: 'ga-level-3-international-foundation-diploma-business-management',
    title: 'GA Level 3 International Foundation Diploma in Business and Management',
    shortTitle: 'Level 3 IFD in Business & Management',
    category: 'International Foundation',
    level: 'Level 3',
    levelNumber: 3,
    overview: 'The GA Level 3 International Foundation Diploma in Business and Management is designed to introduce learners to fundamental concepts in business and management while supporting their preparation for further academic study. The qualification offers a pathway for students interested in developing their business knowledge before pursuing higher-level education.',
    targetAudience: [
      'Students preparing for further studies in business and management.',
      'International learners exploring higher education pathways.',
      'Individuals seeking foundational business knowledge.',
      'Learners considering future careers in management or related sectors.'
    ],
    qualificationRef: '610/2245/7',
    awardingBody: 'Gatehouse Awards',
    specificationUrl: 'https://gatehouseawards.org/',
    highlight: true
  },
  {
    id: 'ga-level-3-foundation-business-technology',
    slug: 'ga-level-3-international-foundation-diploma-business-technology',
    title: 'GA Level 3 International Foundation Diploma in Business and Technology',
    shortTitle: 'Level 3 IFD in Business & Technology',
    category: 'International Foundation',
    level: 'Level 3',
    levelNumber: 3,
    overview: 'The GA Level 3 International Foundation Diploma in Business and Technology introduces learners to the relationship between business practices and technology. It is intended for students who wish to develop foundational knowledge relevant to modern business environments and explore further educational opportunities in business and technology-related subjects.',
    targetAudience: [
      'Students interested in both business and technology.',
      'Learners preparing for higher education in related disciplines.',
      'Individuals seeking an introduction to technology within business environments.',
      'International students exploring academic progression opportunities.'
    ],
    qualificationRef: '610/2246/9',
    awardingBody: 'Gatehouse Awards',
    specificationUrl: 'https://gatehouseawards.org/',
    highlight: false
  },
  {
    id: 'ga-level-3-business-admin-60',
    slug: 'ga-level-3-diploma-business-administration-60-credits',
    title: 'GA Level 3 Diploma in Business Administration (60 Credits)',
    shortTitle: 'Level 3 Business Admin (60 Credits)',
    category: 'Business Administration',
    level: 'Level 3',
    levelNumber: 3,
    overview: 'The GA Level 3 Diploma in Business Administration (60 Credits) is intended for learners who want to develop their knowledge of administrative practices within professional business environments. The qualification offers a structured opportunity to strengthen business administration knowledge and support further learning or professional development.',
    targetAudience: [
      'Individuals interested in administrative and office-based careers.',
      'Employees wishing to develop their business administration knowledge.',
      'Learners seeking a formal qualification in the subject.',
      'Professionals interested in further training and development.'
    ],
    qualificationRef: '610/7126/2',
    credits: 60,
    awardingBody: 'Gatehouse Awards',
    specificationUrl: 'https://gatehouseawards.org/',
    highlight: false
  },
  {
    id: 'ga-level-3-business-admin-90',
    slug: 'ga-level-3-diploma-business-administration-90-credits',
    title: 'GA Level 3 Diploma in Business Administration (90 Credits)',
    shortTitle: 'Level 3 Business Admin (90 Credits)',
    category: 'Business Administration',
    level: 'Level 3',
    levelNumber: 3,
    overview: 'The GA Level 3 Diploma in Business Administration (90 Credits) provides an opportunity for learners to develop a broader understanding of business administration and organisational practices. This qualification is suited to individuals who want to strengthen their professional knowledge and build a foundation for future employment or academic progression.',
    targetAudience: [
      'Learners interested in business administration roles.',
      'Employees seeking to expand their professional knowledge.',
      'Individuals looking for a more substantial Level 3 qualification.',
      'Students considering further business-related education.'
    ],
    qualificationRef: '610/7132/8',
    credits: 90,
    awardingBody: 'Gatehouse Awards',
    specificationUrl: 'https://gatehouseawards.org/',
    highlight: false
  },
  {
    id: 'ga-level-3-business-admin-120',
    slug: 'ga-level-3-diploma-business-administration-120-credits',
    title: 'GA Level 3 Diploma in Business Administration (120 Credits)',
    shortTitle: 'Level 3 Business Admin (120 Credits)',
    category: 'Business Administration',
    level: 'Level 3',
    levelNumber: 3,
    overview: 'The GA Level 3 Diploma in Business Administration (120 Credits) offers an extensive programme for learners seeking to develop their knowledge of business administration. It provides an opportunity to explore administrative and organisational practices in greater depth, supporting learners who wish to pursue further education or strengthen their professional development.',
    targetAudience: [
      'Students seeking an extensive Level 3 business administration qualification.',
      'Individuals preparing for further academic study.',
      'Employees wishing to broaden their administrative knowledge.',
      'Learners considering careers in business operations and administration.'
    ],
    qualificationRef: '610/7133/X',
    credits: 120,
    awardingBody: 'Gatehouse Awards',
    specificationUrl: 'https://gatehouseawards.org/',
    highlight: false
  }
];

