const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const MASTER_COURSES = [
  {
    id: "ielts-academic",
    name: "IELTS Academic",
    category: "Language Preparation",
    description: "Official Cambridge-aligned IELTS Academic preparation for university admissions abroad.",
    plans: [
      {
        id: "ielts-acad-self-prep",
        name: "Self Preparation Pack",
        price: "₹13,899",
        numericPrice: 13899,
        period: "₹2,316/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "60 sectional tests",
          "15 mock tests",
          "20+ hrs video",
          "500+ grammar/vocab lessons",
          "No live lectures"
        ]),
      },
      {
        id: "ielts-acad-champ",
        name: "Champion Pack",
        price: "₹25,999",
        numericPrice: 25999,
        period: "₹4,333/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "1 batch timing",
          "100 hrs live lectures",
          "60 sectional tests",
          "15 mock tests",
          "20+ hrs video"
        ]),
      },
      {
        id: "ielts-acad-champ-plus",
        name: "Champion Pack +",
        price: "₹28,999",
        numericPrice: 28999,
        period: "₹4,833/m",
        validityText: "6 months",
        badge: "Most Comprehensive",
        features: JSON.stringify([
          "All 3 batch timings (morning/afternoon/evening)",
          "100 hrs live lectures",
          "60 sectional tests",
          "15 mock tests",
          "20+ hrs video"
        ]),
      },
    ],
  },
  {
    id: "ielts-general",
    name: "IELTS General",
    category: "Language Preparation",
    description: "Tailored IELTS General training for Canada PR, Australia immigration, and work visas.",
    plans: [
      {
        id: "ielts-gen-self-prep",
        name: "Self Preparation Pack",
        price: "₹13,899",
        numericPrice: 13899,
        period: "₹2,316/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "60 sectional tests",
          "15 mock tests",
          "20+ hrs video",
          "500+ grammar/vocab lessons",
          "No live lectures"
        ]),
      },
      {
        id: "ielts-gen-champ",
        name: "Champion Pack",
        price: "₹28,999",
        numericPrice: 28999,
        period: "—",
        validityText: "—",
        badge: null,
        features: JSON.stringify([
          "100 hrs live lectures",
          "60 sectional tests",
          "15 mock tests",
          "20+ hrs video",
          "500+ grammar/vocab"
        ]),
      },
    ],
  },
  {
    id: "pte-academic",
    name: "PTE Academic",
    category: "Language Preparation",
    description: "Pearson Test of English Academic with AI algorithm scoring and full mock evaluations.",
    plans: [
      {
        id: "pte-acad-self-prep",
        name: "Self Preparation Pack",
        price: "₹13,899",
        numericPrice: 13899,
        period: "₹2,316/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "Dashboard access",
          "2000+ practice questions",
          "15 mock tests",
          "Performance analysis",
          "No live lectures"
        ]),
      },
      {
        id: "pte-acad-champ",
        name: "Champion Pack",
        price: "₹20,999",
        numericPrice: 20999,
        period: "₹3,500/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "Live lecture",
          "Dashboard access",
          "2000+ practice questions",
          "15 mock tests",
          "Performance analysis"
        ]),
      },
      {
        id: "pte-acad-live-class",
        name: "Live Class",
        price: "₹9,499",
        numericPrice: 9499,
        period: "₹3,166/m",
        validityText: "3 months",
        badge: null,
        features: JSON.stringify([
          "Dashboard access",
          "Performance analysis",
          "Expert feedback"
        ]),
      },
    ],
  },
  {
    id: "pte-core",
    name: "PTE Core",
    category: "Language Preparation",
    description: "PTE Core training for Canadian immigration and vocational migration.",
    plans: [
      {
        id: "pte-core-champ",
        name: "Champion Pack",
        price: "₹20,999",
        numericPrice: 20999,
        period: "₹3,500/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "2000+ practice questions",
          "5 mock tests",
          "6-week live lectures",
          "Dashboard access",
          "Performance analysis"
        ]),
      },
    ],
  },
  {
    id: "celpip",
    name: "CELPIP",
    category: "Language Preparation",
    description: "Canadian English Language Proficiency Index Program training with mock tests.",
    plans: [
      {
        id: "celpip-self-prep",
        name: "Self Preparation Pack",
        price: "₹31,999",
        numericPrice: 31999,
        period: "₹5,333/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "11 mock tests",
          "Dashboard access",
          "Performance analysis",
          "Expert feedback",
          "No live lectures"
        ]),
      },
      {
        id: "celpip-champ",
        name: "Champion Pack",
        price: "₹50,999",
        numericPrice: 50999,
        period: "₹8,500/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "11 mock tests",
          "6 weeks live lectures",
          "Dashboard access",
          "Performance analysis",
          "Expert feedback"
        ]),
      },
    ],
  },
  {
    id: "french-language-programs",
    name: "French Language Programs",
    category: "Language Preparation",
    description: "CEFR aligned French training from Beginner A1 to Advanced TEF Canada proficiency.",
    plans: [
      {
        id: "french-basic-a1-1t",
        name: "Basic & A1 (1 timing)",
        price: "₹31,999",
        numericPrice: 31999,
        period: "₹6,400/m",
        validityText: "5 months",
        badge: null,
        features: JSON.stringify([
          "Single batch",
          "15 practice tests",
          "10 wks live lectures",
          "Grammar+vocab+e-book"
        ]),
      },
      {
        id: "french-basic-a1-2t",
        name: "Basic & A1 (2 timings)",
        price: "₹36,999",
        numericPrice: 36999,
        period: "₹7,400/m",
        validityText: "5 months",
        badge: null,
        features: JSON.stringify([
          "Morning+evening batches",
          "15 practice tests",
          "10 wks live lectures"
        ]),
      },
      {
        id: "french-basic-a1-a2-1l",
        name: "Basic, A1 & A2 (1 lecture)",
        price: "₹47,999",
        numericPrice: 47999,
        period: "₹6,857/m",
        validityText: "7 months",
        badge: null,
        features: JSON.stringify([
          "Single batch",
          "30 practice tests",
          "16 wks live lectures"
        ]),
      },
      {
        id: "french-basic-a1-a2-2l",
        name: "Basic, A1 & A2 (2 lectures)",
        price: "₹55,999",
        numericPrice: 55999,
        period: "₹8,000/m",
        validityText: "7 months",
        badge: null,
        features: JSON.stringify([
          "Morning+evening batches",
          "30 practice tests",
          "16 wks live lectures"
        ]),
      },
      {
        id: "french-basic-to-tef",
        name: "Basic to TEF (Most Popular)",
        price: "₹91,999",
        numericPrice: 91999,
        period: "₹5,750/m",
        validityText: "16 months",
        badge: "Most Popular",
        features: JSON.stringify([
          "60 practice tests",
          "10 TEF mocks",
          "32 wks live lectures"
        ]),
      },
      {
        id: "french-b1-b2-tef",
        name: "B1, B2 & TEF Pack",
        price: "₹56,999",
        numericPrice: 56999,
        period: "₹8,143/m",
        validityText: "7 months",
        badge: null,
        features: JSON.stringify([
          "15 practice tests",
          "10 TEF mocks",
          "16 wks live lectures"
        ]),
      },
    ],
  },
  {
    id: "german-language-programs",
    name: "German Language Programs",
    category: "Language Preparation",
    description: "Goethe-Institut aligned German courses from A1 to B1 for German study and Job Seeker visas.",
    plans: [
      {
        id: "german-basic-a1",
        name: "Basic & A1",
        price: "₹26,999",
        numericPrice: 26999,
        period: "₹5,400/m",
        validityText: "5 months",
        badge: null,
        features: JSON.stringify([
          "11 wks live lectures",
          "15 practice tests",
          "Grammar+vocab",
          "Dashboard",
          "E-book"
        ]),
      },
      {
        id: "german-basic-a1-a2",
        name: "Basic, A1 & A2 (Most Popular)",
        price: "₹40,999",
        numericPrice: 40999,
        period: "₹5,857/m",
        validityText: "7 months",
        badge: "Most Popular",
        features: JSON.stringify([
          "18 wks live lectures",
          "30 practice tests",
          "Grammar+vocab",
          "Dashboard",
          "E-book"
        ]),
      },
      {
        id: "german-basic-a1-a2-b1",
        name: "Basic, A1, A2 & B1 (Premium)",
        price: "₹60,999",
        numericPrice: 60999,
        period: "₹6,100/m",
        validityText: "10 months",
        badge: "Premium",
        features: JSON.stringify([
          "27 wks live lectures",
          "45 practice tests",
          "Grammar+vocab",
          "Dashboard",
          "E-book"
        ]),
      },
    ],
  },
  {
    id: "duolingo-english-test",
    name: "Duolingo English Test",
    category: "Language Preparation",
    description: "Accelerated Duolingo preparation with computer-adaptive test simulation and live lectures.",
    plans: [
      {
        id: "duolingo-champ",
        name: "Champion Pack",
        price: "₹10,499",
        numericPrice: 10499,
        period: "₹5,250/m",
        validityText: "2 months",
        badge: null,
        features: JSON.stringify([
          "13 mock tests",
          "4 wks live lectures",
          "Dashboard",
          "Performance analysis",
          "Expert feedback"
        ]),
      },
    ],
  },
  {
    id: "spoken-english",
    name: "Spoken English",
    category: "Language Preparation",
    description: "Fluency, professional public speaking, and conversational English coaching.",
    plans: [
      {
        id: "spoken-eng-champ",
        name: "Champion Pack",
        price: "₹15,799",
        numericPrice: 15799,
        period: "₹2,633/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "Dashboard access",
          "Live + recorded lectures",
          "Practice test",
          "Expert feedback"
        ]),
      },
    ],
  },
  {
    id: "toefl",
    name: "TOEFL",
    category: "Language Preparation",
    description: "Official ETS TOEFL iBT curriculum with structured live lectures and expert analysis.",
    plans: [
      {
        id: "toefl-live-class",
        name: "Live Class Pack",
        price: "₹22,999",
        numericPrice: 22999,
        period: "₹3,833/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "12 wks live lectures",
          "Recorded lessons",
          "Dashboard",
          "Performance analysis",
          "Expert feedback"
        ]),
      },
    ],
  },
  {
    id: "d-sat",
    name: "D-SAT",
    category: "Test Preparation",
    description: "Digital SAT training with adaptive testing, Bluebook simulation, and target 1500+ strategy.",
    plans: [
      {
        id: "dsat-self-prep",
        name: "Self Preparation Pack",
        price: "₹22,999",
        numericPrice: 22999,
        period: "₹3,833/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "39 practice tests",
          "11 mock tests",
          "90+ hrs video lessons",
          "Dashboard",
          "Expert feedback"
        ]),
      },
      {
        id: "dsat-champ",
        name: "Champion Pack",
        price: "₹53,999",
        numericPrice: 53999,
        period: "₹9,000/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "39 practice tests",
          "11 mock tests",
          "120+ hrs live lectures",
          "Dashboard",
          "Expert feedback"
        ]),
      },
      {
        id: "dsat-live-class",
        name: "Live Class Pack",
        price: "₹28,999",
        numericPrice: 28999,
        period: "₹9,666/m",
        validityText: "3 months",
        badge: null,
        features: JSON.stringify([
          "Live lectures",
          "Recorded lessons",
          "Dashboard",
          "Performance analysis",
          "Expert feedback"
        ]),
      },
    ],
  },
  {
    id: "shorter-gre",
    name: "Shorter GRE",
    category: "Test Preparation",
    description: "Updated ETS Shorter GRE preparation covering Quantitative Reasoning and Verbal strategies.",
    plans: [
      {
        id: "gre-self-prep",
        name: "Self Preparation Pack",
        price: "₹22,999",
        numericPrice: 22999,
        period: "₹3,833/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "11 mock tests",
          "90+ hrs video lessons",
          "Dashboard",
          "Performance analysis",
          "Expert feedback"
        ]),
      },
      {
        id: "gre-champ",
        name: "Champion Pack",
        price: "₹53,999",
        numericPrice: 53999,
        period: "₹9,000/m",
        validityText: "6 months",
        badge: null,
        features: JSON.stringify([
          "11 mock tests",
          "120+ hrs video lessons",
          "Dashboard",
          "Performance analysis",
          "Expert feedback"
        ]),
      },
      {
        id: "gre-live-class",
        name: "Live Class Pack",
        price: "₹28,999",
        numericPrice: 28999,
        period: "₹9,666/m",
        validityText: "3 months",
        badge: null,
        features: JSON.stringify([
          "Live lectures",
          "Recorded lessons",
          "Dashboard",
          "Performance analysis",
          "Expert feedback"
        ]),
      },
    ],
  },
  {
    id: "gmat",
    name: "GMAT",
    category: "Test Preparation",
    description: "GMAT Focus Edition with Quant and Verbal mastery sessions led by top 99th percentile instructors.",
    plans: [
      {
        id: "gmat-live-class",
        name: "Live Class Pack",
        price: "₹38,999",
        numericPrice: 38999,
        period: "₹13,000/m",
        validityText: "3 months",
        badge: null,
        features: JSON.stringify([
          "Live lectures",
          "3 days Quant + 3 days Verbal",
          "Dashboard",
          "Performance analysis",
          "Expert feedback"
        ]),
      },
    ],
  },
  {
    id: "dmat",
    name: "DMAT",
    category: "Test Preparation",
    description: "Direct Management Aptitude Test prep with live interactive classes and review.",
    plans: [
      {
        id: "dmat-live-classes",
        name: "Live Classes",
        price: "₹34,999",
        numericPrice: 34999,
        period: "—",
        validityText: "60 days",
        badge: null,
        features: JSON.stringify([
          "Live classes"
        ]),
      },
    ],
  },
  {
    id: "skill-catalyst-programs",
    name: "Skill Catalyst Programs",
    category: "Skill Catalyst",
    description: "Industry-ready professional skills, Google Suite mastery, capstones, and career launchpad.",
    plans: [
      {
        id: "skill-career-essentials",
        name: "Career Essentials Pack",
        price: "₹16,299",
        numericPrice: 16299,
        period: "—",
        validityText: "10 days",
        badge: null,
        features: JSON.stringify([
          "95 days portal access",
          "20 hrs live lectures",
          "Capstone projects",
          "Mock interviews",
          "Skill assessment",
          "Certificate"
        ]),
      },
      {
        id: "skill-combo-pack",
        name: "Combo Pack (Most Popular)",
        price: "₹42,999",
        numericPrice: 42999,
        period: "—",
        validityText: "6 weeks",
        badge: "Most Popular",
        features: JSON.stringify([
          "95 days portal access",
          "6 wks live lectures",
          "Capstone projects",
          "Competency evaluation",
          "Skill assessment",
          "Certificate"
        ]),
      },
      {
        id: "skill-gsuite-hub",
        name: "Google Suite Hub Pack (Premium)",
        price: "₹16,299",
        numericPrice: 16299,
        period: "—",
        validityText: "7 days",
        badge: "Premium",
        features: JSON.stringify([
          "95 days portal access",
          "14 hrs live lectures",
          "Dashboard projects",
          "Quiz tracking",
          "Skill assessment",
          "Certificate"
        ]),
      },
      {
        id: "skill-bizz-tech",
        name: "Bizz Tech Course",
        price: "₹16,299",
        numericPrice: 16299,
        period: "—",
        validityText: "7 days",
        badge: null,
        features: JSON.stringify([
          "95 days portal access",
          "14 hrs live lectures",
          "Podcast projects",
          "Analytics mastery",
          "Skill assessment",
          "Certificate"
        ]),
      },
    ],
  },
  {
    id: "test-your-english",
    name: "Test Your English",
    category: "Language Preparation",
    description: "Rapid baseline diagnostic test to gauge current CEFR band and proficiency level.",
    plans: [
      {
        id: "test-eng-15-days",
        name: "15-Day Package",
        price: "₹199",
        numericPrice: 199,
        period: "—",
        validityText: "15 days",
        badge: null,
        features: JSON.stringify([
          "Quick English proficiency test package"
        ]),
      },
    ],
  },
];

async function seed() {
  console.log("Starting Course & Package Database Seed from PDF Guide...");
  try {
    // Delete existing plans and courses cleanly
    await prisma.coursePlan.deleteMany({});
    await prisma.course.deleteMany({});

    for (const courseData of MASTER_COURSES) {
      const { plans, ...courseFields } = courseData;
      const createdCourse = await prisma.course.create({
        data: {
          ...courseFields,
          plans: {
            create: plans.map((p) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              numericPrice: p.numericPrice,
              period: p.period,
              validityText: p.validityText,
              badge: p.badge,
              features: p.features,
            })),
          },
        },
      });
      console.log(`✓ Inserted: ${createdCourse.name} (${plans.length} plans)`);
    }

    const totalCourses = await prisma.course.count();
    const totalPlans = await prisma.coursePlan.count();
    console.log(`\n🎉 Seed Completed! Total Courses: ${totalCourses}, Total Packages: ${totalPlans}`);
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

