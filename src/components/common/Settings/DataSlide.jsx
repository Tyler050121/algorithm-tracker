import React, { useRef } from "react";
import {
  VStack,
  SimpleGrid,
  Button,
  Icon,
  Text,
  useColorModeValue,
  useToken,
  Box,
  HStack,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import {
  FiDatabase,
  FiCode,
  FiActivity,
  FiTrash2,
  FiAlertTriangle,
  FiDownload,
  FiUpload,
} from "react-icons/fi";
import { motion } from "framer-motion";

import { hexToRgba } from "../../../theme/deriveThemeColors";

const MotionBox = motion.create(Box);

const ActionPill = ({ icon, label, onClick, tone = "palette.4" }) => {
  const bg = useColorModeValue("white", "whiteAlpha.100");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const hoverBorder = useColorModeValue("brand.500", "brand.400");

  const [toneHex] = useToken("colors", [tone]);

  return (
    <Button
      as={motion.button}
      whileHover={{ y: -2, shadow: "sm" }}
      whileTap={{ y: 0 }}
      variant="outline"
      h="auto"
      py={3}
      px={3}
      bg={bg}
      borderColor={borderColor}
      _hover={{ borderColor: hoverBorder }}
      onClick={onClick}
      borderRadius="xl"
      borderWidth="1px"
      w="full"
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-start"
      gap={3}
      boxShadow="xs"
    >
      <Box
        p={2}
        borderRadius="lg"
        bg={useColorModeValue(
            hexToRgba(toneHex, 0.1),
            hexToRgba(toneHex, 0.2)
        )}
        color={toneHex}
        flexShrink={0}
      >
        <Icon as={icon} boxSize={5} />
      </Box>
      <Text fontSize="sm" fontWeight="semibold" noOfLines={1} textAlign="left">
        {label}
      </Text>
    </Button>
  );
};

const DataSlide = ({ onExport, onImport, onClear }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const importTypeRef = useRef("all");

  const [palette2, palette4, palette7] = useToken("colors", [
    "palette.2",
    "palette.4",
    "palette.7",
  ]);

  const handleImportClick = (type) => {
    importTypeRef.current = type;
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImport(file, importTypeRef.current);
      event.target.value = "";
    }
  };

  const sectionBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const cardBg = useColorModeValue("white", "whiteAlpha.50");

  return (
    <VStack spacing={5} align="stretch" pb={6}>
      {/* 导出（第一行） */}
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        p={5}
        borderWidth="1px"
        borderColor={sectionBorder}
        borderRadius="2xl"
        bg={cardBg}
        boxShadow="sm"
      >
        <VStack align="stretch" spacing={4}>
          <HStack spacing={4} minW={0}>
            <Box
              w={10}
              h={10}
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={useColorModeValue(
                hexToRgba(palette4, 0.15),
                hexToRgba(palette4, 0.25)
              )}
              borderRadius="lg"
              color={palette4}
              flexShrink={0}
            >
              <Icon as={FiDownload} boxSize={5} />
            </Box>
            <Box minW={0}>
              <Text fontSize="md" fontWeight="bold" noOfLines={1}>
                {t("settings.dataManagement.export")}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {t(
                  "settings.dataManagement.exportDesc",
                  "Backup your data to a JSON file"
                )}
              </Text>
            </Box>
          </HStack>

          <SimpleGrid columns={[1, 3]} spacing={3} w="full">
            <ActionPill
              icon={FiDatabase}
              label={t("settings.dataManagement.exportAll")}
              onClick={() => onExport("all")}
              tone="palette.4"
            />
            <ActionPill
              icon={FiCode}
              label={t("settings.dataManagement.exportSolutions")}
              onClick={() => onExport("solutions")}
              tone="palette.6"
            />
            <ActionPill
              icon={FiActivity}
              label={t("settings.dataManagement.exportRecords")}
              onClick={() => onExport("records")}
              tone="palette.2"
            />
          </SimpleGrid>
        </VStack>
      </MotionBox>

      {/* 导入（第二行） */}
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        p={5}
        borderWidth="1px"
        borderColor={sectionBorder}
        borderRadius="2xl"
        bg={cardBg}
        boxShadow="sm"
      >
        <VStack align="stretch" spacing={4}>
          <HStack spacing={4} minW={0}>
            <Box
              w={10}
              h={10}
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={useColorModeValue(
                hexToRgba(palette2, 0.15),
                hexToRgba(palette2, 0.25)
              )}
              borderRadius="lg"
              color={palette2}
              flexShrink={0}
            >
              <Icon as={FiUpload} boxSize={5} />
            </Box>
            <Box minW={0}>
              <Text fontSize="md" fontWeight="bold" noOfLines={1}>
                {t("settings.dataManagement.import")}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {t(
                  "settings.dataManagement.importDesc",
                  "Restore data from a JSON file"
                )}
              </Text>
            </Box>
          </HStack>

          <SimpleGrid columns={[1, 3]} spacing={3} w="full">
            <ActionPill
              icon={FiDatabase}
              label={t("settings.dataManagement.importAll")}
              onClick={() => handleImportClick("all")}
              tone="palette.3"
            />
            <ActionPill
              icon={FiCode}
              label={t("settings.dataManagement.importSolutions")}
              onClick={() => handleImportClick("solutions")}
              tone="palette.5"
            />
            <ActionPill
              icon={FiActivity}
              label={t("settings.dataManagement.importRecords")}
              onClick={() => handleImportClick("records")}
              tone="palette.7"
            />
          </SimpleGrid>
        </VStack>
      </MotionBox>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".json"
        onChange={handleFileChange}
      />

      {/* 危险区域 */}
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        mt={1}
        p={5}
        borderWidth="1px"
        borderColor={useColorModeValue(
          hexToRgba(palette7, 0.3),
          hexToRgba(palette7, 0.3)
        )}
        borderRadius="xl"
        bg={useColorModeValue(
          hexToRgba(palette7, 0.05),
          hexToRgba(palette7, 0.1)
        )}
        position="relative"
        overflow="hidden"
      >
        <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
          <HStack spacing={4}>
            <Box
              w={10}
              h={10}
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={useColorModeValue(
                hexToRgba(palette7, 0.15),
                hexToRgba(palette7, 0.2)
              )}
              borderRadius="lg"
              color={palette7}
            >
              <Icon as={FiAlertTriangle} boxSize={5} />
            </Box>
            <Box>
              <Text
                fontWeight="bold"
                color={useColorModeValue("danger.700", "danger.200")}
                fontSize="sm"
              >
                {t("settings.dataManagement.dangerZone")}
              </Text>
              <Text
                fontSize="xs"
                color={useColorModeValue("danger.600", "danger.200")}
              >
                {t("settings.dataManagement.clearDesc")}
              </Text>
            </Box>
          </HStack>
          <Button
            colorScheme="danger"
            variant="solid"
            leftIcon={<FiTrash2 />}
            onClick={onOpen}
            size="sm"
            height="36px"
            borderRadius="lg"
            px={6}
            fontSize="xs"
          >
            {t("settings.dataManagement.clear")}
          </Button>
        </HStack>
      </MotionBox>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <AlertDialogContent borderRadius="2xl">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {t("settings.dataManagement.clearConfirm.title")}
          </AlertDialogHeader>
          <AlertDialogBody>
            {t("settings.dataManagement.clearConfirm.body")}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="ghost"
              borderRadius="lg"
            >
              {t("settings.dataManagement.clearConfirm.cancel")}
            </Button>
            <Button
              colorScheme="danger"
              onClick={() => {
                onClear();
                onClose();
              }}
              ml={3}
              borderRadius="lg"
            >
              {t("settings.dataManagement.clearConfirm.confirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VStack>
  );
};

export default DataSlide;
