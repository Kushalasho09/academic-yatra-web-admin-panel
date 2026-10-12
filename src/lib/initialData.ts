export interface CourseWithPlans {
  id: string;
  name: string;
  category: string;
  description?: string;
  plans: {
    id: string;
    courseId: string;
    name: string;
    price: string;
    numericPrice: number;
    originalPrice?: string;
    period?: string;
    duration?: string;
    validityText?: string;
    liveHours?: string;
    badge?: string;
    isFeatured?: boolean;
    description?: string;
    features: string[];
  }[];
}

export const INITIAL_COURSES: CourseWithPlans[] = [
  {
    id: "ielts-academic",
    name: "IELTS Academic Masterclass",
    category: "Test Prep",
    description: "Complete preparation for Band 8+ in IELTS Academic with live mock tests and feedback.",
    plans: [
      {
        id: "ielts-starter",
        courseId: "ielts-academic",
        name: "Self-Paced Practice",
        price: "6,499",
        numericPrice: 6499,
        originalPrice: "9,999",
        duration: "2 Months",
        validityText: "60 Days Full Access",
        liveHours: "Recorded Lectures",
        features: ["50+ Practice Sets", "AI Band Predictor", "Writing Evaluator", "Email Support"],
      },
      {
        id: "ielts-pro",
        courseId: "ielts-academic",
        name: "Live Mentorship Band 8+",
        price: "16,299",
        numericPrice: 16299,
        originalPrice: "24,999",
        duration: "3 Months",
        validityText: "90 Days Intensive",
        liveHours: "48 Hours Live",
        badge: "Most Popular",
        isFeatured: true,
        features: ["1-on-1 Speaking Mocks", "Daily Writing Corrections", "48 Hrs Live Classes", "Guaranteed Band 7.5+ Assistance"],
      },
      {
        id: "ielts-vip",
        courseId: "ielts-academic",
        name: "1-on-1 Personal Coaching",
        price: "28,999",
        numericPrice: 28999,
        originalPrice: "39,999",
        duration: "3 Months",
        validityText: "Personal Mentor",
        liveHours: "Unlimited Speaking Mocks",
        features: ["Dedicated Cambridge Trainer", "Unlimited Essay Corrections", "Visa Statement of Purpose Review"],
      },
    ],
  },
  {
    id: "german-a1-b2",
    name: "German Language Pathway (A1 - B2)",
    category: "Languages",
    description: "Goethe-Zertifikat preparation for students and professionals planning to study in Germany.",
    plans: [
      {
        id: "german-a1",
        courseId: "german-a1-b2",
        name: "German A1 Beginner",
        price: "12,999",
        numericPrice: 12999,
        originalPrice: "18,000",
        duration: "2 Months",
        validityText: "A1 Goethe Exam Ready",
        liveHours: "40 Hours Live",
        features: ["Goethe Pattern Mocks", "Interactive Grammar Labs", "Native Audio Dialogues", "Certificate of Completion"],
      },
      {
        id: "german-combo",
        courseId: "german-a1-b2",
        name: "A1 + A2 Fastrack Combo",
        price: "23,499",
        numericPrice: 23499,
        originalPrice: "34,000",
        duration: "4 Months",
        validityText: "Complete Foundation",
        liveHours: "80 Hours Live",
        badge: "Best Value",
        isFeatured: true,
        features: ["A1 + A2 Curriculum", "Weekly Speaking Clubs", "Direct German University Guidance", "Doubt Clearing Sessions"],
      },
    ],
  },
  {
    id: "skill-catalyst-ai",
    name: "AI & Full-Stack Tech Catalyst",
    category: "Skill Catalyst",
    description: "Industry-ready hands-on software development program for international employability.",
    plans: [
      {
        id: "tech-standard",
        courseId: "skill-catalyst-ai",
        name: "Core Development",
        price: "19,999",
        numericPrice: 19999,
        originalPrice: "29,999",
        duration: "3 Months",
        validityText: "Project Based",
        liveHours: "Live Labs",
        features: ["Next.js & TypeScript", "Cloud Deployments", "Git & CI/CD", "Portfolio Projects"],
      },
      {
        id: "tech-placement",
        courseId: "skill-catalyst-ai",
        name: "Global Career Accelerator",
        price: "34,999",
        numericPrice: 34999,
        originalPrice: "49,999",
        duration: "6 Months",
        validityText: "Job Assistance",
        liveHours: "1-on-1 Tech Mentorship",
        badge: "Career Track",
        isFeatured: true,
        features: ["Global Resume Review", "Mock Technical Interviews", "Capstone AI Project", "Direct Recruiter Introductions"],
      },
    ],
  },
];

export const INITIAL_BLOGS = [
  {
    id: "blog-1",
    title: "Complete Roadmap to Study in Germany Tuition-Free in 2026",
    slug: "study-in-germany-tuition-free-2026",
    excerpt: "Learn how international students can secure admissions in top German public universities with zero tuition fees and English-taught programs.",
    content: `## Why Germany is the #1 Destination for International Students\n\nGermany offers world-class education at virtually zero tuition fees across public universities. In this guide, we break down the step-by-step process for academic session 2026-2027.\n\n### 1. Understanding the APS Certificate\nFor Indian students, the APS certificate is mandatory. Apply at least 4 months prior to your target intake.\n\n### 2. Blocked Account Requirements\nEnsure you have your Sperrkonto (Blocked Account) funded as per current German Federal Foreign Office requirements.\n\n### 3. Language Proficiency (IELTS vs Goethe)\nWhile English programs require Band 6.5+, learning at least A1-B1 German gives you an unfair advantage in part-time jobs and visa interviews.`,
    coverImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&auto=format&fit=crop&q=80",
    author: "Academic Yatra Editorial",
    category: "Study Abroad",
    tags: "Germany, Higher Education, Free Tuition, Visa Guide",
    readTime: "6 min read",
    isPublished: true,
    views: 342,
    createdAt: new Date().toISOString(),
  },
  {
    id: "blog-2",
    title: "How to Crack IELTS Speaking Part 2 & 3 with Band 8.0+",
    slug: "crack-ielts-speaking-band-8-guide",
    excerpt: "Master cue card structuring, lexical resource, and idiomatic fluency without memorizing fake scripts.",
    content: `## The Secret to IELTS Speaking 8+\n\nThe examiner is evaluating four key criteria: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation.\n\n### The 1-Minute Prep Strategy for Part 2\nDivide your notes into 4 quadrants:\n- Who / What\n- Where / When\n- Why it matters\n- How you felt about it\n\nKeep talking until the examiner stops you!`,
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
    author: "IELTS Head Mentor",
    category: "Test Prep",
    tags: "IELTS, Speaking, English Exam, Study Tips",
    readTime: "4 min read",
    isPublished: true,
    views: 618,
    createdAt: new Date().toISOString(),
  },
];
