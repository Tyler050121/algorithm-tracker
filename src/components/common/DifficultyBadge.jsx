import React from 'react';
import { Badge } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DIFFICULTY_MAP } from '../../constants';

const DifficultyBadge = ({ difficulty, ...props }) => {
  const { t } = useTranslation();
  const safeDifficulty = difficulty?.toLowerCase() || 'unknown';
  const { label, color } = DIFFICULTY_MAP[safeDifficulty] || { label: 'Unknown', color: 'gray' };
  return (
    <Badge colorScheme={color} variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="md" {...props}>
      {t(`dashboard.difficulty.${safeDifficulty}`, label)}
    </Badge>
  );
};

export default DifficultyBadge;
