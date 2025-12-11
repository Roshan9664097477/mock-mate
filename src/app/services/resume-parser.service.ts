import { Injectable } from '@angular/core';
import { ResumeData, StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ResumeParserService {
  private readonly SUPPORTED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  constructor(private storage: StorageService) {}

  isSupported(file: File): boolean {
    return this.SUPPORTED_TYPES.includes(file.type) || 
           /\.(pdf|docx|txt)$/i.test(file.name);
  }

  async parseFile(file: File): Promise<ResumeData> {
    if (!this.isSupported(file)) {
      throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
    }

    let text: string;

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      text = await this.parseText(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      text = await this.parsePdf(file);
    } else {
      text = await this.parseDocx(file);
    }

    return this.extractResumeData(file.name, text);
  }

  private async parseText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  private async parsePdf(file: File): Promise<string> {
    // Using pdf.js via CDN for PDF parsing
    const pdfjsLib = (window as any)['pdfjsLib'];
    
    if (!pdfjsLib) {
      // Fallback: try to extract basic text
      return this.extractBasicText(file);
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      text += pageText + '\n';
    }
    
    return text.trim();
  }

  private async parseDocx(file: File): Promise<string> {
    // Simple DOCX parsing using JSZip pattern
    // DOCX files are ZIP archives with XML content
    try {
      const arrayBuffer = await file.arrayBuffer();
      const text = await this.extractDocxText(arrayBuffer);
      return text;
    } catch {
      return this.extractBasicText(file);
    }
  }

  private async extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
    // Basic DOCX text extraction
    // DOCX is a ZIP file, we need to extract word/document.xml
    const JSZip = (window as any)['JSZip'];
    
    if (!JSZip) {
      throw new Error('JSZip not available');
    }

    const zip = await JSZip.loadAsync(arrayBuffer);
    const documentXml = await zip.file('word/document.xml')?.async('string');
    
    if (!documentXml) {
      throw new Error('Invalid DOCX file');
    }

    // Extract text from XML
    const parser = new DOMParser();
    const doc = parser.parseFromString(documentXml, 'text/xml');
    const textNodes = doc.getElementsByTagName('w:t');
    
    let text = '';
    for (let i = 0; i < textNodes.length; i++) {
      text += textNodes[i].textContent + ' ';
    }
    
    return text.trim();
  }

  private async extractBasicText(file: File): Promise<string> {
    // Fallback: try to read as text
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Clean up any binary characters
        const cleaned = result.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
        resolve(cleaned || 'Unable to extract text. Please try a different file format.');
      };
      reader.onerror = () => resolve('Unable to read file.');
      reader.readAsText(file);
    });
  }

  private extractResumeData(filename: string, text: string): ResumeData {
    return {
      id: this.storage.generateId(),
      filename,
      rawText: text,
      skills: this.extractSkills(text),
      experienceYears: this.estimateExperience(text),
      sections: this.extractSections(text),
      uploadedAt: new Date()
    };
  }

  private extractSkills(text: string): string[] {
    const techSkills = [
      'javascript', 'typescript', 'python', 'java', 'c\\+\\+', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',
      'react', 'angular', 'vue', 'svelte', 'next\\.?js', 'nuxt', 'node\\.?js', 'express', 'django', 'flask', 'fastapi', 'spring',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'firebase', 'supabase',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab', 'ci/cd',
      'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
      'html', 'css', 'sass', 'tailwind', 'bootstrap', 'graphql', 'rest api', 'websocket',
      'agile', 'scrum', 'jira', 'confluence', 'figma', 'photoshop', 'illustrator',
      'excel', 'powerpoint', 'tableau', 'power bi', 'data analysis', 'data science',
      'linux', 'unix', 'bash', 'shell', 'terraform', 'ansible',
      'react native', 'flutter', 'ionic', 'electron',
      'unit testing', 'jest', 'mocha', 'cypress', 'selenium'
    ];

    const found: string[] = [];
    const textLower = text.toLowerCase();

    for (const skill of techSkills) {
      const regex = new RegExp('\\b' + skill + '\\b', 'i');
      if (regex.test(textLower)) {
        // Normalize skill name
        const normalized = skill.replace(/\\/g, '').replace(/\.\?/g, '.');
        found.push(this.toTitleCase(normalized));
      }
    }

    return [...new Set(found)];
  }

  private toTitleCase(str: string): string {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  private estimateExperience(text: string): number | null {
    // Look for explicit mentions
    const patterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
      /experience\s*:\s*(\d+)\+?\s*years?/i,
      /(\d+)\+?\s*years?\s*in\s*(?:the\s*)?(?:industry|field|software|development)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    // Try to calculate from year ranges
    const yearPattern = /\b(20\d{2}|19\d{2})\b/g;
    const years = [...text.matchAll(yearPattern)].map(m => parseInt(m[1], 10));
    
    if (years.length >= 2) {
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      if (maxYear - minYear > 0 && maxYear - minYear < 50) {
        return maxYear - minYear;
      }
    }

    return null;
  }

  private extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const sectionPatterns: [RegExp, string][] = [
      [/(?:experience|work\s*history|employment)/i, 'experience'],
      [/(?:education|academic|qualifications)/i, 'education'],
      [/(?:skills|technical\s*skills|competencies)/i, 'skills'],
      [/(?:projects|portfolio)/i, 'projects'],
      [/(?:summary|objective|profile|about)/i, 'summary'],
      [/(?:certifications?|licenses?)/i, 'certifications'],
    ];

    const lines = text.split('\n');
    let currentSection = 'header';
    let currentContent: string[] = [];

    for (const line of lines) {
      let matched = false;
      
      for (const [pattern, sectionName] of sectionPatterns) {
        if (pattern.test(line) && line.trim().length < 50) {
          if (currentContent.length > 0) {
            sections[currentSection] = currentContent.join('\n').trim();
          }
          currentSection = sectionName;
          currentContent = [];
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        currentContent.push(line);
      }
    }

    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }
}

