export interface EmailTemplate {
  title: string;
  content: string;
  logoUrl?: string;
  sections: Section[];
}

export interface Section {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider';
  content: string;
  order: number;
  styles?: {
    fontSize?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
  };
}