import React from 'react';
import { Badge, useColorModeValue, useToken } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DIFFICULTY_MAP } from '../../constants';
import { hexToRgba } from '../../theme/deriveThemeColors';

const DifficultyBadge = ({ difficulty, ...props }) => {
  const { t } = useTranslation();
  const safeDifficulty = difficulty?.toLowerCase() || 'unknown';
  const { label, color } = DIFFICULTY_MAP[safeDifficulty] || { label: 'Unknown', color: 'gray' };

  const [bgLightHex, bgDarkHex, borderLightHex, borderDarkHex] = useToken('colors', [
    `${color}.200`,
    `${color}.500`,
    `${color}.300`,
    `${color}.500`,
  ]);

  const bg = useColorModeValue(bgLightHex, hexToRgba(bgDarkHex, 0.45));
  const textColor = useColorModeValue(`${color}.900`, `${color}.50`);
  const borderColor = useColorModeValue(borderLightHex, hexToRgba(borderDarkHex, 0.5));

  return (
    <Badge
      bg={bg}
      color={textColor}
      border="1px solid"
      borderColor={borderColor}
      fontSize="xs"
      px={2}
      py={0.5}
      borderRadius="md"
      fontWeight="bold"
      {...props}
    >
      {t(`dashboard.difficulty.${safeDifficulty}`, label)}
    </Badge>
  );
};

export default DifficultyBadge;
