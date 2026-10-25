import { defineArrayMember, defineType } from 'sanity';
import { INTRO_MAX } from '../../src/lib/project-fields';
import { AccentDecorator, AccentIcon } from '../components/accent-decorator';

type Span = { _type?: string; text?: string; marks?: string[] };
type Block = { _type?: string; children?: Span[] };

/**
 * The first problem in the paragraphs, or `true`. These are the rich text
 * rules the site's build checks (spec 0019, AC-3): the build turns each
 * paragraph into one `**bold**` and `==accent==` string, so a span with both
 * marks, or a typed `**` or `==`, would break it.
 */
const checkParagraphs = (
  blocks: readonly Block[] | undefined,
): true | string => {
  const problems = (blocks ?? []).flatMap((block, index) => {
    const where = `Paragraph ${index + 1}`;
    const spans = block.children ?? [];
    const text = spans.map((span) => span.text ?? '').join('');
    return [
      text.trim() === '' && `${where} is empty; write it or remove it.`,
      spans.some((span) => (span.marks ?? []).length > 1) &&
        `${where} has words marked both Bold and Accent; pick one.`,
      /\*\*|==/.test(text) &&
        `${where} contains "**" or "=="; use the Bold and Accent buttons instead.`,
      text.includes('\n') &&
        `${where} has a line break; start a new paragraph instead.`,
    ].filter((problem): problem is string => typeof problem === 'string');
  });
  return problems[0] ?? true;
};

/**
 * A project's intro: 1 to 4 plain paragraphs, with only two buttons, Bold
 * and Accent. No headings, lists, or links, since the hero shows paragraphs
 * only.
 */
export const introText = defineType({
  name: 'introText',
  title: 'Intro',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: 'Normal', value: 'normal' }],
      lists: [],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          {
            title: 'Accent',
            value: 'accent',
            icon: AccentIcon,
            component: AccentDecorator,
          },
        ],
        annotations: [],
      },
    }),
  ],
  validation: (rule) =>
    rule
      .required()
      .min(1)
      .max(INTRO_MAX)
      .custom((blocks) => checkParagraphs(blocks as Block[] | undefined)),
});
