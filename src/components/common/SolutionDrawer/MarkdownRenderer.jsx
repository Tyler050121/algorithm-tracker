import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkdownRenderer = ({ content }) => {
  const syntaxTheme = useColorModeValue(oneLight, oneDark);
  const codeBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box
      sx={{
        'p': { fontSize: 'sm', lineHeight: '1.7' },
        'ul, ol': { mb: 3, pl: 4, fontSize: 'sm' },
        'li': { mb: 1 },
        'h1, h2, h3': { fontWeight: 'bold', mt: 5, mb: 3, lineHeight: '1.3' },
        'h1': { fontSize: 'xl' },
        'h2': { fontSize: 'lg' },
        'h3': { fontSize: 'md' },
        'blockquote': { borderLeft: '3px solid', borderColor: 'brand.500', pl: 3, py: 1, my: 3, bg: 'blackAlpha.50', color: 'gray.500', fontStyle: 'italic' },
        'a': { color: 'brand.500', textDecoration: 'underline' },
        'code': { bg: codeBg, px: 1.5, py: 0.5, borderRadius: 'sm', fontSize: '0.85em', fontFamily: 'mono' },
        'pre': { p: 0, mb: 4, borderRadius: 'md', overflow: 'hidden' },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={syntaxTheme}
                language={match[1]}
                PreTag="div"
                customStyle={{ margin: 0, borderRadius: 0 }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownRenderer;
