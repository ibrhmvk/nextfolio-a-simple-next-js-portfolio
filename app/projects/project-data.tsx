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
    description: "AI companion for your day to day life",
    url: "https://shakty.ai/",
  },
  {
    title: "Radr",
    year: 2023,
    description: "A public alias for your private email",
    url: "https://radr.co/",
  },
  {
    title: "Ottbaba",
    year: 2025,
    description: "One-Stop Destination for OTT Entertainment",
    url: "https://ottbaba.com/",
  },
  {
    title: "Tallrank AI",
    year: 2024,
    description: "AI hiring platform",
    url: "https://tallrank.ai/",
  },
];
