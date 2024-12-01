import { cleanDocxText, cleanLatexText, removeSpecialChars } from '../services/textCleaningService';

describe('cleanDocxText', () => {
  test('should extract headings and paragraphs from HTML', () => {
    const html = '<h1>Title</h1><p>Paragraph <img src="image.png"> <a href="#">Link</a></p>';
    const result = cleanDocxText(html);
    expect(result).toBe('<h1>Title</h1><p>Paragraph  Link</p>');
  });

  test('should return empty string for HTML without matching tags', () => {
    const html = '<div>No relevant tags</div>';
    const result = cleanDocxText(html);
    expect(result).toBe('');
  });

  test('should remove text inside square brackets', () => {
    const html = '<p>Paragraph with [extra text]</p>';
    const result = cleanDocxText(html);
    expect(result).toBe('<p>Paragraph with </p>');
  });
});

describe('cleanLatexText', () => {
  test('should remove content before \\chapter{}', () => {
    const latex = 'Random text \\chapter{Introduction} Content after chapter';
    const result = cleanLatexText(latex);
    expect(result).toBe('\\chapter{Introduction} Content after chapter');
  });

  test('should remove LaTeX comments', () => {
    const latex = 'Text before % this is a comment\nText after';
    const result = cleanLatexText(latex);
    expect(result).toBe('Text before Text after');
  });

  test('should remove \\begin{} and \\end{} environments', () => {
    const latex = '\\begin{environment}Content\\end{environment} Text outside';
    const result = cleanLatexText(latex);
    expect(result).toBe('Text outside');
  });

  test('should preserve \\chapter{} but remove other commands', () => {
    const latex = '\\chapter{Intro}\\section{Subsection}Text here';
    const result = cleanLatexText(latex);
    expect(result).toBe('\\chapter{Intro}Text here');
  });

  test('should replace multiple whitespaces with single space', () => {
    const latex = 'Text   with   multiple   spaces';
    const result = cleanLatexText(latex);
    expect(result).toBe('Text with multiple spaces');
  });
});

describe('removeSpecialChars', () => {
  test('should remove numbering from \\section{}', () => {
    const section = '\\section{1. Introduction}';
    const result = removeSpecialChars(section);
    expect(result).toBe('\\section{Introduction}');
  });

  test('should remove special characters', () => {
    const section = '\\section{Introduction & Overview #$%}';
    const result = removeSpecialChars(section);
    expect(result).toBe('\\section{Introduction  Overview }');
  });

  test('should handle sections without special characters or numbering', () => {
    const section = '\\section{Introduction}';
    const result = removeSpecialChars(section);
    expect(result).toBe('\\section{Introduction}');
  });
});
