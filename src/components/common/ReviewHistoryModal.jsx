import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ReviewHistoryChart from './ReviewHistoryChart';

const ReviewHistoryModal = ({ isOpen, onClose, problem }) => {
  const { i18n } = useTranslation();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered returnFocusOnClose={false}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl">
        <ModalHeader>
          {(i18n.language === 'zh' ? problem?.title.zh : problem?.title.en) || problem?.title.en}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <ReviewHistoryChart problem={problem} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ReviewHistoryModal;
