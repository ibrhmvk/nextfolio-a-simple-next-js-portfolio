export interface Project {
  title: string;
  year: number;
  description: string;
  url: string;
}

export const projects: Project[] = [
  {
    title: "Shakty AI",
    year: 2024,
    description: "Build your AI companion using your own data",
    url: "https://shakty.ai/",
  },
  {
    title: "Radr",
    year: 2023,
    description: "Privacy First: A Smart Public Alias for Secure Emailing",
    url: "https://radr.co/",
  },
  {
    title: "Ottbaba",
    year: 2025,
    description: "One-Stop Destination for your OTT Entertainment",
    url: "https://ottbaba.com/",
  },
  {
    title: "Tallrank AI",
    year: 2024,
    description: "AI-powered hiring platform",
    url: "https://tallrank.ai/",
  },
];
