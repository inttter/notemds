const commands = {
    table: {
        content: `| Header 1 | Header 2 |\n|---------|---------|\n| Row 1    | Row 1    |\n| Row 2    | Row 2    |`,
        aliases: ['tb'],
    },
    list: {
        content: `- Item 1\n- Item 2\n- Item 3`,
        aliases: ['dashedlist', 'dlist'],
    },
    numberedlist: {
        content: `1. Item 1\n2. Item 2\n3. Item 3`,
        aliases: ['numlist', 'nlist'],
    },
    bulletlist: {
        content: `* Item 1\n* Item 2\n* Item 3`,
        aliases: ['blist'],
    },
    code: {
        content: '```\n// Your code here\n```',
        aliases: ['snippet'],
    },
    quote: {
        content: `> Your quoted text here`,
        aliases: ['blockquote'],
    },
    image: {
        content: `![Alt Text](URL)`,
        aliases: ['img', 'picture'],
    },
    link: {
        content: `[Link text](URL)`,
        aliases: ['url'],
    },
    video: {
        content: `<video src="URL" controls></video>`,
        aliases: ['vd'],
    },
    tasklist: {
        content: `- [ ] Task 1\n- [X] Task 2`,
        aliases: ['tlist', 'todo'],
    },
    line: {
        content: `------`,
        aliases: ['horizontal', 'hr', 'separator', 'section', 'divider'],
    },
    footnote: {
        content: `This is some text[^1].\n\n[^1]: Footnote text here.`,
        aliases: ['fn', 'reference'],
    },
    metadata: {
        content: `---\ntitle: Note Title\ndate: ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getDate()}, ${new Date().getFullYear()}\n---`,
        aliases: ['mdata', 'yaml'],
    },
    toc: {
        content: '// Table of Contents will be generated here',
        aliases: ['contents'],
    },
    date: {
        content: (() => {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = String(now.getFullYear()).slice(-2);
            
            // Returns date in DD/MM/YY
            return `${day}/${month}/${year}`; 
        })(),
        aliases: ['day'],
    },
};

export default commands;