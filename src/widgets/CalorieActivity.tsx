import { Image, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

export type CalorieActivityProps = {
  calories: number;
  goal: number;
  protein: number;
  carbs: number;
  fat: number;
  remaining: number;
};

function CalorieActivity(props: CalorieActivityProps, environment: LiveActivityEnvironment) {
  'widget';
  const { calories, goal, remaining, protein, carbs, fat } = props;
  const pct = goal > 0 ? Math.round((calories / goal) * 100) : 0;
  const accent = environment.colorScheme === 'dark' ? '#7DD956' : '#2E8B3D';
  const dim = environment.colorScheme === 'dark' ? '#9AA4B5' : '#5A6470';
  const text = environment.colorScheme === 'dark' ? '#F4F7FB' : '#0A0D12';

  return {
    banner: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Text modifiers={[font({ weight: 'semibold' }), foregroundStyle(accent)]}>
          {remaining > 0 ? `${Math.round(remaining)} kcal left` : 'Goal reached'}
        </Text>
        <Text modifiers={[font({ size: 28, weight: 'heavy' }), foregroundStyle(text)]}>
          {Math.round(calories)} kcal
        </Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(dim)]}>
          {pct}% · P {Math.round(protein)}g · C {Math.round(carbs)}g · F {Math.round(fat)}g
        </Text>
      </VStack>
    ),
    compactLeading: (
      <Image systemName="flame.fill" color={accent} />
    ),
    compactTrailing: (
      <Text modifiers={[font({ weight: 'bold', size: 20 }), foregroundStyle(text)]}>
        {Math.round(calories)}
      </Text>
    ),
    minimal: (
      <Image systemName="flame.fill" color={accent} />
    ),
    expandedLeading: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Image systemName="flame.fill" color={accent} />
        <Text modifiers={[font({ size: 12 }), foregroundStyle(dim)]}>Calories</Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Text modifiers={[font({ weight: 'heavy', size: 24 }), foregroundStyle(text)]}>
          {Math.round(calories)}
        </Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(dim)]}>of {Math.round(goal)}</Text>
      </VStack>
    ),
    expandedBottom: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(dim)]}>
          P {Math.round(protein)}g · C {Math.round(carbs)}g · F {Math.round(fat)}g
        </Text>
      </VStack>
    ),
  };
}

export default createLiveActivity('CalorieActivity', CalorieActivity);
