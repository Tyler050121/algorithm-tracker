import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkdownRenderer = ({ content }) => {
  const syntaxTheme = useColorModeValue(oneLight, oneDark);
  const codeBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box
      className="markdown-body"
      sx={{
        'p': { fontSize: 'sm', lineHeight: '1.8', mb: 3 },
        'ul, ol': { mb: 4, pl: 5, fontSize: 'sm' },
        'li': { mb: 1.5 },
        'h1, h2, h3, h4, h5, h6': { fontWeight: 'bold', mt: 6, mb: 3, lineHeight: '1.3' },
        'h1': { fontSize: '2xl', borderBottom: '1px solid', borderColor: 'gray.200', pb: 2 },
        'h2': { fontSize: 'xl', borderBottom: '1px solid', borderColor: 'gray.100', pb: 1 },
        'h3': { fontSize: 'lg' },
        'blockquote': { 
          borderLeft: '4px solid', 
          borderColor: 'brand.500', 
          pl: 4, 
          py: 2, 
          my: 4, 
          bg: 'blackAlpha.50', 
          color: 'gray.600', 
          fontStyle: 'italic',
          borderRadius: '0 4px 4px 0'
        },
        'a': { color: 'brand.500', textDecoration: 'none', _hover: { textDecoration: 'underline' } },
        'code': { bg: codeBg, px: 1.5, py: 0.5, borderRadius: 'md', fontSize: '0.85em', fontFamily: 'mono', color: 'red.500' },
        'pre': { p: 0, mb: 4, borderRadius: 'md', overflow: 'hidden', bg: 'transparent' },
        'table': { width: '100%', mb: 4, borderCollapse: 'collapse' },
        'th, td': { border: '1px solid', borderColor: 'gray.200', p: 2, fontSize: 'sm' },
        'th': { bg: 'gray.50', fontWeight: 'bold' },
        'img': { maxWidth: '100%', borderRadius: 'md', my: 2 },
        'hr': { my: 6, borderColor: 'gray.200' },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
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
