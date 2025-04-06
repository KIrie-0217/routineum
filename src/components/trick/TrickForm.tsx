'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Switch,
  FormHelperText,
  VStack,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { NewTrick, Trick, UpdateTrick } from '@/types/models/trick';

const trickSchema = z.object({
  name: z.string().min(1, 'シークエンス名は必須です'),
  description: z.string().optional().nullable(),
  difficulty: z.number().min(1).max(5),
  video_url: z.string().url('有効なURLを入力してください').optional().nullable(),
  mastery_level: z.number().min(0).max(100),
  is_favorite: z.boolean().default(false),
  tags: z.array(z.string()).optional().nullable(),
});

type TrickFormData = z.infer<typeof trickSchema>;

interface TrickFormProps {
  initialData?: Trick;
  onSubmit: (data: NewTrick | UpdateTrick) => Promise<void>;
  isSubmitting: boolean;
}

export default function TrickForm({ initialData, onSubmit, isSubmitting }: TrickFormProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TrickFormData>({
    resolver: zodResolver(trickSchema),
    defaultValues: initialData || {
      difficulty: 3,
      mastery_level: 0,
      is_favorite: false,
      tags: [],
    },
  });

  const masteryLevel = watch('mastery_level');
  const difficulty = watch('difficulty');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFormSubmit = async (data: TrickFormData) => {
    await onSubmit(data);
  };

  return (
    <Box as="form" onSubmit={handleSubmit(handleFormSubmit)} w="100%">
      <VStack spacing={4} align="start">
        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="name">シークエンス名</FormLabel>
          <Input id="name" {...register('name')} />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="description">説明（オプション）</FormLabel>
          <Textarea id="description" {...register('description')} placeholder="シークエンスの説明や覚え書き" />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="difficulty">難易度</FormLabel>
          <Slider
            id="difficulty"
            min={1}
            max={5}
            step={1}
            value={difficulty}
            onChange={(val) => setValue('difficulty', val)}
            mb={6}
          >
            <SliderMark value={1} mt={2} ml={-2.5} fontSize="sm">
              簡単
            </SliderMark>
            <SliderMark value={3} mt={2} ml={-2.5} fontSize="sm">
              普通
            </SliderMark>
            <SliderMark value={5} mt={2} ml={-2.5} fontSize="sm">
              難しい
            </SliderMark>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
          <input type="hidden" {...register('difficulty', { valueAsNumber: true })} />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="video_url">動画URL（オプション）</FormLabel>
          <Input id="video_url" {...register('video_url')} placeholder="YouTubeやVimeoのURL" />
          <FormErrorMessage>{errors.video_url?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="mastery_level">習熟度</FormLabel>
          <Slider
            id="mastery_level"
            min={0}
            max={100}
            value={masteryLevel}
            onChange={(val) => setValue('mastery_level', val)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            mb={6}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <Tooltip
              hasArrow
              bg="blue.500"
              color="white"
              placement="top"
              isOpen={showTooltip}
              label={`${masteryLevel}%`}
            >
              <SliderThumb boxSize={6} />
            </Tooltip>
          </Slider>
          <input type="hidden" {...register('mastery_level', { valueAsNumber: true })} />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="is_favorite" mb="0">
            お気に入りに追加
          </FormLabel>
          <Switch id="is_favorite" {...register('is_favorite')} />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="tags">タグ（オプション）</FormLabel>
          <InputGroup>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="タグを入力してEnterキーを押す"
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleAddTag}>
                追加
              </Button>
            </InputRightElement>
          </InputGroup>
          <FormHelperText>タグを追加してシークエンスを分類できます</FormHelperText>

          <Flex wrap="wrap" mt={2} gap={2}>
            {tags.map((tag) => (
              <Tag key={tag} size="md" borderRadius="full" variant="solid" colorScheme="blue">
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => handleRemoveTag(tag)} />
              </Tag>
            ))}
          </Flex>
        </FormControl>

        <HStack spacing={4} w="100%" justify="flex-end">
          <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
            {initialData ? '更新' : '作成'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
