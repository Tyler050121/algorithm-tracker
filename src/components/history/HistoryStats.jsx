import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { FiActivity, FiCalendar, FiRepeat } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import StatCard from '../common/StatCard';

const HistoryStats = ({ totalLearns, totalReviews, activeDays }) => {
  const { t } = useTranslation();

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6} flexShrink={0}>
      <StatCard 
        icon={FiActivity} 
        label={t('history.stats.totalLearns')} 
        value={totalLearns} 
        helpText="Problems started"
      />
      <StatCard 
        icon={FiRepeat} 
        label={t('history.stats.totalReviews')} 
        value={totalReviews} 
        helpText="Reviews completed"
      />
      <StatCard 
        icon={FiCalendar} 
        label={t('history.stats.activeDays')} 
        value={activeDays} 
        helpText="Days active this year"
      />
    </SimpleGrid>
  );
};

export default HistoryStats;
