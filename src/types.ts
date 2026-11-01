export type ComponentType =
  | "text"
  | "timeline"
  | "progress"
  | "tags"
  | "project"
  | "quote"
  | "divider"
  | "spacer"
  | "image"
  | "links";

export interface ResumeComponent {
  id: string;
  type: ComponentType;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  value: number;
  style: string;
  color: string;
  fontSize: number;
  spacing: number;
  align: "left" | "center" | "right";
  bold: boolean;
  icon: string;
  iconStyle: "line" | "soft" | "badge";
  width: number;
  indent: number;
  image?: string;
}

export interface Section {
  id: string;
  title: string;
  subtitle: string;
  components: ResumeComponent[];
  visible: boolean;
}

export interface ResumeData {
  version: 1;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  photo: string;
  photoShape: "rounded" | "circle" | "square";
  template: string;
  background: string;
  accent: string;
  font: "sans" | "serif" | "mono" | "wenkai" | "noto-sans" | "noto-serif" | "mashan" | "zhimang" | "kuaile" | "xiaowei" | "huangyou" | "liujian" | "longcang";
  fontSize: number;
  lineHeight: number;
  pagePadding: number;
  sections: Section[];
  exportSettings: ExportSettings;
}

export interface ExportSettings {
  format: "pdf" | "docx";
  wordMode?: "faithful" | "editable";
  watermark: boolean;
  pageNumbers: boolean;
  background: boolean;
  quality: 1.5 | 2 | 3;
  fileName: string;
  pages: "all" | "current";
}

export type Motif = AnimalMotif
  | "cat"
  | "dog"
  | "bear"
  | "flower"
  | "rabbit"
  | "bird"
  | "fox"
  | "cloud"
  | "sun"
  | "star"
  | "moon"
  | "planet"
  | "leaf";
export type NewAnimalMotif = "sloth" | "owl" | "dolphin" | "whale" | "axolotl" | "bat" | "giraffe" | "hippo" | "platypus" | "ferret";
export type AnimalMotif = NewAnimalMotif | "cat" | "dog" | "panda" | "red-panda" | "hamster" | "pig" | "raccoon" | "tiger" | "lion" | "frog" | "sheep" | "otter" | "penguin" | "duck" | "deer" | "koala" | "hedgehog" | "squirrel" | "seal" | "capybara" | "elephant" | "alpaca" | "turtle" | "chinchilla" | "cow" | "peacock";

export interface Template {
  id: string;
  name: string;
  english: string;
  color: string;
  category: "minimal" | "creative" | "professional" | "cartoon";
  layout:
    | "classic"
    | "stripe"
    | "centered"
    | "editorial"
    | "soft"
    | "playful"
    | "notebook"
    | "framed"
    | "duotone"
    | "ribbon"
    | "geometric";
  font: ResumeData["font"];
  motif?: Motif | AnimalMotif;
}

export type UpdateResume = (
  update: (current: ResumeData) => ResumeData,
) => void;

export const uid = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
