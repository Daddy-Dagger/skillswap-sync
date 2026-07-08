import { getDb } from "../api/queries/connection";
import { skillCategories, skills } from "./schema";

const categories = [
  { name: "development", displayName: "Development", description: "Build software, websites, and applications", icon: "Code2", color: "#3B82F6", baseCreditMultiplier: "1.2", sortOrder: 1 },
  { name: "design", displayName: "Design", description: "Create beautiful interfaces and experiences", icon: "Palette", color: "#8B5CF6", baseCreditMultiplier: "1.0", sortOrder: 2 },
  { name: "content", displayName: "Content", description: "Write, edit, and create compelling content", icon: "PenTool", color: "#10B981", baseCreditMultiplier: "0.8", sortOrder: 3 },
  { name: "marketing", displayName: "Marketing", description: "Grow products and reach audiences", icon: "TrendingUp", color: "#F59E0B", baseCreditMultiplier: "0.9", sortOrder: 4 },
  { name: "nocode_ai", displayName: "No-Code & AI", description: "Automate and build without traditional coding", icon: "Zap", color: "#EF4444", baseCreditMultiplier: "1.1", sortOrder: 5 },
];

const skillsData = [
  // Development
  { categoryName: "development", name: "frontend", displayName: "Frontend Development", description: "Build user interfaces with React, Vue, Angular, and more" },
  { categoryName: "development", name: "backend", displayName: "Backend Development", description: "Build APIs, servers, and databases" },
  { categoryName: "development", name: "fullstack", displayName: "Full Stack Development", description: "End-to-end web application development" },
  { categoryName: "development", name: "mobile", displayName: "Mobile Development", description: "Build iOS and Android applications" },
  { categoryName: "development", name: "devops", displayName: "DevOps", description: "CI/CD, cloud infrastructure, and deployment" },

  // Design
  { categoryName: "design", name: "ui_design", displayName: "UI Design", description: "Create beautiful user interfaces" },
  { categoryName: "design", name: "ux_design", displayName: "UX Design", description: "Design user experiences and research" },
  { categoryName: "design", name: "graphic_design", displayName: "Graphic Design", description: "Logos, branding, and visual assets" },
  { categoryName: "design", name: "motion_graphics", displayName: "Motion Graphics", description: "Animated visuals and effects" },
  { categoryName: "design", name: "video_editing", displayName: "Video Editing", description: "Edit and produce video content" },

  // Content
  { categoryName: "content", name: "copywriting", displayName: "Copywriting", description: "Write persuasive marketing copy" },
  { categoryName: "content", name: "content_writing", displayName: "Content Writing", description: "Blog posts, articles, and long-form content" },
  { categoryName: "content", name: "technical_writing", displayName: "Technical Writing", description: "Documentation and technical guides" },
  { categoryName: "content", name: "editing", displayName: "Editing & Proofreading", description: "Polish and refine written content" },

  // Marketing
  { categoryName: "marketing", name: "seo", displayName: "SEO", description: "Search engine optimization" },
  { categoryName: "marketing", name: "growth_marketing", displayName: "Growth Marketing", description: "Growth hacking and user acquisition" },
  { categoryName: "marketing", name: "social_media", displayName: "Social Media", description: "Social media management and strategy" },
  { categoryName: "marketing", name: "email_marketing", displayName: "Email Marketing", description: "Email campaigns and automation" },

  // No-Code & AI
  { categoryName: "nocode_ai", name: "nocode", displayName: "No-Code Development", description: "Build with Webflow, Bubble, Framer" },
  { categoryName: "nocode_ai", name: "ai_automation", displayName: "AI Automation", description: "Automate workflows with AI tools" },
  { categoryName: "nocode_ai", name: "prompt_engineering", displayName: "Prompt Engineering", description: "Craft effective AI prompts" },
  { categoryName: "nocode_ai", name: "ai_integration", displayName: "AI Integration", description: "Integrate AI into products" },
];

async function seed() {
  const db = getDb();
  console.log("Seeding skill categories...");

  for (const cat of categories) {
    await db
      .insert(skillCategories)
      .values(cat)
      .onDuplicateKeyUpdate({ set: { displayName: cat.displayName } });
  }

  console.log("Seeding skills...");

  const allCategories = await db.select().from(skillCategories);
  const categoryMap = new Map(allCategories.map((c) => [c.name, c.id]));

  for (const skill of skillsData) {
    const categoryId = categoryMap.get(skill.categoryName);
    if (!categoryId) {
      console.warn(`Category not found: ${skill.categoryName}`);
      continue;
    }

    await db
      .insert(skills)
      .values({
        categoryId,
        name: skill.name,
        displayName: skill.displayName,
        description: skill.description,
      })
      .onDuplicateKeyUpdate({
        set: { displayName: skill.displayName, categoryId },
      });
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
