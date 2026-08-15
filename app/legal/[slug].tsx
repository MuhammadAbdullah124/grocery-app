import { ScrollView, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { LEGAL_CONTENT } from '@/constants/legal';

export default function LegalScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const content = LEGAL_CONTENT[slug ?? ''] ?? { title: 'Information', body: ['Content not available.'] };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header title={content.title} />
      <ScrollView
        className="flex-1 px-5 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {content.body.map((paragraph, index) => (
          <Text key={index} className="mb-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {paragraph}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
